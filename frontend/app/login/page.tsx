"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginUser, saveToken, saveUser } from "../lib/api";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { user, token } = await loginUser({ email, password });
      saveToken(token);
      saveUser(user);

      if (user.role === "admin") {
        router.push("/admin");
      } else if (user.role === "guide") {
        router.push("/guide-dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  function setDemoCredentials(e: string, p: string) {
    setEmail(e);
    setPassword(p);
    setError(null);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4 py-12 relative overflow-hidden">
      {/* Decorative watermark */}
      <div className="pointer-events-none select-none absolute inset-0 flex items-center justify-center">
        <span className="text-[200px] font-extrabold text-teal-900/5 whitespace-nowrap">
          HikKing
        </span>
      </div>

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-sm border border-stone-200/80 p-8 sm:p-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-700 to-teal-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M14 6l6 12H4l4-8 3 5 3-9z" />
              </svg>
            </span>
          </Link>
          <span className="text-xl font-black text-gray-900 mt-2">
            Hik<span className="text-teal-600">King</span>
          </span>
          <span className="text-xs text-gray-400 font-medium">Trekking & Outdoor Expeditions</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 text-center">
          Welcome Back
        </h1>
        <p className="text-xs text-gray-500 text-center mt-1 mb-6">
          Sign in to manage your trips, reservations, and profile
        </p>

        {/* Demo Fast Login Chips */}
        <div className="mb-6 p-3 bg-stone-50 rounded-2xl border border-stone-200/70">
          <span className="text-[11px] font-bold text-gray-500 block uppercase tracking-wider mb-2 text-center">
            Demo Accounts
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => setDemoCredentials("admin@hikking.com", "password123")}
              className="px-2 py-1.5 bg-white hover:bg-teal-50 border border-stone-200 rounded-xl text-[11px] font-bold text-gray-700 hover:text-teal-700 transition text-center shadow-2xs cursor-pointer"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials("traveler@hikking.com", "password123")}
              className="px-2 py-1.5 bg-white hover:bg-teal-50 border border-stone-200 rounded-xl text-[11px] font-bold text-gray-700 hover:text-teal-700 transition text-center shadow-2xs cursor-pointer"
            >
              Traveler
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials("guide.tariq@hikking.com", "password123")}
              className="px-2 py-1.5 bg-white hover:bg-teal-50 border border-stone-200 rounded-xl text-[11px] font-bold text-gray-700 hover:text-teal-700 transition text-center shadow-2xs cursor-pointer"
            >
              Guide
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="e.g. traveler@hikking.com"
              className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-gray-700">
                Password
              </label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter password"
                className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 pr-10 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-medium"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold py-3 rounded-xl shadow-xs transition-all disabled:opacity-60 text-sm"
          >
            {loading ? "Signing in..." : "Sign In to Account"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-6">
          Don&apos;t have an account yet?{" "}
          <Link href="/signup" className="text-teal-600 font-bold hover:underline">
            Register for Free
          </Link>
        </p>
      </div>
    </div>
  );
}
