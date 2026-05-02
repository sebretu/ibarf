import React from 'react';
import { motion } from 'framer-motion';
import {
    ArrowRight, ShieldCheck, Zap, Heart, Sparkles,
    Cpu, Globe, Terminal, Layers, ShoppingCart,
    CheckCircle, List, ArrowRightCircle, Utensils, Leaf
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { landingContent } from './landingContent';
import GuestCalculator from '../../components/GuestCalculator';

const LandingGlass = () => {
    const { hero, philosophy, benefits, cta } = landingContent;

    return (
        <div className="bg-[#050505] text-white overflow-hidden selection:bg-green-500/30">
            {/* Background Gradients */}
            <div className="fixed inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-green-500/10 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-barf-gold/5 blur-[150px] rounded-full" />
            </div>

            {/* 1. Hero Section */}
            <section className="relative min-h-screen flex flex-col items-center justify-center px-6 z-10 pt-20">
                {/* Visual Anchor */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                    <div className="w-[800px] h-[800px] border border-white/[0.03] rounded-full animate-[spin_60s_linear_infinite]" />
                    <div className="absolute w-[600px] h-[600px] border border-white/[0.05] rounded-full animate-[spin_40s_linear_infinite_reverse]" />
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative bg-white/[0.03] backdrop-blur-[60px] border border-white/[0.08] p-8 md:p-24 rounded-[4rem] text-center max-w-5xl shadow-[0_40px_100px_rgba(0,0,0,0.5)]"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full mb-10">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-green-400">System V.2.0 Active</span>
                    </div>

                    <h1 className="text-3xl md:text-8xl font-black tracking-tighter uppercase leading-[0.9] mb-12">
                        {hero.title1} <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]">{hero.title2}</span>
                    </h1>

                    <p className="text-white/40 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-16 leading-relaxed uppercase tracking-tighter">
                        {hero.subtitle}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Link to="/auth" className="bg-green-500 text-black px-12 py-6 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-green-400 hover:shadow-[0_0_40px_rgba(34,197,94,0.4)] transition-all flex items-center gap-3 group active:scale-95">
                            {hero.ctaStart} <Zap size={20} className="fill-current" />
                        </Link>
                        <Link to="/nasza-misja" className="px-12 py-6 rounded-2xl border border-white/10 bg-white/5 font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-3">
                            {hero.ctaSecondary} <ArrowRight size={18} />
                        </Link>
                    </div>

                    {cta.info && (
                        <p className="mt-8 text-xs md:text-sm text-white/30 max-w-xl mx-auto italic leading-relaxed font-medium">
                            {cta.info}
                        </p>
                    )}

                    {/* Majestic Background Cat Overlay inside card */}
                    <div className="absolute inset-0 z-[-1] opacity-15 overflow-hidden rounded-[4rem]">
                        <img src="/assets/maine-coon-bg.png" className="w-full h-full object-cover grayscale invert" alt="bg-cat" />
                    </div>
                </motion.div>

                {/* Cyber indicators */}
                <div className="mt-20 flex gap-4 opacity-20">
                    <div className="px-4 py-1 border border-white/20 rounded text-[9px] font-mono">STATUS: OPTIMIZED</div>
                    <div className="px-4 py-1 border border-white/20 rounded text-[9px] font-mono">CORE: PRO VERSION</div>
                    <div className="px-4 py-1 border border-white/20 rounded text-[9px] font-mono">UI: GLASSMOPHISM V2</div>
                </div>
            </section>

            {/* 1.5 Guest Calculator Section */}
            <section className="py-10 bg-[#050505] relative z-20">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <GuestCalculator />
                </div>
            </section>

            {/* 2. Features Grid */}
            <section className="py-20 md:py-40 px-6 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-20">
                        <div className="max-w-2xl">
                            <h2 className="text-3xl md:text-6xl font-black uppercase tracking-tighter mb-6">
                                {philosophy.title.split(' ').slice(0, 1)} <br />
                                <span className="text-green-500">{philosophy.title.split(' ').slice(1).join(' ')}</span>
                            </h2>
                            <p className="text-white/40 font-medium text-lg leading-relaxed italic">{philosophy.subtitle}</p>
                        </div>
                        <div className="text-right flex flex-col items-end">
                            <Cpu className="text-green-500/20 w-20 h-20 mb-4" />
                            <div className="h-[2px] w-32 bg-green-500" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {philosophy.items.map((feat, idx) => {
                            const icons = [Terminal, Globe, Layers];
                            const Icon = icons[idx] || Terminal;
                            return (
                                <motion.div
                                    key={feat.title}
                                    whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                                    className="bg-white/[0.02] border border-white/[0.08] p-12 rounded-[3rem] group transition-all"
                                >
                                    <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center mb-10 group-hover:bg-green-500 group-hover:text-black transition-all">
                                        <Icon className="text-green-400 group-hover:text-inherit transition-colors" />
                                    </div>
                                    <h3 className="text-2xl font-black uppercase mb-4 tracking-tight">{feat.title}</h3>
                                    <p className="text-white/30 text-sm leading-relaxed">{feat.desc}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* 3. Interactive Floating Section */}
            <section className="py-20 md:py-40 bg-white/[0.01]">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="relative perspective-2000">
                        {/* High-tech UI elements */}
                        <motion.div
                            animate={{ rotateY: [0, 10, 0], rotateX: [0, -5, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                            className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-8 rounded-[4rem] relative z-10 shadow-2xl"
                        >
                            <div className="flex gap-2 mb-8">
                                <div className="w-3 h-3 rounded-full bg-red-500/40" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/40" />
                                <div className="w-3 h-3 rounded-full bg-green-500/40" />
                            </div>
                            <div className="space-y-4">
                                <div className="h-4 w-[80%] bg-white/5 rounded-full" />
                                <div className="h-4 w-[60%] bg-white/5 rounded-full" />
                                <div className="h-20 w-full bg-white/5 rounded-3xl" />
                                <div className="h-4 w-[90%] bg-white/5 rounded-full" />
                            </div>
                        </motion.div>
                        {/* Majestic Cat Background */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-40 filter grayscale blur-sm scale-125 z-0">
                            <img src="/assets/maine-coon-bg.png" alt="tech-cat" className="w-full h-full object-contain" />
                        </div>
                    </div>

                    <div>
                        <h2 className="text-3xl md:text-6xl font-black uppercase mb-10">{benefits.title.split(' ').slice(0, 1)} <br /> <span className="text-green-500">{benefits.title.split(' ').slice(1).join(' ')}</span></h2>
                        <div className="space-y-8">
                            {benefits.items.map((item, i) => {
                                const icons = [Zap, Sparkles, Leaf, Heart];
                                const Icon = icons[i] || CheckCircle;
                                return (
                                    <div key={i} className="flex items-center gap-6 group">
                                        <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center shrink-0 group-hover:border-green-500/50 transition-colors">
                                            <Icon className="text-green-500 w-5 h-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-lg font-bold tracking-tight uppercase text-white/60 group-hover:text-white transition-colors">{item.title}</p>
                                            <p className="text-sm text-white/30 lowercase">{item.desc}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Final CTA */}
            <section className="py-20 md:py-40 px-6 container mx-auto text-center">
                <div className="relative p-8 md:p-32 rounded-[5rem] overflow-hidden border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-green-500/10 blur-[120px] rounded-full" />
                    <div className="relative z-10">
                        <h2 className="text-2xl md:text-7xl font-black uppercase tracking-tighter mb-12">
                            {cta.title.split(' ').slice(0, 2).join(' ')} <br /> {cta.title.split(' ').slice(2, 3)} <span className="text-green-500">{cta.title.split(' ').slice(3).join(' ')}</span>
                        </h2>
                        <Link to="/auth" className="inline-flex items-center gap-4 bg-white text-black px-12 py-6 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-green-500 hover:shadow-[0_0_50px_rgba(34,197,94,0.3)] transition-all group">
                            {cta.button} <ArrowRightCircle className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        {cta.info && (
                            <p className="mt-12 text-sm md:text-base text-white/50 max-w-2xl mx-auto italic leading-relaxed font-medium">
                                {cta.info}
                            </p>
                        )}
                    </div>
                </div>
            </section>

        </div>
    );
};

export default LandingGlass;
