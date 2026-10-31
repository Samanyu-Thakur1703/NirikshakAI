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
  Zap,
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

    // Full name
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required.";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters long.";
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid official email address.";
    }

    // Password complexity: at least 8 chars, at least 1 number or special char
    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = "Password must contain both uppercase and lowercase letters.";
    } else if (!/(?=.*\d)|(?=.*[!@#$%^&*])/.test(formData.password)) {
      newErrors.password = "Password must include at least one number or symbol.";
    }

    // Confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    // Role
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
      <div className="w-full max-w-lg bg-[#0A111A]/95 border border-teal-900/40 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-2xl">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 via-teal-400 to-amber-400 flex items-center justify-center shadow-lg shadow-teal-950/50 mb-3 border border-teal-300/40">
            <ShieldAlert className="w-6 h-6 text-slate-950" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Register Emergency Response Profile
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Authorizes access to real-world verification, de-duplication, and CAP 1.2 dispatch pipelines
          </p>
        </div>

        {/* Demo Mode / Backend Notice Banner */}
        {isDemoAuth && (
          <div className="mb-4 p-3 rounded-xl bg-[#060D17] border border-amber-400/30 text-amber-200 text-xs flex items-start gap-2 shadow-sm">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-white block">Operator Access:</span>
              <span className="text-slate-300">
                {authNotice} New registrations are provisioned for demo access with role-based permissions.
              </span>
            </div>
          </div>
        )}

        {/* Submission Feedback Banner */}
        {submitFeedback && (
          <div
            className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 border ${
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

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="name-input">
              Full Legal / Officer Name <span className="text-[#ff5f1f]">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-teal-400/80 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="name-input"
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: null });
                }}
                placeholder="Harshdeep Singh"
                className={`w-full bg-[#060D17] border rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 transition-all ${
                  errors.name
                    ? "border-[#ff5f1f] focus:border-[#ff5f1f]"
                    : "border-teal-900/50 focus:border-teal-400 focus:ring-teal-400/30"
                }`}
                aria-invalid={Boolean(errors.name)}
              />
            </div>
            {errors.name && <p className="text-[10px] text-[#ff5f1f] mt-1 font-semibold">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="signup-email-input">
              Agency / Organization Email <span className="text-[#ff5f1f]">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-teal-400/80 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="signup-email-input"
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: null });
                }}
                placeholder="officer@ndma.gov.in"
                className={`w-full bg-[#060D17] border rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 transition-all ${
                  errors.email
                    ? "border-[#ff5f1f] focus:border-[#ff5f1f]"
                    : "border-teal-900/50 focus:border-teal-400 focus:ring-teal-400/30"
                }`}
                aria-invalid={Boolean(errors.email)}
              />
            </div>
            {errors.email && <p className="text-[10px] text-[#ff5f1f] mt-1 font-semibold">{errors.email}</p>}
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Operational Station Role <span className="text-[#ff5f1f]">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["Analyst", "Responder", "Admin"].map((r) => {
                const isSelected = formData.role === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: r })}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? "bg-teal-500/20 border-teal-400 text-teal-300 shadow-sm"
                        : "bg-[#060D17] border-teal-900/40 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>{r}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Password & Confirm Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="signup-password-input">
                Password <span className="text-[#ff5f1f]">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-teal-400/80 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="signup-password-input"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (errors.password) setErrors({ ...errors, password: null });
                  }}
                  placeholder="Min 8 chars, 1 num"
                  className={`w-full bg-[#060D17] border rounded-xl pl-9 pr-9 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 transition-all ${
                    errors.password
                      ? "border-[#ff5f1f] focus:border-[#ff5f1f]"
                      : "border-teal-900/50 focus:border-teal-400 focus:ring-teal-400/30"
                  }`}
                  aria-invalid={Boolean(errors.password)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-300 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-slate-400" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[10px] text-[#ff5f1f] mt-1 font-semibold">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="confirm-password-input">
                Confirm Password <span className="text-[#ff5f1f]">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-teal-400/80 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="confirm-password-input"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, confirmPassword: e.target.value });
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
                  }}
                  placeholder="Repeat password"
                  className={`w-full bg-[#060D17] border rounded-xl pl-9 pr-9 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 transition-all ${
                    errors.confirmPassword
                      ? "border-[#ff5f1f] focus:border-[#ff5f1f]"
                      : "border-teal-900/50 focus:border-teal-400 focus:ring-teal-400/30"
                  }`}
                  aria-invalid={Boolean(errors.confirmPassword)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-300 cursor-pointer"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-slate-400" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-[10px] text-[#ff5f1f] mt-1 font-semibold">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-3 py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 via-teal-400 to-amber-400 hover:from-teal-400 hover:to-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-950/40 transition-all cursor-pointer active:scale-95"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Registering Operator Profile...</span>
              </>
            ) : (
              <>
                <span>Complete Registration & Enter Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer / Switch to Sign In */}
        <div className="mt-5 pt-3.5 border-t border-teal-900/30 text-center text-xs text-slate-400">
          <span>Already registered with DisasterWatch? </span>
          <button
            type="button"
            onClick={onNavigateToSignIn}
            className="text-amber-300 hover:text-amber-200 font-bold underline underline-offset-2 ml-1 cursor-pointer"
          >
            Sign In to Existing Station
          </button>
        </div>
      </div>
    </div>
  );
}
