import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Layout, Palette, Zap, Leaf, CheckCircle2, ArrowLeft, Loader2, Save, Users, Calendar, Mail, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const Admin = ({ variant, setVariant, token, user }) => {
    const [activeTab, setActiveTab] = useState('design'); // 'design' or 'users'
    const [users, setUsers] = useState([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    useEffect(() => {
        if (activeTab === 'users' && users.length === 0) {
            fetchUsers();
        }
    }, [activeTab]);

    const fetchUsers = async () => {
        setIsLoadingUsers(true);
        try {
            const res = await axios.get('/api/admin/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
        } catch (e) {
            console.error('Failed to fetch users', e);
        } finally {
            setIsLoadingUsers(false);
        }
    };

    if (user?.email !== 'sebretu33@gmail.com') {
        return (
            <div className="min-h-screen bg-ui-bg text-ui-text flex items-center justify-center p-6">
                <div className="text-center">
                    <h1 className="text-4xl font-black uppercase mb-4">Dostęp Zablokowany</h1>
                    <p className="text-ui-text/50">Tylko główny administrator ma uprawnienia do tego panelu.</p>
                    <Link to="/" className="mt-8 inline-block text-ui-accent font-bold uppercase tracking-widest">
                        Powrót do strony głównej
                    </Link>
                </div>
            </div>
        );
    }

    const variants = [
        {
            id: 'zen',
            name: 'Zen Minimalism',
            desc: 'Czysta, biała estetyka Apple. Złote akcenty i majestatyczne wektorowe tło.',
            icon: Palette,
            color: 'bg-barf-gold'
        },
        {
            id: 'glass',
            name: 'Glassmorphism Tech',
            desc: 'Futurystyczny interfejs z efektami szronionego szkła i neonową zielenią.',
            icon: Zap,
            color: 'bg-green-500'
        },
        {
            id: 'organic',
            name: 'Modern Organic',
            desc: 'Ciepłe, naturalne barwy oliwkowe. Miękkie oświetlenie i ekologiczny design.',
            icon: Leaf,
            color: 'bg-olive-600'
        }
    ];

    const handleSave = async () => {
        setIsSaving(true);
        setSaveMessage('');
        try {
            await axios.post('/api/settings',
                { landingVariant: variant },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSaveMessage('Konfiguracja zapisana pomyślnie!');
            setTimeout(() => setSaveMessage(''), 3000);
        } catch (e) {
            console.error('Failed to save settings', e);
            setSaveMessage('Błąd podczas zapisywania.');
        } finally {
            setIsSaving(false);
        }
    };


    return (
        <div className="min-h-screen bg-ui-bg text-ui-text pt-32 pb-20 px-6 transition-colors duration-500">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-ui-text/5 p-2 rounded-lg">
                                <ShieldCheck className="w-5 h-5 text-ui-text" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-ui-text/40">Główny Administrator</span>
                        </div>
                        <h1 className="text-5xl font-black text-ui-text tracking-tighter uppercase leading-none">Panel Sterowania</h1>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex bg-ui-text/5 p-1 rounded-2xl border border-ui-text/10">
                            <button
                                onClick={() => setActiveTab('design')}
                                className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'design' ? 'bg-ui-accent text-ui-text shadow-lg' : 'text-ui-text/40 hover:text-ui-text'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <Layout size={14} /> Wygląd
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('users')}
                                className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-ui-accent text-ui-text shadow-lg' : 'text-ui-text/40 hover:text-ui-text'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <Users size={14} /> Użytkownicy
                                </div>
                            </button>
                        </div>
                        <Link to="/" className="flex items-center gap-2 text-sm font-bold text-ui-text/40 hover:text-ui-text transition-colors">
                            <ArrowLeft size={16} /> Wróć
                        </Link>
                    </div>
                </div>

                {activeTab === 'design' ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="mb-12">
                            <p className="text-ui-text/50 font-medium max-w-lg">
                                Wybierz aktywny wariant strony Landing Page. Zmiany są widoczne natychmiast dla wszystkich użytkowników.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {variants.map((v) => (
                                <motion.div
                                    key={v.id}
                                    whileHover={{ y: -10 }}
                                    onClick={() => setVariant(v.id)}
                                    className={`relative cursor-pointer group rounded-[2.5rem] p-8 transition-all duration-500 border-4
                                        ${variant === v.id
                                            ? 'bg-ui-card border-ui-accent shadow-2xl'
                                            : 'bg-ui-text/5 border-transparent hover:border-ui-accent/30'}`}
                                >
                                    <div className={`w-16 h-16 ${v.color} rounded-3xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                                        <v.icon className="text-white w-8 h-8" />
                                    </div>

                                    <h3 className="text-2xl font-black text-ui-text mb-4 uppercase tracking-tight">{v.name}</h3>
                                    <p className="text-ui-text/60 text-sm leading-relaxed mb-10 min-h-[60px] italic">
                                        "{v.desc}"
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${variant === v.id ? 'text-ui-text' : 'text-ui-text/20'}`}>
                                            {variant === v.id ? 'Aktywny' : 'Wybierz styl'}
                                        </span>
                                        {variant === v.id && (
                                            <CheckCircle2 className="text-ui-success w-6 h-6 animate-pulse" />
                                        )}
                                    </div>

                                    <div className="absolute top-6 right-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                                        <v.icon size={100} />
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="mt-20 p-10 bg-black rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative">
                            <div className="relative z-10">
                                <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Tryb Podglądu Live</h2>
                                <p className="text-white/40 text-sm font-medium">Ustawienia zostaną zapisane w bazie danych i zastosowane dla wszystkich użytkowników.</p>
                                {saveMessage && (
                                    <motion.p
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`text-xs mt-2 font-bold uppercase tracking-widest ${saveMessage.includes('Błąd') ? 'text-red-500' : 'text-green-500'}`}
                                    >
                                        {saveMessage}
                                    </motion.p>
                                )}
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className={`relative z-50 bg-ui-text text-ui-bg px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-2xl flex items-center gap-3 group cursor-pointer
                                    ${isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-ui-accent hover:text-ui-text'}`}
                            >
                                {isSaving ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-ui-bg border-t-transparent rounded-full animate-spin" />
                                        Zapisywanie...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-6 h-6" /> Zapisz Konfigurację
                                    </>
                                )}
                            </button>

                            <div className="absolute bottom-0 right-0 p-10 opacity-10 rotate-12 pointer-events-none">
                                <img src="/assets/maine-coon-vector.png" className="w-[300px] h-auto object-contain [[data-theme='zen']_&]:invert-0 [[data-theme='glass']_&]:invert [[data-theme='organic']_&]:invert-0" alt="Maine Coon Vector" />
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-3xl font-black uppercase tracking-tight">Zarejestrowani Użytkownicy</h2>
                                <p className="text-ui-text/50 font-medium mt-1">Lista wszystkich osób posiadających konto w systemie.</p>
                            </div>
                            <div className="bg-ui-text/5 px-6 py-3 rounded-2xl border border-ui-text/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-ui-accent rounded-full animate-pulse" />
                                    <span className="text-sm font-black uppercase tracking-widest">{users.length} Użytkowników</span>
                                </div>
                            </div>
                        </div>

                        {isLoadingUsers ? (
                            <div className="py-20 flex flex-col items-center justify-center">
                                <Loader2 className="w-12 h-12 text-ui-accent animate-spin mb-4" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-ui-text/40">Ładowanie bazy danych...</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {users.map((u) => (
                                    <div
                                        key={u.id}
                                        className="bg-ui-card border border-ui-text/5 p-6 rounded-[2rem] flex items-center justify-between hover:border-ui-accent/30 transition-all group"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 bg-ui-text/5 rounded-2xl flex items-center justify-center group-hover:bg-ui-accent/10 transition-colors">
                                                <Mail className="w-6 h-6 text-ui-text/40 group-hover:text-ui-accent transition-colors" />
                                            </div>
                                            <div>
                                                <div className="text-lg font-black tracking-tight">{u.email}</div>
                                                <div className="flex items-center gap-4 mt-1">
                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-ui-text/40">
                                                        <Calendar size={12} />
                                                        {new Date(u.createdAt).toLocaleDateString('pl-PL', {
                                                            day: '2-digit',
                                                            month: 'long',
                                                            year: 'numeric'
                                                        })}
                                                    </div>
                                                    <div className="w-1 h-1 bg-ui-text/20 rounded-full" />
                                                    <div className="text-[10px] font-black uppercase tracking-widest text-ui-success/60">Aktywny</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="bg-ui-text/5 p-2 rounded-lg">
                                                <ShieldCheck className="w-4 h-4 text-ui-text/40" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Admin;
