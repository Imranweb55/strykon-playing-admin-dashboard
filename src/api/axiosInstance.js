import axios from "axios";

const configuredUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// "localhost" only means this computer. When the dashboard is opened from
// another device on the same Wi-Fi (e.g. http://192.168.1.5:5173), a
// localhost API address would point at that phone/tablet instead of the PC
// running the backend - so swap in the host the page was opened from.
const resolveBaseUrl = (url) => {
  try {
    const target = new URL(url);
    const local = ["localhost", "127.0.0.1", "::1", "[::1]"];
    const pageHost = window.location.hostname;
    if (local.includes(target.hostname) && !local.includes(pageHost)) {
      target.hostname = pageHost;
      return target.toString().replace(/\/$/, "");
    }
  } catch {
    /* not an absolute URL (e.g. "/api") - use it as is */
  }
  return url;
};

const axiosInstance = axios.create({
  baseURL: resolveBaseUrl(configuredUrl),
});

// Attach saved token (if any) to every outgoing request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("strykon_admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
