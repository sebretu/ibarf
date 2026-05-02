import React from 'react';
import { motion } from 'framer-motion';
import {
    ArrowRight, Beef, Bird, Fish, Heart, Leaf,
    Sparkles, Utensils, ShieldCheck, Sun, Wind, Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { landingContent } from './landingContent';
import GuestCalculator from '../../components/GuestCalculator';

const LandingOrganic = () => {
    const { hero, philosophy, benefits, cta } = landingContent;

    return (
        <div className="bg-[#FAF9F6] text-[#3A3F33] selection:bg-olive-600/20">
            {/* 1. Hero Section */}
            <section className="relative min-h-[90vh] flex items-center justify-center px-6 lg:px-24 overflow-hidden py-20">
                {/* Background Textures */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />

                {/* Soft Lighting / Gradients */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#E8EADF]/40 to-transparent" />
                <div className="absolute top-[20%] right[-10%] w-[60%] h-[60%] bg-olive-200/20 blur-[120px] rounded-full" />

                <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left Side: Image */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="relative flex justify-center lg:justify-start order-2 lg:order-1"
                    >
                        <div className="relative w-full max-w-[500px] aspect-square">
                            <img
                                src="/assets/maine-coon-bg.png"
                                className="w-full h-full object-contain filter drop-shadow-2xl"
                                alt="majestic-cat"
                            />
                            {/* Accent Circle */}
                            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-olive-100/40 blur-3xl rounded-full" />
                        </div>
                    </motion.div>

                    {/* Right Side: Content */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center lg:text-left order-1 lg:order-2"
                    >
                        <div className="flex items-center justify-center lg:justify-start gap-4 mb-8">
                            <Leaf size={20} className="text-olive-700" />
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-olive-800/60">{hero.badge}</span>
                        </div>

                        <h1 className="text-3xl md:text-8xl font-black tracking-tight leading-[0.9] text-olive-900 mb-10">
                            {hero.title1} <br />
                            <span className="italic font-serif font-light text-olive-700">{hero.title2}</span>
                        </h1>

                        <p className="text-lg md:text-xl text-olive-800/80 font-medium max-w-2xl lg:mx-0 mx-auto mb-16 leading-relaxed">
                            {hero.subtitle}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                            <Link to="/auth" className="bg-[#3A3F33] text-white px-14 py-6 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-olive-800 transition-all shadow-xl flex items-center justify-center gap-4 group active:scale-95">
                                {hero.ctaStart} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link to="/nasza-misja" className="px-14 py-6 rounded-3xl border border-olive-900/10 text-olive-900/80 font-black text-sm uppercase tracking-widest hover:bg-white transition-all text-center">
                                {hero.ctaSecondary}
                            </Link>
                        </div>
                        {cta.info && (
                            <p className="mt-8 text-xs md:text-sm text-olive-800/60 max-w-lg mx-auto lg:mx-0 italic leading-relaxed font-medium">
                                {cta.info}
                            </p>
                        )}
                    </motion.div>
                </div>
            </section>

            {/* 1.5 Guest Calculator Section */}
            <section className="py-10 bg-[#FAF9F6] relative z-20">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <GuestCalculator />
                </div>
            </section>

            {/* 2. Philosophy Section */}
            <section className="py-20 md:py-40 bg-white">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                    <div className="order-2 lg:order-1 relative">
                        <div className="aspect-[4/5] bg-olive-50 rounded-[4rem] overflow-hidden relative shadow-inner">
                            <img src="/assets/maine-coon-bg.png" className="w-full h-full object-cover opacity-10 grayscale" alt="texture" />
                            <div className="absolute inset-0 bg-gradient-to-tr from-olive-100/40 to-transparent" />
                        </div>
                        {/* Floating Info Badge */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="absolute -top-10 -right-10 bg-white p-10 rounded-[3rem] shadow-2xl border border-olive-50 flex flex-col items-center"
                        >
                            <Sparkles className="text-barf-gold mb-3" />
                            <span className="text-3xl font-black text-olive-900">100%</span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-olive-900/60">Raw & Pure</span>
                        </motion.div>
                    </div>

                    <div className="order-1 lg:order-2">
                        <span className="text-olive-700 text-xs font-black uppercase tracking-[0.3em] mb-4 block">{philosophy.badge}</span>
                        <h2 className="text-3xl md:text-7xl font-black text-olive-900 tracking-tight uppercase mb-10 leading-none">
                            {philosophy.title.split(' ').slice(0, 2).join(' ')} <br /> {philosophy.title.split(' ').slice(2).join(' ')}
                        </h2>
                        <p className="text-xl text-olive-800/80 leading-relaxed mb-12 font-medium">
                            {philosophy.subtitle}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {philosophy.items.map((item, idx) => {
                                const icons = [ShieldCheck, Utensils, Heart];
                                const Icon = icons[idx] || ShieldCheck;
                                return (
                                    <div key={item.id} className="flex flex-col gap-4 p-6 bg-olive-50/50 rounded-3xl border border-olive-900/5">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                            <Icon className="text-olive-700 w-6 h-6" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black uppercase tracking-widest text-olive-900">{item.title}</span>
                                            <span className="text-xs text-olive-800/60 font-medium leading-relaxed">{item.desc}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Ingredient Cards Section */}
            <section className="py-20 md:py-40 bg-[#F4F5EF] px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 md:mb-24">
                        <h2 className="text-3xl md:text-6xl font-black text-olive-900 tracking-tight uppercase">{benefits.title}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {benefits.items.slice(0, 3).map((item, idx) => {
                            const icons = [Zap, Sparkles, Leaf];
                            const colors = ['bg-olive-100', 'bg-red-50', 'bg-blue-50'];
                            const Icon = icons[idx] || Leaf;
                            return (
                                <motion.div
                                    key={item.title}
                                    whileHover={{ y: -15 }}
                                    className="bg-white p-8 md:p-12 rounded-[4rem] shadow-sm hover:shadow-2xl transition-all duration-500 border border-olive-900/5"
                                >
                                    <div className={`w-20 h-20 ${colors[idx]} rounded-[2rem] flex items-center justify-center mb-10`}>
                                        <Icon size={32} className="text-olive-900/40" />
                                    </div>
                                    <h3 className="text-2xl font-black uppercase mb-6 tracking-tight text-olive-900">{item.title}</h3>
                                    <p className="text-sm text-olive-800/70 font-medium leading-relaxed">
                                        {item.desc}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* 4. Soft CTA Section */}
            <section className="py-20 md:py-40 px-6 container mx-auto text-center">
                <div className="bg-olive-50 rounded-[5rem] p-10 md:p-40 text-olive-950 border border-olive-900/10 relative overflow-hidden flex flex-col items-center shadow-2xl">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
                    <div className="relative z-10 flex flex-col items-center">
                        <Leaf size={60} className="mb-12 text-olive-700 animate-pulse" />
                        <h2 className="text-2xl md:text-7xl font-black uppercase tracking-tighter mb-12 max-w-4xl">
                            {cta.title.split(' ').slice(0, 2).join(' ')} <br /> {cta.title.split(' ').slice(2).join(' ')}
                        </h2>
                        <Link to="/auth" className="bg-[#3A3F33] text-white px-16 py-8 rounded-full font-black text-lg uppercase tracking-widest hover:bg-olive-800 transition-all transform hover:scale-105 active:scale-95 shadow-2xl">
                            {cta.button}
                        </Link>
                        {cta.info && (
                            <p className="mt-12 text-sm md:text-base text-olive-800/70 max-w-3xl text-center italic leading-relaxed font-medium">
                                {cta.info}
                            </p>
                        )}
                    </div>
                </div>
            </section>

        </div>
    );
};

export default LandingOrganic;
