import axios from "axios";

export interface ApiErrorDetail {
  message: string;
  statusCode?: number;
  rawError?: any;
}

export function parseApiError(error: any): ApiErrorDetail {
  if (axios.isAxiosError(error)) {
    // Check for request timeout
    if (error.code === "ECONNABORTED") {
      return {
        message: "सर्व्हर प्रतिसाद देत नाही. कृपया पुन्हा प्रयत्न करा (Server connection timeout).",
        statusCode: 408,
        rawError: error,
      };
    }
    // Check for offline / no network response
    if (!error.response) {
      return {
        message: "इंटरनेट जोडणी तपासा. सर्व्हरशी संपर्क होऊ शकत नाही (Network connection offline).",
        rawError: error,
      };
    }
    // Extract server side exception details
    const data = error.response.data as any;
    const message = data?.detail || data?.message || "सर्व्हर एरर आली. कृपया थोड्या वेळाने प्रयत्न करा (API Error).";
    return {
      message,
      statusCode: error.response.status,
      rawError: error,
    };
  }
  return {
    message: error?.message || "काहीतरी चूक झाली (An unexpected error occurred).",
    rawError: error,
  };
}
