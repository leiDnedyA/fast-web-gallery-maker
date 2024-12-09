export const ENVIRONMENT: "production" | "development" = import.meta.env.MODE as any;

export function adjustEndpointToEnvironment(endpoint: string): string {
  return `${ENVIRONMENT === "production" ? "" : "/api"}${endpoint}`;
}
