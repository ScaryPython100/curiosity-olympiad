"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUpAction, signInAction, sendOtpAction, verifyOtpAction, resetPasswordAction } from "./actions";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { initTabSession } from "@/utils/auth";

export default function AuthPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"create_account" | "login">("login");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("mode") === "signup" || params.get("tab") === "signup") {
        setActiveTab("create_account");
      }
    }
  }, []);
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
  
  // School Code & Parental Consent State (Required for all self-serve signups)
  const [schoolCode, setSchoolCode] = useState("");
  const [hasConsent, setHasConsent] = useState(false);

  const [resetIdentifier, setResetIdentifier] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return null;
    let score = 0;
    if (pwd.length > 5) score += 1;
    if (pwd.length > 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { label: "Weak - Please make it stronger", barColor: "bg-red-400", textColor: "text-red-500", width: "w-1/3" };
    if (score <= 4) return { label: "Medium", barColor: "bg-amber-400", textColor: "text-amber-600", width: "w-2/3" };
    return { label: "Strong", barColor: "bg-emerald-500", textColor: "text-emerald-600", width: "w-full" };
  };
  const strength = getPasswordStrength(otpPassword);


  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) {
      setError("Please enter your mobile number or email address.");
      return;
    }

    if (activeTab === "create_account") {
      if (otpUsername) {
        const trimmedUser = otpUsername.trim();
        if (trimmedUser.length < 3 || trimmedUser.length > 24) {
          setError("🚫 Username must be between 3 and 24 characters.");
          return;
        }
        if (trimmedUser.includes("@") || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedUser)) {
          setError("🚫 Usernames cannot be an email address for student privacy. Please choose a public explorer nickname (e.g. StarGazer42).");
          return;
        }
        const cleanPhone = trimmedUser.replace(/[\s\-\(\)\+]/g, "");
        if (/^\d{7,15}$/.test(cleanPhone)) {
          setError("🚫 Usernames cannot be a phone number for student privacy. Please choose a public explorer nickname (e.g. StarGazer42).");
          return;
        }
        if (!/^[a-zA-Z0-9_.-]+$/.test(trimmedUser)) {
          setError("🚫 Usernames can only contain letters, numbers, underscores, dots, and hyphens (no spaces or special symbols).");
          return;
        }
      }
      if (!schoolCode.trim()) {
        setError("🚫 School Code is required. Please enter your school's code (e.g. AGS-KUPPAM-101) or ask your science teacher.");
        return;
      }
      if (schoolCode.trim().length < 3) {
        setError("🚫 Invalid School Code. Please check the code provided by your school.");
        return;
      }
      if (!hasConsent) {
        setError("🚫 Parental or teacher consent is required to create a Practice Lab account.");
        return;
      }
    }

    setIsLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("curiosity_school_code");
        if (otpRealName) localStorage.setItem("curiosity_real_name", otpRealName);
        if (otpUsername) {
          localStorage.setItem("curiosity_username", otpUsername);
          localStorage.setItem("curiosity_login_" + otpUsername.toLowerCase().trim(), destination.trim());
        }
        if (hasConsent) {
          localStorage.setItem("curiosity_parental_consent", "true");
          localStorage.setItem("curiosity_consent_timestamp", new Date().toISOString());
        }
      }

      const formData = new FormData();
      formData.append("destination", destination);
      formData.append("method", destination.includes("@") ? "email" : "phone");
      if (activeTab === "create_account") {
        formData.append("isCreateAccount", "true");
        if (otpUsername) formData.append("username", otpUsername);
        formData.append("schoolCode", schoolCode.trim().toUpperCase());
        formData.append("parentalConsent", "true");
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
      if (otpPassword) {
        formData.append("password", otpPassword);
      }
      if (activeTab === "create_account") {
        formData.append("isCreateAccount", "true");
        formData.append("schoolCode", schoolCode.trim().toUpperCase());
        formData.append("parentalConsent", "true");
      }

      const res = await verifyOtpAction(formData);
      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        initTabSession();
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      if (err.message === "NEXT_REDIRECT" || (err.digest && err.digest.includes("NEXT_REDIRECT"))) throw err;
      setError(err.message || "Verification error.");
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

    if (!isLogin) {
      if (username) {
        const trimmedUser = username.trim();
        if (trimmedUser.length < 3 || trimmedUser.length > 24) {
          setError("🚫 Username must be between 3 and 24 characters.");
          setIsLoading(false);
          return;
        }
        if (trimmedUser.includes("@") || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedUser)) {
          setError("🚫 Usernames cannot be an email address for student privacy. Please choose a public explorer nickname (e.g. StarGazer42).");
          setIsLoading(false);
          return;
        }
        const cleanPhone = trimmedUser.replace(/[\s\-\(\)\+]/g, "");
        if (/^\d{7,15}$/.test(cleanPhone)) {
          setError("🚫 Usernames cannot be a phone number for student privacy. Please choose a public explorer nickname (e.g. StarGazer42).");
          setIsLoading(false);
          return;
        }
        if (!/^[a-zA-Z0-9_.-]+$/.test(trimmedUser)) {
          setError("🚫 Usernames can only contain letters, numbers, underscores, dots, and hyphens (no spaces or special symbols).");
          setIsLoading(false);
          return;
        }
      }
      if (!schoolCode.trim()) {
        setError("🚫 School Code is required. Please enter your school's code (e.g. AGS-KUPPAM-101) or ask your science teacher.");
        setIsLoading(false);
        return;
      }
      if (schoolCode.trim().length < 3) {
        setError("🚫 Invalid School Code. Please check the code provided by your school.");
        setIsLoading(false);
        return;
      }
      if (!hasConsent) {
        setError("🚫 Parental or teacher consent is required to create a Practice Lab account.");
        setIsLoading(false);
        return;
      }

      if (typeof window !== "undefined") {
        localStorage.removeItem("curiosity_school_code");
        if (realName) localStorage.setItem("curiosity_real_name", realName);
        if (username) {
          localStorage.setItem("curiosity_username", username);
          localStorage.setItem("curiosity_login_" + username.toLowerCase().trim(), email.trim());
        }
        if (hasConsent) {
          localStorage.setItem("curiosity_parental_consent", "true");
          localStorage.setItem("curiosity_consent_timestamp", new Date().toISOString());
        }
      }
    } else {
      // When logging in as an existing user, clear previous student local caches to prevent cross-account bleed
      if (typeof window !== "undefined") {
        localStorage.removeItem("curiosity_school_code");
        localStorage.removeItem("curiosity_real_name");
        localStorage.removeItem("curiosity_username");
        localStorage.removeItem("curiosity_avatar_url");
        localStorage.removeItem("curiosity_user_id");
      }
    }

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    if (!isLogin) {
      formData.append("identifier", username);
      formData.append("realName", realName);
      formData.append("schoolCode", schoolCode.trim().toUpperCase());
      if (hasConsent) formData.append("parentalConsent", "true");
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
        initTabSession();
        window.location.href = "/dashboard";
      }
    } else {
      const res = await signUpAction(formData);
      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        initTabSession();
        window.location.href = "/dashboard";
      }
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-[#f7f9fb] p-4 sm:p-6 font-['Montserrat'] antialiased overflow-x-hidden w-full max-w-full">
      <div className="w-full max-w-md mx-auto flex flex-col gap-5 sm:gap-6">
        
        {/* Language Selector at Top Right */}
        <div className="flex justify-end">
          <LanguageSelector />
        </div>

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-14 h-14 bg-[#143867] text-amber-300 rounded-2xl flex items-center justify-center shadow-2xs mb-1">
            <span className="material-symbols-outlined text-3xl">science</span>
          </div>
          <h1 className="font-black text-2xl sm:text-3xl text-[#143867] tracking-tight">
            {t.auth.app_title || "Curiosity Olympiad"}
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm font-semibold">
            Agastya International Foundation • Aah! Aha! Ha-ha!
          </p>
        </div>

        {/* 2-Section Switcher: Create Account vs Login */}
        <div className="flex bg-[#e2e8f0]/80 rounded-2xl p-1 border border-gray-200 shadow-2xs">
          <button
            type="button"
            id="tab-sign-up"
            onClick={() => { setActiveTab("create_account"); setError(""); setSuccessMsg(""); }}
            className={`flex-1 py-2.5 min-h-[44px] text-center rounded-xl font-black text-xs sm:text-sm transition-transform duration-100 ease-out active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "create_account"
                ? "bg-white shadow-xs text-[#143867]"
                : "text-gray-600 hover:text-[#143867]"
            }`}
          >
            <span className="material-symbols-outlined text-base">person_add</span>
            <span>{t.auth.sign_up}</span>
          </button>
          <button
            type="button"
            id="tab-sign-in"
            onClick={() => { setActiveTab("login"); setError(""); setSuccessMsg(""); }}
            className={`flex-1 py-2.5 min-h-[44px] text-center rounded-xl font-black text-xs sm:text-sm transition-transform duration-100 ease-out active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "login"
                ? "bg-white shadow-xs text-[#143867]"
                : "text-gray-600 hover:text-[#143867]"
            }`}
          >
            <span className="material-symbols-outlined text-base">login</span>
            <span>{t.auth.sign_in}</span>
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 md:p-8 shadow-sm border border-gray-200">
          {error && (
            <div className="bg-red-50 text-red-700 border border-red-200 p-3.5 rounded-2xl text-xs font-bold mb-4 flex items-start gap-2.5">
              <span className="material-symbols-outlined text-base shrink-0 mt-0.5 text-red-500">error</span>
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-3.5 rounded-2xl text-xs font-bold mb-4 flex items-center gap-2.5">
              <span className="material-symbols-outlined text-base shrink-0 text-emerald-600">check_circle</span>
              <span>{successMsg}</span>
            </div>
          )}

          {/* SECTION 1: CREATE ACCOUNT */}
          {activeTab === "create_account" && (
            !otpSent ? (
              <form noValidate onSubmit={handleSendOtp} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-black text-[11px] sm:text-xs uppercase tracking-wider text-[#143867]" htmlFor="destination">
                    {t.auth.email_phone}
                  </label>
                  <input
                    id="destination"
                    type="text"
                    required
                    placeholder="Email or Mobile Number"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-gray-300 rounded-xl px-4 py-3 min-h-[44px] text-sm focus:outline-none focus:border-[#143867] focus:ring-2 focus:ring-[#143867]/20 text-gray-900 transition-all font-medium placeholder:text-gray-400"
                  />
                  <p className="text-[11px] text-gray-500 font-medium">
                    {t.auth.send_otp_disclaimer}
                  </p>
                </div>

                {/* Entry 2: School Code (Required) */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-black text-[11px] sm:text-xs uppercase tracking-wider text-[#143867]" htmlFor="schoolCode">
                      {t.auth.school_code_label || "School Code (Required)"}
                    </label>
                    <span className="text-[10px] font-bold text-[#ea580c] uppercase tracking-wider bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                      Required
                    </span>
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                      school
                    </span>
                    <input
                      id="schoolCode"
                      type="text"
                      required
                      placeholder={t.auth.school_code_placeholder || "e.g. AGS-KUPPAM-101"}
                      value={schoolCode}
                      onChange={(e) => setSchoolCode(e.target.value.toUpperCase())}
                      className="w-full bg-[#f8fafc] border border-gray-300 rounded-xl pl-10 pr-4 py-3 min-h-[44px] text-sm focus:outline-none focus:border-[#143867] focus:ring-2 focus:ring-[#143867]/20 text-gray-900 transition-all font-mono font-bold uppercase placeholder:font-sans placeholder:normal-case placeholder:text-gray-400"
                    />
                  </div>
                  <div className="bg-[#f0f9ff] border border-[#bae6fd] p-3 rounded-xl text-xs text-[#0369a1] flex items-start gap-2.5 mt-0.5">
                    <span className="material-symbols-outlined text-base text-[#0284c7] shrink-0 mt-0.5">
                      help_outline
                    </span>
                    <div className="space-y-1">
                      <p className="font-bold text-[11px] leading-tight">
                        {t.auth.school_code_guidance_title || "Don't have a School Code?"}
                      </p>
                      <p className="text-[11px] text-gray-600 leading-snug">
                        {t.auth.school_code_guidance_body || "Ask your science teacher or school lab coordinator. All participating schools are assigned an Agastya School Code (e.g. AGS-KUPPAM-101) to link your lab results to your institution."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-black text-[11px] sm:text-xs uppercase tracking-wider text-[#143867]" htmlFor="otpPassword">
                    {t.auth.password_req}
                  </label>
                  <input
                    id="otpPassword"
                    type="password"
                    required
                    placeholder={t.auth.password_placeholder}
                    value={otpPassword}
                    onChange={(e) => setOtpPassword(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-gray-300 rounded-xl px-4 py-3 min-h-[44px] text-sm focus:outline-none focus:border-[#143867] focus:ring-2 focus:ring-[#143867]/20 text-gray-900 transition-all font-medium placeholder:text-gray-400"
                  />
                  {strength && (
                    <div className="mt-1 flex flex-col gap-1">
                      <div className="flex gap-1.5 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full ${strength.barColor} ${strength.width} transition-all duration-300 rounded-full`}></div>
                      </div>
                      <p className={`text-[10px] font-bold ${strength.textColor}`}>{strength.label}</p>
                    </div>
                  )}
                  <p className="text-[11px] text-gray-500 font-medium">
                    {t.auth.password_desc}
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-black text-[11px] sm:text-xs uppercase tracking-wider text-[#143867]" htmlFor="otpRealName">
                    {t.auth.real_name_req}
                  </label>
                  <input
                    id="otpRealName"
                    type="text"
                    required
                    pattern="^[^0-9]+$"
                    title="Numbers are not allowed in your Real Name"
                    placeholder={t.auth.real_name_placeholder}
                    value={otpRealName}
                    onChange={(e) => setOtpRealName(e.target.value.replace(/[0-9]/g, ''))}
                    className="w-full bg-[#f8fafc] border border-gray-300 rounded-xl px-4 py-3 min-h-[44px] text-sm focus:outline-none focus:border-[#143867] focus:ring-2 focus:ring-[#143867]/20 text-gray-900 transition-all font-medium placeholder:text-gray-400"
                  />
                  <div className="bg-blue-50 border border-blue-200 p-2.5 rounded-xl text-xs text-blue-900 font-medium flex items-start gap-2 mt-0.5">
                    <span className="material-symbols-outlined text-sm text-blue-600 shrink-0 mt-0.5">verified_user</span>
                    <span className="leading-snug">{t.auth.real_name_desc}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-black text-[11px] sm:text-xs uppercase tracking-wider text-[#143867]" htmlFor="otpUsername">
                    {t.auth.username}
                  </label>
                  <input
                    id="otpUsername"
                    type="text"
                    required
                    placeholder={t.auth.username_placeholder}
                    value={otpUsername}
                    onChange={(e) => setOtpUsername(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-gray-300 rounded-xl px-4 py-3 min-h-[44px] text-sm focus:outline-none focus:border-[#143867] focus:ring-2 focus:ring-[#143867]/20 text-gray-900 transition-all font-medium placeholder:text-gray-400"
                  />
                  <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-xs text-amber-900 font-medium flex items-start gap-2 mt-0.5">
                    <span className="material-symbols-outlined text-sm text-[#ea580c] shrink-0 mt-0.5">badge</span>
                    <span className="leading-snug">{t.auth.username_warning}</span>
                  </div>
                </div>

                {/* Entry 6: Parental/Teacher Consent Checkbox (Required) */}
                <div className="bg-gray-50 border border-gray-200 p-3.5 rounded-2xl">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      id="parentalConsent"
                      required
                      checked={hasConsent}
                      onChange={(e) => setHasConsent(e.target.checked)}
                      className="mt-1 w-5 h-5 rounded-md border-2 border-gray-400 text-[#143867] focus:ring-[#143867] focus:ring-offset-0 transition-all cursor-pointer accent-[#143867]"
                    />
                    <div className="space-y-0.5">
                      <span className="font-bold text-xs sm:text-sm text-gray-800 leading-snug block">
                        {t.auth.consent_checkbox_label || "I have parental/teacher consent to participate in the Curiosity Practice Lab"} <span className="text-[#ea580c] font-black">*</span>
                      </span>
                      <p className="text-[11px] text-gray-500 leading-tight">
                        {t.auth.consent_subtext || "Under our student privacy and safety policy, students under 18 must confirm guardian or educator permission before creating an account."}
                      </p>
                      <p className="text-[11px] text-gray-500 pt-1 leading-snug">
                        By registering, you also agree to our{" "}
                        <Link href="/terms" target="_blank" className="font-bold text-[#143867] underline hover:text-[#ea580c]">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" target="_blank" className="font-bold text-[#143867] underline hover:text-[#ea580c]">
                          Privacy Policy
                        </Link>
                        .
                      </p>
                    </div>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-2 w-full min-h-[48px] bg-[#143867] hover:bg-[#1e4a85] text-white py-3 px-4 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-xs active:scale-[0.98] transition-transform duration-100 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">send</span>
                  <span>{isLoading ? (t.auth.sending_otp) : (t.auth.send_otp)}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-black text-[11px] sm:text-xs uppercase tracking-wider text-[#143867]" htmlFor="otpCode">
                      {t.auth.enter_otp}
                    </label>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-xs font-bold text-[#ea580c] hover:underline cursor-pointer"
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
                    className="w-full bg-[#f8fafc] border border-gray-300 rounded-xl px-4 py-3 min-h-[48px] text-center text-2xl font-mono tracking-widest font-black focus:outline-none focus:border-[#143867] focus:ring-2 focus:ring-[#143867]/20 text-gray-900 transition-all"
                  />
                  <p className="text-[11px] text-gray-500 font-medium">
                    {t.auth.enter_otp_desc || "Enter the 6-digit verification code sent to your registered address."}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-2 w-full min-h-[48px] bg-[#143867] hover:bg-[#1e4a85] text-white py-3 px-4 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-xs active:scale-[0.98] transition-transform duration-100 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  <span>{isLoading ? (t.auth.verifying) : (t.auth.verify_create)}</span>
                </button>
              </form>
            )
          )}

          {/* SECTION 2: LOGIN */}
          {activeTab === "login" && (
            <div className="space-y-4">
              <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
                {/* Entry 1: Email ID, Phone Number or Username */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-black text-[11px] sm:text-xs uppercase tracking-wider text-[#143867]" htmlFor="email">
                    {t.auth.email_phone}
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="text"
                    required
                    placeholder="Email or Mobile Number"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-gray-300 rounded-xl px-4 py-3 min-h-[44px] text-sm focus:outline-none focus:border-[#143867] focus:ring-2 focus:ring-[#143867]/20 text-gray-900 transition-all font-medium placeholder:text-gray-400"
                  />
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-800 font-bold bg-amber-50 border border-amber-200 rounded-lg p-2 mt-0.5">
                    <span className="material-symbols-outlined text-xs text-[#ea580c] shrink-0">info</span>
                    <span>{t.auth.login_disclaimer || "Note: Use your registered Mobile, Email, or Username (not Real Name)."}</span>
                  </div>
                </div>

                {/* Entry 2: Password */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="font-black text-[11px] sm:text-xs uppercase tracking-wider text-[#143867]" htmlFor="password">
                      {t.auth.password}
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-xs font-bold text-[#ea580c] hover:underline transition-colors focus:outline-none"
                    >
                      {t.auth.forgot || "Forgot?"}
                    </Link>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-gray-300 rounded-xl px-4 py-3 min-h-[44px] text-sm focus:outline-none focus:border-[#143867] focus:ring-2 focus:ring-[#143867]/20 text-gray-900 transition-all font-medium placeholder:text-gray-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-2 w-full min-h-[48px] bg-[#143867] hover:bg-[#1e4a85] text-white py-3 px-4 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-xs active:scale-[0.98] transition-transform duration-100 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">login</span>
                  <span>{isLoading ? (t.auth.please_wait) : (t.auth.login_btn)}</span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* School Bulk Roster Portal Link */}
        <div className="text-center px-2">
          <Link
            href="/schools"
            className="min-h-[44px] inline-flex items-center justify-center gap-2 text-[11px] sm:text-xs font-bold text-[#143867] hover:text-[#1e4a85] bg-white hover:bg-gray-50 px-3.5 py-2 rounded-full border border-gray-200 shadow-2xs active:scale-95 transition-all max-w-full text-center"
          >
            <span className="material-symbols-outlined text-base text-[#ea580c] shrink-0">school</span>
            <span className="truncate sm:whitespace-normal">{t.auth.school_portal}</span>
          </Link>
        </div>

      </div>
    </div>
  );
}