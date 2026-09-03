import { ConvexReactClient } from "convex/react";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL ?? "";
export const convex =
  CONVEX_URL && typeof window !== "undefined"
    ? new ConvexReactClient(CONVEX_URL)
    : null;

export { ConvexProvider } from "convex/react";
