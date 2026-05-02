import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cat, Calculator, List, ShoppingCart, LogOut, Menu, X, Settings, Package, Palette, ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';

const Navbar = ({ user, setToken, variant, onUpdateVariant }) => {
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { path: '/', icon: Calculator, label: 'Kalkulator Główny' },
        { path: '/szybki-przepis', icon: Calculator, label: 'Szybki Kalkulator' },
        { path: '/przepisy', icon: List, label: 'Przepisy' },
        { path: '/magazyn', icon: Package, label: 'Magazyn' },
        { path: '/zakupy', icon: ShoppingCart, label: 'Zakupy' },
    ];

    return (
        <header
            className={`relative w-full z-[2000] border-b transition-all duration-500
                ${isScrolled
                    ? 'bg-ui-nav-bg backdrop-blur-[40px] border-ui-border h-16 md:h-32 py-0 shadow-2xl'
                    : 'bg-transparent border-transparent h-20 md:h-40 py-2'}`}
        >
            <div className="container mx-auto h-full px-4 md:px-12 flex items-center justify-between">
                {/* Logo Section */}
                <div className="flex-shrink-0 flex items-center mr-auto">
                    <Link
                        to="/"
                        className="flex items-center gap-4 transition-all duration-500 hover:scale-[1.02] active:scale-95 group"
                    >
                        <div className="relative flex items-center justify-center mt-2 md:mt-28">
                            <div className="h-12 w-12 md:h-72 md:w-72 relative flex items-center justify-center transition-colors duration-500">
                                <img
                                    src={logo}
                                    alt="iBarf Logo"
                                    className="w-full h-full object-contain"
                                    style={{ filter: 'var(--logo-filter)' }}
                                />
                            </div>
                        </div>
                    </Link>
                </div>


                {/* Desktop Nav */}
                <nav className="hidden lg:flex items-center gap-8">
                    {user && navItems.map((link) => {
                        const isActive = location.pathname === link.href;
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`text-[11px] md:text-[13px] font-black uppercase tracking-[0.25em] transition-all duration-300
                                    ${location.pathname === link.path
                                        ? "text-ui-accent border-b-2 border-ui-accent pb-1"
                                        : "text-ui-text/60 hover:text-ui-text"
                                    }`}

                            >
                                {link.label}
                            </Link>
                        );
                    })}

                    {user && user.email === 'sebretu33@gmail.com' && (
                        <Link
                            to="/admin"
                            className={`flex items-center gap-2 text-[11px] md:text-[13px] font-black uppercase tracking-[0.25em] transition-all
                                ${location.pathname === '/admin' ? 'text-ui-accent' : 'text-ui-text/60 hover:text-ui-text'}`}
                        >
                            <Settings size={16} />
                            <span className="hidden xl:inline">Panel</span>
                        </Link>
                    )}

                    {user && (
                        <button
                            onClick={() => setToken(null)}
                            className="ml-4 p-2 rounded-xl hover:bg-ui-danger/10 text-ui-danger/60 hover:text-ui-danger transition-all duration-300"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    )}
                </nav>

                {/* Mobile Hamburger */}
                <button
                    className="lg:hidden p-2 text-ui-text"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu Drawer */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-0 top-0 left-0 w-full h-screen bg-ui-bg/95 z-[3000] p-8 flex flex-col items-center justify-center gap-8"
                    >
                        <button
                            className="absolute top-8 right-8 text-ui-text"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <X size={32} />
                        </button>

                        {user ? (
                            navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-2xl font-black uppercase tracking-widest text-ui-text hover:text-ui-accent transition-colors"
                                >
                                    {item.label}
                                </Link>
                            ))
                        ) : (
                            <Link
                                to="/auth"
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-2xl font-black uppercase tracking-widest text-ui-text hover:text-ui-accent transition-colors"
                            >
                                Zaloguj się
                            </Link>

                        )}

                        {user && user.email === 'sebretu33@gmail.com' && (
                            <Link
                                to="/admin"
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-2xl font-black uppercase tracking-widest text-ui-text hover:text-ui-accent transition-colors"
                            >
                                Panel Sterowania
                            </Link>
                        )}

                        {user && (
                            <button
                                onClick={() => {
                                    setToken(null);
                                    setMobileMenuOpen(false);
                                }}
                                className="mt-8 text-ui-danger font-bold uppercase tracking-widest"
                            >
                                Wyloguj się
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </header >
    );
};

export default Navbar;
