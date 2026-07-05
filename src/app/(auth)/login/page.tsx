"use client";

import { useState } from "react";
import { signUpAction, signInAction } from "./actions";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const result = isLogin
      ? await signInAction(formData)
      : await signUpAction(formData);

    if (result?.error) {
      alert(result.error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-white p-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <div className="w-full max-w-md mx-auto flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-16 h-16 bg-[#2f4f7f] text-[#a3c2f9] rounded-full flex items-center justify-center shadow-lg mb-2">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9z"/>
            </svg>
          </div>
          <h1 className="font-bold text-3xl text-[#143867]">
            Curiosity Olympiad
          </h1>
          <p className="text-gray-600 text-sm font-medium">
            Your journey to discovery begins here.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 text-center rounded-md font-semibold text-sm transition-colors ${
              isLogin
                ? "bg-white shadow-sm text-[#143867]"
                : "text-gray-500 hover:text-[#143867]"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 text-center rounded-md font-semibold text-sm transition-colors ${
              !isLogin
                ? "bg-white shadow-sm text-[#143867]"
                : "text-gray-500 hover:text-[#143867]"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-sm text-gray-900" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required={!isLogin}
              placeholder="student@school.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#143867] focus:ring-1 focus:ring-[#143867] text-gray-900 transition-all"
            />
          </div>

          {!isLogin && (
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-sm text-gray-900" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                name="identifier"
                type="text"
                required={!isLogin}
                placeholder="e.g. ScienceWhiz99"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#143867] focus:ring-1 focus:ring-[#143867] text-gray-900 transition-all"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="font-semibold text-sm text-gray-900" htmlFor="password">
                Password
              </label>
              {isLogin && (
                <a className="text-xs font-medium text-[#143867] hover:underline" href="#">
                  Forgot?
                </a>
              )}
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-[#143867] focus:ring-1 focus:ring-[#143867] text-gray-900 transition-all"
            />
          </div>

          <button
            type="submit"
            className="mt-4 w-full bg-[#143867] text-white py-3.5 rounded-lg font-semibold text-sm hover:bg-[#0f2a4f] transition-colors shadow-md"
          >
            Continue
          </button>
        </form>

      </div>
    </div>
  );
}