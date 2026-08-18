"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Wordmark } from "@/components/brand/Brand";
import { PasswordRules } from "@/components/auth/PasswordRules";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import {
  forgotPassword,
  loginWithEmail,
  registerAccount,
  resendOtp,
  resetPassword,
  signInWithGoogleIdToken,
  verifyOtp,
} from "@/features/auth/authService";
import { useAuthStore } from "@/stores/authStore";
import { COUNTRY_OPTIONS, GOOGLE_CLIENT_ID } from "@/lib/env";
import { getAuthErrorCode, getErrorMessage } from "@/lib/formatters";
import {
  emailTypingHint,
  isValidEmail,
  isValidLocalPhone,
  isValidPassword,
  passwordsMatch,
  phoneTypingHint,
} from "@/lib/validators";
import type { Country, PrimaryIntent } from "@/types";

type Mode = "login" | "signup" | "otp" | "forgot" | "reset";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: Record<string, unknown>,
          ) => void;
        };
      };
    };
  }
}

function PasswordToggle({
  visible,
  onToggle,
}: {
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={visible ? "Hide password" : "Show password"}
      onClick={onToggle}
      className="inline-flex h-11 w-11 items-center justify-center rounded-md text-ink-muted hover:text-ink"
    >
      {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );
}

export default function AuthClient() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/explore";
  const toast = useToast();
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);

  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [primaryIntent, setPrimaryIntent] = useState<PrimaryIntent>("BUY");
  const [country, setCountry] = useState<Country>("CAMEROON");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [otpWait, setOtpWait] = useState(0);

  const countryCode =
    COUNTRY_OPTIONS.find((c) => c.country === country)?.countryCode ?? "+237";

  const emailError = useMemo(() => emailTypingHint(email), [email]);
  const phoneError = useMemo(() => phoneTypingHint(phone, country), [phone, country]);
  const confirmPasswordError = useMemo(
    () => (mode === "signup" ? passwordsMatch(password, confirmPassword) : null),
    [mode, password, confirmPassword],
  );
  const confirmNewPasswordError = useMemo(
    () =>
      mode === "reset" ? passwordsMatch(newPassword, confirmNewPassword) : null,
    [mode, newPassword, confirmNewPassword],
  );

  useEffect(() => {
    if (user) {
      router.replace(user.profileComplete ? next : "/onboarding/hub");
    }
  }, [user, next, router]);

  useEffect(() => {
    if (otpWait <= 0) return;
    const timer = window.setTimeout(() => setOtpWait((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [otpWait]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      if (!window.google) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          try {
            setLoading(true);
            const session = await signInWithGoogleIdToken(response.credential);
            setUser(session.user);
            toast.push("Welcome back", "success");
            router.replace(
              session.user.profileComplete ? next : "/onboarding/hub",
            );
          } catch (e) {
            toast.push(getErrorMessage(e), "error");
          } finally {
            setLoading(false);
          }
        },
      });
      const el = document.getElementById("google-btn");
      if (el) {
        window.google.accounts.id.renderButton(el, {
          theme: "outline",
          size: "large",
          width: 320,
          text: "continue_with",
          shape: "rectangular",
        });
      }
    };
    document.body.appendChild(script);
    return () => {
      script.remove();
    };
  }, [next, router, setUser, toast]);

  function switchMode(nextMode: Mode) {
    setMode(nextMode);
    if (nextMode === "login") {
      setConfirmPassword("");
      setAgreedToTerms(false);
    }
    if (nextMode === "signup") {
      setPassword("");
      setConfirmPassword("");
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();

    if (!isValidEmail(email)) {
      toast.push(emailError ?? "Enter a valid email", "error");
      return;
    }

    if (mode === "login") {
      if (password.length < 8) {
        toast.push("Password must be at least 8 characters", "error");
        return;
      }
    }

    if (mode === "signup") {
      if (fullName.trim().length < 2) {
        toast.push("Enter your full name", "error");
        return;
      }
      if (!isValidLocalPhone(phone, country)) {
        toast.push(
          phoneError ?? phoneTypingHint(phone, country) ?? "Enter a WhatsApp number",
          "error",
        );
        return;
      }
      const passwordError = isValidPassword(password);
      if (passwordError) {
        toast.push(passwordError, "error");
        return;
      }
      if (confirmPasswordError) {
        toast.push(confirmPasswordError, "error");
        return;
      }
      if (!agreedToTerms) {
        toast.push("Please agree to the terms to continue", "error");
        return;
      }
    }

    if (mode === "otp" && !/^\d{6}$/.test(otp)) {
      toast.push("Enter the 6-digit code from your email", "error");
      return;
    }

    if (mode === "reset") {
      if (!/^\d{6}$/.test(otp)) {
        toast.push("Enter the 6-digit reset code", "error");
        return;
      }
      const passwordError = isValidPassword(newPassword);
      if (passwordError) {
        toast.push(passwordError, "error");
        return;
      }
      if (confirmNewPasswordError) {
        toast.push(confirmNewPasswordError, "error");
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === "login") {
        const session = await loginWithEmail({ email: email.trim(), password });
        setUser(session.user);
        toast.push("Welcome back", "success");
        router.replace(session.user.profileComplete ? next : "/onboarding/hub");
      } else if (mode === "signup") {
        await registerAccount({
          email: email.trim(),
          password,
          fullName: fullName.trim(),
          phone: phone.replace(/\D/g, ""),
          country,
          countryCode,
          primaryIntent,
        });
        toast.push("Check your email for the verification code", "success");
        setMode("otp");
        setOtpWait(60);
      } else if (mode === "otp") {
        const session = await verifyOtp({
          email: email.trim(),
          code: otp,
          purpose: "EMAIL_VERIFY",
        });
        setUser(session.user);
        toast.push("Email verified", "success");
        router.replace("/onboarding/hub");
      } else if (mode === "forgot") {
        await forgotPassword(email.trim());
        toast.push("If that email is registered, we sent a reset code", "success");
        setMode("reset");
        setOtpWait(60);
      } else if (mode === "reset") {
        const session = await resetPassword({
          email: email.trim(),
          code: otp,
          password: newPassword,
        });
        setUser(session.user);
        toast.push("Password updated", "success");
        router.replace(session.user.profileComplete ? next : "/onboarding/hub");
      }
    } catch (err) {
      const code = getAuthErrorCode(err);
      if (code === "EMAIL_NOT_VERIFIED" && mode === "login") {
        toast.push("Verify your email with the code we sent", "info");
        setMode("otp");
        setOtpWait(60);
        return;
      }
      toast.push(getErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ob-atmosphere flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="mx-auto w-full max-w-md rounded-xl border border-border bg-surface p-5 shadow-rest sm:p-6">
          <div className="mb-6 flex justify-center">
            <Wordmark href="/" className="mb-0" />
          </div>

          {mode === "login" || mode === "signup" ? (
            <div className="mb-6 grid grid-cols-2 gap-2 rounded-lg bg-canvas p-1">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`min-h-11 rounded-md text-sm font-semibold transition ${
                mode === "login"
                  ? "bg-surface text-ink shadow-rest"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className={`min-h-11 rounded-md text-sm font-semibold transition ${
                mode === "signup"
                  ? "bg-surface text-ink shadow-rest"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              Sign up
            </button>
            </div>
          ) : null}

          <h1 className="type-page text-ink">
          {mode === "login" && "Welcome back"}
          {mode === "signup" && "Create your account"}
          {mode === "otp" && "Verify your email"}
          {mode === "forgot" && "Reset password"}
          {mode === "reset" && "Choose a new password"}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
          {mode === "login" && "Log in with email or Google — same account as the app."}
          {mode === "signup" &&
            "WhatsApp is required so accepted deals can reach you."}
          {mode === "otp" &&
            `Enter the 6-digit code we sent to ${email || "your email"}.`}
          {mode === "forgot" && "We’ll send a reset code if that email is registered."}
          {mode === "reset" && "Enter the code from your email and choose a new password."}
          </p>

          {mode === "login" || mode === "signup" ? (
          <>
            <div id="google-btn" className="mt-6 flex justify-center" />
            <div className="my-5 flex items-center gap-3 text-xs text-ink-muted">
              <div className="h-px flex-1 bg-border" />
              or email
              <div className="h-px flex-1 bg-border" />
            </div>
          </>
          ) : (
          <div className="mt-6" />
          )}

          <form
          className="space-y-3 rounded-lg border border-border bg-canvas p-4"
          onSubmit={onSubmit}
        >
          <Input
            label="Email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={emailError ?? undefined}
            disabled={mode === "otp" || mode === "reset"}
          />

          {mode === "signup" ? (
            <>
              <Input
                label="Full name"
                required
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                error={
                  fullName.length > 0 && fullName.trim().length < 2
                    ? "Enter at least 2 characters"
                    : undefined
                }
              />
              <Select
                label="Country"
                value={country}
                onChange={(e) => {
                  const nextCountry = e.target.value as Country;
                  if (nextCountry !== country) setPhone("");
                  setCountry(nextCountry);
                }}
              >
                {COUNTRY_OPTIONS.map((c) => (
                  <option key={c.country} value={c.country}>
                    {c.label}
                  </option>
                ))}
              </Select>
              <Input
                label="WhatsApp phone"
                required
                autoComplete="tel"
                value={phone}
                leading={countryCode}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={country === "NIGERIA" ? "8012345678" : "6XXXXXXXX"}
                error={phoneError ?? undefined}
              />
              <Select
                label="What are you here for first?"
                value={primaryIntent}
                onChange={(e) => setPrimaryIntent(e.target.value as PrimaryIntent)}
              >
                <option value="BUY">Buy items</option>
                <option value="SELL">Sell items</option>
                <option value="BOTH">Both</option>
              </Select>
            </>
          ) : null}

          {mode === "login" ? (
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              trailing={
                <PasswordToggle
                  visible={showPassword}
                  onToggle={() => setShowPassword((v) => !v)}
                />
              }
            />
          ) : null}

          {mode === "signup" ? (
            <>
              <div>
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  trailing={
                    <PasswordToggle
                      visible={showPassword}
                      onToggle={() => setShowPassword((v) => !v)}
                    />
                  }
                />
                <PasswordRules password={password} />
              </div>
              <Input
                label="Confirm password"
                type={showConfirmPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={confirmPasswordError ?? undefined}
                trailing={
                  <PasswordToggle
                    visible={showConfirmPassword}
                    onToggle={() => setShowConfirmPassword((v) => !v)}
                  />
                }
              />
              <label className="flex cursor-pointer items-start gap-2.5 text-sm text-ink-secondary">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span>I agree to the terms and conditions</span>
              </label>
            </>
          ) : null}

          {(mode === "otp" || mode === "reset") && (
            <Input
              label="6-digit code"
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              pattern="\d{6}"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              error={
                otp.length > 0 && !/^\d{6}$/.test(otp)
                  ? "Enter all 6 digits"
                  : undefined
              }
            />
          )}

          {mode === "reset" ? (
            <>
              <div>
                <Input
                  label="New password"
                  type={showNewPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  trailing={
                    <PasswordToggle
                      visible={showNewPassword}
                      onToggle={() => setShowNewPassword((v) => !v)}
                    />
                  }
                />
                <PasswordRules password={newPassword} />
              </div>
              <Input
                label="Confirm new password"
                type={showConfirmNewPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                error={confirmNewPasswordError ?? undefined}
                trailing={
                  <PasswordToggle
                    visible={showConfirmNewPassword}
                    onToggle={() => setShowConfirmNewPassword((v) => !v)}
                  />
                }
              />
            </>
          ) : null}

          <Button type="submit" loading={loading} className="w-full" size="lg">
            {mode === "login"
              ? "Log in"
              : mode === "signup"
                ? "Create account"
                : mode === "otp"
                  ? "Verify email"
                  : mode === "forgot"
                    ? "Send reset code"
                    : "Save new password"}
          </Button>
          </form>

          <div className="mt-4 space-y-2 text-center text-sm text-ink-muted">
          {mode === "login" ? (
            <button
              type="button"
              className="underline-offset-2 hover:underline"
              onClick={() => setMode("forgot")}
            >
              Forgot password?
            </button>
          ) : null}
          {mode === "otp" ? (
            <button
              type="button"
              disabled={otpWait > 0}
              className="font-semibold text-primary disabled:opacity-50"
              onClick={async () => {
                try {
                  await resendOtp(email.trim(), "EMAIL_VERIFY");
                  setOtpWait(60);
                  toast.push("Code resent", "success");
                } catch (e) {
                  toast.push(getErrorMessage(e), "error");
                }
              }}
            >
              {otpWait > 0 ? `Resend code in ${otpWait}s` : "Resend code"}
            </button>
          ) : null}
          {mode === "reset" ? (
            <button
              type="button"
              className="underline-offset-2 hover:underline"
              onClick={() => setMode("forgot")}
            >
              Didn&apos;t get a code? Send again
            </button>
          ) : null}
          {(mode === "otp" || mode === "forgot" || mode === "reset") && (
            <button
              type="button"
              className="block w-full underline-offset-2 hover:underline"
              onClick={() => switchMode("login")}
            >
              Back to log in
            </button>
          )}
          <div>
            <Link href="/explore" className="hover:text-ink">
              Continue as guest
            </Link>
          </div>
          </div>
      </div>
    </div>
  );
}
