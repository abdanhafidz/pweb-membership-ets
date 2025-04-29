// app/signup/page.tsx

'use client';

import { useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const token = Cookies.get('token');
      const res = await fetch(
        'https://lifedebugger-pweb-api-ets.hf.space/api/v1/auth/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
          }),
        }
      );
      const data = await res.json();

      if (res.ok) {
        toast.success('Registration successful!');
        setTimeout(() => router.push('/login'), 1500);
      } else {
        toast.error(data?.message || 'Something went wrong');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white font-sans flex items-center justify-center px-4">
      <Toaster position="top-right" />
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-gray-900 p-8 rounded-2xl shadow-lg space-y-6"
      >
        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
          Sign Up
        </h2>
        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          value={form.email}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          minLength={8}
          className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={form.password}
          onChange={handleChange}
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          required
          className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={form.confirmPassword}
          onChange={handleChange}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
      </motion.form>
    </main>
  );
}