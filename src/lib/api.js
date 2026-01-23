import axios from "axios";
import { useCallback } from "react";

// Base URL
export const getBaseURL = () => {
    if (import.meta.env.VITE_APP_NODE_ENV === "production") {
        return import.meta.env.VITE_APP_API_BASE;
    } else {
        return "http://localhost:5000/api";
    }
};

// Axios instance
const api = axios.create({
    baseURL: getBaseURL(),
    withCredentials: true, // 🔥 REQUIRED for cookies
    timeout: 30000,
});


// -----------------------------
// Loading Interceptor
// -----------------------------
export const setupLoadingInterceptor = (setIsLoading) => {

    api.interceptors.request.use(
        (config) => {
            setIsLoading(true);
            return config;
        },
        (error) => {
            setIsLoading(false);
            return Promise.reject(error);
        }
    );

    api.interceptors.response.use(
        (response) => {
            setIsLoading(false);
            return response;
        },
        (error) => {
            setIsLoading(false);

            // Session expired / unauthorized
            if (error.response?.status === 401) {
                console.warn("Session expired. Redirecting to login...");
                window.location.href = "/login";
            }

            return Promise.reject(error);
        }
    );
};


// -----------------------------
// Request Wrapper
// -----------------------------
const requestWrapper = async (method, url, dataOrConfig = null) => {
    try {
        if (method === "get") {
            return await api.get(url, dataOrConfig);
        }
        if (method === "post") {
            return await api.post(url, dataOrConfig);
        }
        if (method === "put") {
            return await api.put(url, dataOrConfig);
        }
        if (method === "delete") {
            return await api.delete(url, dataOrConfig);
        }
    } catch (err) {
        console.error(`${method.toUpperCase()} Error:`, err.response?.data || err.message);
        throw err;
    }
};


// -----------------------------
// Custom Hook
// -----------------------------
export function useApi() {

    const get = useCallback(
        (url, config) => requestWrapper("get", url, config),
        []
    );

    const post = useCallback(
        (url, body) => requestWrapper("post", url, body),
        []
    );

    const put = useCallback(
        (url, body) => requestWrapper("put", url, body),
        []
    );

    const del = useCallback(
        (url, config) => requestWrapper("delete", url, config),
        []
    );

    return { get, post, put, del };
}
