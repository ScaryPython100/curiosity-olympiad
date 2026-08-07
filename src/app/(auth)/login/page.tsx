"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUpAction, signInAction, sendOtpAction, verifyOtpAction, resetPasswordAction } from "./actions";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";

export default function AuthPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"create_account" | "login">("login");
  const isLogin = activeTab === "login";
  const [loginWithOtp, setLoginWithOtp] = useState(false);
  
  // OTP State
  const [destination, setDestination] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpUsername, setOtpUsername] = useState("");
  const [otpRealName, setOtpRealName] = useState("");
  const [otpPassword, setOtpPassword] = useState("");
  
  // Password State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [realName, setRealName] = useState("");
  
  // Forgot Password State
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetIdentifier, setResetIdentifier] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination) return;
    setIsLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      if (typeof window !== "undefined") {
        if (otpRealName) localStorage.setItem("curiosity_real_name", otpRealName);
        if (otpUsername) {
          localStorage.setItem("curiosity_username", otpUsername);
          localStorage.setItem("curiosity_login_" + otpUsername.toLowerCase().trim(), destination.trim());
        }
      }

      const formData = new FormData();
      formData.append("destination", destination);
      formData.append("method", destination.includes("@") ? "email" : "phone");
      if (activeTab === "create_account") {
        formData.append("isCreateAccount", "true");
        if (otpUsername) formData.append("username", otpUsername);
      }
      
      const res = await sendOtpAction(formData);
      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        setOtpSent(true);
        setSuccessMsg(`OTP code sent to ${destination}`);
      } else {
        setError("Failed to send OTP code.");
      }
    } catch (err: any) {
      if (err.message === "NEXT_REDIRECT" || (err.digest && err.digest.includes("NEXT_REDIRECT"))) throw err;
      setError(err.message || "Error sending OTP code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) return;
    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("destination", destination);
      formData.append("code", otpCode);
      formData.append("username", otpUsername || destination.split("@")[0] || "Explorer");
      formData.append("realName", otpRealName || otpUsername || "Student");
      formData.append("password", otpPassword || "DevSandboxOverridePassword!123");
      if (activeTab === "create_account") {
        formData.append("isCreateAccount", "true");
      }

      const res = await verifyOtpAction(formData);
      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      if (err.message === "NEXT_REDIRECT" || (err.digest && err.digest.includes("NEXT_REDIRECT"))) throw err;
      setError(err.message || "Verification error.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const formData = new FormData();
      formData.append("identifier", resetIdentifier);
      formData.append("code", resetOtp);
      formData.append("newPassword", newPassword);

      const res = await resetPasswordAction(formData);
      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        setSuccessMsg(res.message || "Password updated successfully! You can now log in.");
        setIsForgotPassword(false);
        setPassword(newPassword);
        if (resetIdentifier) setEmail(resetIdentifier);
      }
    } catch (err: any) {
      setError(err.message || "Error resetting password.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Prevent user from trying to log in using a Real Name with spaces
    if (isLogin) {
      const cleanInput = email.trim();
      const isEmailFormat = cleanInput.includes("@");
      const isPhoneFormat = /^\+?[\d\s\-\(\)]+$/.test(cleanInput);
      if (!isEmailFormat && !isPhoneFormat && cleanInput.includes(" ")) {
        setError("🚫 To log in, you cannot use your Real Name ('" + cleanInput + "'). Please enter your registered Mobile Number, Mail ID, or Username (without spaces).");
        setIsLoading(false);
        return;
      }
    }

    if (!isLogin && typeof window !== "undefined") {
      if (realName) localStorage.setItem("curiosity_real_name", realName);
      if (username) {
        localStorage.setItem("curiosity_username", username);
        localStorage.setItem("curiosity_login_" + username.toLowerCase().trim(), email.trim());
      }
    }

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    if (!isLogin) {
      formData.append("identifier", username);
      formData.append("realName", realName);
    } else {
      if (typeof window !== "undefined") {
        const resolved = localStorage.getItem("curiosity_login_" + email.toLowerCase().trim());
        if (resolved) formData.append("resolvedEmail", resolved);
      }
    }

    if (isLogin) {
      const res = await signInAction(formData);
      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        window.location.href = "/dashboard";
      }
    } else {
      const res = await signUpAction(formData);
      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        window.location.href = "/dashboard";
      }
    }
    
    setIsLoading(false);
  };

  console.log("DEBUG SSR:", { typeT: typeof t, typeAuth: typeof t?.auth, typeAppTitle: typeof t?.auth?.app_title, isLanguagesArray: false }); return (
    <div className="min-h-screen flex flex-col justify-center bg-[#f7f9fb] p-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <div className="w-full max-w-md mx-auto flex flex-col gap-6">
        
        {/* Language Selector at Top Right */}
        <div className="flex justify-end">
          <LanguageSelector />
        </div>

        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-14 h-14 bg-[#143867] text-[#ffe16d] rounded-2xl flex items-center justify-center shadow-lg mb-1">
            <span className="material-symbols-outlined text-3xl">lightbulb</span>
          </div>
          <h1 className="font-extrabold text-3xl text-[#143867] tracking-tight">
            {t.auth.app_title}
          </h1>
          <p className="text-gray-600 text-xs md:text-sm font-medium">
            Agastya International Foundation • Aah! Aha! Ha-ha!
          </p>
        </div>

        {/* 2-Section Switcher: Create Account vs Login */}
        <div className="flex bg-gray-200/80 rounded-xl p-1 border border-gray-300/60">
          <button
            type="button"
            onClick={() => { setActiveTab("create_account"); setError(""); setSuccessMsg(""); }}
            className={`flex-1 py-2.5 text-center rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "create_account"
                ? "bg-white shadow-sm text-[#143867]"
                : "text-gray-600 hover:text-[#143867]"
            }`}
          >
            <span className="material-symbols-outlined text-sm">person_add</span>
            <span>{t.auth.sign_up}</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("login"); setError(""); setSuccessMsg(""); }}
            className={`flex-1 py-2.5 text-center rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "login"
                ? "bg-white shadow-sm text-[#143867]"
                : "text-gray-600 hover:text-[#143867]"
            }`}
          >
            <span className="material-symbols-outlined text-sm">login</span>
            <span>{t.auth.sign_in}</span>
          </button>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100">
          {error && (
            <div className="bg-red-50 text-red-500 border border-red-200 p-3 rounded-xl text-xs font-semibold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">error</span>
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-green-50 text-green-600 border border-green-200 p-3 rounded-xl text-xs font-semibold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              <span>{successMsg}</span>
            </div>
          )}

          {/* SECTION 1: CREATE ACCOUNT */}
          {activeTab === "create_account" && (
            !otpSent ? (
              <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-xs uppercase tracking-wider text-[#143867]" htmlFor="destination">
                    {t.auth.email_phone}
                  </label>
                  <input
                    id="destination"
                    type="text"
                    required
                    placeholder="student@school.edu or +91 98765 43210"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-[#f7f9fb] border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#143867] focus:ring-1 focus:ring-[#143867] text-gray-900 transition-all font-medium"
                  />
                  <p className="text-[11px] text-gray-500 font-medium">
                    {t.auth.send_otp_disclaimer}
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-xs uppercase tracking-wider text-[#143867]" htmlFor="otpRealName">
                    {t.auth.real_name_req}
                  </label>
                  <input
                    id="otpRealName"
                    type="text"
                    required
                    placeholder={t.auth.real_name_placeholder}
                    value={otpRealName}
                    onChange={(e) => setOtpRealName(e.target.value)}
                    className="w-full bg-[#f7f9fb] border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#143867] focus:ring-1 focus:ring-[#143867] text-gray-900 transition-all font-medium"
                  />
                  <p className="text-[11px] text-gray-500 font-medium">
                    {t.auth.real_name_desc}
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-xs uppercase tracking-wider text-[#143867]" htmlFor="otpUsername">
                    {t.auth.username}
                  </label>
                  <input
                    id="otpUsername"
                    type="text"
                    required
                    placeholder={t.auth.username_placeholder}
                    value={otpUsername}
                    onChange={(e) => setOtpUsername(e.target.value)}
                    className="w-full bg-[#f7f9fb] border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#143867] focus:ring-1 focus:ring-[#143867] text-gray-900 transition-all font-medium"
                  />
                  <div className="bg-amber-50 border border-amber-300/80 p-2.5 rounded-xl text-xs text-[#9a3412] font-bold flex items-start gap-1.5 mt-0.5">
                    <span className="material-symbols-outlined text-sm text-[#f37021] shrink-0 mt-0.5">warning</span>
                    <span>
                      {t.auth.username_warning}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-xs uppercase tracking-wider text-[#143867]" htmlFor="otpPassword">
                    {t.auth.password_req}
                  </label>
                  <input
                    id="otpPassword"
                    type="password"
                    required
                    placeholder={t.auth.password_placeholder}
                    value={otpPassword}
                    onChange={(e) => setOtpPassword(e.target.value)}
                    className="w-full bg-[#f7f9fb] border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#143867] focus:ring-1 focus:ring-[#143867] text-gray-900 transition-all font-medium"
                  />
                  <p className="text-[11px] text-gray-500 font-medium">
                    {t.auth.password_desc}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-2 w-full bg-[#143867] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#1d4d8a] transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">send</span>
                  <span>{isLoading ? (t.auth.sending_otp) : (t.auth.send_otp)}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-xs uppercase tracking-wider text-[#143867]" htmlFor="otpCode">
                      {t.auth.enter_otp}
                    </label>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-xs font-bold text-[#143867] hover:underline"
                    >
                      {t.auth.change_address}
                    </button>
                  </div>
                  <input
                    id="otpCode"
                    type="text"
                    required
                    maxLength={6}
                    placeholder="• • • • • •"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full bg-[#f7f9fb] border border-gray-300 rounded-xl px-4 py-3 text-center text-xl font-mono tracking-widest font-bold focus:outline-none focus:border-[#143867] focus:ring-2 focus:ring-[#143867] text-gray-900 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-2 w-full bg-[#143867] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#1d4d8a] transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  <span>{isLoading ? (t.auth.verifying) : (t.auth.verify_create)}</span>
                </button>
              </form>
            )
          )}

          {/* SECTION 2: LOGIN */}
          {activeTab === "login" && (
            <div className="space-y-4">
              {isForgotPassword ? (
                /* Forgot Password View */
                <form onSubmit={handleResetPasswordSubmit} className="flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <h3 className="font-bold text-sm text-[#143867] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base text-[#f37021]">lock_reset</span>
                      {t.auth.forgot_password}
                    </h3>
                    <button
                      type="button"
                      onClick={() => { setIsForgotPassword(false); setError(""); setSuccessMsg(""); }}
                      className="text-xs font-bold text-gray-400 hover:text-gray-600"
                    >
                      {t.auth.cancel}
                    </button>
                  </div>

                  <p className="text-xs text-gray-600 font-medium">
                    {t.auth.enter_registered}
                  </p>

                  {/* Identifier */}
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-xs uppercase tracking-wider text-[#143867]" htmlFor="resetIdentifier">
                      {t.auth.email_phone}
                    </label>
                    <input
                      id="resetIdentifier"
                      type="text"
                      required
                      placeholder="e.g. student@school.edu or ScaryPython692"
                      value={resetIdentifier}
                      onChange={(e) => setResetIdentifier(e.target.value)}
                      className="w-full bg-[#f7f9fb] border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#143867] focus:ring-1 focus:ring-[#143867] text-gray-900 transition-all font-medium"
                    />
                  </div>

                  {/* OTP Code */}
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-xs uppercase tracking-wider text-[#143867]" htmlFor="resetOtp">
                      {t.auth.enter_otp}
                    </label>
                    <input
                      id="resetOtp"
                      type="text"
                      required
                      placeholder="• • • • • •"
                      value={resetOtp}
                      onChange={(e) => setResetOtp(e.target.value)}
                      className="w-full bg-[#f7f9fb] border border-gray-300 rounded-xl px-4 py-3 text-sm font-mono tracking-widest focus:outline-none focus:border-[#143867] focus:ring-1 focus:ring-[#143867] text-gray-900 transition-all font-medium"
                    />
                    <p className="text-[10px] text-gray-500 font-medium">{t.auth.enter_otp_desc}</p>
                  </div>

                  {/* New Password */}
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-xs uppercase tracking-wider text-[#143867]" htmlFor="newPassword">
                      {t.auth.password_req}
                    </label>
                    <input
                      id="newPassword"
                      type="password"
                      required
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-[#f7f9fb] border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#143867] focus:ring-1 focus:ring-[#143867] text-gray-900 transition-all font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="mt-2 w-full bg-[#143867] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#1d4d8a] transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">key</span>
                    <span>{isLoading ? (t.auth.updating_password) : (t.auth.reset_password_btn)}</span>
                  </button>

                  <div className="text-center pt-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => { setIsForgotPassword(false); setError(""); }}
                      className="text-xs font-bold text-gray-500 hover:text-[#143867] hover:underline"
                    >
                      ← {t.auth.back_login}
                    </button>
                  </div>
                </form>
              ) : !loginWithOtp ? (
                <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
                  {/* Entry 1: Email ID, Phone Number or Username */}
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-xs uppercase tracking-wider text-[#143867]" htmlFor="email">
                      {t.auth.email_phone}
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="text"
                      required
                      placeholder="e.g. student@school.edu, +91 98765 43210, or ScienceWhiz99"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#f7f9fb] border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#143867] focus:ring-1 focus:ring-[#143867] text-gray-900 transition-all font-medium"
                    />
                    <p className="text-[11px] text-[#9a3412] font-bold mt-0.5">
                      {t.auth.login_disclaimer}
                    </p>
                  </div>

                  {/* Entry 2: Password */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <label className="font-bold text-xs uppercase tracking-wider text-[#143867]" htmlFor="password">
                        {t.auth.password}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPassword(true);
                          setResetIdentifier(email || destination);
                          setError("");
                          setSuccessMsg("");
                        }}
                        className="text-xs font-bold text-[#143867] hover:underline"
                      >
                        {t.auth.forgot}
                      </button>
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#f7f9fb] border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#143867] focus:ring-1 focus:ring-[#143867] text-gray-900 transition-all font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="mt-2 w-full bg-[#143867] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#1d4d8a] transition-all shadow-md active:scale-95 disabled:opacity-50"
                  >
                    {isLoading ? (t.auth.please_wait) : (t.auth.login_btn)}
                  </button>

                  <div className="text-center pt-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => { setLoginWithOtp(true); setError(""); setSuccessMsg(""); }}
                      className="text-xs font-bold text-[#143867] hover:underline inline-flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">sms</span>
                      <span>{t.auth.login_otp_toggle}</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* Alternate: OTP Login */
                !otpSent ? (
                  <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-xs uppercase tracking-wider text-[#143867]" htmlFor="loginDestination">
                        {t.auth.email_phone}
                      </label>
                      <input
                        id="loginDestination"
                        type="text"
                        required
                        placeholder="student@school.edu or +91 98765 43210"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="w-full bg-[#f7f9fb] border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#143867] focus:ring-1 focus:ring-[#143867] text-gray-900 transition-all font-medium"
                      />
                      <p className="text-[11px] text-gray-500 font-medium">
                        {t.auth.otp_login_desc}
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="mt-2 w-full bg-[#143867] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#1d4d8a] transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">send</span>
                      <span>{isLoading ? (t.auth.sending_otp) : (t.auth.send_otp)}</span>
                    </button>

                    <div className="text-center pt-2 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => { setLoginWithOtp(false); setError(""); }}
                        className="text-xs font-bold text-gray-500 hover:text-[#143867] hover:underline"
                      >
                        ← {t.auth.back_login}
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-xs uppercase tracking-wider text-[#143867]" htmlFor="loginOtpCode">
                          {t.auth.enter_otp}
                        </label>
                        <button
                          type="button"
                          onClick={() => setOtpSent(false)}
                          className="text-xs font-bold text-[#143867] hover:underline"
                        >
                          {t.auth.change_address}
                        </button>
                      </div>
                      <input
                        id="loginOtpCode"
                        type="text"
                        required
                        maxLength={6}
                        placeholder="• • • • • •"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="w-full bg-[#f7f9fb] border border-gray-300 rounded-xl px-4 py-3 text-center text-xl font-mono tracking-widest font-bold focus:outline-none focus:border-[#143867] focus:ring-2 focus:ring-[#143867] text-gray-900 transition-all"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="mt-2 w-full bg-[#143867] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#1d4d8a] transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      <span>{isLoading ? (t.auth.verifying) : (t.auth.verify_login)}</span>
                    </button>
                  </form>
                )
              )}
            </div>
          )}
        </div>

        {/* School Bulk Roster Portal Link */}
        <div className="text-center">
          <Link
            href="/schools"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#143867] hover:underline bg-white px-4 py-2 rounded-full border border-gray-200 shadow-xs"
          >
            <span className="material-symbols-outlined text-sm">school</span>
            <span>{t.auth.school_portal}</span>
          </Link>
        </div>

      </div>
    </div>
  );
}