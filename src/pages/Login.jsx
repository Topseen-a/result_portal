import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button, Input, Alert } from "../components/ui";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    <div className="flex min-h-screen">
      <div className="hidden flex-1 flex-col justify-between bg-navy-950 p-12 text-white lg:flex">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold">
            R
          </div>
          <span className="text-lg font-semibold tracking-tight">Result Portal</span>
        </div>
        <div className="max-w-md">
          <h1 className="text-3xl font-semibold leading-tight">
            Results, registrations, and GPA — all in one place.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            Register for courses, track your published results, and check your GPA and CGPA
            the moment they're released.
          </p>
        </div>
        <p className="text-xs text-slate-500">© {new Date().getFullYear()} Result Portal</p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-[#f6f7fb] px-6 py-12">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-semibold text-slate-900">Welcome back</h2>
          <p className="mt-1 text-sm text-slate-500">Sign in to your account to continue.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {error && <Alert>{error}</Alert>}
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            New here?{" "}
            <Link to="/create-account" className="font-medium text-brand-600 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
