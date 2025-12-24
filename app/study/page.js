"use client";
import React, { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
    ArrowLeft, BookOpen, Brain, MessageSquare, PenTool,
    ChevronRight, ChevronLeft, CheckCircle, XCircle, RotateCcw, Play, Save,
    Send, Sparkles, GraduationCap, Settings, Loader
} from "lucide-react";
import { extractTextFromPDF, generateMockTest } from "../utils/analyzer";
import { exportFlashcards, exportTest } from "../utils/exportHelpers";

function StudyContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const fileUrl = searchParams.get('file');
    const title = searchParams.get('title');
    const mode = searchParams.get('mode');
    const course = searchParams.get('course');
    const urls = searchParams.get('urls');
    const titles = searchParams.get('titles');

    const [activeTab, setActiveTab] = useState('chat');
    const [extractedText, setExtractedText] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        if (mode === 'grand_test' && urls) {
            // Grand Test: Extract from multiple PDFs
            setIsAnalyzing(true);
            const urlList = urls.split(',');
            const titleList = titles ? titles.split(',') : [];

            Promise.all(urlList.map(url => extractTextFromPDF(url)))
                .then(texts => {
                    const combined = texts.map((text, i) =>
                        `=== ${titleList[i] || `Document ${i + 1}`} ===\n${text}\n\n`
                    ).join('');
                    setExtractedText(combined);
                    setIsAnalyzing(false);
                    // Auto-start test mode
                    setActiveTab('test');
                }).catch(err => {
                    console.error("Grand Test extraction failed", err);
                    setIsAnalyzing(false);
                });
        } else if (fileUrl) {
            // Single file mode
            setIsAnalyzing(true);
            extractTextFromPDF(fileUrl).then(text => {
                setExtractedText(text);
                setIsAnalyzing(false);
            }).catch(err => {
                console.error("Analysis failed", err);
                setIsAnalyzing(false);
            });
        }
    }, [fileUrl, mode, urls, titles]);

    if (!fileUrl && !urls) return <div className="p-10 text-white">Error: No file selected.</div>;

    return (
        <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden font-inter">
            {/* LEFT: PDF STAGE */}
            <div className="flex-1 flex flex-col border-r border-white/5 relative bg-black">
                {/* Header */}
                <div className="h-16 flex items-center px-6 border-b border-white/5 bg-[#050505]">
                    <button onClick={() => router.back()} className="text-gray-400 hover:text-white mr-4 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="font-cinzel font-bold text-lg tracking-wide text-gray-200 truncate max-w-md">
                            {mode === 'grand_test' ? `${course} - Grand Test` : (title || "Document Study")}
                        </h1>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                            {mode === 'grand_test' ? 'Grand Assessment Mode' : 'Reading Mode'}
                        </p>
                    </div>
                </div>
                {mode === 'grand_test' ? (
                    <div className="w-full h-full bg-[#111] flex items-center justify-center">
                        <div className="text-center">
                            <GraduationCap size={64} className="mx-auto text-gold-500 mb-4 opacity-50" />
                            <h2 className="text-2xl font-cinzel font-bold text-white mb-2">{course} Grand Test</h2>
                            <p className="text-gray-400 text-sm">Processing {urls?.split(',').length || 0} documents...</p>
                            {isAnalyzing && <Loader className="animate-spin mx-auto mt-4 text-gold-500" />}
                        </div>
                    </div>
                ) : (
                    <iframe src={fileUrl} className="w-full h-full bg-[#111]" />
                )}
            </div>

            {/* RIGHT: INTELLIGENT SIDEBAR */}
            <div className="w-[450px] flex flex-col bg-[#080808] border-l border-white/5 shadow-2xl z-10">
                {/* Tool Navigation */}
                <div className="flex items-center justify-around p-2 border-b border-white/5 bg-[#0a0a0a]">
                    <NavIcon id="chat" icon={Sparkles} label="AI Tutor" active={activeTab} set={setActiveTab} />
                    <NavIcon id="notes" icon={PenTool} label="Notes" active={activeTab} set={setActiveTab} />
                    <NavIcon id="flashcards" icon={BookOpen} label="Cards" active={activeTab} set={setActiveTab} />
                    <NavIcon id="test" icon={GraduationCap} label="Test" active={activeTab} set={setActiveTab} />
                </div>

                {/* Dynamic Content Area */}
                <div className="flex-1 overflow-hidden relative group">
                    {/* Ambient Background */}
                    <div className="absolute inset-0 bg-gradient-to-b from-purple-900/5 to-transparent pointer-events-none"></div>

                    {activeTab === 'chat' && <AIChatPanel context={extractedText} analyzing={isAnalyzing} />}
                    {activeTab === 'notes' && <NotesPanel fileId={title || course || 'grand_test'} />}
                    {activeTab === 'flashcards' && <FlashcardsPanel context={extractedText} />}
                    {activeTab === 'test' && <TestCenterPanel context={extractedText} analyzing={isAnalyzing} isGrandTest={mode === 'grand_test'} />}
                </div>
            </div>
        </div>
    );
}

// --- NAVIGATION ---
function NavIcon({ id, icon: Icon, label, active, set }) {
    const isActive = active === id;
    return (
        <button
            onClick={() => set(id)}
            className={`flex flex-col items-center justify-center w-full py-3 rounded-lg transition-all duration-300
            ${isActive ? 'text-gold-400 bg-white/5' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
        >
            <Icon size={20} className={`mb-1 transition-transform ${isActive ? 'scale-110' : ''}`} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
        </button>
    );
}

// --- PANELS ---

function AIChatPanel({ context, analyzing }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const scrollRef = useRef(null);

    useEffect(() => {
        if (analyzing) {
            setMessages([{ role: 'ai', text: "Analyzing document content... please wait." }]);
        } else if (context) {
            setMessages([{ role: 'ai', text: `Analysis complete! I've read ${context.split(' ').length} words. I can help you summarize key points, create quizzes, or explain complex topics. What would you like to do?` }]);
        } else {
            setMessages([{ role: 'ai', text: "Hello! I'm ready to help, but I couldn't extract text from this document. I'll do my best with general knowledge." }]);
        }
    }, [context, analyzing]);

    const handleSend = () => {
        if (!input.trim()) return;
        setMessages([...messages, { role: 'user', text: input }]);
        setInput("");

        // Mock AI Response
        setTimeout(() => {
            setMessages(prev => [...prev, { role: 'ai', text: "That's an interesting point! Based on the document, this concept relates to the core principles of governance discussed in Chapter 2." }]);
        }, 1000);
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-gold-600/20 text-gold-100 border border-gold-500/20 rounded-tr-none' : 'bg-white/5 text-gray-300 border border-white/10 rounded-tl-none'}`}>
                            {m.text}
                        </div>
                    </div>
                ))}
            </div>

            {/* Suggested Prompts */}
            {messages.length === 1 && (
                <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
                    {['Summarize', 'Key Concepts', 'Quiz Me'].map(p => (
                        <button key={p} className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 hover:text-gold-400 hover:border-gold-500/30 transition-colors">
                            {p}
                        </button>
                    ))}
                </div>
            )}

            <div className="p-4 border-t border-white/10 bg-[#080808]">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Ask about the document..."
                        className="w-full bg-[#111] border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-gold-500/50 transition-colors text-white placeholder-gray-600"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button onClick={handleSend} className="absolute right-2 top-2 p-1.5 rounded-lg bg-gold-600 text-black hover:bg-gold-500 transition-colors">
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}

function NotesPanel({ fileId }) {
    const [notes, setNotes] = useState("");

    useEffect(() => {
        const saved = localStorage.getItem(`dmav_notes_${fileId}`);
        if (saved) setNotes(saved);
    }, [fileId]);

    const handleSave = () => {
        localStorage.setItem(`dmav_notes_${fileId}`, notes);
        alert("Notes Saved!");
    };

    return (
        <div className="h-full flex flex-col p-4">
            <h3 className="font-cinzel text-gray-500 text-xs uppercase mb-2">My Notes</h3>
            <textarea
                className="flex-1 w-full bg-[#111] border border-white/10 rounded-xl p-4 resize-none focus:outline-none focus:border-gold-500/30 font-mono text-sm leading-relaxed text-gray-300 placeholder-gray-700"
                placeholder="Start typing your notes here..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
            />
            <button onClick={handleSave} className="mt-4 w-full py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-sm font-bold text-gray-300 transition-all flex items-center justify-center">
                <Save size={16} className="mr-2" /> Save to Browser
            </button>
        </div>
    );
}

function FlashcardsPanel({ context }) {
    const [flipped, setFlipped] = useState(false);
    const [index, setIndex] = useState(0);
    const [cards, setCards] = useState([]);

    useEffect(() => {
        if (context && context.length > 100) {
            // Generate flashcards from context
            const sentences = context.match(/[^.!?]+[.!?]+/g) || [];
            const suitable = sentences.filter(s => s.length > 30 && s.length < 150);
            const selected = suitable.slice(0, 10); // Top 10

            const generated = selected.map((s, i) => {
                const words = s.split(' ');
                const keywordIndex = words.findIndex(w => w.length > 6);
                const keyword = keywordIndex > -1 ? words[keywordIndex].replace(/[^a-zA-Z]/g, '') : 'Concept';
                return {
                    q: `What does "${keyword}" refer to in this context?`,
                    a: s.trim()
                };
            });
            setCards(generated);
        } else {
            // Fallback to default cards
            setCards([
                { q: "What is the primary function of the Executive?", a: "To enforce and implement laws." },
                { q: "Define 'Separation of Powers'.", a: "Division of government responsibilities into distinct branches." },
                { q: "Who authored 'The Prince'?", a: "Niccolò Machiavelli." },
            ]);
        }
    }, [context]);

    if (cards.length === 0) {
        return (
            <div className="h-full flex items-center justify-center p-6">
                <p className="text-gray-500 text-sm">No flashcards available. Analyzing document...</p>
            </div>
        );
    }

    const handleExport = (format) => {
        exportFlashcards(cards, format, 'dmaverics_flashcards');
    };

    return (
        <div className="h-full flex flex-col items-center p-6">
            <div className="w-full flex justify-between items-center mb-6">
                <h3 className="font-cinzel text-gold-500 text-sm">Deck: Study Cards</h3>
                <div className="flex gap-2">
                    <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">{cards.length} Cards</span>
                    <button
                        onClick={() => handleExport('json')}
                        className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded hover:bg-blue-500/20 transition-colors border border-blue-500/20"
                        title="Export as JSON"
                    >
                        Export
                    </button>
                </div>
            </div>

            <div
                onClick={() => setFlipped(!flipped)}
                className="w-full flex-1 perspective cursor-pointer group mb-6 relative"
            >
                <div className={`relative w-full h-full duration-500 preserve-3d transition-all ${flipped ? 'rotate-y-180' : ''}`}>
                    {/* FRONT */}
                    <div className="absolute inset-0 backface-hidden bg-[#111] border border-white/10 rounded-2xl flex flex-col items-center justify-center p-8 text-center shadow-2xl">
                        <span className="text-xs text-gray-600 uppercase tracking-widest mb-4">Question</span>
                        <p className="text-lg font-medium text-gray-200">{cards[index].q}</p>
                    </div>
                    {/* BACK */}
                    <div className="absolute inset-0 backface-hidden bg-[#151515] border border-gold-500/20 rounded-2xl rotate-y-180 flex flex-col items-center justify-center p-8 text-center bg-[url('/noise.png')]">
                        <span className="text-xs text-gold-600 uppercase tracking-widest mb-4">Answer</span>
                        <p className="text-xl font-bold text-gold-400">{cards[index].a}</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <button onClick={() => { setFlipped(false); setIndex((i) => (i - 1 + cards.length) % cards.length); }} className="p-4 rounded-full bg-white/5 hover:bg-white/10 transition-colors"><ChevronLeft size={20} /></button>
                <div className="text-sm font-mono text-gray-400">{index + 1} / {cards.length}</div>
                <button onClick={() => { setFlipped(false); setIndex((i) => (i + 1) % cards.length); }} className="p-4 rounded-full bg-white/5 hover:bg-white/10 transition-colors"><ChevronRight size={20} /></button>
            </div>
        </div>
    );
}

function TestCenterPanel({ context, analyzing, isGrandTest }) {
    const [step, setStep] = useState('config'); // config | quiz | result
    const [score, setScore] = useState(0);
    const [config, setConfig] = useState({ type: 'objective', qCount: 5 });
    const [generatedQuiz, setGeneratedQuiz] = useState(null);

    // Auto-start Grand Test
    useEffect(() => {
        if (isGrandTest && !analyzing && context) {
            startGrandTest();
        }
    }, [isGrandTest, analyzing, context]);

    const startQuiz = () => {
        if (context) {
            const test = generateMockTest(context, config);
            setGeneratedQuiz(test.questions);
            setStep('quiz');
        } else {
            // Fallback to mock if no context
            setGeneratedQuiz(null);
            setStep('quiz');
        }
    };

    const startGrandTest = () => {
        if (context) {
            const test = generateMockTest(context, { mode: 'grand_test' });
            setGeneratedQuiz(test.questions);
            setStep('quiz');
        }
    };

    const handleExportTest = (format) => {
        if (generatedQuiz && generatedQuiz.length > 0) {
            exportTest(generatedQuiz, format, 'dmaverics_test');
        } else if (context) {
            // Generate test first, then export
            const test = generateMockTest(context, isGrandTest ? { mode: 'grand_test' } : config);
            exportTest(test.questions, format, 'dmaverics_test');
        }
    };

    if (step === 'config') return (
        <div className="h-full flex flex-col p-6 space-y-6">
            <div className="text-center py-6">
                <GraduationCap size={48} className="mx-auto text-gold-500 mb-4 opacity-80" />
                <h2 className="text-2xl font-cinzel font-bold text-white">Exam Simulator</h2>
                <p className="text-sm text-gray-500 mt-2">Generate a custom test based on this document.</p>
            </div>

            <div className="space-y-4 flex-1">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Question Count</label>
                    <input
                        type="number"
                        min="3"
                        max="20"
                        value={config.qCount}
                        onChange={(e) => setConfig({ ...config, qCount: parseInt(e.target.value) })}
                        className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white"
                    />
                </div>
            </div>

            <div className="flex gap-2">
                <button disabled={analyzing} onClick={startQuiz} className="flex-1 py-4 rounded-xl bg-gold-600 text-black font-bold flex items-center justify-center hover:bg-gold-500 transition-all shadow-lg shadow-gold-900/20 disabled:opacity-50 disabled:grayscale">
                    {analyzing ? <Loader className="animate-spin mr-2" /> : <Play size={18} className="mr-2" />}
                    {analyzing ? "Analyzing..." : "Begin"}
                </button>
                <button
                    onClick={() => handleExportTest('json')}
                    disabled={analyzing || !context}
                    className="px-4 py-4 rounded-xl bg-blue-600/20 text-blue-400 font-bold hover:bg-blue-600/30 transition-all border border-blue-500/30 disabled:opacity-50"
                    title="Export Test"
                >
                    Export
                </button>
            </div>
        </div>
    );

    if (step === 'quiz') return <MockQuiz questions={generatedQuiz} onComplete={(s) => { setScore(s); setStep('result'); }} />;

    if (step === 'result') return (
        <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className={`w-40 h-40 rounded-full border-4 flex items-center justify-center mb-8 relative ${score >= 70 ? 'border-green-500/50 text-green-400' : 'border-red-500/50 text-red-400'}`}>
                <span className="text-5xl font-bold font-cinzel">{score}%</span>
                <span className="absolute bottom-6 text-xs uppercase tracking-widest font-bold">{score >= 70 ? 'Passed' : 'Study More'}</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Assessment Complete</h2>
            <p className="text-gray-400 mb-8 max-w-xs text-sm">Review your notes and try again to improve your score.</p>
            <button onClick={() => setStep('config')} className="flex items-center px-8 py-3 bg-white/10 rounded-full hover:bg-white/20 transition-all border border-white/10">
                <RotateCcw size={16} className="mr-2" /> New Test
            </button>
        </div>
    );
}

function MockQuiz({ onComplete, questions: customQuestions }) {
    const [current, setCurrent] = useState(0);
    const [userAnswers, setUserAnswers] = useState([]);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);

    const defaultQuestions = [
        { q: "The concept of 'Rule of Law' implies that:", opts: ["The King is above the law", "Everyone is subject to the law", "Judges make the laws"], a: 1 },
        { q: "Which body approves the budget?", opts: ["The Executive", "The Legislature", "The Media"], a: 1 },
        { q: "Democracy literally means:", opts: ["Rule by the few", "Rule by the people", "Rule by wealth"], a: 1 },
    ];

    // Normalize custom questions to match format
    const activeQuestions = customQuestions && customQuestions.length > 0 ? customQuestions.map(q => {
        // Handle different question types
        if (q.type === 'mcq' && q.options) {
            return {
                q: q.question,
                opts: q.options,
                a: q.options.indexOf(q.correct) // Find index of correct answer
            };
        } else if (q.type === 'short_answer' || q.type === 'theory') {
            return {
                q: q.question,
                opts: ['(Open-ended question)', 'Provide your answer...', 'Refer to your notes'],
                a: 0,
                isOpenEnded: true
            };
        } else {
            // Fallback for any other format
            return {
                q: q.question || q.q,
                opts: q.options || q.opts || ['Option A', 'Option B', 'Option C'],
                a: q.correct !== undefined ? (typeof q.correct === 'number' ? q.correct : 0) : (q.a || 0)
            };
        }
    }) : defaultQuestions;

    const handleAnswer = (selectedIndex) => {
        if (showFeedback) return; // Prevent multiple selections

        setSelectedAnswer(selectedIndex);
        setShowFeedback(true);

        // Store answer
        const newAnswers = [...userAnswers];
        newAnswers[current] = {
            questionIndex: current,
            selected: selectedIndex,
            correct: activeQuestions[current].a,
            isCorrect: selectedIndex === activeQuestions[current].a
        };
        setUserAnswers(newAnswers);

        // Auto-advance after 1.5 seconds
        setTimeout(() => {
            if (current < activeQuestions.length - 1) {
                setCurrent(current + 1);
                setSelectedAnswer(null);
                setShowFeedback(false);
            } else {
                // Calculate final score
                const correctCount = newAnswers.filter(a => a.isCorrect).length;
                const scorePercent = Math.round((correctCount / activeQuestions.length) * 100);
                onComplete(scorePercent);
            }
        }, 1500);
    };

    return (
        <div className="h-full flex flex-col p-6">
            <div className="mb-8">
                <div className="flex justify-between items-end mb-4">
                    <span className="text-4xl font-cinzel font-bold text-white">0{current + 1}</span>
                    <span className="text-xs font-mono text-gray-500 mb-1">/ 0{activeQuestions.length}</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gold-500 transition-all duration-500" style={{ width: `${((current + 1) / activeQuestions.length) * 100}%` }}></div>
                </div>
            </div>

            <h3 className="text-lg font-medium leading-relaxed text-gray-200 mb-8 min-h-[80px]">
                {activeQuestions[current].q}
            </h3>

            <div className="space-y-3">
                {activeQuestions[current].opts.map((opt, i) => {
                    const isSelected = selectedAnswer === i;
                    const isCorrect = i === activeQuestions[current].a;
                    const showCorrect = showFeedback && isCorrect;
                    const showIncorrect = showFeedback && isSelected && !isCorrect;

                    return (
                        <button
                            key={i}
                            onClick={() => handleAnswer(i)}
                            disabled={showFeedback}
                            className={`w-full text-left p-4 rounded-xl border transition-all group
                                ${showCorrect ? 'bg-green-500/20 border-green-500 ring-2 ring-green-500/50' : ''}
                                ${showIncorrect ? 'bg-red-500/20 border-red-500 ring-2 ring-red-500/50' : ''}
                                ${!showFeedback ? 'bg-[#111] border-white/10 hover:border-gold-500/50 hover:bg-gold-500/5' : ''}
                            `}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center flex-1">
                                    <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs mr-3 transition-all
                                        ${showCorrect ? 'border-green-500 text-green-400 bg-green-500/20' : ''}
                                        ${showIncorrect ? 'border-red-500 text-red-400 bg-red-500/20' : ''}
                                        ${!showFeedback ? 'border-white/20 group-hover:border-gold-500 group-hover:text-gold-500' : ''}
                                    `}>
                                        {String.fromCharCode(65 + i)}
                                    </span>
                                    <span className={`text-sm transition-colors
                                        ${showCorrect ? 'text-green-300' : ''}
                                        ${showIncorrect ? 'text-red-300' : ''}
                                        ${!showFeedback ? 'text-gray-300 group-hover:text-white' : ''}
                                    `}>
                                        {opt}
                                    </span>
                                </div>
                                {showCorrect && <CheckCircle size={20} className="text-green-500" />}
                                {showIncorrect && <XCircle size={20} className="text-red-500" />}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default function StudyPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center bg-black text-white font-cinzel">Loading Environment...</div>}>
            <StudyContent />
        </Suspense>
    );
}
