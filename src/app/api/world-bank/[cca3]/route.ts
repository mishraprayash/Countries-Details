import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ cca3: string }> }
) {
  try {
    const { cca3 } = await params;
    
    // Purchasing Power Parity rarely changes, caching for 7 days
    const res = await fetch(
      `https://api.worldbank.org/v2/country/${cca3}/indicator/PA.NUS.PPPC.RF?format=json&per_page=10`,
      { next: { revalidate: 604800 } }
    );
    
    if (!res.ok) {
      throw new Error(`Failed to fetch World Bank data: ${res.status}`);
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`World Bank API error for ${await params.then(p => p.cca3)}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch World Bank data" },
      { status: 500 }
    );
  }
}