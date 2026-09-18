import { NextResponse } from "next/server";

const CCA3_REGEX = /^[a-zA-Z0-9]{3}$/;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ cca3: string }> }
) {
  let cca3: string | undefined;
  try {
    const resolvedParams = await params;
    cca3 = resolvedParams?.cca3;

    if (!cca3 || !CCA3_REGEX.test(cca3)) {
      return NextResponse.json(
        { error: "Invalid country code parameter" },
        { status: 400 }
      );
    }

    const cleanCca3 = encodeURIComponent(cca3);

    // Purchasing Power Parity rarely changes, caching for 7 days
    const res = await fetch(
      `https://api.worldbank.org/v2/country/${cleanCca3}/indicator/PA.NUS.PPPC.RF?format=json&per_page=10`,
      { next: { revalidate: 604800 } }
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch World Bank data: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`World Bank API error for ${cca3}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch World Bank data" },
      { status: 500 }
    );
  }
}
