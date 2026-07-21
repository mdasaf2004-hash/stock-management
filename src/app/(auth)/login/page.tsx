"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Aurora from "@/components/aurora/aurora";
import { Package, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      // Auto-sign in after registration
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      setLoading(false);

      if (result?.error) {
        setMode("login");
        setError("Account created. Please sign in.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setLoading(false);
      setError("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0a1a]">
      <Aurora
        colorStops={["#2e1065", "#7c3aed", "#2e1065"]}
        amplitude={1.2}
        blend={0.5}
        speed={0.8}
      />

      {/* Logo - Top Left */}
      <div className="absolute top-6 left-6 z-20 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
          <Package className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-bold text-white tracking-tight">StockPro</span>
      </div>
      <div>
        <h1 className="text-3xl font-bold text-white ">Easy solution</h1>
        <p className="text-white/60">to manage your inventory</p>
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl text-white font-bold">
                {mode === "login" ? "Welcome!" : "Create account"}
              </CardTitle>
              <CardDescription className="text-white/60 mt-1">
                {mode === "login"
                  ? "Sign in to StockPro inventory management"
                  : "Get started with StockPro"}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 rounded-lg bg-red-500/20 p-3 text-sm text-red-200 border border-red-500/30">
                {error}
              </div>
            )}

            <form
              onSubmit={mode === "login" ? handleLogin : handleRegister}
              className="space-y-4"
            >
              {mode === "register" && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white/80">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-11"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/80">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/80">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={
                      mode === "register"
                        ? "Min. 6 characters"
                        : "Enter your password"
                    }
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-11 pr-10"
                    minLength={mode === "register" ? 6 : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-white text-black hover:bg-white/90 h-11 font-semibold"
                disabled={loading}
              >
                {loading
                  ? mode === "login"
                    ? "Signing in..."
                    : "Creating account..."
                  : mode === "login"
                  ? "Sign In"
                  : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setMode(mode === "login" ? "register" : "login");
                  setError("");
                }}
                className="text-sm text-white/60 hover:text-white/90 transition-colors"
              >
                {mode === "login" ? (
                  <>
                    Don&apos;t have an account?{" "}
                    <span className="text-white font-medium">Sign up</span>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <span className="text-white font-medium">Sign in</span>
                  </>
                )}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
