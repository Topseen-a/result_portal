import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button, Input, PasswordInput, Alert } from "../components/ui";
import AuthLayout from "../components/AuthLayout";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const notice = location.state?.notice;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      const redirectTo = location.state?.from || "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      // The login endpoint deliberately returns no detail on bad credentials
      // (401/400 with an empty body), so map those by status instead of
      // trusting err.message, which would otherwise show a generic
      // "Something went wrong" for what is simply a wrong password.
      if (err.status === 400 || err.status === 401) {
        setError("Invalid email or password.");
      } else {
        setError(err.message || "Invalid email or password.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      heading="Welcome back"
      subheading="Sign in to your account to continue."
      panelTitle="Results, registrations and GPA, all in one place."
      panelText="Register for courses, track your published results, and check your GPA and CGPA the moment they're released."
      footer={
        <>
          New here?{" "}
          <Link to="/create-account" className="font-semibold text-brand-600 hover:text-brand-500">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {notice && !error && <Alert tone="success">{notice}</Alert>}
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
        <PasswordInput
          label="Password"
          labelAction={
            <Link
              to="/forgot-password"
              state={{ email }}
              className="text-sm font-medium text-brand-600 hover:text-brand-500"
            >
              Forgot password?
            </Link>
          }
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </AuthLayout>
  );
}
