import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

let csrfToken: string | null = null;
let csrfTokenPromise: Promise<string> | null = null;

export async function fetchCsrf(): Promise<string> {
  // If a fetch is already in-flight, reuse it (prevents race conditions)
  if (csrfTokenPromise) return csrfTokenPromise;

  csrfTokenPromise = api.get<{ csrfToken: string }>("/csrf-token")
    .then((res) => {
      csrfToken = res.data.csrfToken;
      return csrfToken;
    })
    .finally(() => {
      csrfTokenPromise = null;
    });

  return csrfTokenPromise;
}

api.interceptors.request.use(async (config) => {
  if (config.method !== "get" && config.method !== "head" && config.method !== "options") {
    if (!csrfToken) await fetchCsrf();
    config.headers["x-csrf-token"] = csrfToken;
  }
  return config;
});

api.interceptors.response.use(undefined, async (err) => {
  if (err.response?.status === 403 && err.response?.data?.message?.includes("CSRF")) {
    const retryCount = err.config?._retryCount || 0;
    if (retryCount >= 2) throw err;
    // Force fresh token on retry (clear promise so a new request is made)
    csrfTokenPromise = null;
    await fetchCsrf();
    if (err.config) {
      err.config.headers["x-csrf-token"] = csrfToken;
      err.config._retryCount = retryCount + 1;
      return api(err.config);
    }
  }
  throw err;
});

export default api;
