import React, { useState } from "react";
import {
  ShieldAlert,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Briefcase,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Loader2,
  Info,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function SignUpPage({ onNavigateToSignIn, onSignUpSuccess }) {
  const { signUp, isDemoAuth, authNotice } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Analyst",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState(null);

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required.";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters long.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid official email address.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (!formData.role) {
      newErrors.role = "Please select an operational role.";
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
        message: "Please complete all mandatory fields with valid values.",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitFeedback(null);

    try {
      const res = await signUp({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      });

      if (res.success) {
        setSubmitFeedback({
          type: "success",
          message: "Officer account provisioned successfully. Logging in...",
        });
        setTimeout(() => {
          onSignUpSuccess?.();
        }, 1000);
      } else {
        setSubmitFeedback({
          type: "error",
          message: res.error || "Registration rejected. Please verify information.",
        });
      }
    } catch (err) {
      setSubmitFeedback({
        type: "error",
        message: "Registration pipeline encountered an unexpected network issue.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#0B101B] border border-[#1E293B] rounded-2xl p-6 sm:p-7 shadow-2xl">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#DC2626]/20 border border-[#DC2626]/40 flex items-center justify-center text-[#EF4444] mb-2.5">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h2 className="text-base font-extrabold text-white tracking-tight">
            Register Emergency Response Profile
          </h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Authorizes access to Unified Command, verification, and CAP 1.2 dispatch pipelines
          </p>
        </div>

        {isDemoAuth && (
          <div className="mb-4 p-2.5 rounded-lg bg-[#0E1526] border border-[#1E293B] text-[#94A3B8] text-xs flex items-start gap-2">
            <Info className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold text-white block">Operational Provisioning:</span>
              <span>{authNotice} Enter your details to create an operator profile.</span>
            </div>
          </div>
        )}

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

        <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="signup-name">
              Officer Full Name <span className="text-[#EF4444]">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#64748B] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                id="signup-name"
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: null });
                }}
                placeholder="Major R. Sharma"
                className={`w-full bg-[#111827] border rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-[#64748B] focus:outline-none transition-colors ${
                  errors.name ? "border-[#EF4444]" : "border-[#1E293B] focus:border-[#38BDF8]"
                }`}
              />
            </div>
            {errors.name && (
              <p className="text-[11px] text-[#EF4444] mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3" />
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="signup-email">
              Official Agency Email <span className="text-[#EF4444]">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#64748B] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                id="signup-email"
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: null });
                }}
                placeholder="officer@ndma.gov.in"
                className={`w-full bg-[#111827] border rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-[#64748B] focus:outline-none transition-colors ${
                  errors.email ? "border-[#EF4444]" : "border-[#1E293B] focus:border-[#38BDF8]"
                }`}
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
            <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="signup-role">
              Designated Operations Role <span className="text-[#EF4444]">*</span>
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-[#64748B] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <select
                id="signup-role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-[#111827] border border-[#1E293B] rounded-lg pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#38BDF8] transition-colors"
              >
                <option value="Analyst">Emergency Data Analyst</option>
                <option value="Operator">Operations Commander</option>
                <option value="Forensic Reviewer">Forensic Media Reviewer</option>
                <option value="GIS Specialist">GIS Cartography Specialist</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="signup-password">
                Password <span className="text-[#EF4444]">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#64748B] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (errors.password) setErrors({ ...errors, password: null });
                  }}
                  placeholder="Min. 8 characters"
                  className={`w-full bg-[#111827] border rounded-lg pl-8 pr-9 py-2 text-xs text-white placeholder-[#64748B] focus:outline-none transition-colors ${
                    errors.password ? "border-[#EF4444]" : "border-[#1E293B] focus:border-[#38BDF8]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-[#EF4444] mt-1 font-medium">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="signup-confirm-password">
                Confirm Password <span className="text-[#EF4444]">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#64748B] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  id="signup-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, confirmPassword: e.target.value });
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
                  }}
                  placeholder="Re-enter password"
                  className={`w-full bg-[#111827] border rounded-lg pl-8 pr-9 py-2 text-xs text-white placeholder-[#64748B] focus:outline-none transition-colors ${
                    errors.confirmPassword ? "border-[#EF4444]" : "border-[#1E293B] focus:border-[#38BDF8]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-[11px] text-[#EF4444] mt-1 font-medium">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-2.5 px-3 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Provisioning Account...</span>
              </>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 pt-3 border-t border-[#1E293B] text-center text-xs text-[#94A3B8]">
          <span>Already have authorized credentials? </span>
          <button
            type="button"
            onClick={onNavigateToSignIn}
            className="text-[#38BDF8] hover:underline font-semibold ml-1 cursor-pointer"
          >
            Sign In Here
          </button>
        </div>
      </div>
    </div>
  );
}
