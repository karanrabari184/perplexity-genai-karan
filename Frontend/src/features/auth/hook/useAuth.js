import { useDispatch } from "react-redux";
import { register, login, getMe, logout } from "../service/auth.api";
import { setUser, setLoading, setError } from "../service/auth.slice";

export function useAuth(){
    
    const dispatch = useDispatch()

    async function handleRegister({ email, username, password }) {
        try {
            dispatch(setLoading(true))
            dispatch(setError(null))
            const data = await register({ email, username, password })
            dispatch(setUser(null))
            return data.success === true
        } catch (error) {
            dispatch(setError(error.response?.data?.message || "Registration failed"))
            return false
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleLogin({ email, password }) {
        try {
            dispatch(setLoading(true))
            dispatch(setError(null))
            const data = await login({ email, password })
            dispatch(setUser(data.user))
            return data.success === true
        } catch (err) {
            dispatch(setError(err.response?.data?.message || "Login failed"))
            return false
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleGetMe() {
        try {
            dispatch(setLoading(true))
            const data = await getMe()
            dispatch(setUser(data.user))
            dispatch(setError(null))
            return true
        } catch (err) {
            if (err.response?.status !== 401) {
                dispatch(setError(err.response?.data?.message || "Failed to fetch user data"))
            } else {
                dispatch(setUser(null))
                dispatch(setError(null))
            }
            return false
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleLogout() {
        try {
            await logout()
        } catch (err) {
            console.error("Logout error:", err)
        } finally {
            dispatch(setUser(null))
            dispatch(setError(null))
        }
    }

 return {
        handleRegister,
        handleLogin,
        handleGetMe,
        handleLogout,
    }

}