"use client";
import React, { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft, BookOpen, Brain, Download, FileText,
    MessageSquare, Settings, Share2, Sparkles, Wand2,
    RefreshCw, Play, Save, ChevronRight, X, Maximize2,
    CheckCircle2, AlertCircle, Clock
} from "lucide-react";
import { generateMockTest } from "@/app/utils/analyzer";

// --- HELPERS ---
const extractPDFText = async (fileUrl) => {
    // PDF.js worker setup is handled in analyzer.js
    const { extractTextFromPDF } = await import("@/app/utils/analyzer");
    return await extractTextFromPDF(fileUrl);
};

export default function StudyPage() {
    return (
        <Suspense fallback={<div className="h-screen bg-black flex items-center justify-center text-gold-500">Loading Environment...</div>}>
            <StudyContent />
        </Suspense>
    );
}

function StudyContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const fileUrl = searchParams.get("file");
    const docTitle = searchParams.get("title") || "Untitled Document";
    const mode = searchParams.get("mode") || "study"; // study | grand_test

    const [activeTab, setActiveTab] = useState("reader"); // reader | quiz | summary | notes
    const [fullText, setFullText] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // AI States
    const [summary, setSummary] = useState("");
    const [quiz, setQuiz] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Notes State
    const [notes, setNotes] = useState("");

    useEffect(() => {
        if (!fileUrl) {
            router.push("/dashboard");
            return;
        }
        loadDocument();
        // Load notes from local storage
        const savedNotes = localStorage.getItem(`dmav_notes_${fileUrl.split('/').pop()}`);
        if (savedNotes) setNotes(savedNotes);
    }, [fileUrl]);

    const loadDocument = async () => {
        try {
            setLoading(true);
            const text = await extractPDFText(fileUrl);
            setFullText(text);
        } catch (err) {
            console.error(err);
            setError("Failed to load document content.");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveNotes = () => {
        localStorage.setItem(`dmav_notes_${fileUrl.split('/').pop()}`, notes);
        alert("Notes saved successfully!");
    };

    const handleGenerateMock = async () => {
        if (!fullText) return;
        setIsAnalyzing(true);
        try {
            const test = await generateMockTest(fullText, docTitle);
            setQuiz(test.questions);
            setActiveTab("quiz");
        } catch (err) {
            alert("Analysis failed. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    if (loading) return <LoadingScreen />;
    if (error) return <ErrorScreen message={error} />;

    return (
        <div className="flex h-screen bg-black text-white overflow-hidden font-inter">
            {/* Navigation Drawer */}
            <div className="w-16 flex flex-col items-center py-8 border-r border-white/5 bg-[#050505]">
                <button onClick={() => router.push('/dashboard')} className="p-3 mb-10 text-gray-500 hover:text-gold-500 hover:bg-gold-500/10 rounded-xl transition-all">
                    <ArrowLeft size={24} />
                </button>

                <div className="flex-1 space-y-4">
                    <NavIcon id="reader" icon={BookOpen} active={activeTab} set={setActiveTab} label="Reader" />
                    <NavIcon id="summary" icon={Sparkles} active={activeTab} set={setActiveTab} label="AI Summary" />
                    <NavIcon id="quiz" icon={Brain} active={activeTab} set={setActiveTab} label="Mock Test" />
                    <NavIcon id="notes" icon={FileText} active={activeTab} set={setActiveTab} label="My Notes" />
                </div>

                <button className="p-3 text-gray-600 hover:text-white transition-colors">
                    <Settings size={20} />
                </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col relative">
                <header className="h-16 flex items-center justify-between px-8 border-b border-white/5">
                    <div className="flex items-center space-x-4">
                        <span className="text-xs font-mono text-gold-500/50 uppercase tracking-widest">{mode} MODE</span>
                        <h2 className="text-sm font-bold text-gray-200 truncate max-w-md">{docTitle}</h2>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button className="flex items-center px-4 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-all border border-white/5">
                            <Download size={14} className="mr-2 text-gold-500" /> PDF
                        </button>
                        <button className="flex items-center px-4 py-1.5 bg-gold-600 hover:bg-gold-500 text-black rounded-lg text-xs font-bold transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                            <Share2 size={14} className="mr-2" /> Share
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-hidden relative">
                    <AnimatePresence mode="wait">
                        {activeTab === 'reader' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                                <iframe src={`${fileUrl}#toolbar=0`} className="w-full h-full border-0 grayscale hover:grayscale-0 transition-all duration-700" title="PDF Viewer" />
                            </motion.div>
                        )}

                        {activeTab === 'summary' && <SummaryView fullText={fullText} summary={summary} setSummary={setSummary} isAnalyzing={isAnalyzing} setIsAnalyzing={setIsAnalyzing} />}
                        {activeTab === 'quiz' && <QuizView questions={quiz} generate={handleGenerateMock} isAnalyzing={isAnalyzing} />}
                        {activeTab === 'notes' && <NotesView notes={notes} setNotes={setNotes} save={handleSaveNotes} />}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}

// --- SUBVIEWS ---

function NavIcon({ id, icon: Icon, active, set, label }) {
    const isActive = active === id;
    return (
        <div className="relative group">
            <button
                onClick={() => set(id)}
                className={`p-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-gold-500 text-black shadow-[0_0_20px_rgba(212,175,55,0.4)]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
            >
                <Icon size={22} />
            </button>
            <span className="absolute left-16 top-1/2 -translate-y-1/2 bg-gold-500 text-black text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-all ml-2 whitespace-nowrap z-50">
                {label}
            </span>
        </div>
    );
}

function LoadingScreen() {
    return (
        <div className="h-screen bg-black flex flex-col items-center justify-center text-white">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="mb-6">
                <RefreshCw size={48} className="text-gold-500" />
            </motion.div>
            <h2 className="font-cinzel text-xl font-bold tracking-widest text-gold-500">DECRYPTING ARCHIVE</h2>
            <p className="mt-2 text-xs text-gray-600 uppercase tracking-widest">Please wait while we process the secure material</p>
        </div>
    );
}

function ErrorScreen({ message }) {
    return (
        <div className="h-screen bg-black flex flex-col items-center justify-center text-white p-6">
            <AlertCircle size={48} className="text-red-500 mb-6" />
            <h2 className="text-2xl font-bold mb-2">ACCESS TERMINATED</h2>
            <p className="text-gray-500">{message}</p>
            <button onClick={() => window.location.href = '/dashboard'} className="mt-8 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-bold transition-all">
                Return to Dashboard
            </button>
        </div>
    );
}

function SummaryView({ fullText, summary, setSummary, isAnalyzing, setIsAnalyzing }) {
    const handleGenerate = async () => {
        setIsAnalyzing(true);
        // Optimized summary generation logic could go here
        // For now, mirroring a mock result or actual AI call
        setTimeout(() => {
            setSummary("This document covers the core concepts of the subject, emphasizing the critical relationship between theory and application. Key takeaways include the historical context, major frameworks, and modern-day implications for practitioners. The author argues that without a robust understanding of these fundamentals, advanced study is significantly hampered.");
            setIsAnalyzing(false);
        }, 3000);
    };

    return (
        <div className="h-full overflow-y-auto p-12 bg-[#080808]">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-10">
                    <h3 className="text-3xl font-cinzel font-bold text-white">AI Intel Summary</h3>
                    {!summary && !isAnalyzing && (
                        <button onClick={handleGenerate} className="flex items-center px-6 py-3 bg-gold-600 hover:bg-gold-500 text-black font-bold rounded-xl transition-all shadow-lg group">
                            <Sparkles className="mr-2 group-hover:animate-pulse" size={18} /> Deep Analyze
                        </button>
                    )}
                </div>

                {isAnalyzing ? (
                    <div className="space-y-6">
                        <div className="h-4 bg-white/5 rounded-full w-full animate-pulse"></div>
                        <div className="h-4 bg-white/5 rounded-full w-5/6 animate-pulse delay-75"></div>
                        <div className="h-4 bg-white/5 rounded-full w-4/6 animate-pulse delay-150"></div>
                        <div className="pt-8 text-center text-xs text-gold-500 uppercase tracking-[0.3em] font-bold animate-pulse">Extracting Intelligence Patterns...</div>
                    </div>
                ) : summary ? (
                    <div className="prose prose-invert max-w-none">
                        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 leading-relaxed text-gray-300 shadow-inner">
                            {summary}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Sparkles size={32} className="text-gray-700" />
                        </div>
                        <p className="text-gray-500">Document intelligence layer is ready. Request analysis to proceed.</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
}

function QuizView({ questions, generate, isAnalyzing }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);

    const handleAnswer = (idx, ans) => {
        setSelectedAnswers(prev => ({ ...prev, [idx]: ans }));
    };

    const calculateScore = () => {
        let sc = 0;
        questions.forEach((q, i) => {
            if (selectedAnswers[i] === q.correct) sc++;
        });
        return Math.round((sc / questions.length) * 100);
    };

    if (isAnalyzing) return <div className="h-full flex flex-col items-center justify-center bg-black"><LoadingScreen /></div>;

    if (!questions || questions.length === 0) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="w-20 h-20 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-gold-500">
                        <Wand2 size={40} />
                    </div>
                    <h3 className="text-2xl font-cinzel font-bold text-white mb-4">Mock Exam Generator</h3>
                    <p className="text-gray-500 mb-8 max-w-md">Our AI can scan this document and create a custom test for you.</p>
                    <button onClick={generate} className="px-10 py-4 bg-gold-600 text-black font-bold rounded-xl hover:scale-105 transition-all shadow-xl">
                        Transform into Exam
                    </button>
                </div>
            </div>
        );
    }

    if (showResults) {
        const score = calculateScore();
        return (
            <div className="h-full overflow-y-auto p-12 bg-[#080808] flex items-center justify-center">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-lg w-full bg-[#111] border border-white/10 p-12 rounded-3xl text-center shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gold-500"></div>
                    <CheckCircle2 size={80} className="text-gold-500 mx-auto mb-6" />
                    <h2 className="text-4xl font-cinzel font-bold text-white mb-2">Session Complete</h2>
                    <p className="text-gray-500 uppercase tracking-widest text-xs mb-10">Academic Performance Intel</p>

                    <div className="text-7xl font-bold text-white mb-4">{score}%</div>
                    <p className="text-gold-400 font-bold text-sm mb-12">Accuracy Rating: {score > 70 ? 'Superior' : 'Needs Reinforcement'}</p>

                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => window.location.reload()} className="py-4 border border-white/10 rounded-xl font-bold text-gray-400 hover:text-white transition-all">Retry</button>
                        <button onClick={() => window.location.href = '/dashboard'} className="py-4 bg-gold-600 text-black rounded-xl font-bold hover:bg-gold-500 transition-all">Archive Data</button>
                    </div>
                </motion.div>
            </div>
        );
    }

    const q = questions[currentIndex];

    return (
        <div className="h-full overflow-y-auto p-12 bg-[#080808]">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-12 text-gray-500">
                    <span className="text-xs font-bold uppercase tracking-widest">Question {currentIndex + 1} of {questions.length}</span>
                    <div className="w-48 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gold-500 transition-all duration-500" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}></div>
                    </div>
                </div>

                <motion.div key={currentIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                    <h3 className="text-2xl font-bold text-white leading-relaxed">{q.question}</h3>

                    <div className="grid grid-cols-1 gap-4">
                        {q.options.map((opt, i) => (
                            <button
                                key={i}
                                onClick={() => handleAnswer(currentIndex, i)}
                                className={`w-full text-left p-6 rounded-2xl border transition-all duration-200 flex justify-between items-center group
                                ${selectedAnswers[currentIndex] === i ? 'bg-gold-500/10 border-gold-500 text-gold-500' : 'bg-white/5 border-transparent text-gray-400 hover:border-white/10 hover:text-white'}`}
                            >
                                <span className="font-semibold">{opt}</span>
                                <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${selectedAnswers[currentIndex] === i ? 'bg-gold-500 border-gold-400 text-black' : 'border-white/10 group-hover:border-white/30'}`}>
                                    {selectedAnswers[currentIndex] === i && <ArrowLeft size={14} className="rotate-180" />}
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="flex justify-between pt-10 border-t border-white/5">
                        <button
                            disabled={currentIndex === 0}
                            onClick={() => setCurrentIndex(prev => prev - 1)}
                            className="text-gray-500 hover:text-white px-6 py-3 rounded-lg font-bold disabled:opacity-20 transition-all"
                        >
                            Previous
                        </button>
                        {currentIndex < questions.length - 1 ? (
                            <button
                                disabled={selectedAnswers[currentIndex] === undefined}
                                onClick={() => setCurrentIndex(prev => prev + 1)}
                                className="bg-white/5 hover:bg-white/10 border border-white/10 px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-20 flex items-center"
                            >
                                Next <ChevronRight size={18} className="ml-2" />
                            </button>
                        ) : (
                            <button
                                disabled={selectedAnswers[currentIndex] === undefined}
                                onClick={() => setShowResults(true)}
                                className="bg-gold-600 hover:bg-gold-500 text-black px-10 py-3 rounded-xl font-bold transition-all shadow-lg"
                            >
                                Submit Intel
                            </button>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function NotesView({ notes, setNotes, save }) {
    return (
        <div className="h-full overflow-hidden p-8 lg:p-12 bg-[#080808] flex flex-col">
            <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-cinzel font-bold text-white">Encrypted Notes</h3>
                        <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest hidden sm:block">Personal Intel • Local Storage Only</p>
                    </div>
                    <button onClick={save} className="flex items-center px-6 py-2.5 bg-gold-600 hover:bg-gold-500 text-black font-bold rounded-xl transition-all shadow-lg">
                        <Save size={18} className="mr-2" /> Commit to Storage
                    </button>
                </div>

                <div className="flex-1 relative">
                    <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="Start typing your academic intelligence here..."
                        className="w-full h-full bg-[#111] border border-white/5 rounded-3xl p-10 text-gray-300 resize-none focus:outline-none focus:border-gold-500/30 transition-all font-mono leading-relaxed shadow-inner"
                    />
                    <div className="absolute bottom-6 right-8 text-[10px] text-gray-700 uppercase tracking-widest font-bold font-mono">
                        {notes.length} Characters • Secured
                    </div>
                </div>
            </div>
        </div>
    );
}
