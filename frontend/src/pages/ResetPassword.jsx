import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { confirmPasswordReset } from "../api/endpoints";
import { Button, PasswordInput, Alert } from "../components/ui";
import AuthLayout from "../components/AuthLayout";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const uid = params.get("uid");
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const mismatch = confirm.length > 0 && password !== confirm;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setSaving(true);
    try {
      await confirmPasswordReset({ uid, token, newPassword: password });
      navigate("/login", {
        replace: true,
        state: { notice: "Your password has been reset. Sign in with your new password." },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const panelProps = {
    panelTitle: "Choose a new password.",
    panelText: "Pick something you haven't used here before. At least 8 characters, and not just numbers.",
    footer: (
      <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-500">
        Back to sign in
      </Link>
    ),
  };

  if (!uid || !token) {
    return (
      <AuthLayout heading="Invalid reset link" {...panelProps}>
        <div className="space-y-5">
          <p className="text-sm leading-relaxed text-slate-600">
            This link is incomplete or has been altered. Request a new one and use the link from the latest email.
          </p>
          <Button as={Link} to="/forgot-password" className="w-full">
            Request a new link
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout heading="Set a new password" subheading="Enter and confirm your new password below." {...panelProps}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <Alert>
            {error}{" "}
            {/expired|invalid/i.test(error) && (
              <Link to="/forgot-password" className="font-semibold underline">
                Request a new link
              </Link>
            )}
          </Alert>
        )}
        <PasswordInput
          label="New password"
          autoComplete="new-password"
          autoFocus
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
        />
        <PasswordInput
          label="Confirm new password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Re-enter your password"
          error={mismatch ? "Passwords don't match." : undefined}
        />
        <Button type="submit" className="w-full" disabled={saving || mismatch}>
          {saving ? "Resetting password..." : "Reset password"}
        </Button>
      </form>
    </AuthLayout>
  );
}
