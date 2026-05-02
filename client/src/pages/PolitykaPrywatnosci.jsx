import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';

const PolitykaPrywatnosci = () => {
    return (
        <div className="min-h-screen bg-ui-bg py-20 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto ui-glass-card !p-8 md:!p-12"
            >
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-ui-accent/20 flex items-center justify-center text-ui-accent">
                        <ShieldAlert className="w-6 h-6" />
                    </div>
                    <h1 className="ui-heading !text-3xl md:!text-4xl !text-white !mb-0">Polityka prywatności</h1>
                </div>

                <div className="space-y-8 text-ui-text/80 leading-relaxed text-sm md:text-base">
                    <section>
                        <h2 className="text-xl font-black text-white mb-4 uppercase tracking-wider">1. Administrator danych</h2>
                        <p>Administratorem danych osobowych jest: Marcin Slapiński, adres e-mail: kontakt@ibarf.pl</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-white mb-4 uppercase tracking-wider">2. Zakres przetwarzanych danych</h2>
                        <p className="mb-2">W związku z korzystaniem ze strony ibarf.pl mogą być przetwarzane następujące dane osobowe:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>adres e-mail</li>
                            <li>login użytkownika</li>
                            <li>dane podane dobrowolnie w trakcie rejestracji lub korzystania z konta</li>
                        </ul>
                        <p className="mt-2">Podanie danych jest dobrowolne, ale niezbędne do korzystania z funkcji konta użytkownika.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-white mb-4 uppercase tracking-wider">3. Cel przetwarzania danych</h2>
                        <p className="mb-2">Dane osobowe są przetwarzane w celu:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>założenia i obsługi konta użytkownika</li>
                            <li>umożliwienia logowania do serwisu</li>
                            <li>zapewnienia prawidłowego działania strony</li>
                            <li>kontaktu z użytkownikiem (jeśli zajdzie taka potrzeba)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-white mb-4 uppercase tracking-wider">4. Podstawa prawna przetwarzania</h2>
                        <p className="mb-2">Dane przetwarzane są na podstawie:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>art. 6 ust. 1 lit. b RODO (realizacja usługi konta użytkownika)</li>
                            <li>art. 6 ust. 1 lit. f RODO (uzasadniony interes administratora – zapewnienie działania serwisu)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-white mb-4 uppercase tracking-wider">5. Przechowywanie danych</h2>
                        <p className="mb-2">Dane będą przechowywane przez okres:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>posiadania konta użytkownika</li>
                            <li>do momentu jego usunięcia przez użytkownika lub administratora</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-white mb-4 uppercase tracking-wider">6. Odbiorcy danych</h2>
                        <p className="mb-2">Dane mogą być przekazywane podmiotom wspierającym działanie strony, takim jak:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>dostawca serwera / hostingu</li>
                        </ul>
                        <p className="mt-2">Dane nie są sprzedawane ani udostępniane osobom trzecim w celach marketingowych.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-white mb-4 uppercase tracking-wider">7. Prawa użytkownika</h2>
                        <p className="mb-2">Użytkownik ma prawo do:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>dostępu do swoich danych</li>
                            <li>ich poprawiania</li>
                            <li>usunięcia danych</li>
                            <li>ograniczenia przetwarzania</li>
                            <li>wniesienia sprzeciwu</li>
                        </ul>
                        <p className="mt-2">W celu realizacji swoich praw należy skontaktować się z administratorem.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-white mb-4 uppercase tracking-wider">8. Pliki cookies</h2>
                        <p className="mb-2">Strona wykorzystuje pliki cookies w celu:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>utrzymania sesji użytkownika (logowanie)</li>
                            <li>zapewnienia prawidłowego działania serwisu</li>
                        </ul>
                        <p className="mt-2">Pliki cookies nie są wykorzystywane do celów marketingowych. Użytkownik może zarządzać plikami cookies w ustawieniach swojej przeglądarki.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-white mb-4 uppercase tracking-wider">9. Zabezpieczenia danych</h2>
                        <p>Administrator stosuje odpowiednie środki techniczne i organizacyjne w celu ochrony danych osobowych przed nieuprawnionym dostępem.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-white mb-4 uppercase tracking-wider">10. Zmiany polityki prywatności</h2>
                        <p>Polityka prywatności może być aktualizowana w zależności od zmian w funkcjonowaniu strony lub przepisach prawa.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-white mb-4 uppercase tracking-wider">11. Kontakt</h2>
                        <p>W sprawach związanych z danymi osobowymi można kontaktować się pod adresem: kontakt@ibarf.pl</p>
                    </section>
                </div>
            </motion.div>
        </div>
    );
};

export default PolitykaPrywatnosci;
