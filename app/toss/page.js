"use client";
import React from "react";
import { motion } from "framer-motion";
import { FileCheck, AlertTriangle, Scale, Hammer } from "lucide-react";

export default function TermsOfService() {
    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black text-white p-6">
            <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-blue-900/10 blur-[100px]"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel relative w-full max-w-4xl rounded-2xl p-8 backdrop-blur-2xl md:p-12 z-10 overflow-y-auto max-h-[90vh]"
            >
                <div className="mb-10 text-center">
                    <FileCheck className="mx-auto mb-4 text-gold-500" size={48} />
                    <h1 className="font-cinzel text-3xl font-bold tracking-wider text-white">
                        Terms of Service
                    </h1>
                    <p className="mt-2 text-xs uppercase tracking-[0.2em] text-gold-500">
                        D'Maverics Operational Guidelines
                    </p>
                </div>

                <div className="space-y-8 text-sm text-gray-300 font-inter leading-relaxed">
                    <section>
                        <h2 className="text-lg font-bold text-white mb-3 flex items-center">
                            <Scale className="mr-2 text-gold-500" size={18} /> 1. Acceptance of Terms
                        </h2>
                        <p>
                            By accessing D'Maverics Secure Archive, you agree to abide by these operational guidelines. This service is provided for educational and archiving purposes only.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-white mb-3 flex items-center">
                            <Hammer className="mr-2 text-gold-500" size={18} /> 2. User Responsibilities
                        </h2>
                        <p>
                            Users are responsible for maintaining the confidentiality of their access credentials. Unauthorized distribution of archived materials is strictly prohibited.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-white mb-3 flex items-center">
                            <AlertTriangle className="mr-2 text-gold-500" size={18} /> 3. Service Limitations
                        </h2>
                        <p>
                            While we strive for 100% uptime, D'Maverics does not guarantee uninterrupted service. We reserve the right to modify or terminate access at any time for security reasons.
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
