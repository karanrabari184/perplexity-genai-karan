import React from "react"
import { Link, useNavigate } from "react-router"
import { useSelector } from "react-redux"
import { useAuth } from "../hook/useAuth"

const Profile = () => {
    const user = useSelector((state) => state.auth.user)
    const { handleLogout } = useAuth()
    const navigate = useNavigate()

    const onLogout = async () => {
        await handleLogout()
        navigate("/")
    }

    const displayName = user?.username || "User"
    const initial = displayName.charAt(0).toUpperCase()

    return (
        <section className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-lg">
                <Link
                    to="/"
                    className="text-sm font-medium text-[#31b8c6] transition hover:text-[#45c7d4]"
                >
                    ← Back to chat
                </Link>

                <div className="mt-8 rounded-2xl border border-[#31b8c6]/40 bg-zinc-900/70 p-8 shadow-2xl shadow-black/50 backdrop-blur">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#31b8c6] text-xl font-bold text-zinc-950">
                            {initial}
                        </div>

                        <div>
                            <h1 className="text-2xl font-semibold text-white">Profile</h1>
                            <p className="text-sm text-zinc-400">Personal account</p>
                        </div>
                    </div>

                    <dl className="mt-8 space-y-4 text-sm">
                        <div>
                            <dt className="text-zinc-500">Username</dt>
                            <dd className="mt-1 font-medium text-white">{user?.username}</dd>
                        </div>
                        <div>
                            <dt className="text-zinc-500">Email</dt>
                            <dd className="mt-1 font-medium text-white">{user?.email}</dd>
                        </div>
                    </dl>

                    <button
                        type="button"
                        onClick={onLogout}
                        className="mt-8 w-full rounded-lg border border-red-500/40 bg-red-950/30 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-950/50"
                    >
                        Log out
                    </button>
                </div>
            </div>
        </section>
    )
}

export default Profile
