import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Revalidate every 24 hours (86400 seconds) since exchange rates don't need real-time precision here
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 86400 }
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch exchange rates: ${res.status}`);
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Exchange rate API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch exchange rates" },
      { status: 500 }
    );
  }
}