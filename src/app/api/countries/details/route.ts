import { NextResponse } from "next/server";
import { getCountriesByCodes } from "@/lib/api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const codes = searchParams.get("codes");

  if (!codes) {
    return NextResponse.json({ error: "No codes provided" }, { status: 400 });
  }

  try {
    const codeArray = codes.split(",");
    const details = await getCountriesByCodes(codeArray);
    return NextResponse.json(details);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch country details" }, { status: 500 });
  }
}
