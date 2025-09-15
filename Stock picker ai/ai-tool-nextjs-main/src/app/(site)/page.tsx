import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Stock Picker Pro - Professional Trading Dashboard",
  description: "Advanced stock and cryptocurrency analysis with professional trading indicators",
  // other metadata
};

export default function Home() {
  // Redirect to dashboard
  redirect('/dashboard');
}
