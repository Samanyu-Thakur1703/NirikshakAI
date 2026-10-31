import React, { useState } from "react";
import {
  ShieldAlert,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Loader2,
  Info,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function SignInPage({ onNavigateToSignUp, onLoginSuccess }) {
  const { signIn, isDemoAuth, authNotice } = useAuth();

  const [formData, setFormData] = useState({
    email: "h.singh@ndma.gov.in",
    password: "Password@123",
    rememberMe: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState(null);

  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid official email address.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validate()) {
      setSubmitFeedback({
        type: "error",
        message: "Please correct the highlighted validation errors before submitting.",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitFeedback(null);

    try {
      const res = await signIn({
        email: formData.email.trim(),
        password: formData.password,
        rememberMe: formData.rememberMe,
      });

      if (res.success) {
        setSubmitFeedback({
          type: "success",
          message: "Authentication authorized. Initializing command session...",
        });
        setTimeout(() => {
          onLoginSuccess?.();
        }, 800);
      } else {
        setSubmitFeedback({
          type: "error",
          message: res.error || "Authentication failed. Please verify credentials.",
        });
      }
    } catch (err) {
      setSubmitFeedback({
        type: "error",
        message: "An unexpected network error occurred. Please retry.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0B101B] border border-[#1E293B] rounded-2xl p-6 sm:p-7 shadow-2xl">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#DC2626]/20 border border-[#DC2626]/40 flex items-center justify-center text-[#EF4444] mb-2.5">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h2 className="text-base font-extrabold text-white tracking-tight">
            CrisisOps EOC Command Station
          </h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Emergency Operations Center • Multi-Agent Intelligence
          </p>
        </div>

        {/* Demo Mode / Backend Notice Banner */}
        {isDemoAuth && (
          <div className="mb-4 p-2.5 rounded-lg bg-[#0E1526] border border-[#1E293B] text-[#94A3B8] text-xs flex items-start gap-2">
            <Info className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold text-white block">Official Verification Station:</span>
              <span>{authNotice} Enter credentials to access role-based command features.</span>
            </div>
          </div>
        )}

        {/* Submission Feedback Banner */}
        {submitFeedback && (
          <div
            className={`mb-4 p-2.5 rounded-lg text-xs flex items-center gap-2 border ${
              submitFeedback.type === "success"
                ? "bg-[#10B981]/20 border-[#10B981]/40 text-[#10B981]"
                : "bg-[#7F1D1D]/30 border-[#EF4444]/40 text-[#EF4444]"
            }`}
          >
            {submitFeedback.type === "success" ? (
              <CheckCircle className="w-4 h-4 shrink-0 text-[#10B981]" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-[#EF4444]" />
            )}
            <span>{submitFeedback.message}</span>
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="email-input">
              Authorized Email Address <span className="text-[#EF4444]">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#64748B] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                id="email-input"
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: null });
                }}
                placeholder="officer@ndma.gov.in"
                className={`w-full bg-[#111827] border rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-[#64748B] focus:outline-none transition-colors ${
                  errors.email
                    ? "border-[#EF4444]"
                    : "border-[#1E293B] focus:border-[#38BDF8]"
                }`}
                aria-invalid={Boolean(errors.email)}
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-[#EF4444] mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3" />
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300" htmlFor="password-input">
                EOC Password <span className="text-[#EF4444]">*</span>
              </label>
              <span className="text-[10px] text-[#F59E0B] font-mono">Demo: Password@123</span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#64748B] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                id="password-input"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  if (errors.password) setErrors({ ...errors, password: null });
                }}
                placeholder="••••••••••••"
                className={`w-full bg-[#111827] border rounded-lg pl-8 pr-9 py-2 text-xs text-white placeholder-[#64748B] focus:outline-none transition-colors ${
                  errors.password
                    ? "border-[#EF4444]"
                    : "border-[#1E293B] focus:border-[#38BDF8]"
                }`}
                aria-invalid={Boolean(errors.password)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white transition-colors cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] text-[#EF4444] mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3" />
                {errors.password}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-[#94A3B8]">
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                className="w-3.5 h-3.5 rounded border-[#1E293B] bg-[#111827] accent-[#2563EB]"
              />
              <span>Remember this station</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-2.5 px-3 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Verifying Authentication...</span>
              </>
            ) : (
              <>
                <span>Sign In to Unified Command</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 pt-3 border-t border-[#1E293B] text-center text-xs text-[#94A3B8]">
          <span>New disaster response officer? </span>
          <button
            type="button"
            onClick={onNavigateToSignUp}
            className="text-[#38BDF8] hover:underline font-semibold ml-1 cursor-pointer"
          >
            Register Operator Profile
          </button>
        </div>
      </div>
    </div>
  );
}
