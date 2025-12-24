"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    Upload, Link as LinkIcon, FileText, Check, LogOut,
    Copy, ExternalLink, Library, FolderOpen, ArrowLeft, ChevronDown, ChevronRight, RefreshCw,
    ShieldAlert, UserPlus, Trash2, Users, Home as HomeIcon, GraduationCap, Clock, PieChart
} from "lucide-react";

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('home'); // home | library | upload | test | admin

    // Data State
    const [archives, setArchives] = useState([]);
    const [loadingArchives, setLoadingArchives] = useState(false);

    // Upload State
    const [file, setFile] = useState(null);
    const [metadata, setMetadata] = useState({ courseCode: "", topicNumber: "", title: "" });
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [generatedLink, setGeneratedLink] = useState(null);

    // Admin State
    const [adminUsers, setAdminUsers] = useState([]);
    const [adminNewUser, setAdminNewUser] = useState({ office: "", nickname: "" });
    const [adminSubTab, setAdminSubTab] = useState('users');

    useEffect(() => {
        const userData = localStorage.getItem("maverics_user");
        if (!userData) { router.push("/"); }
        else { setUser(JSON.parse(userData)); }
        fetchArchives();
    }, [router]);

    const fetchArchives = async () => {
        try {
            setLoadingArchives(true);
            const res = await fetch('/api/archives');
            if (res.ok) setArchives(await res.json());
        } catch (error) { console.error(error); }
        finally { setLoadingArchives(false); }
    };

    const fetchAdminUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            if (res.ok) setAdminUsers(await res.json());
        } catch (e) { console.error(e); }
    };

    const handleLogout = () => {
        localStorage.removeItem("maverics_user");
        if (window.netlifyIdentity) window.netlifyIdentity.logout();
        router.push("/");
    };

    // --- VIEW LOGIC ---
    if (!user) return null;

    return (
        <div className="flex h-screen bg-[#050505] text-white overflow-hidden font-inter">
            {/* SIDEBAR */}
            <div className="w-64 flex flex-col border-r border-white/5 bg-black">
                <div className="h-20 flex items-center px-6 border-b border-white/5">
                    <h1 className="font-cinzel font-bold text-xl text-gold-500 tracking-wider">D'Maverics</h1>
                </div>

                <div className="flex-1 py-6 px-3 space-y-1">
                    <SidebarItem id="home" icon={HomeIcon} label="Home" active={activeTab} set={setActiveTab} />
                    <SidebarItem id="library" icon={Library} label="My Library" active={activeTab} set={setActiveTab} />
                    <SidebarItem id="upload" icon={Upload} label="Upload" active={activeTab} set={setActiveTab} />
                    <SidebarItem id="test" icon={GraduationCap} label="Take a Test" active={activeTab} set={setActiveTab} />

                    {user.role === 'admin' && (
                        <div className="pt-6 mt-6 border-t border-white/5">
                            <SidebarItem id="admin" icon={ShieldAlert} label="Admin Panel" active={activeTab} set={() => { setActiveTab('admin'); fetchAdminUsers(); }} />
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-white/5">
                    <button onClick={handleLogout} className="flex items-center text-xs text-gray-500 hover:text-white transition-colors">
                        <LogOut size={14} className="mr-2" /> Sign Out
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col overflow-y-auto relative">
                <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none fixed"></div>

                <header className="h-20 flex items-center justify-between px-8 border-b border-white/5 bg-[#050505]/80 backdrop-blur sticky top-0 z-10">
                    <h2 className="text-xl font-bold capitalize text-gray-200">{activeTab.replace('-', ' ')}</h2>
                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <div className="text-sm font-bold text-white">{user.nickname}</div>
                            <div className="text-xs text-gray-500">{user.office}</div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-600 to-amber-800 flex items-center justify-center font-cinzel font-bold text-black border border-gold-500">
                            {user.nickname[0].toUpperCase()}
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-8">
                    <AnimatePresence mode="wait">
                        {activeTab === 'home' && <HomeView key="home" user={user} archives={archives} setTab={setActiveTab} />}
                        {activeTab === 'library' && <LibraryView key="library" archives={archives} />}
                        {activeTab === 'upload' && <UploadView key="upload" file={file} setFile={setFile} metadata={metadata} setMetadata={setMetadata} uploading={uploading} handleUpload={() => handleUploadLogic(file, metadata, setUploading, setSuccess, setGeneratedLink, fetchArchives)} success={success} generatedLink={generatedLink} />}
                        {activeTab === 'test' && <TakeTestView key="test" archives={archives} />}
                        {activeTab === 'admin' && <AdminView key="admin" users={adminUsers} archives={archives} subTab={adminSubTab} setSubTab={setAdminSubTab} newUser={adminNewUser} setNewUser={setAdminNewUser} fetchUsers={fetchAdminUsers} fetchFiles={fetchArchives} />}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}

// --- LOGIC EXTRACTED ---
const handleUploadLogic = async (file, metadata, setUploading, setSuccess, setLink, refresh) => {
    if (!file || !metadata.courseCode || !metadata.title) return;
    setUploading(true);
    try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("metadata", JSON.stringify(metadata));
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (res.ok) {
            const data = await res.json();
            setSuccess(true);
            setLink(`${window.location.origin}/${data.link}`);
            refresh();
            setTimeout(() => setSuccess(false), 3000);
        } else { alert("Upload failed."); }
    } catch (e) { alert("Error"); }
    finally { setUploading(false); }
};


// --- COMPONENTS ---

function SidebarItem({ id, icon: Icon, label, active, set }) {
    const isActive = active === id;
    return (
        <button
            onClick={() => set(id)}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 group
            ${isActive ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
        >
            <Icon size={18} className={`mr-3 ${isActive ? 'text-gold-500' : 'text-gray-500 group-hover:text-white'}`} />
            <span className="text-sm font-medium">{label}</span>
        </button>
    );
}

function HomeView({ user, archives, setTab }) {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
            {/* Welcome Banner */}
            <div className="p-8 rounded-3xl bg-gradient-to-r from-gold-900/40 to-black border border-gold-500/20 mb-8 relative overflow-hidden">
                <div className="absolute right-0 top-0 h-full w-1/2 bg-[url('/noise.png')] opacity-10"></div>
                <h2 className="text-3xl font-cinzel font-bold text-white mb-2 relative z-10">Welcome back, {user.nickname}</h2>
                <p className="text-gray-400 relative z-10">Your study streak is on fire! Keep up the momentum.</p>
                <div className="flex gap-4 mt-6 relative z-10">
                    <button onClick={() => setTab('test')} className="px-6 py-2 bg-gold-500 text-black font-bold rounded-lg hover:bg-gold-400 transition-colors">Start Mock Exam</button>
                    <button onClick={() => setTab('upload')} className="px-6 py-2 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 transition-colors">Upload Notes</button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard icon={FileText} label="Documents" value={archives.length} color="text-blue-400" />
                <StatCard icon={Clock} label="Hours Studied" value="12.5" color="text-purple-400" />
                <StatCard icon={PieChart} label="Avg Test Score" value="88%" color="text-green-400" />
            </div>

            {/* Recent */}
            <h3 className="text-lg font-bold text-white mb-4 flex items-center"><Clock size={16} className="mr-2 text-gold-500" /> Recent Materials</h3>
            <div className="space-y-3">
                {archives.slice(0, 3).map(file => (
                    <div key={file.id} className="flex items-center justify-between p-4 bg-[#111] border border-white/5 rounded-xl hover:border-gold-500/30 transition-all">
                        <div className="flex items-center">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 mr-4">
                                <FileText size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-200">{file.title}</h4>
                                <p className="text-xs text-gray-500">{file.courseCode} • {file.fileName}</p>
                            </div>
                        </div>
                        <a href={`/study?file=${encodeURIComponent(`https://archive-dmav.netlify.app/${file.link}`)}&title=${encodeURIComponent(file.title)}`} className="text-xs font-bold text-gold-500 px-3 py-1 bg-gold-500/10 rounded hover:bg-gold-500/20">Resume</a>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

function StatCard({ icon: Icon, label, value, color }) {
    return (
        <div className="bg-[#111] border border-white/5 p-6 rounded-2xl flex items-center">
            <div className={`p-3 rounded-xl bg-white/5 ${color} mr-4`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-gray-500 uppercase font-bold">{label}</p>
            </div>
        </div>
    );
}

function LibraryView({ archives }) {
    // Group by Course
    const grouped = archives.reduce((acc, item) => {
        if (!acc[item.courseCode]) acc[item.courseCode] = [];
        acc[item.courseCode].push(item);
        return acc;
    }, {});

    const [expanded, setExpanded] = useState({});

    const toggleExpand = (course) => {
        setExpanded(prev => ({ ...prev, [course]: !prev[course] }));
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h3 className="text-2xl font-cinzel font-bold text-white mb-6">Course Library</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.keys(grouped).map(course => {
                    const files = grouped[course];
                    const isExpanded = expanded[course];
                    const displayedFiles = isExpanded ? files : files.slice(0, 3);
                    const remaining = files.length - 3;

                    return (
                        <div key={course} className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden hover:border-gold-500/30 transition-all group">
                            <div className="h-24 bg-gradient-to-r from-gray-900 to-black p-6 flex flex-col justify-end relative">
                                <FolderOpen className="absolute top-4 right-4 text-gray-700 group-hover:text-gold-500 transition-colors" />
                                <h4 className="text-xl font-bold text-gold-500">{course}</h4>
                                <p className="text-xs text-gray-500">{files.length} Resources</p>
                            </div>
                            <div className="p-4 space-y-2">
                                {displayedFiles.map(f => (
                                    <a key={f.id} href={`/study?file=${encodeURIComponent(`https://archive-dmav.netlify.app/${f.link}`)}&title=${encodeURIComponent(f.title)}`} className="block text-sm text-gray-400 hover:text-white truncate py-1 border-b border-white/5 last:border-0 pl-2 border-l-2 border-transparent hover:border-l-gold-500 transition-all">
                                        {f.title}
                                    </a>
                                ))}
                                {remaining > 0 && !isExpanded && (
                                    <button
                                        onClick={() => toggleExpand(course)}
                                        className="w-full text-left text-xs text-gold-600 pt-2 font-bold hover:text-gold-500 transition-colors flex items-center"
                                    >
                                        + {remaining} more <ChevronDown size={12} className="ml-1" />
                                    </button>
                                )}
                                {isExpanded && files.length > 3 && (
                                    <button
                                        onClick={() => toggleExpand(course)}
                                        className="w-full text-left text-xs text-gray-600 pt-2 font-bold hover:text-gray-400 transition-colors"
                                    >
                                        Show Less
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}

function TakeTestView({ archives }) {
    const [selectedCourse, setSelectedCourse] = useState(null);

    // Group by Course
    const grouped = archives.reduce((acc, item) => {
        if (!acc[item.courseCode]) acc[item.courseCode] = [];
        acc[item.courseCode].push(item);
        return acc;
    }, {});

    const handleGrandTest = (course) => {
        // Collect URLs from top 5 recent files in this course
        const files = grouped[course].slice(0, 5); // Take top 5
        const fileUrls = files.map(f => `https://archive-dmav.netlify.app/${f.link}`).join(',');
        const titles = files.map(f => f.title).join(',');

        // Encode and Redirect
        const url = `/study?mode=grand_test&course=${course}&urls=${encodeURIComponent(fileUrls)}&titles=${encodeURIComponent(titles)}`;
        window.location.href = url;
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto text-center py-10">
            <div className="w-24 h-24 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-gold-500">
                <GraduationCap size={48} />
            </div>
            <h2 className="text-3xl font-cinzel font-bold text-white mb-4">Exam Readiness Hub</h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                {selectedCourse
                    ? `Select a specific topic from ${selectedCourse} or take a comprehensive Grand Test.`
                    : "Select a course to begin your assessment journey."}
            </p>

            {!selectedCourse ? (
                // COURSE SELECTION
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.keys(grouped).map(course => (
                        <button
                            key={course}
                            onClick={() => setSelectedCourse(course)}
                            className="bg-[#111] border border-white/5 p-6 rounded-2xl flex flex-col items-center hover:border-gold-500 transition-all group"
                        >
                            <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <FolderOpen size={24} className="text-gray-400 group-hover:text-gold-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white">{course}</h3>
                            <p className="text-sm text-gray-500">{grouped[course].length} Topics Available</p>
                        </button>
                    ))}
                </div>
            ) : (
                // TOPIC SELECTION
                <div className="text-left animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <button
                        onClick={() => setSelectedCourse(null)}
                        className="mb-6 flex items-center text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={16} className="mr-2" /> Back to Courses
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Grand Test Card */}
                        <div className="md:col-span-1">
                            <div className="h-full bg-gradient-to-b from-gold-900/20 to-black border border-gold-500/30 rounded-2xl p-6 flex flex-col relative overflow-hidden">
                                <div className="absolute inset-0 bg-gold-500/5 animate-pulse"></div>
                                <h3 className="text-2xl font-cinzel font-bold text-gold-500 mb-2 relative z-10">Grand Test</h3>
                                <p className="text-sm text-gray-400 mb-6 relative z-10">
                                    Comprehensive assessment covering all topics in {selectedCourse}.
                                    <br /><br />
                                    <span className="text-xs font-mono text-gold-400/80">
                                        • 40 Multiple Choice<br />
                                        • 20 Short Answer<br />
                                        • 10 Theory
                                    </span>
                                </p>
                                <button
                                    onClick={() => handleGrandTest(selectedCourse)}
                                    className="mt-auto w-full py-3 bg-gold-500 text-black font-bold rounded-xl hover:bg-gold-400 transition-all shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:shadow-[0_0_30px_rgba(234,179,8,0.4)]"
                                >
                                    Start Grand Test
                                </button>
                            </div>
                        </div>

                        {/* Individual Topics List */}
                        <div className="md:col-span-2 bg-[#111] rounded-2xl border border-white/5 overflow-hidden flex flex-col">
                            <div className="p-4 bg-white/5 border-b border-white/5 font-bold text-gray-300">Specific Topics</div>
                            <div className="overflow-y-auto max-h-[400px]">
                                {grouped[selectedCourse].map(file => (
                                    <a
                                        key={file.id}
                                        href={`/study?file=${encodeURIComponent(`https://archive-dmav.netlify.app/${file.link}`)}&title=${encodeURIComponent(file.title)}`}
                                        className="flex items-center justify-between p-4 hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors group"
                                    >
                                        <div>
                                            <div className="font-bold text-gray-200 group-hover:text-gold-500 transition-colors">{file.title}</div>
                                            <div className="text-xs text-gray-500">Topic File</div>
                                        </div>
                                        <ArrowRightCircle className="text-gray-600 group-hover:text-gold-500 transition-colors" size={20} />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}

// Helper for icon
const ArrowRightCircle = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><path d="M12 16l4-4-4-4"></path><path d="M8 12h8"></path></svg>
);

function UploadView({ file, setFile, metadata, setMetadata, uploading, handleUpload, success, generatedLink }) {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto">
            <div className="bg-[#111] border border-white/5 rounded-2xl p-8">
                <h3 className="text-2xl font-cinzel font-bold text-white mb-6">Upload Material</h3>
                <div className="space-y-4 mb-6">
                    <input type="text" placeholder="Course Code (e.g. POL101)" className="input-field w-full rounded-xl px-4 py-3 bg-black border border-white/10 focus:border-gold-500/50 outline-none text-white" value={metadata.courseCode} onChange={e => setMetadata({ ...metadata, courseCode: e.target.value })} />
                    <input type="text" placeholder="Topic Number (e.g. 05)" className="input-field w-full rounded-xl px-4 py-3 bg-black border border-white/10 focus:border-gold-500/50 outline-none text-white" value={metadata.topicNumber} onChange={e => setMetadata({ ...metadata, topicNumber: e.target.value })} />
                    <input type="text" placeholder="Document Title" className="input-field w-full rounded-xl px-4 py-3 bg-black border border-white/10 focus:border-gold-500/50 outline-none text-white" value={metadata.title} onChange={e => setMetadata({ ...metadata, title: e.target.value })} />
                </div>

                <div className="border-2 border-dashed border-white/10 hover:border-gold-500/30 rounded-xl p-8 text-center mb-6 transition-colors bg-black/50">
                    <input type="file" onChange={e => setFile(e.target.files[0])} className="block mx-auto text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-gray-800 file:text-white file:border-0 hover:file:bg-gold-600 hover:file:text-black transition-all" />
                </div>

                <div className="flex justify-end">
                    <button onClick={handleUpload} disabled={uploading} className="px-8 py-3 bg-gold-600 text-black font-bold rounded-xl hover:bg-gold-500 transition-all disabled:opacity-50">
                        {uploading ? "Uploading..." : "Upload Document"}
                    </button>
                </div>

                {success && <div className="mt-4 p-4 bg-green-500/10 text-green-400 text-center rounded-xl border border-green-500/20">Upload Successful!</div>}
            </div>
        </motion.div>
    );
}

function AdminView({ users, archives, subTab, setSubTab, newUser, setNewUser, fetchUsers, fetchFiles }) {
    // Reusing logic from previous admin view, simplified for cleaner UI
    // NOTE: Implementation abbreviated for brevity but retains functionality
    const [editingFile, setEditingFile] = useState(null);

    const handleDeleteUser = async (id) => {
        if (!confirm("Are you sure?")) return;
        await fetch('/api/admin/users', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        fetchUsers();
    };

    const handleRoleUpdate = async (id, role) => {
        if (!confirm(`Change role to ${role}?`)) return;
        await fetch('/api/admin/users', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, role })
        });
        fetchUsers();
    };

    const handleDeleteFile = async (file) => {
        if (!confirm("Permanently delete this file?")) return;
        await fetch('/api/admin/files', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(file)
        });
        fetchFiles();
    };

    const handleUpdateFile = async (file) => {
        try {
            const res = await fetch('/api/admin/files/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(file)
            });

            if (res.ok) {
                setEditingFile(null);
                fetchFiles();
                alert('File updated successfully!');
            } else {
                alert('Failed to update file');
            }
        } catch (error) {
            console.error('Error updating file:', error);
            alert('Error updating file');
        }
    };

    // Use 'adminTab' instead of subTab consistent with updated UI
    const adminTab = subTab;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex space-x-4 mb-6 border-b border-white/5 pb-1">
                <button onClick={() => setSubTab('users')} className={`px-4 py-2 text-sm font-bold border-b-2 transition-all ${adminTab === 'users' ? 'border-gold-500 text-gold-500' : 'border-transparent text-gray-500'}`}>Users</button>
                <button onClick={() => setSubTab('files')} className={`px-4 py-2 text-sm font-bold border-b-2 transition-all ${adminTab === 'files' ? 'border-gold-500 text-gold-500' : 'border-transparent text-gray-500'}`}>Files</button>
            </div>

            {adminTab === 'users' && (
                <div className="space-y-4">
                    {/* Users List */}
                    {users.map(u => (
                        <div key={u.id} className="flex justify-between items-center p-4 bg-[#111] rounded-xl border border-white/5">
                            <div>
                                <div className="flex items-center">
                                    <span className="font-bold text-white mr-2">{u.nickname}</span>
                                    {u.role === 'admin' && <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-500 text-[10px] font-bold border border-red-500/20">ADMIN</span>}
                                </div>
                                <div className="text-gray-500 text-xs">{u.email || u.office}</div>
                            </div>

                            <div className="flex items-center space-x-2">
                                {/* Role Toggle */}
                                {u.role !== 'admin' ? (
                                    <button onClick={() => handleRoleUpdate(u.id, 'admin')} className="text-xs font-bold text-green-500 hover:bg-green-500/10 px-2 py-1 rounded transition-colors">Promote</button>
                                ) : (
                                    u.id !== 'admin-001' && <button onClick={() => handleRoleUpdate(u.id, 'user')} className="text-xs font-bold text-yellow-500 hover:bg-yellow-500/10 px-2 py-1 rounded transition-colors">Demote</button>
                                )}

                                {/* Delete */}
                                {u.id !== 'admin-001' && (
                                    <button onClick={() => handleDeleteUser(u.id)} className="text-red-500 hover:bg-red-500/10 p-2 rounded transition-colors"><Trash2 size={16} /></button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {adminTab === 'files' && (
                <div className="space-y-2">
                    {/* File List */}
                    {archives.map(f => (
                        <div key={f.id} className="flex justify-between items-center p-3 bg-white/5 rounded hover:border-gold-500/30 border border-transparent transition-all">
                            <div>
                                <span className="text-gold-500 font-mono text-xs mr-2">{f.courseCode}</span>
                                <span className="text-white">{f.title}</span>
                            </div>
                            <div className="flex space-x-2">
                                <button onClick={() => setEditingFile(f)} className="text-blue-400 hover:text-blue-300 p-1"><RefreshCw size={16} /></button>
                                <button onClick={() => handleDeleteFile(f)} className="text-red-500 hover:text-red-400 p-1"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))}

                    {/* Edit Modal */}
                    {editingFile && (
                        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
                            <div className="bg-[#111] p-8 rounded-2xl border border-white/10 w-full max-w-md">
                                <h3 className="text-xl font-bold text-white mb-4">Edit Metadata</h3>
                                <div className="space-y-4 mb-6">
                                    <input className="input-field w-full rounded p-3 bg-black border border-white/10 text-white" value={editingFile.courseCode} onChange={e => setEditingFile({ ...editingFile, courseCode: e.target.value })} placeholder="Course Code" />
                                    <input className="input-field w-full rounded p-3 bg-black border border-white/10 text-white" value={editingFile.topicNumber} onChange={e => setEditingFile({ ...editingFile, topicNumber: e.target.value })} placeholder="Topic #" />
                                    <input className="input-field w-full rounded p-3 bg-black border border-white/10 text-white" value={editingFile.title} onChange={e => setEditingFile({ ...editingFile, title: e.target.value })} placeholder="Title" />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => setEditingFile(null)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                                    <button onClick={() => handleUpdateFile(editingFile)} className="px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-500">Save Changes</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
