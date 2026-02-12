"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { showSuccess, showError } from "../lib/notifications";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link. Please check your email for the correct link.");
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Verification failed");
      }

      setStatus("success");
      setMessage("Your email has been verified successfully!");
      showSuccess("Email verified! Redirecting to login...");
      
      setTimeout(() => router.push("/login"), 3000);
    } catch (error) {
      setStatus("error");
      setMessage(error.message || "Failed to verify email. The link may have expired.");
      showError("Email verification failed");
    }
  };

  const renderContent = () => {
    switch (status) {
      case "verifying":
        return (
          <>
            <div className="bg-blue-500/10 p-4 rounded-full">
              <Loader2 className="text-blue-500 animate-spin" size={48} />
            </div>
            <h1 className="text-2xl font-bold text-white">Verifying Your Email</h1>
            <p className="text-gray-400">Please wait while we verify your email address...</p>
          </>
        );
      
      case "success":
        return (
          <>
            <div className="bg-green-500/10 p-4 rounded-full">
              <CheckCircle className="text-green-500" size={48} />
            </div>
            <h1 className="text-2xl font-bold text-white">Email Verified!</h1>
            <p className="text-gray-400">{message}</p>
            <p className="text-sm text-gray-500">Redirecting to login page...</p>
          </>
        );
      
      case "error":
        return (
          <>
            <div className="bg-red-500/10 p-4 rounded-full">
              <XCircle className="text-red-500" size={48} />
            </div>
            <h1 className="text-2xl font-bold text-white">Verification Failed</h1>
            <p className="text-gray-400">{message}</p>
            <button
              onClick={() => router.push("/login")}
              className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
            >
              Go to Login
            </button>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
