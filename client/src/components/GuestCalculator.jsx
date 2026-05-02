import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight, ChevronLeft, Plus, CheckCircle,
    Search, ArrowRight, Printer, X, LayoutGrid, Cat
} from 'lucide-react';
import RecipeExcelTable from './RecipeExcelTable';
import logo from '../assets/logo.png';

const SearchableSelect = ({ value, onChange, options, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(o => o.id === value);
    const filteredOptions = options.filter(o =>
        o.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="relative w-full" ref={containerRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-ui-bg border border-ui-border rounded-[1.5rem] py-5 px-6 text-sm font-bold text-ui-text cursor-pointer flex justify-between items-center group/select hover:border-ui-accent/50 transition-all shadow-sm"
            >
                <span className={`truncate ${!selectedOption ? 'opacity-30' : ''}`}>
                    {selectedOption ? selectedOption.name : placeholder}
                </span>
                <ChevronRight className={`shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-90 text-ui-accent' : 'opacity-20'}`} size={16} />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute z-[10000] mt-2 left-0 right-0 bg-ui-card border border-ui-border rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.6)] overflow-hidden"
                    >
                        <div className="p-4 bg-ui-text/5 border-b border-ui-border">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ui-text/20" size={16} />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Wyszukaj..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-ui-bg border border-ui-border rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-ui-text outline-none focus:ring-1 focus:ring-ui-accent"
                                />
                            </div>
                        </div>
                        <div className="max-h-64 overflow-y-auto custom-scrollbar bg-ui-card">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map(opt => (
                                    <div
                                        key={opt.id}
                                        onClick={() => {
                                            onChange(opt.id);
                                            setIsOpen(false);
                                            setSearchTerm('');
                                        }}
                                        className={`py-4 px-6 text-xs font-bold cursor-pointer transition-all flex items-center justify-between
                                            ${opt.id === value ? 'bg-ui-accent text-ui-bg' : 'text-ui-text hover:bg-ui-accent/10 hover:pl-8'}`}
                                    >
                                        <span className="truncate">{opt.name}</span>
                                        {opt.id === value && <CheckCircle size={14} />}
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 px-6 text-xs font-bold opacity-30 italic text-center">Nie znaleziono</div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const GuestCalculator = ({ token }) => {
    const [loadingIngredients, setLoadingIngredients] = useState(true);
    const [meats, setMeats] = useState([]);
    const [vegs, setVegs] = useState([]);

    const [catWeight, setCatWeight] = useState('');
    const [activity, setActivity] = useState('średnia');
    const [days, setDays] = useState('');
    const [meatIds, setMeatIds] = useState(['']);
    const [vegId, setVegId] = useState('');

    const [loadingGenerate, setLoadingGenerate] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        const fetchIngs = async () => {
            try {
                const res = await axios.get('/api/ingredients');
                const all = res.data;
                setMeats(all.filter(i => i.category === 'Mieso'));
                setVegs(all.filter(i => i.category === 'Warzywa'));
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingIngredients(false);
            }
        };
        fetchIngs();
    }, []);

    const handleGenerate = async () => {
        const validMeatIds = meatIds.filter(id => id !== '');
        if (!catWeight || !days || validMeatIds.length === 0) {
            alert('Proszę wypełnić wszystkie wymagane pola formularza (waga, aktywność, dni, mięso).');
            return;
        }
        setLoadingGenerate(true);
        try {
            const res = await axios.post('/api/guest-calculator/generate', {
                catWeight, activity, days, meatIds: validMeatIds, vegetableId: vegId
            });
            setResult({ ...res.data, name: 'Przepis Szybki BARF', createdAt: new Date() });
            
            // Scroll to results seamlessly
            setTimeout(() => {
                document.getElementById('guest-result-section')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);

        } catch (e) {
            alert('Wystąpił błąd: ' + (e.response?.data?.error || e.message));
        } finally {
            setLoadingGenerate(false);
        }
    };

    const handleSaveRecipe = async () => {
        if (!result || !token) return;
        try {
            const itemsToSave = [];
            result.items.forEach(item => {
                // Ensure only components with a real ingredient ID are forwarded
                if (item.ingredient && item.ingredient.id && item.amount > 0) {
                    itemsToSave.push({ ingredientId: item.ingredient.id, amount: parseFloat(item.amount) || 0 });
                }
            });

            const submitData = {
                name: 'Szybki Przepis ' + new Date().toLocaleDateString(),
                catWeight: parseFloat(catWeight),
                items: itemsToSave
            };

            await axios.post('/api/recipes', submitData, { headers: { Authorization: `Bearer ${token}` } });
            
            alert('Sukces: Przepis został zdeponowany w Twoim skarbcu. Składniki zostały odjęte z magazynu, a braki wygenerują alert na Liście Zakupów.');
        } catch (e) {
            alert('Błąd zapisu: ' + (e.response?.data?.error || e.message));
        }
    };

    const handlePrintRecipe = async () => {
        if (!result) return;
        const selectedRecipe = result;
        const selectedRecipeAnalysis = result.analysis;

        const { totals, norms, ratios, ingredientDetails } = selectedRecipeAnalysis;
        const date = new Date().toLocaleDateString('pl-PL');
        const d = selectedRecipe.meatWeight > 0 ? (selectedRecipe.meatWeight / (selectedRecipe.catWeight * 25)).toFixed(1) : '–';
        const dailyPortion = d !== '–' ? (selectedRecipe.totalWeight / parseFloat(d)).toFixed(0) : '–';

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
            { label: 'Wapń (Ca)', key: 'calcium', unit: 'mg' },
            { label: 'Fosfor (P)', key: 'phosphorus', unit: 'mg' },
            { label: 'Ca:P', key: 'caP', unit: '', isRatio: true },
            { label: 'Magnez (Mg)', key: 'magnesium', unit: 'mg' },
            { label: 'Sód (Na)', key: 'sodium', unit: 'mg' },
            { label: 'Potas (K)', key: 'potassium', unit: 'mg' },
            { label: 'Żelazo (Fe)', key: 'iron', unit: 'mg' },
            { label: 'Jod (I)', key: 'iodine', unit: 'µg' },
            { label: 'Tauryna', key: 'taurine', unit: 'mg' },
            { label: 'Wit. A', key: 'vitaminA', unit: 'I.E.' },
            { label: 'Wit. D', key: 'vitaminD', unit: 'I.E.' },
            { label: 'Wit. E', key: 'vitaminE', unit: 'I.E.' },
        ];

        const getNormVal = (row) => {
            if (row.isRatio) { return row.key === 'caP' ? '1,15' : '–'; }
            return norms && norms[row.key] ? fmt(norms[row.key]) : '–';
        };
        const getTotalVal = (row) => {
            if (row.isRatio) return fmt(ratios[row.key]);
            return fmt(totals[row.key]);
        };

        const ingRows = selectedRecipe.items.map((item) => {
            const nameLower = (item.ingredient.name || '').toLowerCase();
            const isCap = nameLower.includes('kapsułk') || nameLower.includes('tablet');
            const isYolk = nameLower.includes('zoltko') || nameLower.includes('żółtko');
            let displayAmt, unit;
            if (isCap) { displayAmt = item.amount.toLocaleString('pl-PL'); unit = 'szt.'; }
            else if (isYolk) { const cnt = item._yolkCount || Math.round(item.amount / 17); displayAmt = cnt; unit = 'szt.'; }
            else { displayAmt = item.amount.toLocaleString('pl-PL'); unit = 'g'; }
            return `<div style="display:flex;justify-content:space-between;align-items:center;padding:3mm 4mm;border:0.5pt solid #e0e4d8;border-radius:2mm;background:#fafaf7;page-break-inside:avoid">
                <div style="font-size:11pt;font-weight:700;color:#2d3436">${item.ingredient.name || ''}</div>
                <div style="text-align:right">
                    <span style="font-size:15pt;font-weight:900;color:#6b7c49">${displayAmt}</span>
                    <span style="font-size:9pt;color:#8a9a7a;margin-left:1mm">${unit}</span>
                </div>
            </div>`;
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
<title>Receptura BARF</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700;800;900&display=swap');
  @page { margin: 0; size: A4; }
  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
  body { font-family: 'Source Sans 3', Arial, sans-serif; color: #1a1a1a; background: white; font-size: 12pt; }
  .header { background: #3A3F33; color: white; padding: 8mm 12mm 6mm; display: flex; justify-content: space-between; align-items: center; }
  .header-left { display: flex; align-items: center; gap: 6mm; }
  .header img { width: 30mm; height: auto; opacity: 0.9; }
  .header h1 { font-size: 20pt; font-weight: 900; text-transform: uppercase; color: white; }
  .header-right { text-align: right; font-size: 9pt; color: rgba(255,255,255,0.6); line-height: 1.7; }
  .stats { background: #f4f5ef; display: flex; border-bottom: 0.5pt solid #c8d0b8; }
  .stat { flex: 1; padding: 4mm 5mm; border-right: 0.5pt solid #c8d0b8; }
  .stat-label { font-size: 7pt; font-weight: 800; text-transform: uppercase; color: #6b7c49; }
  .stat-value { font-size: 16pt; font-weight: 900; color: #3A3F33; }
  .content { padding: 7mm 12mm; }
  .section-title { font-size: 8pt; font-weight: 800; text-transform: uppercase; color: #6b7c49; border-bottom: 0.5pt solid #c8d0b8; padding-bottom: 1.5mm; margin-bottom: 5mm; margin-top: 7mm; }
  .ing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2.5mm; }
  table { width: 100%; border-collapse: collapse; }
  th { background:#3A3F33;color:white;padding:2mm 3mm;text-align:left;font-size:8pt; border:0.3pt solid #555;}
  td { border:0.3pt solid #e0e4d8;padding:1.5mm 2.5mm;font-size:9pt;}
  .footer { margin-top: 8mm; padding-top: 4mm; border-top: 0.5pt solid #c8d0b8; text-align: center; font-size: 8pt; color: #8a9a7a; }
</style>
</head>
<body>
<div class="header">
  <div class="header-left">
    <img src="${logoB64}" alt="Logo">
    <div>
      <div style="font-size: 7pt; color: rgba(255,255,255,0.55);">ibarf.pl &bull; Szybka Receptura</div>
      <h1>${selectedRecipe.name}</h1>
    </div>
  </div>
  <div class="header-right">Data: ${date}<br>Kot: ${selectedRecipe.catWeight} kg<br>Na ${d} dni</div>
</div>
<div class="stats">
  <div class="stat"><div class="stat-label">Masa kota</div><div class="stat-value">${selectedRecipe.catWeight} kg</div></div>
  <div class="stat"><div class="stat-label">Dni</div><div class="stat-value">${d}</div></div>
  <div class="stat"><div class="stat-label">Porcja dzienna</div><div class="stat-value">${dailyPortion} g</div></div>
  <div class="stat"><div class="stat-label">Całkowita</div><div class="stat-value">${selectedRecipe.totalWeight.toFixed(0)} g</div></div>
  <div class="stat"><div class="stat-label">Mięso</div><div class="stat-value">${selectedRecipe.meatWeight.toFixed(0)} g</div></div>
</div>
<div class="content">
  <div class="section-title">▪ Składniki Mieszanki</div>
  <div class="ing-grid">${ingRows}</div>
  
  <div class="section-title" style="margin-top:8mm">▪ Skrócona Analiza Wartości</div>
  <table>
    <tr><th>Parametr</th><th>Norma</th><th>Suma</th></tr>
    ${NUTRIENT_ROWS.map((row, i) => `<tr style="background: ${i % 2 === 0 ? 'white' : '#f4f5ef'}">
      <td style="font-weight:700">${row.label} ${row.unit}</td>
      <td style="text-align:right;color:#6b7c49;font-weight:700">${getNormVal(row)}</td>
      <td style="text-align:right;font-weight:900;font-size:11pt">${getTotalVal(row)}</td>
    </tr>`).join('')}
  </table>
  <div style="text-align:center;margin:6mm 0;opacity:0.1;page-break-inside:avoid"><img src="${catB64}" style="max-height:80mm"></div>
  <div class="footer">ibarf.pl &bull; Szybki Kalkulator</div>
</div>
</body>
</html>`;

        const win = window.open('', '_blank', 'width=900,height=700');
        win.document.write(html);
        win.document.close();
        win.focus();
        setTimeout(() => { win.print(); win.close(); }, 800);
    };

    const handlePrintList = async () => {
        if (!result) return;
        
        const toBase64 = async (url) => {
            try {
                const res = await fetch(url);
                const blob = await res.blob();
                return new Promise((resolve) => {
                    const r = new FileReader();
                    r.onloadend = () => resolve(r.result);
                    r.readAsDataURL(blob);
                });
            } catch { return ''; }
        };

        const [logoB64, catB64] = await Promise.all([
            toBase64('/assets/ibarf-logo.png'),
            toBase64('/assets/maine-coon-bg.png')
        ]);

        const itemsRows = result.items
            .filter(item => (item.ingredient.category || '').toLowerCase() !== 'wypełniacz')
            .map(item => {
                const nameLower = (item.ingredient.name || '').toLowerCase();
                const isCap = nameLower.includes('kapsułk') || nameLower.includes('tablet');
                const isYolk = nameLower.includes('zoltko') || nameLower.includes('żółtko');
                const isOmega = item.ingredient._isOmega3;
                let displayAmt, unit;
                if (isCap) { displayAmt = item.amount.toLocaleString('pl-PL'); unit = 'SZT'; }
                else if (isYolk) { const cnt = item._yolkCount || Math.round(item.amount / 17); displayAmt = cnt; unit = 'SZT'; }
                else { displayAmt = item.amount.toLocaleString('pl-PL', {maximumFractionDigits: 0}); unit = 'G'; }
                const bg = isOmega ? '#e8f4fd' : 'white';
                const nameColor = isOmega ? '#1a7ab5' : '#2d3436';
                return `<tr style="background:${bg}">
                    <td style="border:0.3pt solid #e0e4d8;padding:3mm 4mm;font-size:11pt;font-weight:700;color:${nameColor}">${item.ingredient.name}</td>
                    <td style="border:0.3pt solid #e0e4d8;padding:3mm 4mm;font-size:13pt;font-weight:900;color:#6b7c49;text-align:right">${displayAmt} <span style="font-size:9pt;opacity:0.6;font-weight:600">${unit}</span></td>
                </tr>`;
            }).join('');

        const html = `<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700;800;900&display=swap');
  @page { margin: 0; size: A4; }
  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
  body { font-family: 'Source Sans 3', Arial, sans-serif; }
  .header { background: #3A3F33; color: white; padding: 8mm 12mm 6mm; display: flex; justify-content: space-between; align-items: center; }
  .header img { width: 32mm; }
  .header h1 { font-size: 22pt; text-transform: uppercase; margin-left: 6mm; font-weight: 900;}
  .content { padding: 10mm 14mm; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #3A3F33; color: white; padding: 4mm; font-size: 10pt; text-align: left; text-transform: uppercase; border: 0.3pt solid #555; }
  .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 140mm; opacity: 0.08; pointer-events: none; z-index: -1; }
</style>
</head>
<body>
<div class="header">
  <div style="display:flex; align-items:center;">
    <img src="${logoB64}">
    <h1>Lista Zakupów</h1>
  </div>
</div>
<div class="content">
  <img src="${catB64}" class="watermark">
  <table>
    <thead><tr><th>Składnik</th><th style="text-align:right">Ilość potrzebna</th></tr></thead>
    <tbody>${itemsRows}</tbody>
  </table>
</div>
</body></html>`;

        const win = window.open('', '_blank', 'width=900,height=700');
        win.document.write(html);
        win.document.close();
        win.focus();
        setTimeout(() => { win.print(); win.close(); }, 800);
    };

    const renderGauge = (label, key, unit = 'mg') => {
        if (!result || !result.analysis || !result.analysis.analysis[key]) return null;
        const info = result.analysis.analysis[key];
        const { value, norm } = info;

        // Always compute status from the REAL total (value = totals[key]) vs norm
        // This avoids the Tier1 "adjusted" percentage which strips base meat nutrients
        const realPct = norm > 0 ? (value / norm) * 100 : 100;
        const status = realPct < 90 ? 'LOW' : (realPct > 110 ? 'HIGH' : 'OK');

        const isOk = status === 'OK';
        const colorClass = isOk ? 'bg-ui-success' : (status === 'LOW' ? 'bg-ui-warning' : 'bg-ui-danger');
        const statusLabel = isOk ? '✅ OK' : (status === 'LOW' ? '⚠️ ZA MAŁO' : '❌ ZA DUŻO');

        return (
            <div className="relative group/gauge">
                <div className="bg-ui-text/5 p-6 rounded-3xl border border-ui-border transition-all duration-300 group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col">
                            <span className="ui-subheading !opacity-40">{label}</span>
                            <span className={`text-[9px] font-bold ${isOk ? 'text-ui-success' : 'text-ui-text'}`}>{statusLabel}</span>
                        </div>
                        <span className={`text-sm font-black tracking-tight ${isOk ? 'text-ui-success' : 'text-ui-text'}`}>
                            {value.toFixed(1)} <span className="text-[10px] font-bold opacity-30">{unit}</span>
                        </span>
                    </div>
                    <div className="h-2 w-full bg-ui-text/5 rounded-full overflow-hidden">
                        <div
                            style={{ width: `${Math.min(realPct, 100)}%` }}
                            className={`h-full ${colorClass} shadow-[0_0_15px_rgba(0,0,0,0.3)] transition-all duration-500`}
                        />
                    </div>
                    <div className="mt-3 flex justify-between items-center opacity-40">
                        <span className="text-[10px] font-bold uppercase tracking-widest italic">Norma: {norm.toFixed(1)}</span>
                        <span className={`text-[10px] font-black ${isOk ? 'text-ui-success' : ''}`}>
                            {realPct.toFixed(0)}%
                        </span>
                    </div>
                </div>
            </div>
        );
    };


    return (
        <div className="w-full max-w-5xl mx-auto my-12 relative z-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-ui-card/40 backdrop-blur-3xl border border-ui-border rounded-[3rem] p-8 md:p-12 shadow-[0_40px_80px_rgba(0,0,0,0.4)]"
            >
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-3 bg-ui-accent/10 px-5 py-2.5 rounded-full border border-ui-accent/30 mx-auto mb-6 shadow-[0_0_20px_rgba(56,189,248,0.2)]">
                        <Cat className="text-ui-accent w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ui-text">Aplikacja Ekspercka</span>
                    </div>
                    <h2 className="ui-heading !text-4xl md:!text-6xl mb-4">Szybki Kalkulator</h2>
                    <p className="text-ui-muted text-sm max-w-xl mx-auto italic">
                        Wygeneruj optymalny przepis BARF dla swojego kota w 3 sekundy. Automatyczny dobór proporcji mięs i suplementów na podstawie światowych norm żywieniowych.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-ui-bg/30 p-6 md:p-8 rounded-[2.5rem] border border-white/5 shadow-inner mb-6">
                    <div className="flex flex-col gap-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-ui-text/50 ml-2">Waga kota (kg)</label>
                        <input
                            type="number" step="0.1" max="15"
                            value={catWeight} onChange={(e) => setCatWeight(e.target.value)}
                            placeholder="np. 4.5"
                            className="bg-ui-bg border border-ui-border rounded-2xl py-5 px-6 text-sm font-bold text-ui-text outline-none focus:border-ui-accent transition-all shadow-sm"
                        />
                    </div>
                    <div className="flex flex-col gap-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-ui-text/50 ml-2">Wiek i Aktywność</label>
                        <div className="relative">
                            <select
                                value={activity} onChange={(e) => setActivity(e.target.value)}
                                className="w-full bg-ui-bg border border-ui-border rounded-2xl py-5 px-6 text-sm font-bold text-ui-text outline-none focus:border-ui-accent transition-all appearance-none cursor-pointer shadow-sm"
                            >
                                <option value="niska">Niska (kastrat, mało ruchu, senior)</option>
                                <option value="średnia">Średnia (normalny dorosły kot)</option>
                                <option value="wysoka">Wysoka (kot rosnący, bardzo aktywny)</option>
                            </select>
                            <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-ui-accent rotate-90 pointer-events-none" size={16} />
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 md:col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-ui-text/50 ml-2">Ilość dni zapasu</label>
                        <input
                            type="number" max="60"
                            value={days} onChange={(e) => setDays(e.target.value)}
                            placeholder="np. 14 (przepis na dwa tygodnie)"
                            className="bg-ui-bg border border-ui-border rounded-2xl py-5 px-6 text-sm font-bold text-ui-text outline-none focus:border-ui-accent transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 bg-ui-bg/30 p-6 md:p-8 rounded-[2.5rem] border border-white/5 shadow-inner mb-10">
                    <div className="flex flex-col gap-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-ui-text/50 ml-2 flex justify-between">
                            <span>Mięso gładkie (Baza 85%)</span>
                        </label>
                        {meatIds.map((id, idx) => (
                            <div key={idx} className="flex items-center gap-2 mb-2">
                                <SearchableSelect
                                    value={id}
                                    onChange={(v) => {
                                        const newArr = [...meatIds];
                                        newArr[idx] = v;
                                        setMeatIds(newArr);
                                    }}
                                    options={meats}
                                    placeholder={loadingIngredients ? "Ładowanie..." : "Wybierz główne źródło mięsa"}
                                />
                                {idx > 0 && (
                                    <button
                                        onClick={() => setMeatIds(meatIds.filter((_, i) => i !== idx))}
                                        className="w-12 h-12 shrink-0 flex items-center justify-center bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all ml-2"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            onClick={() => setMeatIds([...meatIds, ''])}
                            className="bg-ui-text/5 text-ui-text py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-ui-accent/10 transition-all flex items-center justify-center gap-2 mt-2"
                        >
                            <Plus size={14} /> Dodaj kolejne mięso
                        </button>
                    </div>
                    <div className="flex flex-col gap-3 mt-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-ui-text/50 ml-2">Dodatek Roślinny (Błonnik)</label>
                        <SearchableSelect
                            value={vegId} onChange={setVegId}
                            options={vegs} placeholder={loadingIngredients ? "Ładowanie..." : "Wybierz warzywo (opcjonalnie)"}
                        />
                    </div>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={loadingGenerate || loadingIngredients}
                    className="w-full bg-ui-accent text-ui-bg py-6 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-white transition-all shadow-[0_20px_40px_-10px_rgba(56,189,248,0.4)] flex justify-center items-center gap-3 active:scale-[0.98]"
                >
                    {loadingGenerate ? (
                        <div className="flex gap-2">
                            <span className="w-2 h-2 bg-current rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
                            <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                        </div>
                    ) : (
                        <>Generuj Przepis <ArrowRight size={18} /></>
                    )}
                </button>
            </motion.div>

            {/* RESULTS SECTION */}
            {result && (
                <motion.div
                    id="guest-result-section"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-12 bg-ui-card border border-ui-border rounded-[3rem] p-8 md:p-12 shadow-[0_40px_80px_rgba(0,0,0,0.7)]"
                >
                    <div className="flex flex-wrap justify-between items-start gap-6 border-b border-ui-border pb-8 mb-8">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ui-success mb-2 block animate-pulse">Sukces. Receptura Zbilansowana.</span>
                            <h3 className="ui-heading !text-3xl md:!text-5xl">{result.name}</h3>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={handlePrintList} className="bg-ui-text/5 hover:bg-ui-accent hover:text-white text-ui-text px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-sm flex items-center gap-2 border border-ui-border">
                                <LayoutGrid size={16} /> Składniki
                            </button>
                            <button onClick={handlePrintRecipe} className="bg-white text-black px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-ui-accent hover:text-white transition-all shadow-[0_10px_30px_-5px_rgba(255,255,255,0.3)] flex items-center gap-2">
                                <Printer size={16} /> Drukuj Raport
                            </button>
                            {token && (
                                <button onClick={handleSaveRecipe} className="bg-ui-success text-ui-bg px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_10px_30px_-5px_rgba(34,197,94,0.3)] flex items-center gap-2">
                                    <CheckCircle size={16} /> Zapisz Przepis
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                        <div className="bg-ui-bg/50 p-6 rounded-[2rem] border border-white/5">
                            <span className="text-[9px] font-black uppercase text-ui-muted tracking-[0.2em]">Masa Całkowita</span>
                            <div className="text-2xl font-black text-ui-text mt-1">{result.totalWeight.toFixed(0)}<span className="text-sm">g</span></div>
                        </div>
                        <div className="bg-ui-bg/50 p-6 rounded-[2rem] border border-white/5">
                            <span className="text-[9px] font-black uppercase text-ui-muted tracking-[0.2em]">Masa Mięsa</span>
                            <div className="text-2xl font-black text-ui-text mt-1">{result.meatWeight.toFixed(0)}<span className="text-sm">g</span></div>
                        </div>
                        <div className="bg-ui-bg/50 p-6 rounded-[2rem] border border-white/5">
                            <span className="text-[9px] font-black uppercase text-ui-muted tracking-[0.2em]">Porcja Dzienna</span>
                            <div className="text-2xl font-black text-ui-accent mt-1">{(result.totalWeight / days).toFixed(0)}<span className="text-sm text-ui-text">g</span></div>
                        </div>
                        <div className="bg-ui-bg/50 p-6 rounded-[2rem] border border-white/5">
                            <span className="text-[9px] font-black uppercase text-ui-muted tracking-[0.2em]">Dni Zapasu</span>
                            <div className="text-2xl font-black text-ui-text mt-1">{days}</div>
                        </div>
                    </div>

                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-ui-text/50 mb-6 flex items-center gap-4">
                        <span>Wyliczone Składniki</span>
                        <div className="h-px bg-white/5 flex-1"></div>
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-12">
                        {result.items.map((item, idx) => {
                            const name = item.ingredient.name || '';
                            const nameLower = name.toLowerCase();
                            const isCap = nameLower.includes('kapsułk') || nameLower.includes('tablet');
                            const isYolk = nameLower.includes('zoltko') || nameLower.includes('żółtko');
                            const isOmega3 = item.ingredient._isOmega3;

                            let displayAmount, unit;
                            if (isCap) {
                                displayAmount = item.amount.toLocaleString('pl-PL');
                                unit = 'SZT';
                            } else if (isYolk) {
                                // Show count of yolks (amount is in grams, 17g per yolk)
                                const count = item._yolkCount || Math.round(item.amount / 17);
                                displayAmount = count.toLocaleString('pl-PL');
                                unit = 'SZT';
                            } else {
                                displayAmount = item.amount.toLocaleString('pl-PL');
                                unit = 'G';
                            }

                            if (isOmega3) {
                                return (
                                    <div key={idx} className="md:col-span-2 flex justify-between items-center bg-gradient-to-r from-blue-500/10 to-cyan-500/10 px-6 py-4 rounded-2xl border border-blue-400/30 group hover:border-blue-400/60 transition-all">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black uppercase text-blue-400 tracking-widest">Suplement zalecany</span>
                                            <span className="text-sm font-extrabold text-ui-text">{name}</span>
                                        </div>
                                        <div className="text-xl font-black text-blue-400">
                                            {displayAmount}
                                            <span className="text-[10px] opacity-60 ml-1 text-ui-text">{unit}</span>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div key={idx} className="flex justify-between items-center bg-ui-text/5 px-6 py-4 rounded-2xl border border-ui-border group hover:border-ui-accent/30 transition-all">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black uppercase text-ui-muted tracking-widest">{item.ingredient.category}</span>
                                        <span className="text-sm font-extrabold text-ui-text">{name}</span>
                                    </div>
                                    <div className="text-xl font-black text-ui-accent">
                                        {displayAmount}
                                        <span className="text-[10px] opacity-40 ml-1 text-ui-text">
                                            {unit}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>


                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-ui-text/50 mb-6 flex items-center gap-4">
                        <span>Weryfikacja balansu</span>
                        <div className="h-px bg-white/5 flex-1"></div>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {renderGauge('Wapń (Ca)', 'calcium')}
                        {renderGauge('Fosfor (P)', 'phosphorus')}
                        {renderGauge('Magnez (Mg)', 'magnesium')}
                        {renderGauge('Sód (Na)', 'sodium')}
                        {renderGauge('Potas (K)', 'potassium')}
                        {renderGauge('Żelazo (Fe)', 'iron')}
                        {renderGauge('Tauryna', 'taurine')}
                        {renderGauge('Wit A', 'vitaminA', 'I.E.')}
                        {renderGauge('Wit D', 'vitaminD', 'I.E.')}
                        {renderGauge('Wit E', 'vitaminE', 'I.E.')}
                        {renderGauge('Jod', 'iodine', 'µg')}
                    </div>

                    {result.analysis && result.analysis.ratios && (
                        <div className="p-6 md:p-10 rounded-[3rem] bg-gradient-to-br from-ui-card to-black/20 border border-ui-border relative overflow-hidden group shadow-2xl mb-12">
                            <div className="absolute inset-0 bg-ui-accent/5 blur-[80px] pointer-events-none" />
                            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                                <div>
                                    <span className="ui-subheading mb-3 block !opacity-50">Równowaga Ca:P</span>
                                    <div className="flex items-end gap-4">
                                        <span className={`text-5xl md:text-7xl font-black italic tracking-tighter ${Math.abs(result.analysis.ratios.caP - 1.15) < 0.1 ? 'text-ui-success' : 'text-ui-warning'}`}>
                                            {result.analysis.ratios.caP.toFixed(2)}
                                        </span>
                                        <span className="text-xl font-bold opacity-40 mb-2 text-ui-text">/ 1.15</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="ui-subheading mb-3 block !opacity-50">Równowaga K:Na</span>
                                    <div className="flex items-end gap-4">
                                        <span className={`text-5xl md:text-7xl font-black italic tracking-tighter ${Math.abs(result.analysis.ratios.kNa - 1.5) < 0.3 ? 'text-ui-success' : 'text-ui-warning'}`}>
                                            {result.analysis.ratios.kNa.toFixed(2)}
                                        </span>
                                        <span className="text-xl font-bold opacity-40 mb-2 text-ui-text">/ 1.50</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="ui-subheading mb-3 block !opacity-50">Całkowita wilgotność</span>
                                    <div className="flex items-end gap-4">
                                        <span className="text-5xl md:text-7xl font-black italic tracking-tighter text-ui-success">
                                            {(100 - result.analysis.percentTS).toFixed(1)}%
                                        </span>
                                        <span className="text-xl font-bold opacity-40 mb-2 text-ui-text">~73%</span>
                                    </div>
                                    {(() => {
                                        const waterItem = result.items.find(i =>
                                            (i.ingredient.category || '').toLowerCase() === 'wypełniacz' ||
                                            (i.ingredient.name || '').toLowerCase() === 'woda'
                                        );
                                        const addedWater = waterItem ? waterItem.amount : (result.analysis.totals?.addedWater || 0);
                                        if (addedWater > 0.5) {
                                            return (
                                                <div className="mt-3 flex items-center gap-2 bg-blue-500/10 border border-blue-400/20 rounded-xl px-4 py-2">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-blue-300 opacity-70">Dodaj wodę</span>
                                                    <span className="text-base font-black text-blue-300">{addedWater.toLocaleString('pl-PL', {maximumFractionDigits: 0})} <span className="text-[10px] font-bold opacity-60">g</span></span>
                                                </div>
                                            );
                                        }
                                        return (
                                            <div className="mt-3 flex items-center gap-2 bg-ui-success/10 border border-ui-success/20 rounded-xl px-4 py-2">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-ui-success opacity-70">Woda z mięsa wystarczy</span>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    )}

                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-ui-text/50 mb-6 flex items-center gap-4">
                        <span>Pełna Analiza Laboratoryjna</span>
                        <div className="h-px bg-white/5 flex-1"></div>
                    </h4>
                    
                    <RecipeExcelTable analysis={result.analysis} />
                </motion.div>
            )}
        </div>
    );
};

export default GuestCalculator;
