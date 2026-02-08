import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const Landing = () => {
    const navigate = useNavigate();

    // State for latest activity - will be populated from API
    const [latestActivity, setLatestActivity] = useState([
        {
            id: 1,
            emoji: '🎧',
            bgColor: 'bg-blue-500/30',
            title: 'Sony WH-1000XM4',
            status: 'Found',
            statusColor: 'text-green-400',
            location: 'Library Block A',
            timestamp: new Date(Date.now() - 2 * 60 * 1000) // 2 minutes ago
        },
        {
            id: 2,
            emoji: '🎒',
            bgColor: 'bg-purple-500/30',
            title: 'Black Nike Backpack',
            status: 'Lost',
            statusColor: 'text-red-400',
            location: 'Canteen Area',
            timestamp: new Date(Date.now() - 15 * 60 * 1000) // 15 minutes ago
        },
        {
            id: 3,
            emoji: '🔑',
            bgColor: 'bg-yellow-500/30',
            title: 'Dorm Keys (Room 304)',
            status: 'Reunited',
            statusColor: 'text-green-400',
            location: null,
            timestamp: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
        }
    ]);

    // Helper function to format relative time
    const getRelativeTime = (timestamp) => {
        const now = new Date();
        const diff = Math.floor((now - new Date(timestamp)) / 1000); // difference in seconds

        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    // Fetch latest activity from backend API
    useEffect(() => {
        const fetchLatestActivity = async () => {
            try {
                const data = await api.getLatestActivity();
                setLatestActivity(data);
            } catch (error) {
                console.error('Error fetching latest activity:', error);
            }
        };

        fetchLatestActivity();

        // Set up polling for real-time updates every 30 seconds
        const interval = setInterval(fetchLatestActivity, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleGetStarted = () => {
        navigate('/login');
    };

    // Smooth scroll with navbar offset
    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            const navbarHeight = 100; // Height of fixed navbar
            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
            window.scrollTo({
                top: elementPosition - navbarHeight,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-radial from-gray-800 via-gray-900 to-[#0b0f1a] text-white overflow-x-hidden">
            {/* Animated Background Blurs - Covering entire page */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                {/* Hero area glows */}
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-40 right-0 w-80 h-80 bg-cyan-400/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-[30vh] left-1/2 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>

                {/* About section glow */}
                <div className="absolute top-[100vh] -left-20 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

                {/* Features section glows */}
                <div className="absolute top-[150vh] right-0 w-80 h-80 bg-purple-500/25 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute top-[180vh] left-1/4 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>

                {/* How It Works section glows */}
                <div className="absolute top-[250vh] -right-20 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-[280vh] left-0 w-72 h-72 bg-purple-400/25 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.8s' }}></div>

                {/* CTA and Footer glows */}
                <div className="absolute top-[350vh] left-1/2 -translate-x-1/2 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.2s' }}></div>
            </div>

            {/* Glassmorphism Navbar */}
            <header className="fixed top-0 left-0 right-0 z-50">
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent backdrop-blur-xl border-b border-white/10"></div>
                <nav className="relative mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-2xl glass-card glow-card flex items-center justify-center text-xl font-bold shadow-lg shadow-purple-500/20">
                                LF
                            </div>
                            <div className="pulse-ring"></div>
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold">GLA University</h1>
                            <p className="text-xs text-white/60">Lost & Found Portal</p>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-6">
                        <button onClick={() => scrollToSection('about')} className="text-sm font-medium text-white/80 hover:text-cyan-300 transition-colors duration-200 relative group">
                            About
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-300 group-hover:w-full transition-all duration-300"></span>
                        </button>
                        <button onClick={() => scrollToSection('features')} className="text-sm font-medium text-white/80 hover:text-cyan-300 transition-colors duration-200 relative group">
                            Features
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-300 group-hover:w-full transition-all duration-300"></span>
                        </button>
                        <button onClick={() => scrollToSection('how-it-works')} className="text-sm font-medium text-white/80 hover:text-cyan-300 transition-colors duration-200 relative group">
                            How It Works
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-300 group-hover:w-full transition-all duration-300"></span>
                        </button>
                        <button
                            onClick={handleGetStarted}
                            className="px-5 py-2.5 rounded-full glass-card glow-card font-medium text-sm hover:scale-105 transition-transform duration-200 border border-white/20 hover:border-cyan-300/50"
                        >
                            Get Started
                        </button>
                    </div>
                    <button className="md:hidden px-4 py-2 rounded-full glass-card border border-white/20 hover:border-white/40 transition">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </nav>
            </header>

            <main className="relative z-10">
                {/* Hero Section */}
                <section className="mx-auto max-w-7xl px-6 min-h-screen flex items-center grid lg:grid-cols-2 gap-12">
                    <div className="space-y-6 animate-fade-in">
                        <p className="uppercase tracking-[0.4em] text-xs text-white/60">Lost & Found • GLA University</p>
                        <h2 className="text-4xl md:text-6xl font-bold leading-tight">
                            Reuniting <span className="gradient-text">students</span> with what they lost,
                            faster than ever.
                        </h2>
                        <p className="text-white/70 text-lg">
                            A unified campus system where students report lost items, upload found belongings, and faculty
                            coordinate verified returns — all in one secure, transparent dashboard.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={handleGetStarted}
                                className="shine-button glass-card glow-card px-6 py-3 rounded-full font-semibold transition hover:scale-105"
                            >
                                Start Now
                            </button>
                            <button onClick={() => scrollToSection('features')} className="px-6 py-3 rounded-full border border-white/30 hover:border-cyan-300 hover:text-cyan-200 transition">
                                Explore Features
                            </button>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-white/60">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                Verified faculty moderation
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                                Real-time status updates
                            </div>
                        </div>
                    </div>

                    {/* Hero Visual - Latest Activity */}
                    <div className="relative hidden lg:block animate-fade-in">
                        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-cyan-500/20 rounded-full blur-3xl"></div>
                        <div className="glass-card rounded-3xl p-7 relative transform rotate-[-2deg] hover:rotate-0 transition-all duration-500">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-3.5 h-3.5 rounded-full bg-red-400"></div>
                                    <div className="w-3.5 h-3.5 rounded-full bg-yellow-400"></div>
                                    <div className="w-3.5 h-3.5 rounded-full bg-green-400"></div>
                                </div>
                                <div className="text-xs text-white/40 font-medium">Latest Activity</div>
                            </div>
                            <div className="space-y-4">
                                {latestActivity.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center gap-4 p-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition cursor-pointer"
                                    >
                                        <div className={`w-12 h-12 rounded-xl ${item.bgColor} flex items-center justify-center text-xl`}>
                                            {item.emoji}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-sm">{item.title}</div>
                                            <div className={`text-xs ${item.statusColor} mt-0.5`}>
                                                {item.status}
                                                {item.location && ` • ${item.location}`}
                                            </div>
                                        </div>
                                        <div className="text-xs text-white/40">{getRelativeTime(item.timestamp)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* About Section */}
                <section id="about" className="mx-auto max-w-7xl px-6 py-16">
                    <div className="glass-card rounded-3xl p-10 grid md:grid-cols-2 gap-10" style={{ background: 'rgba(255, 255, 255, 0.08)' }}>
                        <div className="space-y-4">
                            <h3 className="text-3xl font-bold gradient-text">Our Motive</h3>
                            <p className="text-white/70">
                                Lost & Found is a campus-first initiative for GLA University. We help students report lost
                                belongings and instantly share found items. Faculty members oversee the verification process
                                to ensure each return is authentic and transparent.
                            </p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="glass-card shine-button p-4 rounded-2xl">Smart reporting workflows</div>
                                <div className="glass-card shine-button p-4 rounded-2xl">Automated notifications</div>
                                <div className="glass-card shine-button p-4 rounded-2xl">Secure identity checks</div>
                                <div className="glass-card shine-button p-4 rounded-2xl">Campus-wide awareness</div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="glass-card shine-button p-6 rounded-2xl hover:scale-105 transition">
                                <h4 className="font-semibold">Students</h4>
                                <p className="text-white/60 text-sm">Search items, report losses, or upload found belongings with photos and details.</p>
                            </div>
                            <div className="glass-card shine-button p-6 rounded-2xl hover:scale-105 transition">
                                <h4 className="font-semibold">Faculty</h4>
                                <p className="text-white/60 text-sm">Validate ownership, manage submissions, and publish campus alerts.</p>
                            </div>
                            <div className="glass-card shine-button p-6 rounded-2xl hover:scale-105 transition">
                                <h4 className="font-semibold">Dashboard</h4>
                                <p className="text-white/60 text-sm">Real-time tracking of every item and status updates for everyone.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="mx-auto max-w-7xl px-6 py-20">
                    <div className="text-center mb-12">
                        <p className="text-cyan-300 text-sm font-semibold uppercase tracking-widest mb-3">Core Features</p>
                        <h3 className="text-4xl font-bold mb-4">What you can do</h3>
                        <p className="text-white/60 max-w-2xl mx-auto">Everything you need to report, find, and reclaim your belongings on campus</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="glass-card rounded-3xl p-8 shine-button hover:-translate-y-3 transition-all duration-300 group">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h4 className="text-xl font-bold mb-3">Search Lost Items</h4>
                            <p className="text-white/60 leading-relaxed">Filter by location, date, category, and status to recover your belongings faster than ever.</p>
                            <div className="mt-6 flex items-center gap-2 text-cyan-300 text-sm font-medium group-hover:gap-3 transition-all">
                                <span>Explore Search</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="glass-card rounded-3xl p-8 shine-button hover:-translate-y-3 transition-all duration-300 group">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h4 className="text-xl font-bold mb-3">Report Lost Items</h4>
                            <p className="text-white/60 leading-relaxed">Submit detailed descriptions and photos to notify the entire campus community instantly.</p>
                            <div className="mt-6 flex items-center gap-2 text-purple-300 text-sm font-medium group-hover:gap-3 transition-all">
                                <span>Report Now</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </div>
                        </div>

                        {/* Feature 3 */}
                        <div className="glass-card rounded-3xl p-8 shine-button hover:-translate-y-3 transition-all duration-300 group">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/30 to-emerald-500/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                            </div>
                            <h4 className="text-xl font-bold mb-3">Upload Found Items</h4>
                            <p className="text-white/60 leading-relaxed">Found something? Upload it with photos so the rightful owner can easily reclaim it.</p>
                            <div className="mt-6 flex items-center gap-2 text-green-300 text-sm font-medium group-hover:gap-3 transition-all">
                                <span>Upload Item</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-20">
                    <div className="text-center mb-12">
                        <p className="text-purple-300 text-sm font-semibold uppercase tracking-widest mb-3">Simple Process</p>
                        <h3 className="text-4xl font-bold mb-4">How It Works</h3>
                        <p className="text-white/60 max-w-2xl mx-auto">Four easy steps to reunite with your belongings</p>
                    </div>
                    <div className="grid md:grid-cols-4 gap-8">
                        {/* Step 1 */}
                        <div className="glass-card shine-button p-8 rounded-3xl text-center hover:-translate-y-2 transition-all duration-300 group">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center text-3xl font-bold mx-auto mb-6 group-hover:scale-110 transition-transform">
                                <span className="text-cyan-300">1</span>
                            </div>
                            <h4 className="text-xl font-bold text-white mb-3">Register</h4>
                            <p className="text-white/60 leading-relaxed">Sign up with your university ID and verify your identity via OTP.</p>
                        </div>

                        {/* Step 2 */}
                        <div className="glass-card shine-button p-8 rounded-3xl text-center hover:-translate-y-2 transition-all duration-300 group">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center text-3xl font-bold mx-auto mb-6 group-hover:scale-110 transition-transform">
                                <span className="text-purple-300">2</span>
                            </div>
                            <h4 className="text-xl font-bold text-white mb-3">Report</h4>
                            <p className="text-white/60 leading-relaxed">Lost something? Report it with detailed descriptions and photos.</p>
                        </div>

                        {/* Step 3 */}
                        <div className="glass-card shine-button p-8 rounded-3xl text-center hover:-translate-y-2 transition-all duration-300 group">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500/30 to-orange-500/30 flex items-center justify-center text-3xl font-bold mx-auto mb-6 group-hover:scale-110 transition-transform">
                                <span className="text-pink-300">3</span>
                            </div>
                            <h4 className="text-xl font-bold text-white mb-3">Match</h4>
                            <p className="text-white/60 leading-relaxed">Found items are matched with reports and verified by faculty.</p>
                        </div>

                        {/* Step 4 */}
                        <div className="glass-card shine-button p-8 rounded-3xl text-center hover:-translate-y-2 transition-all duration-300 group">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500/30 to-emerald-500/30 flex items-center justify-center text-3xl font-bold mx-auto mb-6 group-hover:scale-110 transition-transform">
                                <span className="text-green-300">4</span>
                            </div>
                            <h4 className="text-xl font-bold text-white mb-3">Reunite</h4>
                            <p className="text-white/60 leading-relaxed">Collect your item from the designated campus location.</p>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="mx-auto max-w-7xl px-6 py-16">
                    <div className="glass-card rounded-3xl p-12 text-center space-y-6">
                        <h3 className="text-3xl md:text-4xl font-bold">Ready to get started?</h3>
                        <p className="text-white/70 text-lg max-w-2xl mx-auto">
                            Join hundreds of students and faculty using our platform to reunite lost items with their owners.
                        </p>
                        <button
                            onClick={handleGetStarted}
                            className="shine-button glass-card glow-card px-8 py-4 rounded-full font-semibold text-lg transition hover:scale-105"
                        >
                            Access Portal
                        </button>
                    </div>
                </section>
            </main>

            {/* Footer Section */}
            <footer className="relative z-10 mt-8">
                <div className="mx-auto max-w-7xl px-6 py-12">
                    <div className="glass-card rounded-3xl p-10">
                        <div className="grid md:grid-cols-4 gap-8">
                            {/* About */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl glass-card flex items-center justify-center text-sm font-bold">
                                        LF
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-white">GLA Lost & Found</h4>
                                        <p className="text-xs text-white/50">Campus Portal</p>
                                    </div>
                                </div>
                                <p className="text-sm text-white/60">
                                    Helping GLA University students and faculty reunite with their lost belongings.
                                </p>
                            </div>

                            {/* Quick Links */}
                            <div className="space-y-4">
                                <h4 className="font-semibold text-white">Quick Links</h4>
                                <ul className="space-y-2 text-sm text-white/60">
                                    <li><a href="#about" className="hover:text-cyan-300 transition">About Us</a></li>
                                    <li><a href="#features" className="hover:text-cyan-300 transition">Features</a></li>
                                    <li><a href="#how-it-works" className="hover:text-cyan-300 transition">How It Works</a></li>
                                    <li><button onClick={handleGetStarted} className="hover:text-cyan-300 transition">Get Started</button></li>
                                </ul>
                            </div>

                            {/* Legal */}
                            <div className="space-y-4">
                                <h4 className="font-semibold text-white">Legal</h4>
                                <ul className="space-y-2 text-sm text-white/60">
                                    <li><a href="#" className="hover:text-cyan-300 transition">Terms of Service</a></li>
                                    <li><a href="#" className="hover:text-cyan-300 transition">Privacy Policy</a></li>
                                    <li><a href="#" className="hover:text-cyan-300 transition">Cookie Policy</a></li>
                                    <li><a href="#" className="hover:text-cyan-300 transition">Disclaimer</a></li>
                                </ul>
                            </div>

                            {/* Creators */}
                            <div className="space-y-4">
                                <h4 className="font-semibold text-white">Created By</h4>
                                <div className="space-y-3 text-sm text-white/60">
                                    <p>Built with ❤️ by GLA Students</p>
                                    <p className="text-xs">Department of Computer Science</p>
                                    <div className="flex gap-3 pt-2">
                                        <a href="#" className="w-8 h-8 rounded-full glass-card flex items-center justify-center hover:scale-110 transition" title="GitHub">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
                                        </a>
                                        <a href="#" className="w-8 h-8 rounded-full glass-card flex items-center justify-center hover:scale-110 transition" title="LinkedIn">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                                        </a>
                                        <a href="mailto:contact@gla.ac.in" className="w-8 h-8 rounded-full glass-card flex items-center justify-center hover:scale-110 transition" title="Email">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Copyright Bar */}
                        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/50">
                            <p>© 2024 GLA University Lost & Found. All rights reserved.</p>
                            <p>Made with React, Firebase & Tailwind CSS</p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
