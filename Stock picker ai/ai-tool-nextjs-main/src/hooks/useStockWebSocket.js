'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

const FINNHUB_WS_URL = 'wss://ws.finnhub.io';
const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const RECONNECT_DELAY = 5000; // 5 seconds

export function useStockWebSocket(symbols = []) {
  const [prices, setPrices] = useState({});
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [error, setError] = useState(null);
  
  const ws = useRef(null);
  const heartbeatInterval = useRef(null);
  const reconnectTimeout = useRef(null);
  const subscribedSymbols = useRef(new Set());

  // Initialize WebSocket connection
  const connect = useCallback(() => {
    try {
      if (ws.current?.readyState === WebSocket.OPEN) {
        return;
      }

      const token = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
      
      if (!token) {
        console.warn('Finnhub API key not configured. WebSocket connection disabled.');
        setConnectionStatus('disconnected');
        setError('API key not configured');
        return;
      }

      ws.current = new WebSocket(`${FINNHUB_WS_URL}?token=${token}`);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setConnectionStatus('connected');
        setError(null);
        
        // Resubscribe to all symbols
        subscribedSymbols.current.forEach(symbol => {
          ws.current.send(JSON.stringify({ type: 'subscribe', symbol }));
        });
        
        // Start heartbeat
        startHeartbeat();
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'trade') {
            // Update prices for each trade
            data.data?.forEach(trade => {
              setPrices(prev => ({
                ...prev,
                [trade.s]: {
                  price: trade.p,
                  volume: trade.v,
                  timestamp: trade.t,
                  change: prev[trade.s] ? trade.p - prev[trade.s].price : 0
                }
              }));
            });
          } else if (data.type === 'ping') {
            // Respond to ping with pong
            ws.current.send(JSON.stringify({ type: 'pong' }));
          }
        } catch (err) {
          console.error('Error parsing message:', err);
        }
      };

      ws.current.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError('Connection error occurred');
        setConnectionStatus('error');
      };

      ws.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setConnectionStatus('disconnected');
        stopHeartbeat();
        
        // Attempt to reconnect
        if (!event.wasClean) {
          scheduleReconnect();
        }
      };
    } catch (err) {
      console.error('Failed to connect:', err);
      setError(err.message);
      scheduleReconnect();
    }
  }, []);

  // Heartbeat to keep connection alive
  const startHeartbeat = () => {
    stopHeartbeat();
    heartbeatInterval.current = setInterval(() => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, HEARTBEAT_INTERVAL);
  };

  const stopHeartbeat = () => {
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current);
      heartbeatInterval.current = null;
    }
  };

  // Reconnection logic
  const scheduleReconnect = () => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
    
    setConnectionStatus('reconnecting');
    reconnectTimeout.current = setTimeout(() => {
      console.log('Attempting to reconnect...');
      connect();
    }, RECONNECT_DELAY);
  };

  // Subscribe to a symbol
  const subscribe = useCallback((symbol) => {
    if (!symbol) return;
    
    const upperSymbol = symbol.toUpperCase();
    subscribedSymbols.current.add(upperSymbol);
    
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ 
        type: 'subscribe', 
        symbol: upperSymbol 
      }));
    }
  }, []);

  // Unsubscribe from a symbol
  const unsubscribe = useCallback((symbol) => {
    if (!symbol) return;
    
    const upperSymbol = symbol.toUpperCase();
    subscribedSymbols.current.delete(upperSymbol);
    
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ 
        type: 'unsubscribe', 
        symbol: upperSymbol 
      }));
    }
  }, []);

  // Subscribe to symbols on mount/change
  useEffect(() => {
    symbols.forEach(symbol => subscribe(symbol));
    
    return () => {
      symbols.forEach(symbol => unsubscribe(symbol));
    };
  }, [symbols, subscribe, unsubscribe]);

  // Initialize connection
  useEffect(() => {
    connect();
    
    return () => {
      stopHeartbeat();
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connect]);

  return {
    prices,
    connectionStatus,
    error,
    subscribe,
    unsubscribe,
    reconnect: connect
  };
}