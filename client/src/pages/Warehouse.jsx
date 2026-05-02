import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Package, Search, Save, AlertCircle, ShoppingCart, TrendingUp, CheckCircle2 } from 'lucide-react';

const Warehouse = ({ token }) => {
    const [ingredients, setIngredients] = useState([]);
    const [stocks, setStocks] = useState({});
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [ingRes, stockRes] = await Promise.all([
                axios.get('/api/ingredients'),
                axios.get('/api/magazine', { headers: { Authorization: `Bearer ${token}` } })
            ]);

            setIngredients(ingRes.data.filter(i => i.category !== 'Mieso' && i.category !== 'Podroby'));

            const stockMap = {};
            stockRes.data.forEach(s => {
                stockMap[s.ingredientId] = s.amount;
            });
            setStocks(stockMap);
            setLoading(false);
        } catch (err) {
            console.error("Fetch error in Warehouse:", err);
            alert("BŁĄD MAGAZYNU: Nie można pobrać danych. Spróbuj odświeżyć stronę. " + err.message);
            setLoading(false);
        }
    };

    const handleUpdateStock = async (ingredientId, amount) => {
        try {
            setSaveStatus({ id: ingredientId, state: 'saving' });
            await axios.post('/api/magazine', {
                ingredientId,
                amount: parseFloat(amount) || 0
            }, { headers: { Authorization: `Bearer ${token}` } });

            setStocks(prev => ({ ...prev, [ingredientId]: parseFloat(amount) || 0 }));
            setSaveStatus({ id: ingredientId, state: 'success' });
            setTimeout(() => setSaveStatus(null), 2000);
        } catch (e) {
            setSaveStatus({ id: ingredientId, state: 'error' });
            alert('Błąd podczas aktualizacji stanu magazynowego.');
        }
    };

    const filtered = ingredients.filter(i => {
        const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase()) ||
            i.category.toLowerCase().includes(search.toLowerCase());
        const hasStock = (stocks[i.id] || 0) > 0;

        // If there's a search term, show matching items even if 0 stock
        if (search.trim() !== '') return matchesSearch;

        // Otherwise only show items with stock
        return hasStock;
    });

    if (loading) return (
        <div className="min-h-screen bg-ui-bg flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-ui-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-ui-bg pt-24 md:pt-32 pb-20 px-4 md:px-6 max-w-[1200px] mx-auto overflow-x-hidden w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-ui-accent/10 rounded-[2rem] flex items-center justify-center border border-ui-accent/20">
                        <Package className="text-ui-accent w-10 h-10" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-ui-text">Magazyn</h1>
                        <p className="ui-subheading mt-2 font-medium italic opacity-60">Zarządzaj swoimi zapasami suplementów</p>
                    </div>
                </div>
            </div>

            {/* Quick Add Section */}
            <div className="ui-glass-card !p-6 md:!p-12 mb-10 md:mb-16 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-ui-accent/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />

                <h2 className="text-xl font-black uppercase tracking-widest text-ui-text mb-8 flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-ui-accent flex items-center justify-center text-ui-bg">
                        <Save size={16} />
                    </div>
                    Szybkie Dodawanie
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 relative z-10">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Wybierz Suplement</label>
                        <select
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val) {
                                    setSearch(ingredients.find(i => i.id === val)?.name || '');
                                    e.target.value = '';
                                }
                            }}
                            className="w-full bg-ui-text/5 border border-ui-border rounded-2xl py-5 px-6 text-sm font-bold text-ui-text outline-none focus:ring-2 focus:ring-ui-accent/20 transition-all custom-select"
                        >
                            <option value="">Wyszukaj produkt na liście...</option>
                            {ingredients.map(i => (
                                <option key={i.id} value={i.id}>{i.name} ({i.category})</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Filtruj widok</label>
                        <div className="relative">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-ui-text/30 w-5 h-5 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Wpisz nazwę, aby przefiltrować..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-ui-text/5 border border-ui-border rounded-2xl py-5 pl-16 pr-8 text-sm font-bold text-ui-text outline-none focus:ring-2 focus:ring-ui-accent/20 transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {filtered.map(ingredient => {
                    const currentStock = stocks[ingredient.id] || 0;
                    const isSaving = saveStatus?.id === ingredient.id && saveStatus?.state === 'saving';
                    const isSuccess = saveStatus?.id === ingredient.id && saveStatus?.state === 'success';
                    const isCapsule = ingredient.name.toLowerCase().includes('kapsułk') || ingredient.name.toLowerCase().includes('tablet');

                    return (
                        <div key={ingredient.id} className="ui-glass-card !p-6 md:!p-8 group hover:border-ui-accent/30 transition-all flex flex-col h-full">
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-[10px] font-black uppercase text-ui-accent tracking-widest">{ingredient.category}</span>
                                {currentStock < 10 && (
                                    <div className="flex items-center gap-2 text-ui-warning px-3 py-1 bg-ui-warning/10 rounded-full text-[10px] font-black uppercase">
                                        <AlertCircle size={12} /> Mało zapasów
                                    </div>
                                )}
                            </div>

                            <h3 className="text-xl font-black text-ui-text mb-8 flex-1 leading-tight">{ingredient.name}</h3>

                            <div className="space-y-6">
                                <div className="text-[10px] font-black uppercase opacity-30">Stan w Magazynie</div>
                                <div className="flex items-end gap-3">
                                    <input
                                        type="number"
                                        defaultValue={currentStock}
                                        onBlur={(e) => {
                                            if (parseFloat(e.target.value) !== currentStock) {
                                                handleUpdateStock(ingredient.id, e.target.value);
                                            }
                                        }}
                                        className="w-32 bg-ui-bg border border-ui-border rounded-xl py-3 px-4 text-2xl font-black text-ui-text outline-none focus:ring-1 focus:ring-ui-accent transition-all"
                                    />
                                    <span className="mb-2 text-[10px] font-bold opacity-30 uppercase">{isCapsule ? 'SZTUK' : 'GRAM'}</span>
                                </div>

                                <div className="pt-6 border-t border-ui-border/30 flex justify-between items-center text-[10px] font-black">
                                    <div className="flex items-center gap-2">
                                        {isSaving ? (
                                            <div className="w-3 h-3 border-2 border-ui-accent border-t-transparent rounded-full animate-spin"></div>
                                        ) : isSuccess ? (
                                            <CheckCircle2 size={16} className="text-ui-success animate-bounce" />
                                        ) : (
                                            <TrendingUp size={16} className="text-ui-accent" />
                                        )}
                                        <span className={isSaving ? 'text-ui-accent' : isSuccess ? 'text-ui-success' : 'text-ui-text/40'}>
                                            {isSaving ? 'ZAPISYWANIE' : isSuccess ? 'ZAPISANO' : 'GOTOWY'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-20 opacity-30">
                    <Package className="mx-auto w-20 h-20 mb-6" />
                    <p className="text-2xl font-black uppercase tracking-widest">Brak wyników</p>
                </div>
            )}
        </div>
    );
};

export default Warehouse;
