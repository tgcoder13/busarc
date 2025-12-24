"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Lock, User, RefreshCw, Globe, Shield } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [formData, setFormData] = useState({
    office: "",
    nickname: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Initialize Netlify Identity Listeners
  useEffect(() => {
    if (window.netlifyIdentity) {
      window.netlifyIdentity.on("init", user => {
        if (user) {
          console.log("Found existing user", user);
        }
      });

      window.netlifyIdentity.on("login", async user => {
        console.log("Logged in", user);

        // Sync with our Database
        try {
          const res = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'sync', user })
          });
          const data = await res.json();

          if (data.success) {
            localStorage.setItem("maverics_user", JSON.stringify(data.user));
            window.netlifyIdentity.close();
            router.push("/dashboard");
          }
        } catch (e) {
          console.error("Sync failed", e);
        }
      });
    }
  }, [router]);

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem("maverics_user", JSON.stringify(data.user));
        router.push("/dashboard");
      } else {
        setError(data.error || "Authentication failed.");
        setIsSubmitting(false);
      }

    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
      setIsSubmitting(false);
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

                <button
                  onClick={() => window.netlifyIdentity.open()}
                  className="btn-primary w-full rounded-lg py-4 text-sm font-bold text-black shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
                >
                  <User size={18} className="mr-2" /> Login / Sign Up
                </button>
              </div>

              <div className="text-center">
                <button
                  onClick={() => setShowAdminLogin(true)}
                  className="text-xs text-gray-500 hover:text-gold-500 flex items-center justify-center mx-auto transition-colors"
                >
                  <Shield size={12} className="mr-1.5" /> System Admin
                </button>
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
                <h3 className="text-lg font-bold text-red-400 flex items-center justify-center">
                  <Shield className="mr-2" size={18} /> Admin Override
                </h3>
              </div>

              <form onSubmit={handleAdminSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center">
                    <User size={14} className="mr-2" /> Office
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Antigravity"
                    className="input-field w-full rounded-lg bg-white/5 px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    value={formData.office}
                    onChange={(e) => setFormData({ ...formData, office: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center">
                    <Lock size={14} className="mr-2" /> Nickname
                  </label>
                  <input
                    required
                    type="password"
                    placeholder="••••••••"
                    className="input-field w-full rounded-lg bg-white/5 px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    value={formData.nickname}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  />
                </div>

                {error && <p className="text-red-500 text-sm text-center font-bold bg-red-500/10 p-2 rounded">{error}</p>}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-lg py-4 text-sm font-bold bg-gradient-to-r from-red-900/80 to-red-800/80 hover:from-red-800 hover:to-red-700 text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:grayscale flex justify-center items-center ring-1 ring-red-500/30"
                >
                  {isSubmitting ? <RefreshCw className="animate-spin" /> : "Authenticate Admin"}
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
          <p className="text-[10px]">
            SECURE CLASSIFICATION SERVER • NETLIFY IDENTITY
          </p>
        </div>
      </motion.div>
    </main>
  );
}
