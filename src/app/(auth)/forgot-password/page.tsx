"use client";

import React, { useState } from "react";
import Link from "next/link";
import { sendRecoveryOtpAction, verifyRecoveryOtpAction, updatePasswordAction } from "./actions";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
    if (score <= 4) return { label: "Medium", barColor: "bg-yellow-400", textColor: "text-yellow-600", width: "w-2/3" };
    return { label: "Strong", barColor: "bg-green-500", textColor: "text-green-600", width: "w-full" };
  };
  const strength = getPasswordStrength(newPassword);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) return;
    setIsLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("identifier", identifier);

    try {
      const res = await sendRecoveryOtpAction(formData);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccessMsg(res.message || "OTP Sent");
        setStep(2);
      }
    } catch (err: any) {
      setError("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    setIsLoading(true);
    setError("");
    setSuccessMsg("");

    const formData = new FormData();
    formData.append("identifier", identifier);
    formData.append("code", otp);

    try {
      const res = await verifyRecoveryOtpAction(formData);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccessMsg("OTP Verified! Please enter your new password.");
        setStep(3);
      }
    } catch (err: any) {
      setError("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccessMsg("");

    const formData = new FormData();
    formData.append("newPassword", newPassword);

    try {
      const res = await updatePasswordAction(formData);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccessMsg(res.message || "Password updated successfully!");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      }
    } catch (err: any) {
      setError("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-[#f7f9fb] p-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <div className="w-full max-w-md mx-auto flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-14 h-14 bg-[#143867] text-[#ffe16d] rounded-2xl flex items-center justify-center shadow-lg mb-1">
            <span className="material-symbols-outlined text-3xl">lock_reset</span>
          </div>
          <h1 className="font-extrabold text-3xl text-[#143867] tracking-tight">
            Reset Password
          </h1>
          <p className="text-gray-600 text-xs md:text-sm font-medium">
            Agastya International Foundation
          </p>
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

          {/* STEP 1: SEND OTP */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-xs uppercase tracking-wider text-[#143867]">
                  Email or Mobile Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter registered Email or Mobile"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-[#f7f9fb] border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#143867] focus:ring-1 focus:ring-[#143867] text-gray-900 transition-all font-medium"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 w-full bg-[#143867] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#1d4d8a] transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>{isLoading ? "Sending..." : "Send Verification Code"}</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </form>
          )}

          {/* STEP 2: VERIFY OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-xs uppercase tracking-wider text-[#143867]">
                  Enter Verification Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="6-Digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full bg-[#f7f9fb] border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#143867] focus:ring-1 focus:ring-[#143867] text-gray-900 text-center tracking-widest font-bold transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 w-full bg-[#143867] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#1d4d8a] transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">verified</span>
                <span>{isLoading ? "Verifying..." : "Verify Code"}</span>
              </button>
            </form>
          )}

          {/* STEP 3: NEW PASSWORD */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-xs uppercase tracking-wider text-[#143867]">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#f7f9fb] border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#143867] focus:ring-1 focus:ring-[#143867] text-gray-900 transition-all font-medium"
                />
                {strength && (
                  <div className="mt-1 flex flex-col gap-1">
                    <div className="flex gap-1 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full ${strength.barColor} ${strength.width} transition-all duration-300`}></div>
                    </div>
                    <p className={`text-[10px] font-bold ${strength.textColor}`}>{strength.label}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-xs uppercase tracking-wider text-[#143867]">
                  Re-enter New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#f7f9fb] border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#143867] focus:ring-1 focus:ring-[#143867] text-gray-900 transition-all font-medium"
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 w-full bg-green-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-green-700 transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">save</span>
                <span>{isLoading ? "Updating..." : "Update Password"}</span>
              </button>
            </form>
          )}

          <div className="mt-6 border-t border-gray-100 pt-6">
            <Link href="/login" className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#143867] hover:underline">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
