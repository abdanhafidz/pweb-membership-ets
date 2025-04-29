// app/login/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Cookies from "js-cookie";
import { motion } from "framer-motion";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        "https://lifedebugger-pweb-api-ets.hf.space/api/v1/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        Cookies.set("jwt_token", data.data.token, { expires: 7 });
        toast.success("Login successful!");
        setTimeout(() => router.push("/dashboard"), 1500);
      } else {
        toast.error(data?.message || "Login failed");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white font-sans flex flex-col items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="max-w-md w-full bg-opacity-50 bg-black rounded-xl shadow-lg p-8 space-y-6">
        <h2 className="text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
          Login
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-lg font-semibold mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full p-3 rounded-lg bg-gray-800 text-white focus:outline-none"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-lg font-semibold mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full p-3 rounded-lg bg-gray-800 text-white focus:outline-none"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-400">
          Don't have an account?{" "}
          <a href="/signup" className="text-purple-500 hover:text-purple-400">
            Sign up
          </a>
        </p>
      </div>
    </motion.div>
  );
}
