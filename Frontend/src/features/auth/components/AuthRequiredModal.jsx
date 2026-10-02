import React, { useEffect } from "react"
import { useNavigate } from "react-router"
import { savePendingChatMessage } from "../constants/pendingMessage"

const AuthRequiredModal = ({ open, onClose, pendingMessage }) => {
    const navigate = useNavigate()

    useEffect(() => {
        if (!open) return

        const onKeyDown = (event) => {
            if (event.key === "Escape") {
                onClose()
            }
        }

        window.addEventListener("keydown", onKeyDown)
        return () => window.removeEventListener("keydown", onKeyDown)
    }, [open, onClose])

    if (!open) return null

    const goToAuth = (path) => {
        savePendingChatMessage(pendingMessage)
        onClose()
        navigate(path)
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-required-title"
        >
            <button
                type="button"
                className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
                aria-label="Close dialog"
                onClick={onClose}
            />

            <div className="relative w-full max-w-sm rounded-2xl border border-[#31b8c6]/35 bg-zinc-900 p-6 shadow-2xl shadow-black/50">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-white/10 hover:text-white"
                    aria-label="Close"
                >
                    ×
                </button>

                <h2
                    id="auth-required-title"
                    className="pr-8 text-lg font-semibold text-[#31b8c6]"
                >
                    Login required
                </h2>

                <p className="mt-3 text-sm leading-6 text-zinc-300">
                    Please login or create an account to start chatting.
                </p>

                <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                    <button
                        type="button"
                        onClick={() => goToAuth("/login")}
                        className="flex-1 rounded-lg bg-[#31b8c6] px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-[#45c7d4]"
                    >
                        Login
                    </button>

                    <button
                        type="button"
                        onClick={() => goToAuth("/register")}
                        className="flex-1 rounded-lg border border-[#31b8c6]/50 px-4 py-2.5 text-sm font-semibold text-[#31b8c6] transition hover:bg-[#31b8c6]/10"
                    >
                        Create account
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AuthRequiredModal
