import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Cat, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import logo from '../assets/logo.png';

const Auth = ({ setToken, setUser }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!isLogin) {
            if (password !== confirmPassword) {
                setError('Hasła nie zgadzają się');
                return;
            }
            if (!acceptedTerms || !acceptedPrivacy) {
                setError('Musisz zaakceptować regulamin i politykę prywatności');
                return;
            }
        }

        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
        try {
            const res = await axios.post(endpoint, { email, password });
            setToken(res.data.token);
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
        } catch (err) {
            setError(err.response?.data?.error || 'Wystąpił błąd');
        }
    };

    return (
        <div className="min-h-screen bg-ui-bg flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-ui-accent/10 blur-[120px] rounded-full pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                className="ui-glass-card w-full max-w-xl !p-12 md:!p-16 relative z-10"
            >
                <div className="flex flex-col items-center mb-12">
                    <div className="w-48 h-48 mb-8">
                        <img
                            src={logo}
                            alt="Logo"
                            className="w-full h-full object-contain filter drop-shadow-[0_0_20px_rgba(56,189,248,0.4)]"
                            style={{ filter: 'var(--logo-filter)' }}
                        />
                    </div>
                    <h1 className="ui-heading !text-3xl md:!text-5xl text-center mb-10 text-white">
                        {isLogin ? 'Elitarny Klub BARF' : 'Załóż nowe konto użytkownika'}
                    </h1>
                    <div className="flex items-center gap-2 text-ui-muted text-[10px] uppercase font-bold tracking-[0.2em] opacity-60">
                        <ShieldCheck className="w-4 h-4 text-ui-accent" /> System Bezpieczeństwa Maine Coon
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="space-y-6">
                        <div className="relative group">
                            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-ui-muted/40 group-focus-within:text-ui-accent transition-colors" />
                            <input
                                type="email"
                                placeholder="Email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-ui-text/5 border border-ui-border rounded-2xl py-6 pl-16 pr-6 focus:ring-2 focus:ring-ui-accent/20 focus:border-ui-accent/50 outline-none text-ui-text font-medium transition-all placeholder:text-ui-muted/30"
                            />
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-ui-muted/40 group-focus-within:text-ui-accent transition-colors" />
                            <input
                                type="password"
                                placeholder={isLogin ? "Hasło Dostępu" : "Hasło"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-ui-text/5 border border-ui-border rounded-2xl py-6 pl-16 pr-6 focus:ring-2 focus:ring-ui-accent/20 focus:border-ui-accent/50 outline-none text-ui-text font-medium transition-all placeholder:text-ui-muted/30"
                            />
                        </div>

                        {!isLogin && (
                            <>
                                <div className="relative group">
                                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-ui-muted/40 group-focus-within:text-ui-accent transition-colors" />
                                    <input
                                        type="password"
                                        placeholder="Powtórz Hasło"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-ui-text/5 border border-ui-border rounded-2xl py-6 pl-16 pr-6 focus:ring-2 focus:ring-ui-accent/20 focus:border-ui-accent/50 outline-none text-ui-text font-medium transition-all placeholder:text-ui-muted/30"
                                    />
                                </div>

                                <div className="space-y-4 pt-4">
                                    <label className="flex items-center gap-4 cursor-pointer group/check">
                                        <div className="relative w-6 h-6 flex-shrink-0">
                                            <input
                                                type="checkbox"
                                                required
                                                checked={acceptedTerms}
                                                onChange={(e) => setAcceptedTerms(e.target.checked)}
                                                className="peer sr-only"
                                            />
                                            <div className="w-full h-full bg-ui-text/5 border-2 border-ui-border rounded-lg peer-checked:bg-ui-accent peer-checked:border-ui-accent transition-all group-hover/check:border-ui-accent/50" />
                                            <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-ui-bg opacity-0 peer-checked:opacity-100 transition-opacity" />
                                        </div>
                                        <span className="text-ui-muted text-xs leading-tight">
                                            Akceptuję <a href="/regulamin" target="_blank" className="text-ui-accent hover:underline" onClick={e => e.stopPropagation()}>regulamin serwisu ibarf.pl</a>
                                        </span>
                                    </label>

                                    <label className="flex items-center gap-4 cursor-pointer group/check">
                                        <div className="relative w-6 h-6 flex-shrink-0">
                                            <input
                                                type="checkbox"
                                                required
                                                checked={acceptedPrivacy}
                                                onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                                                className="peer sr-only"
                                            />
                                            <div className="w-full h-full bg-ui-text/5 border-2 border-ui-border rounded-lg peer-checked:bg-ui-accent peer-checked:border-ui-accent transition-all group-hover/check:border-ui-accent/50" />
                                            <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-ui-bg opacity-0 peer-checked:opacity-100 transition-opacity" />
                                        </div>
                                        <span className="text-ui-muted text-xs leading-tight">
                                            Zapoznałem się z <a href="/polityka-prywatnosci" target="_blank" className="text-ui-accent hover:underline" onClick={e => e.stopPropagation()}>polityką prywatności ibarf.pl</a>
                                        </span>
                                    </label>
                                </div>
                            </>
                        )}
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-ui-danger text-sm text-center font-bold bg-ui-danger/10 border border-ui-danger/20 py-4 rounded-2xl"
                        >
                            {error}
                        </motion.div>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full h-20 bg-ui-text text-ui-bg rounded-2xl flex items-center justify-center gap-4 text-lg font-black uppercase tracking-widest hover:bg-ui-accent hover:text-ui-text transition-all shadow-2xl"
                    >
                        {isLogin ? 'Zatwierdź Panel' : 'Załóż Konto'}
                        <ArrowRight className="w-6 h-6" />
                    </motion.button>
                </form>

                <div className="mt-12 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-ui-muted hover:text-ui-accent transition-all font-black text-[10px] uppercase tracking-[0.3em] opacity-60 hover:opacity-100"
                    >
                        {isLogin ? 'Otrzymaj klucz dostępu (Rejestracja)' : 'Masz już licencję? (Logowanie)'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default Auth;
