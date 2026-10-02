import axios from "axios"
import { getApiBaseUrl } from "../../../lib/apiBase.js"

export const authApi = axios.create({
    baseURL: getApiBaseUrl(),
    withCredentials: true,
})

export async function register({ email, username, password }) {
    const response = await authApi.post("/api/auth/register", { email, username, password })
    return response.data
}

export async function login({ email, password }) {
    const response = await authApi.post("/api/auth/login", { email, password })
    return response.data
}

export async function getMe() {
    const response = await authApi.get("/api/auth/get-me")
    return response.data
}

export async function logout() {
    const response = await authApi.post("/api/auth/logout")
    return response.data
}

