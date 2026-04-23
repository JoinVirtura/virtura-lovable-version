import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type CallbackState = "verifying" | "success" | "error";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<CallbackState>("verifying");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    const finish = async () => {
      const errorDescription =
        searchParams.get("error_description") ||
        searchParams.get("error") ||
        (window.location.hash.includes("error")
          ? decodeURIComponent(
              new URLSearchParams(window.location.hash.slice(1)).get(
                "error_description"
              ) || ""
            )
          : "");

      if (errorDescription) {
        if (cancelled) return;
        setErrorMessage(errorDescription);
        setState("error");
        return;
      }

      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type");

      if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as
            | "signup"
            | "email"
            | "invite"
            | "magiclink"
            | "recovery"
            | "email_change",
        });
        if (cancelled) return;
        if (error) {
          setErrorMessage(error.message);
          setState("error");
          return;
        }
      }

      const { data } = await supabase.auth.getSession();
      if (cancelled) return;

      if (data.session) {
        setState("success");
        const next = searchParams.get("next") || "/dashboard";
        toast.success("You're in! Welcome to Virtura 🎉", { duration: 3500 });
        setTimeout(() => navigate(next, { replace: true }), 600);
        return;
      }

      setErrorMessage(
        "We couldn't verify your link. It may have expired or already been used."
      );
      setState("error");
    };

    finish();
    return () => {
      cancelled = true;
    };
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0B0617] via-[#1a0b2e] to-[#0B0617] px-4">
      <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center shadow-2xl">
        {state === "verifying" && (
          <>
            <Loader2 className="w-10 h-10 text-purple-400 animate-spin mx-auto mb-5" />
            <h1 className="text-2xl font-bold text-white mb-2">
              Activating your account…
            </h1>
            <p className="text-white/70 text-sm">
              Just a moment while we verify your email.
            </p>
          </>
        )}

        {state === "success" && (
          <>
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-5">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">You're in!</h1>
            <p className="text-white/70 text-sm">
              Taking you to your dashboard…
            </p>
          </>
        )}

        {state === "error" && (
          <>
            <div className="w-14 h-14 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center mx-auto mb-5">
              <svg
                className="w-8 h-8 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Link didn't work
            </h1>
            <p className="text-white/70 text-sm mb-6">
              {errorMessage ||
                "Your confirmation link is invalid or has expired."}
            </p>
            <button
              onClick={() => navigate("/auth", { replace: true })}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              Back to sign in
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
