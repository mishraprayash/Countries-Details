import { NextRequest, NextResponse } from "next/server";

interface DestinationResult {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  country: string;
  extract?: string;
  thumbnailUrl?: string;
  wikiUrl?: string;
}

// Keywords that indicate a place is NOT a tourist destination
const SKIP_TITLE_PATTERNS = [
  "station", "district", "municipality", "ward", "road", "street", "avenue",
  "building", "office", "headquarters", "embassy", "consulate", "hospital",
  "school", "college", "university", "airport", "terminus",
];

// Keywords that indicate a place IS a tourist attraction
const ATTRACTION_TITLE_PATTERNS = [
  "temple", "palace", "monument", "museum", "park", "garden", "square",
  "fort", "castle", "waterfall", "lake", "mountain", "peak", "hill",
  "beach", "cave", "valley", "island", "durbar", "gallery", "stupa",
  "mosque", "church", "cathedral", "basilica", "shrine", "statue",
  "tower", "bridge", "market", "bazaar", "viewpoint", "lookout",
  "observatory", "zoo", "aquarium", "amusement", "water park",
  "national park", "reserve", "sanctuary", "ruins", "archaeological",
  "historical", "heritage", "memorial", "cemetery", "pagoda",
  "gurdwara", "synagogue", "light house", "lighthouse",
  "town hall", "opera house", "theatre", "theater", "stadium",
];

// Descriptions that indicate a tourist place
const ATTRACTION_DESC_PATTERNS = [
  "mountain", "volcano", "peak", "island", "lake", "waterfall",
  "beach", "temple", "palace", "museum", "park", "monument",
  "castle", "fort", "garden", "square", "tourist", "landmark",
  "historical", "heritage", "natural", "national park",
  "shrine", "church", "cathedral", "stupa", "valley",
];

function isTouristAttraction(title: string, description: string): boolean {
  const titleLower = title.toLowerCase();
  const descLower = description.toLowerCase();

  // Skip non-tourist places
  for (const pattern of SKIP_TITLE_PATTERNS) {
    if (titleLower.includes(pattern)) return false;
  }

  // Check if title matches attraction patterns
  for (const pattern of ATTRACTION_TITLE_PATTERNS) {
    if (titleLower.includes(pattern)) return true;
  }

  // Check if description matches
  for (const pattern of ATTRACTION_DESC_PATTERNS) {
    if (descLower.includes(pattern)) return true;
  }

  return false;
}

async function fetchFromWikipedia(
  lat: number,
  lng: number,
  countryName: string
): Promise<DestinationResult[]> {
  const headers = {
    "User-Agent": "WorldInsights/1.0 (https://world-insights.vercel.app; contact@example.com)",
  };

  // Get Wikipedia pages near these coordinates
  const geoUrl = `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${lat}|${lng}&gsradius=10000&gslimit=50&format=json`;
  const geoRes = await fetch(geoUrl, {
    headers,
    next: { revalidate: 86400 },
  });
  if (!geoRes.ok) throw new Error(`Wikipedia geosearch returned ${geoRes.status}`);

  const geoData = await geoRes.json();
  const pages = geoData?.query?.geosearch || [];
  if (pages.length === 0) return [];

  // Get page details
  const pageIds = pages.map((p: any) => p.pageid).join("|");
  if (!pageIds) return [];

  const detailUrl = `https://en.wikipedia.org/w/api.php?action=query&pageids=${pageIds}&prop=coordinates|pageimages|description|info&format=json&piprop=thumbnail&pithumbsize=400&pilimit=50&inprop=url`;
  const detailRes = await fetch(detailUrl, {
    headers,
    next: { revalidate: 86400 },
  });
  if (!detailRes.ok) throw new Error(`Wikipedia detail returned ${detailRes.status}`);

  const detailData = await detailRes.json();
  const detailPages = detailData?.query?.pages || {};

  const destinations: DestinationResult[] = [];

  for (const page of pages) {
    const detail = detailPages[page.pageid];
    const coords = detail?.coordinates?.[0];
    if (!coords) continue;

    const title = page.title || "";
    if (title.toLowerCase() === countryName.toLowerCase()) continue;

    const description = detail?.description || "";

    // Filter: only keep actual tourist attractions
    if (!isTouristAttraction(title, description)) continue;

    const desc = description.toLowerCase();
    let type = "landmark";
    if (desc.includes("mountain") || desc.includes("volcano") || desc.includes("peak")) type = "mountain";
    else if (desc.includes("island") || desc.includes("atoll")) type = "island";
    else if (desc.includes("lake") || desc.includes("river") || desc.includes("waterfall")) type = "lake";
    else if (desc.includes("beach") || desc.includes("coast")) type = "beach";
    else if (desc.includes("city") || desc.includes("town") || desc.includes("village")) type = "city";

    const thumbnail = detail?.thumbnail?.source;
    const thumbnailUrl = thumbnail
      ? (thumbnail.startsWith("//") ? `https:${thumbnail}` : thumbnail)
      : undefined;
    const pageUrl = detail?.canonicalurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`;

    destinations.push({
      id: `wiki-${page.pageid}`,
      name: title,
      lat: coords.lat,
      lng: coords.lon,
      type,
      country: countryName,
      extract: description || `Explore ${title}, located in ${countryName}.`,
      thumbnailUrl: thumbnailUrl,
      wikiUrl: pageUrl,
    });
  }

  return destinations;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const latStr = searchParams.get("lat");
  const lngStr = searchParams.get("lng");
  const countryName = searchParams.get("country") || "Unknown";

  if (!latStr || !lngStr) {
    return NextResponse.json(
      { error: "lat and lng parameters are required" },
      { status: 400 }
    );
  }

  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);

  try {
    const destinations = await fetchFromWikipedia(lat, lng, countryName);
    if (destinations.length > 0) {
      return NextResponse.json({ destinations, source: "wikipedia" });
    }
  } catch (e) {
    console.error("Wikipedia API failed:", e);
  }

  return NextResponse.json(
    { destinations: [], source: "none" },
    { status: 200 }
  );
}
