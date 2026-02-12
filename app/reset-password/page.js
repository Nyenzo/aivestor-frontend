"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Loader2 } from "lucide-react";
import { resetPasswordSchema } from "../lib/validation";
import { showSuccess, showError } from "../lib/notifications";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    const resetToken = searchParams.get("token");
    if (!resetToken) {
      showError("Invalid reset link. Please request a new password reset.");
      router.push("/login");
    } else {
      setToken(resetToken);
    }
  }, [searchParams, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data) => {
    if (!token) {
      showError("Invalid reset token");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: data.password }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Password reset failed");
      }

      showSuccess("Password reset successful! Redirecting to login...");
      setTimeout(() => router.push("/login"), 2000);
    } catch (error) {
      showError(error.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-blue-500/10 p-3 rounded-full">
              <KeyRound className="text-blue-500" size={32} />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-white text-center mb-2">
            Reset Your Password
          </h1>
          <p className="text-gray-400 text-sm text-center mb-6">
            Enter your new password below
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                New Password
              </label>
              <input
                {...register("password")}
                id="password"
                type="password"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Enter new password"
              />
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                {...register("confirmPassword")}
                id="confirmPassword"
                type="password"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Confirm new password"
              />
              {errors.confirmPassword && (
                <p className="text-red-400 text-sm mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Resetting Password...
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push("/login")}
              className="text-sm text-blue-400 hover:text-blue-300 transition"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
