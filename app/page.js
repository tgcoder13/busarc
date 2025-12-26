"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { Lock, User, RefreshCw, Globe, Shield, Mail } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleGuestAccess = () => {
    localStorage.setItem("maverics_user", JSON.stringify({
      id: "guest",
      nickname: "Guest",
      office: "Public",
      role: "guest"
    }));
    router.push("/dashboard");
  };

  // Check for existing session
  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (session) {
        // Sync with localStorage for compatibility with existing dashboard logic
        localStorage.setItem("maverics_user", JSON.stringify({
          id: session.user.id,
          nickname: session.user.nickname || session.user.name,
          office: session.user.office || "Member",
          role: session.user.role || "user",
          email: session.user.email,
        }));
        router.push("/dashboard");
      }
    };
    checkSession();
  }, [router]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials.");
      } else {
        // Session check in useEffect will handle redirect
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProviderLogin = async (provider) => {
    try {
      await signIn(provider, { callbackUrl: "/dashboard" });
    } catch (err) {
      console.error(err);
      setError("Login failed. Please try again.");
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black text-white">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none"></div>
      <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-gold-600/10 blur-[120px]"></div>
      <div className="absolute bottom-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-blue-900/10 blur-[100px]"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="glass-panel relative w-full max-w-md rounded-2xl p-8 backdrop-blur-2xl md:p-12 z-10 mx-4"
      >
        <div className="mb-10 text-center">
          <h1 className="font-cinzel text-4xl font-bold tracking-wider text-white drop-shadow-lg">
            D'Maverics
          </h1>
          <p className="mt-2 font-inter text-sm uppercase tracking-[0.2em] text-gold-500">
            Secure Study Archive
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!showAdminLogin ? (
            <motion.div
              key="identity"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="p-6 bg-white/5 rounded-xl border border-white/10 text-center">
                <Lock className="mx-auto mb-4 text-gold-500" size={32} />
                <h3 className="text-xl font-bold text-white mb-2">Member Access</h3>
                <p className="text-sm text-gray-400 mb-6">Log in to view archives and access the Study Hub.</p>

                <div className="space-y-3">
                  <button
                    onClick={() => handleProviderLogin("google")}
                    className="btn-primary w-full rounded-lg py-4 text-sm font-bold text-black shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
                  >
                    <Globe size={18} className="mr-2" /> Continue with Google
                  </button>

                  <button
                    onClick={() => setShowAdminLogin(true)}
                    className="w-full rounded-lg py-3 text-xs font-bold text-white border border-white/10 hover:border-gold-500/30 transition-all bg-white/5 active:scale-[0.98] flex items-center justify-center"
                  >
                    <Mail size={14} className="mr-2" /> Login with Email
                  </button>

                  <button
                    onClick={handleGuestAccess}
                    className="w-full rounded-lg py-3 text-xs font-bold text-gray-400 border border-white/10 hover:border-gold-500/30 hover:text-white transition-all bg-white/5 active:scale-[0.98]"
                  >
                    Continue as Guest
                  </button>
                </div>
              </div>

              <div className="text-center">
                <p className="text-[10px] text-gray-600 uppercase tracking-widest">
                  Secure OAuth 2.0 Integration
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="admin"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="border-b border-white/10 pb-4 mb-4">
                <h3 className="text-lg font-bold text-gold-500 flex items-center justify-center">
                  <Mail className="mr-2" size={18} /> Email Login
                </h3>
              </div>

              <form onSubmit={handleEmailLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center">
                    <User size={14} className="mr-2" /> Email
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="name@example.com"
                    className="input-field w-full rounded-lg bg-white/5 px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center">
                    <Lock size={14} className="mr-2" /> Password
                  </label>
                  <input
                    required
                    type="password"
                    placeholder="••••••••"
                    className="input-field w-full rounded-lg bg-white/5 px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>

                {error && <p className="text-red-500 text-sm text-center font-bold bg-red-500/10 p-2 rounded">{error}</p>}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full rounded-lg py-4 text-sm font-bold text-black shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:grayscale flex justify-center items-center"
                >
                  {isSubmitting ? <RefreshCw className="animate-spin" /> : "Sign In"}
                </button>
              </form>

              <div className="text-center pt-2">
                <button
                  onClick={() => setShowAdminLogin(false)}
                  className="text-xs text-gray-500 hover:text-white transition-colors"
                >
                  ← Back to Member Login
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 text-center text-gray-600">
          <p className="text-[10px] mb-3">
            SECURE CLASSIFICATION SERVER • VERCEL DEPLOYMENT
          </p>
          <div className="flex justify-center space-x-4 text-[9px] uppercase tracking-widest">
            <a href="/privacy" className="hover:text-gold-500 transition-colors">Privacy Policy</a>
            <span className="text-gray-800">|</span>
            <a href="/toss" className="hover:text-gold-500 transition-colors">Terms of Service</a>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
