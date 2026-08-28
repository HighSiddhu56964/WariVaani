import axios from "axios";
import axiosRetry from "axios-retry";

const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const api = axios.create({
  baseURL: rawBaseUrl.replace(/\/$/, ""),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Configure Axios-Retry interceptor rules
axiosRetry(api, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    // Retry on network offline or request connection timeouts (ECONNABORTED)
    // Skip retrying Client error status codes (4xx)
    const status = error.response ? error.response.status : null;
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      error.code === "ECONNABORTED" ||
      (status !== null && status >= 500)
    );
  },
});

export default api;
