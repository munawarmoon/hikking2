"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser, saveToken } from "@/app/lib/api";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const { user, token } = await loginUser({ email, password });
      if (user.role !== "admin") {
        setError("এই একাউন্ট admin না");
        return;
      }
      saveToken(token);
      router.push("/admin");
    } catch {
      setError("Login failed. Email অথবা password ভুল।");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow w-full max-w-sm space-y-4"
      >
        <h1 className="text-xl font-bold text-gray-800">Admin Login</h1>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          className="border p-2 w-full rounded"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Password"
          className="border p-2 w-full rounded"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button className="bg-teal-600 text-white px-4 py-2 rounded w-full">
          Login
        </button>
      </form>
    </div>
  );
}