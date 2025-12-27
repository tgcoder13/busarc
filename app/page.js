"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { Lock, User, RefreshCw, Globe, Shield, Mail } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nickname: "",
    office: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        nickname: formData.nickname,
        office: formData.office,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials. Please check your nickname and office.");
      } else {
        router.push("/dashboard");
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

        <div className="space-y-6">
          <div className="p-6 bg-white/5 rounded-xl border border-white/10">
            <h3 className="text-xl font-bold text-white mb-6 text-center">Member Access</h3>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center">
                  <User size={14} className="mr-2" /> Nickname
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. 1234"
                  className="input-field w-full rounded-lg bg-white/5 px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center">
                  <Lock size={14} className="mr-2" /> Office
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. 001"
                  className="input-field w-full rounded-lg bg-white/5 px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                  value={formData.office}
                  onChange={(e) => setFormData({ ...formData, office: e.target.value })}
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

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#050505] px-2 text-gray-500">Or Optional</span></div>
            </div>

            <button
              onClick={() => handleProviderLogin("google")}
              className="w-full rounded-lg py-3 text-xs font-bold text-white border border-white/10 hover:border-gold-500/30 transition-all bg-white/5 active:scale-[0.98] flex items-center justify-center"
            >
              <Globe size={18} className="mr-2 text-gold-500" /> Continue with Google
            </button>
          </div>

          <div className="text-center">
            <p className="text-[10px] text-gray-600 uppercase tracking-widest">
              Vercel Optimized Authentication
            </p>
          </div>
        </div>

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
