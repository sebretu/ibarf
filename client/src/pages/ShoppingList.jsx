import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingCart, CheckSquare, Square, Package, Printer,
    Layers, ShoppingBag, ArrowRight, CheckCircle2, Info, ExternalLink
} from 'lucide-react';

const API_URL = '/api';

const ShoppingList = ({ token }) => {
    const [recipes, setRecipes] = useState([]);
    const [selectedRecipes, setSelectedRecipes] = useState([]);
    const [aggregatedList, setAggregatedList] = useState([]);
    const [checkedItems, setCheckedItems] = useState({});

    const BUY_CATEGORIES = [
        'Gotowe preparaty', 'Witamina D', 'Jod', 'Witaminy z grupy B',
        'Żelazo', 'Witamina E', 'Preparaty', 'Wapń/Fosfor', 'Wapń', 'Tauryna',
        'Suplement' // for Omega 3
    ];

    const isBuyable = (item) => {
        if (!item) return false;
        const cat = (item.category || '').toLowerCase();
        const name = (item.name || '').toLowerCase();

        // Exclude specific fresh products even if they match category
        if (name.includes('wątroba') || name.includes('zoltko') || name.includes('żółtko')) return false;

        return BUY_CATEGORIES.some(c =>
            cat.includes(c.toLowerCase()) ||
            name.includes(c.toLowerCase())
        );
    };

    const handleBuy = (e, name) => {
        e.stopPropagation();
        const query = `kup ${name} ceneo allegro`;
        window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
    };

    useEffect(() => {
        axios.get(`${API_URL}/recipes`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => setRecipes(res.data));
    }, []);

    const [omega3Item, setOmega3Item] = useState(null);

    const generateList = async () => {
        if (selectedRecipes.length === 0) return;
        const res = await axios.post(`${API_URL}/shopping-list`, {
            recipeIds: selectedRecipes
        }, { headers: { Authorization: `Bearer ${token}` } });
        setAggregatedList(res.data.items);
        setOmega3Item(res.data.omega3Item);
    };

    const toggleRecipe = (id) => {
        setSelectedRecipes(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleCheck = (name) => {
        setCheckedItems(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const printList = async () => {
        if (aggregatedList.length === 0 && !omega3Item) return;

        const toBase64 = async (url) => {
            try {
                const res = await fetch(url);
                const blob = await res.blob();
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(blob);
                });
            } catch { return ''; }
        };

        const [logoB64, catB64] = await Promise.all([
            toBase64('/assets/ibarf-logo.png'),
            toBase64('/assets/maine-coon-bg.png'),
        ]);

        const itemsRows = aggregatedList.map(item => {
            return `<tr>
                <td style="border:0.3pt solid #e0e4d8;padding:2mm 3mm;font-size:8pt;font-weight:700;color:#2d3436;text-transform:uppercase">${item.name}</td>
                <td style="border:0.3pt solid #e0e4d8;padding:2mm 3mm;font-size:7.5pt;color:#8a9a7a;text-align:center;text-transform:uppercase">${item.category}</td>
                <td style="border:0.3pt solid #e0e4d8;padding:2mm 3mm;font-size:11pt;font-weight:900;color:#6b7c49;text-align:right">${item.needed.toFixed(1)} <span style="font-size:7pt;opacity:0.6;font-weight:600">G</span></td>
            </tr>`;
        }).join('');

        let omega3Section = '';
        if (omega3Item && omega3Item.needed > 0) {
            omega3Section = `<tr>
                <td style="border:0.3pt solid #e0e4d8;padding:2mm 3mm;font-size:8pt;font-weight:700;color:#2d3436;text-transform:uppercase">${omega3Item.name}</td>
                <td style="border:0.3pt solid #e0e4d8;padding:2mm 3mm;font-size:7.5pt;color:#8a9a7a;text-align:center;text-transform:uppercase">${omega3Item.category}</td>
                <td style="border:0.3pt solid #e0e4d8;padding:2mm 3mm;font-size:11pt;font-weight:900;color:#6b7c49;text-align:right">${omega3Item.needed.toFixed(1)} <span style="font-size:7pt;opacity:0.6;font-weight:600">G</span></td>
            </tr>`;
        }

        const html = `<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="UTF-8">
<title>Lista Zakupów BARF</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700;800;900&display=swap');
  @page { margin: 0; size: A4; }
  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
  body { font-family: 'Source Sans 3', Arial, sans-serif; color: #1a1a1a; background: white; font-size: 10pt; }
  .header { background: #3A3F33; color: white; padding: 8mm 12mm 6mm; display: flex; justify-content: space-between; align-items: center; }
  .header-left { display: flex; align-items: center; gap: 6mm; }
  .header img { width: 28mm; height: auto; opacity: 0.9; }
  .header h1 { font-size: 18pt; font-weight: 900; text-transform: uppercase; letter-spacing: -0.02em; color: white; }
  .header-sub { font-size: 7pt; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.55); margin-bottom: 1mm; }
  .header-right { text-align: right; font-size: 7.5pt; color: rgba(255,255,255,0.6); line-height: 1.7; }
  .content { padding: 10mm 12mm; position: relative; }
  .section-title { font-size: 7pt; font-weight: 800; text-transform: uppercase; letter-spacing: 0.2em; color: #6b7c49; border-bottom: 0.5pt solid #c8d0b8; padding-bottom: 2mm; margin-bottom: 6mm; display: flex; align-items: center; gap: 2mm; }
  table { width: 100%; border-collapse: collapse; position: relative; z-index: 10; }
  th { background: #3A3F33; color: white; padding: 3mm; font-size: 7pt; font-weight: 700; text-align: left; text-transform: uppercase; border: 0.3pt solid #555; }
  .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 140mm; opacity: 0.08; pointer-events: none; z-index: 1; }
  .footer { margin-top: 15mm; padding-top: 5mm; border-top: 0.5pt solid #c8d0b8; text-align: center; font-size: 7pt; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #8a9a7a; }
</style>
</head>
<body>
<div class="header">
  <div class="header-left">
    <img src="${logoB64}" alt="iBarf Logo">
    <div>
      <div class="header-sub">ibarf.pl &bull; Inwentarz Materiałowy</div>
      <h1>Lista Zakupów</h1>
    </div>
  </div>
  <div class="header-right">
    Data: ${new Date().toLocaleDateString('pl-PL')}<br>
    Wygenerowano dla ${selectedRecipes.length} receptur
  </div>
</div>
<div class="content">
  <img src="${catB64}" class="watermark" alt="">
  <div class="section-title">▪ Elementy do nabycia</div>
  <table>
    <thead>
      <tr>
        <th style="width: 50%">Składnik</th>
        <th style="text-align:center">Kategoria</th>
        <th style="text-align:right">Ilość potrzebna</th>
      </tr>
    </thead>
    <tbody>
      ${itemsRows}
      ${omega3Section}
    </tbody>
  </table>
  <div class="footer">ibarf.pl &bull; Darmowy Kalkulator BARF &bull; Najlepsze wsparcie dietetyczne dla Twojego kota</div>
</div>
</body>
</html>`;

        const win = window.open('', '_blank', 'width=900,height=700');
        win.document.write(html);
        win.document.close();
        win.focus();
        setTimeout(() => { win.print(); win.close(); }, 800);
    };

    return (
        <div className="min-h-screen bg-ui-bg pt-24 md:pt-32 pb-20 px-4 md:px-6 max-w-[1600px] mx-auto overflow-x-hidden w-full">
            <div className="grid grid-cols-12 gap-6 md:gap-10 w-full">
                {/* Left: Recipe Multi-Selector */}
                <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-ui-accent/10 p-2.5 rounded-xl shadow-lg border border-ui-accent/20">
                                <Layers className="text-ui-accent w-5 h-5" />
                            </div>
                            <span className="ui-subheading">Konsolidacja</span>
                        </div>
                        <h2 className="ui-heading !text-3xl md:!text-6xl mb-8">Agregator</h2>
                        <p className="text-ui-muted text-sm font-medium opacity-60 italic mb-10">
                            Wybierz receptury ze skarbca, aby wygenerować skumulowaną listę zakupów.
                        </p>
                    </motion.div>

                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                        {recipes.map((recipe, idx) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={recipe.id}
                                onClick={() => toggleRecipe(recipe.id)}
                                className={`p-6 rounded-[2.5rem] border transition-all duration-300 relative overflow-hidden group cursor-pointer
                                    ${selectedRecipes.includes(recipe.id)
                                        ? 'bg-ui-accent text-ui-bg border-ui-accent shadow-[0_0_40px_rgba(56,189,248,0.3)]'
                                        : 'bg-white/5 border-ui-border hover:border-ui-accent/30 text-ui-text'}`}
                            >
                                <div className="flex justify-between items-center relative z-10">
                                    <div className="flex-1 min-w-0 pr-4">
                                        <div className={`text-[9px] font-black uppercase tracking-widest mb-2 ${selectedRecipes.includes(recipe.id) ? 'text-ui-bg opacity-40' : 'text-ui-accent'}`}>Archive Item</div>
                                        <div className="font-black text-lg md:text-xl tracking-tighter leading-none mb-2 truncate uppercase">{recipe.name}</div>
                                        <div className={`text-[10px] font-bold flex items-center gap-2 uppercase tracking-wide opacity-50`}>
                                            {recipe.totalWeight.toFixed(0)}g • {new Date(recipe.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl
                                        ${selectedRecipes.includes(recipe.id) ? 'bg-ui-bg text-ui-accent rotate-12' : 'bg-white/5 text-ui-muted border border-white/10'}`}>
                                        {selectedRecipes.includes(recipe.id) ? <CheckCircle2 className="w-6 h-6" /> : <div className="w-4 h-4 rounded-full border-2 border-current opacity-20" />}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <button
                        onClick={generateList}
                        disabled={selectedRecipes.length === 0}
                        className="w-full bg-white text-black px-12 py-6 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-ui-accent hover:text-white transition-all shadow-[0_20px_40px_-10px_rgba(255,255,255,0.2)] flex items-center justify-center gap-4 disabled:opacity-20 disabled:cursor-not-allowed group active:scale-95"
                    >
                        Generuj Listę Zakupów <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* Right: Aggregated Master List */}
                <div className="col-span-12 lg:col-span-8 flex flex-col no-print">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="ui-glass-card min-h-[750px] flex flex-col group/list relative"
                    >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8 mb-10 md:mb-16 relative z-10">
                            <div>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="bg-ui-accent/10 p-2.5 rounded-xl shadow-lg border border-ui-accent/20">
                                        <ShoppingBag className="text-ui-accent w-5 h-5" />
                                    </div>
                                    <span className="ui-subheading">Inwentarz Materiałowy</span>
                                </div>
                                <h2 className="ui-heading !text-3xl md:!text-6xl">Lista Zakupów</h2>
                                <p className="text-ui-muted mt-4 font-medium italic opacity-60">Zoptymalizowane zestawienie dla zakupów</p>
                            </div>
                            {(aggregatedList.length > 0 || omega3Item) && (
                                <button onClick={printList} className="flex items-center gap-4 bg-white text-black px-10 py-5 rounded-2xl font-black shadow-2xl hover:bg-ui-accent hover:text-white transition-all text-xs uppercase tracking-widest active:scale-95 group/print">
                                    <Printer className="w-5 h-5 group-hover/print:scale-110 transition-transform" /> Drukuj Raport
                                </button>
                            )}
                        </div>

                        <div className="space-y-4 relative z-10 flex-1 overflow-y-auto pr-4 custom-scrollbar">
                            <AnimatePresence mode="popLayout">
                                {aggregatedList.map((item, idx) => (
                                    <motion.div
                                        key={item.name}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: idx * 0.03 }}
                                        onClick={() => toggleCheck(item.name)}
                                        className={`flex justify-between items-center p-6 rounded-[2.5rem] border transition-all duration-300 cursor-pointer group/item
                                            ${checkedItems[item.name]
                                                ? 'bg-ui-success/5 border-ui-success/20 opacity-40 '
                                                : 'bg-white/5 border-ui-border hover:border-ui-accent/30 hover:bg-white/10'}`}
                                    >
                                        <div className="flex items-center gap-4 md:gap-8">
                                            <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all duration-500
                                                ${checkedItems[item.name]
                                                    ? 'bg-ui-success border-ui-success text-white scale-90 rotate-12'
                                                    : 'bg-black/20 border-white/5 text-ui-muted/20 group-hover/item:text-ui-accent group-hover/item:border-ui-accent/30'}`}>
                                                {checkedItems[item.name] ? <CheckSquare className="w-5 h-5 md:w-6 md:h-6" /> : <Square className="w-5 h-5 md:w-6 md:h-6" />}
                                            </div>
                                            <div>
                                                <div className={`text-[9px] uppercase tracking-[0.3em] font-black mb-1 md:mb-2 transition-colors ${checkedItems[item.name] ? 'text-ui-success' : 'text-ui-accent'}`}>{item.category}</div>
                                                <div className={`text-lg md:text-2xl font-black tracking-tighter uppercase transition-all ${checkedItems[item.name] ? 'line-through opacity-40' : 'text-ui-text'}`}>{item.name}</div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <div className={`text-2xl md:text-4xl font-black italic tracking-tighter flex items-baseline gap-2 transition-all ${checkedItems[item.name] ? 'opacity-30' : 'text-ui-text'}`}>
                                                {item.needed.toFixed(1)} <span className="text-sm font-bold opacity-30 not-italic uppercase tracking-widest text-ui-accent">g</span>
                                            </div>
                                            <div className="flex gap-2 items-center">
                                                {isBuyable(item) && (
                                                    <button
                                                        onClick={(e) => handleBuy(e, item.name)}
                                                        className="text-[10px] font-black uppercase bg-ui-accent text-ui-bg px-4 py-1.5 rounded-xl hover:bg-white hover:text-ui-bg transition-all flex items-center gap-2 group/buy shadow-lg shadow-ui-accent/10 hover:shadow-ui-accent/20 active:scale-95 transform"
                                                    >
                                                        <ExternalLink size={12} className="group-hover/buy:rotate-12 transition-transform" /> Kup produkt
                                                    </button>
                                                )}
                                                {item.inStock > 0 && (
                                                    <div className="text-[9px] font-black uppercase text-ui-success/60 bg-ui-success/5 px-2 py-0.5 rounded-full border border-ui-success/10">
                                                        W magazynie: {item.inStock.toFixed(1)}g
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {/* Omega 3 Lunderland - wyliczony suplement */}
                            {omega3Item && omega3Item.needed > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={() => toggleCheck('__omega3__')}
                                    className={`flex justify-between items-center p-6 rounded-[2.5rem] border transition-all duration-300 cursor-pointer group/item
                                        ${checkedItems['__omega3__']
                                            ? 'bg-ui-success/5 border-ui-success/20 opacity-40'
                                            : 'bg-ui-accent/5 border-ui-accent/20 hover:border-ui-accent/40 hover:bg-ui-accent/10'}`}
                                >
                                    <div className="flex items-center gap-4 md:gap-8">
                                        <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all duration-500
                                            ${checkedItems['__omega3__']
                                                ? 'bg-ui-success border-ui-success text-white scale-90 rotate-12'
                                                : 'bg-black/20 border-ui-accent/30 text-ui-accent'}`}>
                                            {checkedItems['__omega3__'] ? <CheckSquare className="w-5 h-5 md:w-6 md:h-6" /> : <Square className="w-5 h-5 md:w-6 md:h-6" />}
                                        </div>
                                        <div>
                                            <div className="text-[9px] uppercase tracking-[0.3em] font-black mb-1 md:mb-2 text-ui-accent">Suplement zalecany</div>
                                            <div className="text-lg md:text-2xl font-black tracking-tighter uppercase text-ui-text">Lunderland Omega 3</div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <div className={`text-2xl md:text-4xl font-black italic tracking-tighter flex items-baseline gap-2 transition-all ${checkedItems['__omega3__'] ? 'opacity-30' : 'text-ui-text'}`}>
                                            {omega3Item.needed.toFixed(1)} <span className="text-sm font-bold opacity-30 not-italic uppercase tracking-widest text-ui-accent">g</span>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <button
                                                onClick={(e) => handleBuy(e, 'Lunderland Omega 3')}
                                                className="text-[10px] font-black uppercase bg-ui-accent text-ui-bg px-4 py-1.5 rounded-xl hover:bg-white hover:text-ui-bg transition-all flex items-center gap-2 group/buy shadow-lg shadow-ui-accent/10 hover:shadow-ui-accent/20 active:scale-95 transform"
                                            >
                                                <ExternalLink size={12} className="group-hover/buy:rotate-12 transition-transform" /> Kup produkt
                                            </button>
                                            {omega3Item.inStock > 0 && (
                                                <div className="text-[9px] font-black uppercase text-ui-success/60 bg-ui-success/5 px-2 py-0.5 rounded-full border border-ui-success/10">
                                                    W magazynie: {omega3Item.inStock.toFixed(1)}g
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {aggregatedList.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-40 opacity-10">
                                    <ShoppingCart size={150} className="mb-8" />
                                    <p className="text-3xl font-black uppercase tracking-[0.2em] italic">Waiting for input...</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ShoppingList;
