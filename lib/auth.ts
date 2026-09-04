export function checkApiKey(req: Request): boolean {
  const required = process.env.TRACECHAIN_API_KEY;
  if (!required) return true;
  return req.headers.get("x-api-key") === required;
}
