import { QueryClient } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const errorData = await res.json();
    const error = new Error(errorData.message || `Error ${res.status}: ${res.statusText}`);
    throw error;
  }
}

export async function apiRequest(
  method: string,
  url: string,
  body?: Record<string, any>,
  options?: RequestInit
) {
  const res = await fetch(url, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    ...options,
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => (context: any) => Promise<T | null> =
  ({ on401 }) =>
  async (context) => {
    try {
      const endpoint = context.queryKey[0];
      const res = await fetch(endpoint, {
        credentials: "include",
      });

      if (res.status === 401) {
        if (on401 === "throw") {
          throw new Error("Unauthorized");
        }
        return null;
      }

      await throwIfResNotOk(res);
      return res.json();
    } catch (err) {
      console.error("Query error:", err);
      throw err;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }),
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});