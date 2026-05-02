import React from 'react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

const Regulamin = () => {
    return (
        <div className="min-h-screen bg-ui-bg py-20 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto ui-glass-card !p-8 md:!p-12"
            >
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-ui-accent/20 flex items-center justify-center text-ui-accent">
                        <FileText className="w-6 h-6" />
                    </div>
                    <h1 className="ui-heading !text-3xl md:!text-4xl !text-white !mb-0">Regulamin serwisu ibarf.pl</h1>
                </div>

                <div className="space-y-8 text-ui-text/80 leading-relaxed text-sm md:text-base">
                    <p className="font-bold text-ui-text">Obowiązuje od: 17.04.2026</p>

                    <section>
                        <h2 className="text-xl font-black text-white mb-4 uppercase tracking-wider">1. Postanowienia ogólne</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Niniejszy regulamin określa zasady korzystania z serwisu internetowego ibarf.pl (dalej: „Serwis”).</li>
                            <li>Właścicielem i administratorem Serwisu jest: Marcin Slapiński, e-mail: kontakt@ibarf.pl</li>
                            <li>Regulamin stanowi umowę pomiędzy administratorem a użytkownikiem Serwisu.</li>
                            <li>Korzystanie z Serwisu oznacza akceptację niniejszego regulaminu.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-white mb-4 uppercase tracking-wider">2. Definicje</h2>
                        <p className="mb-2">Na potrzeby regulaminu przyjmuje się:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>„Użytkownik” – osoba korzystająca z Serwisu</li>
                            <li>„Konto” – zbiór danych przypisanych do użytkownika</li>
                            <li>„Usługi” – funkcjonalności dostępne w Serwisie</li>
                            <li>„API” – interfejs programistyczny Serwisu (jeśli udostępniony)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-white mb-4 uppercase tracking-wider">3. Zakres usług</h2>
                        <p className="mb-2">Serwis może oferować w szczególności:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>tworzenie i obsługę kont użytkowników</li>
                            <li>dostęp do funkcjonalności systemu</li>
                            <li>przyszłe usługi cyfrowe (w tym płatne)</li>
                            <li>dostęp API (jeśli zostanie udostępniony)</li>
                        </ul>
                        <p className="mt-2">Zakres usług może się zmieniać bez konieczności zmiany regulaminu, o ile nie narusza to praw użytkownika.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-white mb-4 uppercase tracking-wider">4. Konto użytkownika</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Utworzenie konta jest dobrowolne i bezpłatne (chyba że w przyszłości zostanie określone inaczej dla usług premium).</li>
                            <li>Użytkownik zobowiązuje się do: podawania prawdziwych danych, zabezpieczenia loginu i hasła, nieudostępniania konta osobom trzecim.</li>
                            <li>Administrator może zablokować lub usunąć konto w przypadku: naruszenia regulaminu, działania na szkodę Serwisu, podejrzenia nieautoryzowanego dostępu.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-white mb-4 uppercase tracking-wider">5. Usługi płatne (jeśli zostaną wprowadzone)</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Serwis może w przyszłości oferować usługi płatne.</li>
                            <li>W takim przypadku: ceny będą jasno określone przed zakupem, płatności będą realizowane przez zewnętrznych operatorów płatności, zwroty i reklamacje będą regulowane osobnym opisem lub sekcją w Serwisie.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-white mb-4 uppercase tracking-wider">6. API (jeśli zostanie udostępnione)</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Serwis może udostępnić API dla integracji zewnętrznych.</li>
                            <li>Dostęp do API może wymagać: klucza API, limitów zapytań (rate limiting).</li>
                            <li>Zabrania się: nadużywania API, prób obejścia zabezpieczeń, używania API w sposób destabilizujący Serwis.</li>
                            <li>Administrator może w każdej chwili zmienić lub wycofać API.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-white mb-4 uppercase tracking-wider">7. Zasady korzystania z Serwisu</h2>
                        <p className="mb-2">Użytkownik zobowiązuje się do korzystania z Serwisu zgodnie z prawem i dobrymi obyczajami.</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Zabrania się: działań niezgodnych z prawem, prób ingerencji w kod lub bezpieczeństwo Serwisu, automatycznego scrapingu bez zgody (jeśli nie dotyczy API), działań obciążających infrastrukturę.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-white mb-4 uppercase tracking-wider">8. Dane i prywatność</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Zasady przetwarzania danych osobowych określa Polityka Prywatności.</li>
                            <li>Użytkownik akceptując regulamin akceptuje również zasady przetwarzania danych.</li>
                            <li>Dane są przetwarzane wyłącznie w zakresie niezbędnym do działania Serwisu.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-white mb-4 uppercase tracking-wider">9. Odpowiedzialność</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Administrator dokłada starań, aby Serwis działał prawidłowo, ale nie gwarantuje jego nieprzerwanej dostępności.</li>
                            <li>Administrator nie ponosi odpowiedzialności za: przerwy w działaniu Serwisu, utratę danych wynikającą z awarii niezależnych od administratora, działania użytkowników.</li>
                            <li>Użytkownik korzysta z Serwisu na własne ryzyko.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-white mb-4 uppercase tracking-wider">10. Zmiany funkcjonalności</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Administrator może wprowadzać zmiany w Serwisie, w tym: dodawanie nowych funkcji, usuwanie lub modyfikację istniejących funkcji.</li>
                            <li>Zmiany mogą być wprowadzane bez wcześniejszego powiadomienia, jeśli nie wpływają istotnie na prawa użytkownika.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-white mb-4 uppercase tracking-wider">11. Usunięcie konta</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Użytkownik może w każdej chwili usunąć konto.</li>
                            <li>Administrator może usunąć konto w przypadkach naruszenia regulaminu.</li>
                            <li>Usunięcie konta może skutkować trwałą utratą danych powiązanych z kontem.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-white mb-4 uppercase tracking-wider">12. Reklamacje</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Reklamacje dotyczące działania Serwisu można zgłaszać na adres: kontakt@ibarf.pl</li>
                            <li>Reklamacje będą rozpatrywane w rozsądnym terminie.</li>
                            <li>Odpowiedź zostanie przesłana drogą elektroniczną.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-white mb-4 uppercase tracking-wider">13. Zmiany regulaminu</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Administrator zastrzega sobie prawo do zmiany regulaminu.</li>
                            <li>Użytkownicy zostaną poinformowani o zmianach poprzez Serwis.</li>
                            <li>Dalsze korzystanie z Serwisu oznacza akceptację zmian.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-white mb-4 uppercase tracking-wider">14. Postanowienia końcowe</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>W sprawach nieuregulowanych zastosowanie mają przepisy prawa polskiego.</li>
                            <li>Regulamin wchodzi w życie z dniem publikacji.</li>
                        </ul>
                    </section>
                </div>
            </motion.div>
        </div>
    );
};

export default Regulamin;
