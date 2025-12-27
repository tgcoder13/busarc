"use client";
import React from "react";
import { motion } from "framer-motion";
import { FileCheck, AlertTriangle, Scale, Hammer } from "lucide-react";

export default function TermsOfService() {
    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black text-white p-6">
            <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel relative w-full max-w-4xl rounded-2xl p-8 backdrop-blur-2xl z-10"
            >
                <div className="mb-8 text-center border-b border-white/10 pb-6">
                    <h1 className="font-cinzel text-3xl font-bold text-gold-500">Terms of Service</h1>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mt-2">Effective: September 2025</p>
                </div>

                <div className="space-y-8 text-sm text-gray-300 leading-relaxed overflow-y-auto max-h-[60vh] pr-4 custom-scrollbar">
                    <section>
                        <h3 className="text-lg font-bold text-white mb-3 flex items-center">
                            <Scale size={18} className="mr-2 text-gold-500" /> Usage Policy
                        </h3>
                        <p>D'Maverics Archive is a private resource. By accessing this server, you agree to use the materials for personal academic purposes only. Unauthorized distribution, reproduction, or commercial use of any content is strictly prohibited.</p>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-white mb-3 flex items-center">
                            <Hammer size={18} className="mr-2 text-gold-500" /> Ethical Conduct
                        </h3>
                        <p>Users must maintain academic integrity. This platform is designed as a study aid, not a tool for academic dishonesty. Any misuse that violates institutional policies is the sole responsibility of the user.</p>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-white mb-3 flex items-center">
                            <AlertTriangle size={18} className="mr-2 text-gold-500" /> Disclaimer
                        </h3>
                        <p>While we strive for 100% accuracy, materials are provided "as-is." D'Maverics Archive does not guarantee the precision or completeness of the study materials. Use at your own discretion.</p>
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
