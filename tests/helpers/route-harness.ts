// Route harness: invokes Next.js route handlers directly under bun test.
// Sends the x-api-key header when TRACECHAIN_API_KEY is present in the test
// environment (mirroring the browser/CLI behavior).

export async function post(
  route: "trace" | "nft" | "report",
  body: unknown
): Promise<Response> {
  const mod = await import(`@/app/api/${route}/route`);
  const key = process.env.TRACECHAIN_API_KEY;
  const req = new Request(`http://localhost:3000/api/${route}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(key ? { "x-api-key": key } : {}),
    },
    body: JSON.stringify(body),
  });
  return mod.POST(req);
}

export async function get(
  route: "dataset",
  path: string = "/api/dataset"
): Promise<Response> {
  const mod = await import(`@/app/api/${route}/route`);
  const key = process.env.TRACECHAIN_API_KEY;
  const req = new Request(`http://localhost${path}`, {
    method: "GET",
    headers: {
      ...(key ? { "x-api-key": key } : {}),
    },
  });
  return mod.GET(req);
}
