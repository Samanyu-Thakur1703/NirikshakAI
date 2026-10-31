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
  Zap,
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

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid official email address.";
    }

    // Password validation
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
      <div className="w-full max-w-md bg-[#0A111A]/95 border border-teal-900/40 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-2xl">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 via-teal-400 to-amber-400 flex items-center justify-center shadow-lg shadow-teal-950/50 mb-3 border border-teal-300/40">
            <ShieldAlert className="w-6 h-6 text-slate-950" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            DisasterWatch <span className="text-teal-400 font-mono">AI</span> EOC Station
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Emergency Operations Center • Multi-Agent GIS Intelligence
          </p>
        </div>

        {/* Demo Mode / Backend Notice Banner */}
        {isDemoAuth && (
          <div className="mb-5 p-3 rounded-xl bg-[#060D17] border border-amber-400/30 text-amber-200 text-xs flex items-start gap-2 shadow-sm">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-white block">Official Verification Station:</span>
              <span className="text-slate-300">
                {authNotice} Enter credentials to access role-based command features.
              </span>
            </div>
          </div>
        )}

        {/* Submission Feedback Banner */}
        {submitFeedback && (
          <div
            className={`mb-5 p-3 rounded-xl text-xs flex items-center gap-2 border ${
              submitFeedback.type === "success"
                ? "bg-teal-950/60 border-teal-500/40 text-teal-300"
                : "bg-[#431407]/60 border-[#ff5f1f]/60 text-orange-200"
            }`}
          >
            {submitFeedback.type === "success" ? (
              <CheckCircle className="w-4 h-4 shrink-0 text-teal-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-[#ff5f1f]" />
            )}
            <span>{submitFeedback.message}</span>
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="email-input">
              Authorized Email Address <span className="text-[#ff5f1f]">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-teal-400/80 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="email-input"
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: null });
                }}
                placeholder="officer@ndma.gov.in"
                className={`w-full bg-[#060D17] border rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 transition-all ${
                  errors.email
                    ? "border-[#ff5f1f] focus:border-[#ff5f1f] focus:ring-orange-500/40"
                    : "border-teal-900/50 focus:border-teal-400 focus:ring-teal-400/30"
                }`}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
            </div>
            {errors.email && (
              <p id="email-error" className="text-[11px] text-[#ff5f1f] mt-1 flex items-center gap-1 font-semibold">
                <AlertCircle className="w-3 h-3" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300" htmlFor="password-input">
                EOC Password <span className="text-[#ff5f1f]">*</span>
              </label>
              <span className="text-[10px] text-amber-300 font-mono font-semibold">Demo: Password@123</span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-teal-400/80 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="password-input"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  if (errors.password) setErrors({ ...errors, password: null });
                }}
                placeholder="••••••••••••"
                className={`w-full bg-[#060D17] border rounded-xl pl-9 pr-10 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 transition-all ${
                  errors.password
                    ? "border-[#ff5f1f] focus:border-[#ff5f1f] focus:ring-orange-500/40"
                    : "border-teal-900/50 focus:border-teal-400 focus:ring-teal-400/30"
                }`}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "password-error" : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-300 transition-colors cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="text-[11px] text-[#ff5f1f] mt-1 flex items-center gap-1 font-semibold">
                <AlertCircle className="w-3 h-3" />
                {errors.password}
              </p>
            )}
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                className="w-4 h-4 rounded bg-[#060D17] border-teal-800 text-teal-400 focus:ring-teal-400/30 accent-teal-400"
              />
              <span>Remember this console station</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 via-teal-400 to-amber-400 hover:from-teal-400 hover:to-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-950/40 transition-all cursor-pointer active:scale-95"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Verifying Authentication...</span>
              </>
            ) : (
              <>
                <span>Sign In to Command Center</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer / Switch to Sign Up */}
        <div className="mt-6 pt-4 border-t border-teal-900/30 text-center text-xs text-slate-400">
          <span>New disaster response officer? </span>
          <button
            type="button"
            onClick={onNavigateToSignUp}
            className="text-amber-300 hover:text-amber-200 font-bold underline underline-offset-2 ml-1 cursor-pointer"
          >
            Register Operator Account
          </button>
        </div>
      </div>
    </div>
  );
}
