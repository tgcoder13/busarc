"use client";
import React from "react";
import { motion } from "framer-motion";
import { Shield, Eye, Lock, FileText } from "lucide-react";

export default function PrivacyPolicy() {
    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black text-white p-6">
            <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel relative w-full max-w-3xl rounded-2xl p-8 backdrop-blur-2xl z-10"
            >
                <div className="mb-8 text-center border-b border-white/10 pb-6">
                    <h1 className="font-cinzel text-3xl font-bold text-gold-500">Privacy Protocol</h1>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mt-2">Status: SECURE • Vercel Native</p>
                </div>

                <div className="space-y-8 text-sm text-gray-300 leading-relaxed">
                    <section>
                        <h3 className="text-lg font-bold text-white mb-3 flex items-center">
                            <Shield size={18} className="mr-2 text-gold-500" /> Data Protection
                        </h3>
                        <p>Your privacy is paramount. We do not sell, trade, or otherwise transfer your personal information to outside parties. All data is processed locally and stored securely using Vercel Blob architecture.</p>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-white mb-3 flex items-center">
                            <Lock size={18} className="mr-2 text-gold-500" /> Authentication
                        </h3>
                        <p>We use Auth.js for standardized, secure session management. Your credentials (nickname/office) are used solely for identification within this private archive system.</p>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-white mb-3 flex items-center">
                            <Eye size={18} className="mr-2 text-gold-500" /> Logging
                        </h3>
                        <p>Minimal logging is performed for security and performance optimization. Logged data is used solely for the purpose of maintaining a stable and secure study environment.</p>
                    </section>
                </div>

                <div className="mt-8 text-center border-t border-white/10 pt-6">
                    <a href="/" className="text-xs text-gold-500 hover:text-white transition-colors uppercase font-bold tracking-widest">
                        ← Return to Base
                    </a>
                </div>
            </motion.div>
        </main>
    );
}
