import axios from "axios";

export const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:5500";

const server = axios.create({
  baseURL: BASE_URL,
});

export function assetUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Request Interceptor:
 * Injects the Bearer token from localStorage into the Authorization header
 * for every outgoing request if the token exists.
 */
server.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * Response Interceptor:
 * Handles centralized error management.
 * If a 401 Unauthorized error occurs, the user's session is cleared and they are
 * redirected to the admin login page.
 */
server.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      const isAdminPath = window.location.pathname.startsWith("/admin");

      // ONLY redirect if it's an admin or a known protected route
      // We don't want to boot guests off the home/cart page!
      if (isAdminPath || window.location.pathname.startsWith("/profile")) {
        const loginPath = isAdminPath ? "/admin/login" : "/login";
        window.location.href = loginPath;
      }
    }
    return Promise.reject(error);
  },
);

// server.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     // Handle session expiration or missing credentials
//     if (error.response && error.response.status === 401) {
//       localStorage.removeItem("token");
//       localStorage.removeItem("user");

//       // Check where the user is to redirect them.
//       const isAdminPath = window.location.pathname.startsWith("/admin");
//       const loginPath = isAdminPath ? "/admin/login" : "/login";

//       if (window.location.pathname !== loginPath) {
//         window.location.href = loginPath;
//       }
//     }

//     // Always propagate the error so callers can handle specific cases
//     return Promise.reject(error);
//   },
// );

export default server;
