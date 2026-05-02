import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
    ArrowRight, ArrowRightCircle, ShieldCheck, Heart,
    Zap, Sparkles, Leaf, Bird, Beef, Fish, Utensils
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { landingContent } from './landingContent';
import GuestCalculator from '../../components/GuestCalculator';

const LandingZen = () => {
    const { scrollY } = useScroll();
    const bgY = useTransform(scrollY, [0, 500], [0, 150]);
    const textY = useTransform(scrollY, [0, 500], [0, -50]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);

    const { hero, philosophy, benefits, cta } = landingContent;

    return (
        <div className="bg-white text-black font-sans selection:bg-barf-gold/30">
            {/* 1. Hero Section */}
            <section className="relative h-screen w-full overflow-hidden flex flex-col items-center justify-center px-6">
                {/* Background Vector - Layer 0 */}
                <motion.div
                    style={{ y: bgY }}
                    className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none"
                >
                    <img
                        src="/assets/maine-coon-bg.png"
                        alt="Majestic Cat"
                        className="w-[90%] md:w-[60%] h-auto object-contain opacity-[0.5] filter grayscale brightness-100"
                    />
                </motion.div>

                {/* Floating Elements - Perspective Layer */}
                <div className="absolute inset-0 z-10 pointer-events-none perspective-2000">
                    <motion.div
                        animate={{
                            y: [0, -20, 0],
                            rotate: [0, 2, 0]
                        }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-[20%] right-[15%] w-12 h-12 bg-barf-gold/5 blur-sm rounded-full"
                    />
                    <motion.div
                        animate={{
                            y: [0, 30, 0],
                            rotate: [0, -3, 0]
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-[25%] left-[10%] w-24 h-24 bg-green-500/5 blur-md rounded-full"
                    />
                </div>

                {/* Content - Layer 2 */}
                <motion.div
                    style={{ y: textY }}
                    className="relative z-20 text-center max-w-5xl"
                >
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[11px] font-black uppercase tracking-[0.5em] text-black/60 mb-8 block"
                    >
                        {hero.badge}
                    </motion.span>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-9xl font-black tracking-tighter leading-[0.85] uppercase mb-12"
                    >
                        {hero.title1} <br />
                        <span className="text-barf-gold">{hero.title2}</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-lg md:text-xl text-black/70 font-medium max-w-2xl mx-auto mb-16 leading-relaxed italic"
                    >
                        {hero.subtitle}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-col sm:flex-row gap-6 justify-center"
                    >
                        <Link to="/auth" className="bg-black text-white px-12 py-6 rounded-full font-black text-sm uppercase tracking-widest hover:bg-barf-gold transition-all shadow-2xl flex items-center gap-3 active:scale-95 group">
                            {hero.ctaStart} <ArrowRightCircle className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link to="/nasza-misja" className="px-12 py-6 rounded-full font-black text-sm uppercase tracking-widest text-black/60 hover:text-black hover:bg-black/5 transition-all">
                            {hero.ctaSecondary}
                        </Link>
                    </motion.div>
                        {cta.info && (
                            <p className="mt-8 text-xs md:text-sm text-black/50 max-w-lg mx-auto italic leading-relaxed font-medium">
                                {cta.info}
                            </p>
                        )}
                    </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    style={{ opacity }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50"
                >
                    <span className="text-[9px] font-black uppercase tracking-widest">Scroll</span>
                    <div className="w-[1px] h-12 bg-black/40 relative overflow-hidden">
                        <motion.div
                            animate={{ y: [0, 48, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute top-0 left-0 w-full h-1/2 bg-barf-gold"
                        />
                    </div>
                </motion.div>
            </section>

            {/* 1.5 Guest Calculator Section */}
            <section className="py-10 bg-[#FAFAFA] relative z-20">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <GuestCalculator />
                </div>
            </section>

            {/* 2. BARF Section (2 columns, Clean UI) */}
            <section className="py-20 md:py-40 bg-white px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                    <div>
                        <span className="text-barf-gold text-xs font-black uppercase tracking-[0.3em] mb-4 block">{philosophy.badge}</span>
                        <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase mb-10 leading-none">
                            {philosophy.title.split(' ').slice(0, 2).join(' ')} <br /> {philosophy.title.split(' ').slice(2).join(' ')}
                        </h2>
                        <p className="text-xl text-black/70 leading-relaxed mb-12 font-medium italic">
                            {philosophy.subtitle}
                        </p>

                        <div className="space-y-6">
                            {philosophy.items.map((item, idx) => {
                                const icons = [ShieldCheck, Utensils, Heart];
                                const Icon = icons[idx] || ShieldCheck;
                                return (
                                    <div key={item.id} className="flex items-center gap-6 p-6 bg-black/[0.02] rounded-3xl border border-black/5 hover:border-barf-gold/30 transition-all cursor-default group">
                                        <div className="bg-white p-3 rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                                            <Icon className="text-barf-gold w-6 h-6" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-lg font-bold tracking-tight uppercase">{item.title}</span>
                                            <span className="text-sm text-black/50 font-medium">{item.desc}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="relative">
                        <div className="aspect-square bg-black/[0.01] border border-black/5 rounded-[4rem] relative flex items-center justify-center overflow-hidden group">
                            <img
                                src="/assets/maine-coon-bg.png"
                                className="w-[80%] h-auto opacity-20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-1000 grayscale select-none"
                                alt="Feline Focus"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-60" />
                        </div>
                        {/* Decorative 3D elements */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-barf-gold/5 blur-3xl rounded-full" />
                        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-green-500/5 blur-3xl rounded-full" />
                    </div>
                </div>
            </section>

            {/* 3. 3D Cards Section */}
            <section className="py-20 md:py-40 bg-[#FAFAFA] px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 md:mb-24">
                        <h2 className="text-3xl md:text-6xl font-black tracking-tighter uppercase mb-6">{benefits.title}</h2>
                        <div className="w-20 h-1 bg-barf-gold mx-auto rounded-full" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {benefits.items.map((item, idx) => {
                            const icons = [Zap, Sparkles, Leaf, Heart];
                            const Icon = icons[idx] || Zap;
                            return (
                                <motion.div
                                    key={item.title}
                                    whileHover={{
                                        y: -20,
                                        rotateX: 5,
                                        rotateY: -5,
                                        boxShadow: "0 50px 100px -20px rgba(0,0,0,0.1)"
                                    }}
                                    viewport={{ once: true }}
                                    className="bg-white border border-black/5 p-12 rounded-[3.5rem] flex flex-col items-center text-center transition-all duration-500 hover:border-barf-gold/20 perspective-1000 group"
                                >
                                    <div className="bg-black/5 p-4 rounded-3xl mb-8 group-hover:bg-barf-gold transition-colors">
                                        <Icon className="w-8 h-8 text-black group-hover:text-white" />
                                    </div>
                                    <h3 className="text-2xl font-black uppercase mb-4 tracking-tight">{item.title}</h3>
                                    <p className="text-sm text-black/60 font-medium leading-relaxed italic">
                                        {item.desc}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* 4. Final Premium CTA */}
            <section className="py-20 md:py-40 px-6">
                <div className="max-w-6xl mx-auto bg-black rounded-[5rem] p-10 md:p-40 text-center text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-barf-gold/10 opacity-50 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />

                    <div className="relative z-10 flex flex-col items-center">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="w-32 h-32 border border-white/5 rounded-full flex items-center justify-center mb-12"
                        >
                            <img src="/assets/maine-coon-bg.png" className="w-16 h-16 opacity-10 brightness-0 invert" alt="Logo Icon" />
                        </motion.div>

                        <h2 className="text-3xl md:text-8xl font-black tracking-tighter uppercase mb-12 leading-[0.9]">
                            {cta.title.split(' ').slice(0, 2).join(' ')} <br /> <span className="text-barf-gold">{cta.title.split(' ').slice(2, 3)}</span> <br /> {cta.title.split(' ').slice(3).join(' ')}
                        </h2>

                        <Link to="/auth" className="inline-block bg-white text-black px-20 py-8 rounded-full font-black text-xl uppercase tracking-widest hover:bg-barf-gold hover:text-white transition-all transform hover:scale-110 active:scale-95 shadow-2xl">
                            {cta.button}
                        </Link>
                        {cta.info && (
                            <p className="mt-12 text-sm md:text-base text-white/50 max-w-3xl text-center italic leading-relaxed font-medium">
                                {cta.info}
                            </p>
                        )}
                    </div>
                </div>
            </section>

        </div>
    );
};

export default LandingZen;
