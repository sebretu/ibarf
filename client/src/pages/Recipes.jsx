import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    BookOpen, Calendar, Trash2, ArrowRightCircle,
    ChevronRight, ExternalLink, Filter, Grid, ArrowRight, X, Printer
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import RecipeExcelTable from '../components/RecipeExcelTable';
import logo from '../assets/logo.png';

const API_URL = '/api';

const Recipes = ({ token }) => {
    const [recipes, setRecipes] = useState([]);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [selectedRecipeAnalysis, setSelectedRecipeAnalysis] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    useEffect(() => {
        fetchRecipes();
    }, []);

    const fetchRecipes = async () => {
        const res = await axios.get(`${API_URL}/recipes`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setRecipes(res.data);
    };

    const fetchRecipeDetails = async (id) => {
        setIsLoadingDetails(true);
        setSelectedRecipeAnalysis(null);
        try {
            const res = await axios.get(`/api/recipes/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedRecipe(res.data.recipe);
            setSelectedRecipeAnalysis(res.data.analysis);
        } catch (e) {
            console.error('Failed to fetch recipe details', e);
            alert('Błąd pobierania detali receptury');
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const deleteRecipe = async (id) => {
        if (!id) return;

        console.info('[CLICK] Delete triggered for', id);
        if (window.remoteLog) window.remoteLog({ type: 'info', message: 'Delete triggered (no confirm)', id });

        setDeletingId(id);
        try {
            await axios.delete(`/api/recipes/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRecipes(prev => prev.filter(r => r.id !== id));
            if (selectedRecipe && selectedRecipe.id === id) {
                setSelectedRecipe(null);
                setSelectedRecipeAnalysis(null);
            }
            alert('RECEPTURA USUNIĘTA!');
        } catch (e) {
            console.error('Delete error:', e);
            alert('Błąd serwera: ' + (e.response?.data?.error || e.message));
        } finally {
            setDeletingId(null);
        }
    };

    const handlePrint = async () => {
        if (!selectedRecipe || !selectedRecipeAnalysis) return;

        const { totals, norms, ratios, ingredientDetails } = selectedRecipeAnalysis;
        const days = selectedRecipe.meatWeight > 0
            ? (selectedRecipe.meatWeight / (selectedRecipe.catWeight * 25)).toFixed(1)
            : '–';
        const dailyPortion = days !== '–'
            ? (selectedRecipe.totalWeight / parseFloat(days)).toFixed(0)
            : '–';
        const date = new Date(selectedRecipe.createdAt).toLocaleDateString('pl-PL');

        const fmt = (v) => {
            if (v === undefined || v === null || isNaN(v) || v === 0) return '–';
            return Number(v).toLocaleString('pl-PL', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
        };

        const NUTRIENT_ROWS = [
            { label: 'Waga', key: 'weight', unit: 'g' },
            { label: 'Energia', key: 'energy', unit: 'kcal' },
            { label: 'Białko', key: 'protein', unit: 'g' },
            { label: 'Tłuszcz', key: 'fat', unit: 'g' },
            { label: 'Woda', key: 'water', unit: 'g' },
            { label: 'Węglowodany', key: 'carbohydrates', unit: 'g' },
            { label: 'Błonnik', key: 'fiber', unit: 'g' },
            { label: 'Wapń (Ca)', key: 'calcium', unit: 'mg' },
            { label: 'Fosfor (P)', key: 'phosphorus', unit: 'mg' },
            { label: 'Ca:P', key: 'caP', unit: '', isRatio: true },
            { label: 'Magnez (Mg)', key: 'magnesium', unit: 'mg' },
            { label: 'Sód (Na)', key: 'sodium', unit: 'mg' },
            { label: 'Potas (K)', key: 'potassium', unit: 'mg' },
            { label: 'K:Na', key: 'kNa', unit: '', isRatio: true },
            { label: 'Żelazo (Fe)', key: 'iron', unit: 'mg' },
            { label: 'Cynk (Zn)', key: 'zinc', unit: 'mg' },
            { label: 'Miedź (Cu)', key: 'copper', unit: 'mg' },
            { label: 'Jod (I)', key: 'iodine', unit: 'µg' },
            { label: 'Selen (Se)', key: 'selenium', unit: 'µg' },
            { label: 'Tauryna', key: 'taurine', unit: 'mg' },
            { label: 'Wit. A', key: 'vitaminA', unit: 'I.E.' },
            { label: 'Wit. D', key: 'vitaminD', unit: 'I.E.' },
            { label: 'Wit. E', key: 'vitaminE', unit: 'I.E.' },
            { label: 'Wit. B1', key: 'vitaminB1', unit: 'mg' },
            { label: 'Wit. B12', key: 'vitaminB12', unit: 'µg' },
            { label: 'Kwas lin.', key: 'omega6Linoleic', unit: 'g' },
        ];

        const dryMatter = (totals.weight || 0) - (totals.water || 0);
        const getTotalVal = (row) => {
            if (row.isRatio) return fmt(ratios[row.key]);
            const v = totals[row.key];
            if (v === undefined) return '–';
            if (row.key === 'protein') return `${fmt(v)} (${fmt(dryMatter > 0 ? v / dryMatter * 100 : 0)}%)`;
            if (row.key === 'fat') return `${fmt(v)} (${fmt(dryMatter > 0 ? v / dryMatter * 100 : 0)}%)`;
            if (row.key === 'water') return `${fmt(v)} (${fmt(totals.weight > 0 ? v / totals.weight * 100 : 0)}%)`;
            if (row.key === 'carbohydrates') return `${fmt(v)} (${fmt(dryMatter > 0 ? v / dryMatter * 100 : 0)}%)`;
            return fmt(v);
        };
        const getNormVal = (row) => {
            if (row.isRatio) { return row.key === 'caP' ? '1,15' : row.key === 'kNa' ? '1,20–1,80' : '–'; }
            const macros = { protein: '50–65%', fat: '20–38%', water: '72–75%', carbohydrates: '0–5%' };
            if (macros[row.key]) return macros[row.key];
            return norms && norms[row.key] ? fmt(norms[row.key]) : '–';
        };

        const ingRows = (selectedRecipe.items || []).map((item) => {
            const isCap = (item.ingredient.name || '').toLowerCase().includes('kapsułk') ||
                (item.ingredient.name || '').toLowerCase().includes('tablet');
            return `<div style="display:flex;justify-content:space-between;align-items:center;padding:2.5mm 3mm;border:0.5pt solid #e0e4d8;border-radius:2mm;background:#fafaf7;page-break-inside:avoid">
                <div>
                    <div style="font-size:6pt;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:#8a9a7a">${item.ingredient.category || ''}</div>
                    <div style="font-size:8.5pt;font-weight:700;color:#2d3436">${item.ingredient.name || ''}</div>
                </div>
                <div style="text-align:right">
                    <div style="font-size:12pt;font-weight:900;color:#6b7c49">${item.amount}</div>
                    <div style="font-size:6pt;color:#8a9a7a">${isCap ? 'szt.' : 'g'}</div>
                </div>
            </div>`;
        }).join('');

        const tableHead = `<tr>
            <th style="background:#3A3F33;color:white;padding:1.5mm 2mm;text-align:left;font-size:6pt;border:0.3pt solid #555;text-transform:uppercase">Składnik</th>
            <th style="background:#3A3F33;color:white;padding:1.5mm 2mm;text-align:center;font-size:6pt;border:0.3pt solid #555">Jedn.</th>
            <th style="background:#3A3F33;color:white;padding:1.5mm 2mm;text-align:right;font-size:6pt;border:0.3pt solid #555">Norma</th>
            <th style="background:#3A3F33;color:white;padding:1.5mm 2mm;text-align:right;font-size:6pt;border:0.3pt solid #555">Suma</th>
        </tr>`;
        const tableBody = NUTRIENT_ROWS.map((row, ri) => {
            const bg = ri % 2 === 0 ? 'white' : '#f4f5ef';
            return `<tr>
                <td style="border:0.3pt solid #e0e4d8;padding:.8mm 1.5mm;font-weight:700;font-size:7pt;background:${bg};white-space:nowrap">${row.label}</td>
                <td style="border:0.3pt solid #e0e4d8;padding:.8mm 1.5mm;text-align:center;font-size:6.5pt;background:${bg};color:#8a9a7a">${row.unit}</td>
                <td style="border:0.3pt solid #e0e4d8;padding:.8mm 1.5mm;text-align:right;font-size:7pt;background:${bg};color:#6b7c49;font-weight:600">${getNormVal(row)}</td>
                <td style="border:0.3pt solid #e0e4d8;padding:.8mm 1.5mm;text-align:right;font-size:7pt;background:#eef2e8;font-weight:900;color:#3A3F33">${getTotalVal(row)}</td>
            </tr>`;
        }).join('');

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

        const html = `<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="UTF-8">
<title>Receptura BARF - ${selectedRecipe.name}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700;800;900&display=swap');
  @page { margin: 0; size: A4; }
  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
  body {
    font-family: 'Source Sans 3', Arial, sans-serif;
    color: #1a1a1a;
    background: white;
    font-size: 10pt;
  }
  .header {
    background: #3A3F33;
    color: white;
    padding: 8mm 12mm 6mm;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .header-left { display: flex; align-items: center; gap: 6mm; }
  .header img { width: 28mm; height: auto; opacity: 0.9; }
  .header h1 { font-size: 18pt; font-weight: 900; text-transform: uppercase; letter-spacing: -0.02em; color: white; }
  .header-sub { font-size: 7pt; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.55); margin-bottom: 1mm; }
  .header-right { text-align: right; font-size: 7.5pt; color: rgba(255,255,255,0.6); line-height: 1.7; }
  .stats { background: #f4f5ef; display: flex; border-bottom: 0.5pt solid #c8d0b8; }
  .stat { flex: 1; padding: 3mm 4mm; border-right: 0.5pt solid #c8d0b8; }
  .stat:last-child { border-right: none; }
  .stat-label { font-size: 5.5pt; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; color: #6b7c49; margin-bottom: 0.5mm; }
  .stat-value { font-size: 13pt; font-weight: 900; color: #3A3F33; }
  .stat-unit { font-size: 6.5pt; color: #8a9a7a; margin-left: 1mm; }
  .content { padding: 6mm 12mm; }
  .section-title { font-size: 6.5pt; font-weight: 800; text-transform: uppercase; letter-spacing: 0.2em; color: #6b7c49; border-bottom: 0.5pt solid #c8d0b8; padding-bottom: 1.5mm; margin-bottom: 4mm; margin-top: 6mm; }
  .ing-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 2mm; }
  table { width: 100%; border-collapse: collapse; page-break-inside: auto; }
  thead { display: table-header-group; }
  tr { page-break-inside: avoid; }
  .footer { margin-top: 8mm; padding-top: 4mm; border-top: 0.5pt solid #c8d0b8; text-align: center; font-size: 7pt; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #8a9a7a; }
</style>
</head>
<body>
<div class="header">
  <div class="header-left">
    <img src="${logoB64}" alt="iBarf Logo">
    <div>
      <div class="header-sub">ibarf.pl &bull; Receptura BARF</div>
      <h1>${selectedRecipe.name}</h1>
    </div>
  </div>
  <div class="header-right">
    Data: ${date}<br>
    Kot: ${selectedRecipe.catWeight} kg<br>
    Receptura na ${days} dni
  </div>
</div>
<div class="stats">
  <div class="stat"><div class="stat-label">Masa kota</div><div class="stat-value">${selectedRecipe.catWeight}<span class="stat-unit">kg</span></div></div>
  <div class="stat"><div class="stat-label">Receptura na</div><div class="stat-value">${days}<span class="stat-unit">dni</span></div></div>
  <div class="stat"><div class="stat-label">Porcja dzienna</div><div class="stat-value">${dailyPortion}<span class="stat-unit">g</span></div></div>
  <div class="stat"><div class="stat-label">Masa całkowita</div><div class="stat-value">${selectedRecipe.totalWeight.toFixed(0)}<span class="stat-unit">g</span></div></div>
  <div class="stat"><div class="stat-label">Masa mięsa</div><div class="stat-value">${selectedRecipe.meatWeight.toFixed(0)}<span class="stat-unit">g</span></div></div>
</div>
<div class="content">
  <div class="section-title">▪ Składniki Mieszanki</div>
  <div class="ing-grid">${ingRows}</div>
  <div style="text-align:center;margin:6mm 0 4mm;opacity:0.22;page-break-inside:avoid">
    <img src="${catB64}" alt="" style="max-height:120mm;max-width:100%;object-fit:contain;display:inline-block">
  </div>
  <div class="section-title" style="margin-top:2mm;page-break-before:always">▪ Pełna Analiza Wartości Odżywczych</div>
  <table><thead>${tableHead}</thead><tbody>${tableBody}</tbody></table>
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
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 md:gap-8 mb-10 md:mb-16 px-4 no-print">
                <motion.div initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-ui-accent/10 p-2.5 rounded-xl shadow-lg border border-ui-accent/20">
                            <BookOpen className="text-ui-accent w-5 h-5" />
                        </div>
                        <span className="ui-subheading">Cyfrowe Archiwum</span>
                    </div>
                    <h1 className="ui-heading !text-4xl md:!text-7xl">Skarbiec Receptur</h1>
                    <p className="text-ui-muted mt-4 font-medium max-w-2xl leading-relaxed italic opacity-60">
                        Twoja kolekcja precyzyjnie zbilansowanych posiłków BARF, zaprojektowanych dla optymalnego rozwoju Twoich milusińskich.
                    </p>
                </motion.div>

                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    <Link to="/" className="bg-white text-ui-bg px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-ui-accent hover:text-ui-text transition-all shadow-[0_20px_40px_-10px_rgba(255,255,255,0.2)] flex items-center gap-3 group">
                        Nowa Receptura <ArrowRightCircle className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 no-print">
                {recipes.map((recipe, idx) => (
                    <div
                        key={recipe.id}
                        className="ui-glass-card group flex flex-col h-full hover:border-ui-accent/40 transition-all duration-500 relative z-10"
                    >
                        <div className="flex justify-between items-start mb-10 overflow-hidden">
                            <div className="flex flex-col">
                                <span className="ui-subheading mb-2">Recipe Profile</span>
                                <div className="flex items-center gap-2 text-[10px] text-ui-muted font-bold uppercase tracking-widest opacity-40">
                                    <Calendar className="w-3.5 h-3.5" /> {new Date(recipe.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="p-3 bg-ui-text/5 rounded-2xl group-hover:bg-ui-accent transition-all duration-500 group-hover:translate-y-[-4px]">
                                <Grid className="w-5 h-5 text-ui-muted group-hover:text-ui-bg transition-colors" />
                            </div>
                        </div>

                        <h3 className="text-2xl font-black mb-8 text-ui-text uppercase tracking-tighter leading-none group-hover:text-ui-accent transition-colors truncate">
                            {recipe.name}
                        </h3>

                        <div className="space-y-4 mb-10 flex-1">
                            <div className="bg-ui-text/5 p-4 rounded-2xl border border-ui-border flex justify-between items-center group/item hover:border-ui-accent/30 transition-all">
                                <span className="ui-subheading !text-[9px]">Masa Kota</span>
                                <span className="text-xl font-black text-ui-text tracking-tight">{recipe.catWeight} <span className="text-[10px] opacity-30 font-bold">kg</span></span>
                            </div>
                            <div className="bg-ui-text/5 p-4 rounded-2xl border border-ui-border flex justify-between items-center group/item hover:border-ui-accent/30 transition-all">
                                <span className="ui-subheading !text-[9px]">Masa Mieszanki</span>
                                <span className="text-xl font-black text-ui-text tracking-tight">{recipe.totalWeight.toFixed(0)} <span className="text-[10px] opacity-30 font-bold">g</span></span>
                            </div>
                            <div className="bg-ui-text/5 p-4 rounded-2xl border border-ui-border flex justify-between items-center group/item hover:border-ui-accent/30 transition-all">
                                <span className="ui-subheading !text-[9px]">Białko Surowe</span>
                                <span className="text-xl font-black text-ui-accent tracking-tight">{recipe.meatWeight.toFixed(0)} <span className="text-[10px] opacity-30 font-bold text-ui-text">g</span></span>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-auto relative z-[60] pointer-events-auto">
                            <button
                                onClick={(e) => { e.stopPropagation(); fetchRecipeDetails(recipe.id); }}
                                className="flex-1 bg-ui-text/5 text-ui-text/50 px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] border border-ui-border hover:bg-white hover:text-ui-bg transition-all duration-300 flex items-center justify-center gap-2 group/btn cursor-pointer"
                                disabled={deletingId === recipe.id || isLoadingDetails}
                            >
                                {isLoadingDetails ? 'Pobieranie...' : 'Detale'} <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); deleteRecipe(recipe.id); }}
                                disabled={deletingId === recipe.id}
                                className={`w-14 h-14 flex items-center justify-center rounded-xl transition-all transform active:scale-95 border cursor-pointer relative z-[70] ${deletingId === recipe.id
                                    ? 'bg-ui-text/10 text-ui-text/20 border-ui-border'
                                    : 'bg-ui-danger/10 text-ui-danger/30 hover:bg-ui-danger hover:text-ui-text border-ui-danger/20'
                                    }`}
                                style={{ pointerEvents: 'auto' }}
                            >
                                {deletingId === recipe.id ? (
                                    <div className="w-5 h-5 border-2 border-ui-text/20 border-t-ui-text rounded-full animate-spin" />
                                ) : (
                                    <Trash2 className="w-6 h-6" />
                                )}
                            </button>
                        </div>
                    </div>
                ))}

                {recipes.length === 0 && (
                    <div className="col-span-full py-40 text-center ui-glass-card border-dashed flex flex-col items-center justify-center opacity-20">
                        <BookOpen className="w-20 h-20 mb-8" />
                        <p className="text-2xl font-black uppercase tracking-[0.2em]">Skarbiec jest pusty</p>
                        <p className="ui-subheading mt-2">Użyj kalkulatora aby stworzyć pierwszą recepturę</p>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {selectedRecipe && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedRecipe(null)}
                            className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 30 }}
                            className="print-modal relative w-full max-w-4xl max-h-[90vh] bg-ui-bg border border-ui-border rounded-[3rem] shadow-2xl overflow-hidden flex flex-col z-[10000]"
                        >
                            <div className="p-10 border-b border-ui-border flex justify-between items-start" style={{ position: 'relative' }}>
                                <div>
                                    {/* Print-only logo – hidden on screen, shown in branded header */}
                                    <img
                                        src={logo}
                                        alt="iBarf"
                                        style={{ display: 'none' }}
                                        className="print-logo"
                                    />
                                    <span className="ui-subheading mb-2">Detale Receptury</span>
                                    <h2 className="text-4xl font-black uppercase tracking-tighter text-ui-text">{selectedRecipe.name}</h2>
                                    <p className="text-ui-muted text-xs font-bold uppercase tracking-widest mt-2">{new Date(selectedRecipe.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="flex gap-4 no-print">
                                    <button
                                        onClick={handlePrint}
                                        className="p-4 bg-ui-accent text-white hover:bg-sky-600 transition-all rounded-2xl flex items-center gap-3 font-black text-sm px-8 shadow-xl"
                                    >
                                        <Printer size={20} /> DRUKUJ
                                    </button>
                                    <button
                                        onClick={() => deleteRecipe(selectedRecipe.id)}
                                        className="p-4 bg-ui-danger text-white hover:bg-red-600 transition-all rounded-2xl flex items-center gap-3 font-black text-sm px-8 shadow-xl"
                                    >
                                        <Trash2 size={20} /> SKASUJ TRWALE
                                    </button>
                                    <button onClick={() => setSelectedRecipe(null)} className="p-4 bg-ui-text/5 hover:bg-ui-text/10 transition-all rounded-2xl group">
                                        <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                                    <div className="bg-ui-text/5 p-6 rounded-3xl border border-ui-border print-visible">
                                        <span className="ui-subheading !text-[9px] print-visible">Masa Kota</span>
                                        <div className="text-3xl font-black text-ui-text mt-2">{selectedRecipe.catWeight}kg</div>
                                    </div>
                                    <div className="bg-ui-text/5 p-6 rounded-3xl border border-ui-border print-visible">
                                        <span className="ui-subheading !text-[9px] print-visible">Na Ile Dni</span>
                                        <div className="text-3xl font-black text-ui-text mt-2">
                                            {(selectedRecipe.meatWeight / (selectedRecipe.catWeight * 25)).toFixed(1)}
                                        </div>
                                    </div>
                                    <div className="bg-ui-text/5 p-6 rounded-3xl border border-ui-border print-visible">
                                        <span className="ui-subheading !text-[9px] print-visible">Waga Porcji Dz.</span>
                                        <div className="text-3xl font-black text-ui-text mt-2">
                                            {(selectedRecipe.totalWeight / (selectedRecipe.meatWeight / (selectedRecipe.catWeight * 25))).toFixed(0)}g
                                        </div>
                                    </div>
                                    <div className="bg-ui-text/5 p-6 rounded-3xl border border-ui-border print-visible">
                                        <span className="ui-subheading !text-[9px] print-visible">Masa Całkowita</span>
                                        <div className="text-3xl font-black text-ui-text mt-2">{selectedRecipe.totalWeight.toFixed(0)}g</div>
                                    </div>
                                    <div className="bg-ui-text/5 p-6 rounded-3xl border border-ui-border print-visible">
                                        <span className="ui-subheading !text-[9px] print-visible">Masa Mięsa</span>
                                        <div className="text-3xl font-black text-ui-accent mt-2">{selectedRecipe.meatWeight.toFixed(0)}g</div>
                                    </div>
                                </div>

                                <div className="print-visible">
                                    <h3 className="ui-subheading mb-6 print-visible">Składniki Mieszanki</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {selectedRecipe.items.map((item, idy) => (
                                            <div key={idy} className="flex items-center justify-between p-5 bg-ui-text/5 rounded-[2rem] border border-ui-border group hover:border-ui-accent/30 transition-all print:border-ui-border">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-black uppercase text-ui-muted tracking-widest">{item.ingredient.category}</span>
                                                    <span className="text-sm font-black text-ui-text">{item.ingredient.name}</span>
                                                </div>
                                                <div className="text-xl font-black text-ui-accent">
                                                    {item.amount}
                                                    <span className="text-[10px] opacity-30 text-ui-text ml-1">
                                                        {item.ingredient.name.toLowerCase().includes('kapsułk') || item.ingredient.name.toLowerCase().includes('tablet') ? 'SZT' : 'G'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {selectedRecipeAnalysis && (
                                    <div className="pt-8 border-t border-ui-border mt-8 print-visible">
                                        <h3 className="ui-subheading mb-6 print-visible">Pełna Analiza Przepisu</h3>
                                        <RecipeExcelTable analysis={selectedRecipeAnalysis} />
                                    </div>
                                )}

                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Recipes;
