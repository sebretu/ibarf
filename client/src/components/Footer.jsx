import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="w-full bg-ui-bg/80 backdrop-blur-md border-t border-ui-border py-12 mt-auto relative z-50">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-ui-text/40 text-[10px] uppercase font-black tracking-[0.3em]">
                        © {new Date().getFullYear()} ibarf.pl • Najlepsze dla Twojego Kota
                    </div>

                    <div className="flex items-center gap-12">
                        <Link
                            to="/regulamin"
                            className="text-ui-text/60 hover:text-ui-accent text-[11px] font-black uppercase tracking-[0.2em] transition-all"
                        >
                            Regulamin
                        </Link>
                        <Link
                            to="/polityka-prywatnosci"
                            className="text-ui-text/60 hover:text-ui-accent text-[11px] font-black uppercase tracking-[0.2em] transition-all"
                        >
                            Polityka Prywatności
                        </Link>
                        <a
                            href="mailto:kontakt@ibarf.pl"
                            className="text-ui-text/60 hover:text-ui-accent text-[11px] font-black uppercase tracking-[0.2em] transition-all"
                        >
                            Kontakt
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
