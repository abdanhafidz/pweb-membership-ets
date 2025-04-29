// app/page.tsx

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white font-sans flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-6">
          Welcome to Our Membership Site
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-8">
          Join our community and unlock access to exclusive content, insights, and more.
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/signup"
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:opacity-90 transition"
          >
            Sign Up
          </a>
          <a
            href="/login"
            className="px-6 py-2 rounded-xl border border-pink-500 text-pink-500 font-semibold hover:bg-pink-500 hover:text-white transition"
          >
            Login
          </a>
        </div>
      </div>
    </main>
  );
}
