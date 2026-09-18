import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";

global.fetch = vi.fn();

describe("GET /api/world-bank/[cca3]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 for invalid cca3 parameter with path traversal", async () => {
    const params = Promise.resolve({ cca3: "../USA" });
    const req = new Request("http://localhost:3000/api/world-bank/../USA");

    const res = await GET(req, { params });
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body).toEqual({ error: "Invalid country code parameter" });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid cca3 parameter with injected query parameters", async () => {
    const params = Promise.resolve({ cca3: "USA?foo=bar" });
    const req = new Request("http://localhost:3000/api/world-bank/USA?foo=bar");

    const res = await GET(req, { params });
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body).toEqual({ error: "Invalid country code parameter" });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("returns 400 for cca3 with incorrect length", async () => {
    const params = Promise.resolve({ cca3: "US" });
    const req = new Request("http://localhost:3000/api/world-bank/US");

    const res = await GET(req, { params });
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body).toEqual({ error: "Invalid country code parameter" });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("fetches data successfully for valid 3-character cca3", async () => {
    const mockData = [{ page: 1 }, [{ countryiso3code: "USA", value: 1.0 }]];
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const params = Promise.resolve({ cca3: "USA" });
    const req = new Request("http://localhost:3000/api/world-bank/USA");

    const res = await GET(req, { params });
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.worldbank.org/v2/country/USA/indicator/PA.NUS.PPPC.RF?format=json&per_page=10",
      { next: { revalidate: 604800 } }
    );
  });
});
