import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ShieldCheck, Apple, Leaf, Sparkles, Utensils } from 'lucide-react';

const NaszaMisja = () => {
    return (
        <div className="min-h-screen bg-[#FAF9F6] text-black">
            {/* Hero Section */}
            <section className="relative py-32 px-6 flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#E8EADF]/40 to-transparent" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 text-center max-w-4xl"
                >
                    <div className="flex items-center justify-center gap-4 mb-8">
                        <Heart size={20} className="text-olive-700" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-olive-800/60">Nasze Wartości</span>
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-[0.9] text-olive-900 mb-10 uppercase">
                        Nasza misja – <br />
                        <span className="italic font-serif font-light text-olive-700">zdrowe żywienie kotów</span>
                    </h1>
                </motion.div>
            </section>

            {/* Content Section */}
            <section className="py-20 px-6 max-w-4xl mx-auto">
                <div className="ui-glass-card !p-12 md:!p-20 shadow-2xl border-olive-900/5">
                    <div className="prose prose-lg prose-olive max-w-none text-olive-900/80 leading-relaxed space-y-12">
                        <section className="space-y-6">
                            <p className="text-xl font-medium text-olive-900 italic">
                                Naszym celem jest wspieranie świadomego żywienia kotów w sposób możliwie najbliższy ich naturalnym potrzebom biologicznym. Kot domowy jest mięsożercą bezwzględnym, co oznacza, że jego organizm został zaprojektowany do trawienia i wykorzystywania przede wszystkim składników pochodzenia zwierzęcego.
                            </p>
                            <p>
                                Kot w naturze odżywia się drobnymi ofiarami – mięsem, kośćmi oraz podrobami. Dieta BARF (Biologically Appropriate Raw Food) stara się odtworzyć ten model żywienia w warunkach domowych, opierając się na surowym mięsie, odpowiednio dobranych podrobach oraz suplementacji niezbędnych składników, takich jak tauryna czy wapń.
                            </p>
                        </section>

                        <section className="bg-olive-50/50 p-10 rounded-[3rem] border border-olive-900/5">
                            <div className="flex items-center gap-4 mb-8">
                                <Sparkles className="text-barf-gold" />
                                <h2 className="text-3xl font-black uppercase tracking-tight text-olive-900">Co daje dieta BARF?</h2>
                            </div>
                            <p className="mb-8">Prawidłowo zbilansowana dieta BARF może przynieść wiele korzyści:</p>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 list-none p-0">
                                {[
                                    'lepszą kondycję sierści i skóry',
                                    'większą kontrolę nad jakością składników',
                                    'wyższą wilgotność pokarmu',
                                    'wsparcie higieny jamy ustnej',
                                    'dopasowanie do indywidualnych potrzeb'
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-4 text-sm font-bold uppercase tracking-tight">
                                        <div className="w-2 h-2 rounded-full bg-barf-gold" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <p className="mt-8 text-sm italic">
                                Najważniejszym elementem BARF jest jednak równowaga – sama „surowizna” to nie wszystko. Kluczowe jest odpowiednie proporcjonowanie składników i suplementacja, aby dieta była pełnowartościowa i bezpieczna w dłuższym okresie.
                            </p>
                        </section>

                        <section className="space-y-8">
                            <div className="flex items-center gap-4">
                                <Leaf className="text-olive-700" />
                                <h2 className="text-3xl font-black uppercase tracking-tight text-olive-900">Świadome podejście</h2>
                            </div>
                            <p>
                                BARF to nie moda, ale powrót do biologicznych podstaw żywienia kota. Wymaga wiedzy i odpowiedzialności, ale daje możliwość pełnej kontroli nad tym, co trafia do miski Twojego pupila.
                            </p>
                            <p className="text-lg font-bold border-l-4 border-olive-700 pl-8 py-4">
                                Dlatego naszą misją jest nie tylko dostarczanie narzędzi, ale też edukacja – tak, aby każdy opiekun mógł podejmować świadome decyzje dotyczące zdrowia swojego kota.
                            </p>
                        </section>
                    </div>
                </div>
            </section>

            {/* Features Badge */}
            <section className="pb-32 px-6 flex justify-center">
                <div className="flex flex-wrap justify-center gap-12 max-w-4xl">
                    {[
                        { icon: ShieldCheck, label: 'Bezpieczeństwo' },
                        { icon: Utensils, label: 'Naturalność' },
                        { icon: Apple, label: 'Zdrowie' }
                    ].map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-white rounded-3xl shadow-lg flex items-center justify-center border border-olive-900/5">
                                <item.icon className="text-olive-700" size={24} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-olive-900/40">{item.label}</span>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default NaszaMisja;
