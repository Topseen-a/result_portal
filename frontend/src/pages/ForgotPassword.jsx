import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { requestPasswordReset } from "../api/endpoints";
import { Button, Input, Alert } from "../components/ui";
import { ArrowLeftIcon, MailIcon } from "../components/icons";
import AuthLayout from "../components/AuthLayout";

function BackToSignIn() {
  return (
    <Link to="/login" className="inline-flex items-center gap-1.5 font-semibold text-brand-600 hover:text-brand-500">
      <ArrowLeftIcon width={16} height={16} />
      Back to sign in
    </Link>
  );
}

export default function ForgotPassword() {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      await requestPasswordReset(email);
      setSentTo(email);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  const panelProps = {
    panelTitle: "Locked out? It happens.",
    panelText: "Enter the email you signed up with and we'll send you a secure link to choose a new password.",
    footer: <BackToSignIn />,
  };

  if (sentTo) {
    return (
      <AuthLayout heading="Check your email" {...panelProps}>
        <div className="space-y-5">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-600">
            <MailIcon width={22} height={22} />
          </div>
          <p className="text-sm leading-relaxed text-slate-600">
            If an account exists for <span className="font-semibold text-slate-800">{sentTo}</span>, we've sent a
            link to reset your password. The link expires in a few days.
          </p>
          <p className="text-sm leading-relaxed text-slate-500">
            Didn't get it? Check your spam folder, or{" "}
            <button
              type="button"
              onClick={() => setSentTo(null)}
              className="font-semibold text-brand-600 hover:text-brand-500"
            >
              try another email
            </button>
            .
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      heading="Forgot your password?"
      subheading="No problem. We'll email you a link to reset it."
      {...panelProps}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <Alert>{error}</Alert>}
        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          autoFocus
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        <Button type="submit" className="w-full" disabled={sending}>
          {sending ? "Sending link..." : "Send reset link"}
        </Button>
      </form>
    </AuthLayout>
  );
}
