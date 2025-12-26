"use client";
import React from "react";
import { motion } from "framer-motion";
import { Shield, Eye, Lock, FileText } from "lucide-react";

export default function PrivacyPolicy() {
    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black text-white p-6">
            <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none"></div>
            <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-gold-600/10 blur-[120px]"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel relative w-full max-w-4xl rounded-2xl p-8 backdrop-blur-2xl md:p-12 z-10 overflow-y-auto max-h-[90vh]"
            >
                <div className="mb-10 text-center">
                    <Shield className="mx-auto mb-4 text-gold-500" size={48} />
                    <h1 className="font-cinzel text-3xl font-bold tracking-wider text-white">
                        Privacy Policy
                    </h1>
                    <p className="mt-2 text-xs uppercase tracking-[0.2em] text-gold-500">
                        D'Maverics Secure Archive
                    </p>
                </div>

                <div className="space-y-8 text-sm text-gray-300 font-inter leading-relaxed">
                    <section>
                        <h2 className="text-lg font-bold text-white mb-3 flex items-center">
                            <Eye className="mr-2 text-gold-500" size={18} /> 1. Data Collection
                        </h2>
                        <p>
                            We collect minimal data necessary to provide our secure file archiving services. This includes your email (via Netlify Identity) and any metadata associated with the files you upload.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-white mb-3 flex items-center">
                            <Lock className="mr-2 text-gold-500" size={18} /> 2. Data Security
                        </h2>
                        <p>
                            Your data is stored using industry-standard cloud storage solutions (Vercel Blob). We implement strict access controls to ensure that only authorized users can view classified documents.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-white mb-3 flex items-center">
                            <FileText className="mr-2 text-gold-500" size={18} /> 3. Usage Policy
                        </h2>
                        <p>
                            Logged data is used solely for the purpose of authentication and providing access to the study hub. We do not sell or share your personal information with third parties.
                        </p>
                    </section>

                    <footer className="pt-8 border-t border-white/10 text-center text-[10px] text-gray-500 uppercase tracking-widest">
                        Last Updated: December 2025 • Secure Classification Server
                    </footer>
                </div>

                <div className="mt-8 text-center">
                    <a href="/" className="text-xs text-gold-500 hover:text-white transition-colors">
                        ← Return to Base
                    </a>
                </div>
            </motion.div>
        </main>
    );
}
