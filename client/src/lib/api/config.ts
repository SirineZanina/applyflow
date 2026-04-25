const raw = import.meta.env.VITE_API_URL as string | undefined;

if (!raw || raw.trim() === "") {
  throw new Error("[config] VITE_API_URL is not set. Add it to your .env file.");
}

try {
  new URL(raw);
} catch {
  throw new Error(`[config] VITE_API_URL is not a valid URL: "${raw}"`);
}

export const BASE_URL = raw.replace(/\/$/, "");
