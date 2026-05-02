import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const NUTRIENT_ROWS = [
    { label: 'Waga', key: 'weight', unit: 'g' },
    { label: 'Energia', key: 'energy', unit: 'kcal' },
    { label: 'Białko', key: 'protein', unit: 'g' },
    { label: 'Tłuszcz', key: 'fat', unit: 'g' },
    { label: 'Woda', key: 'water', unit: 'g' },
    { label: 'Węglowodany', key: 'carbohydrates', unit: 'g' },
    { label: 'Włókno', key: 'fiber', unit: 'g' },
    { label: 'Wapń', key: 'calcium', unit: 'mg' },
    { label: 'Fosfor', key: 'phosphorus', unit: 'mg' },
    { label: 'Wapń:Fosfor', key: 'caP', unit: '', isRatio: true },
    { label: 'Magnez', key: 'magnesium', unit: 'mg' },
    { label: 'Sód', key: 'sodium', unit: 'mg' },
    { label: 'Potas', key: 'potassium', unit: 'mg' },
    { label: 'Potas:Sód', key: 'kNa', unit: '', isRatio: true },
    { label: 'Chlor', key: 'chloride', unit: 'mg' },
    { label: 'Żelazo', key: 'iron', unit: 'mg' },
    { label: 'Cynk', key: 'zinc', unit: 'mg' },
    { label: 'Miedź', key: 'copper', unit: 'mg' },
    { label: 'Mangan', key: 'manganese', unit: 'mg' },
    { label: 'Jod', key: 'iodine', unit: 'µg' },
    { label: 'Selen', key: 'selenium', unit: 'µg' },
    { label: 'Tauryna', key: 'taurine', unit: 'mg' },
    { label: 'Vitamin A', key: 'vitaminA', unit: 'I.E.' },
    { label: 'Vitamin D', key: 'vitaminD', unit: 'I.E.' },
    { label: 'Vitamin E', key: 'vitaminE', unit: 'I.E.' },
    { label: 'Vitamin K', key: 'vitaminK', unit: 'µg' },
    { label: 'Vitamin B1', key: 'vitaminB1', unit: 'mg' },
    { label: 'Vitamin B2', key: 'vitaminB2', unit: 'mg' },
    { label: 'Vitamin B3', key: 'vitaminB3', unit: 'mg' },
    { label: 'Vitamin B5', key: 'vitaminB5', unit: 'mg' },
    { label: 'Vitamin B6', key: 'vitaminB6', unit: 'mg' },
    { label: 'Vitamin B7 (Biotyna)', key: 'vitaminB7', unit: 'µg' },
    { label: 'Vitamin B9 (Kwas)', key: 'vitaminB9', unit: 'µg' },
    { label: 'Vitamin B12', key: 'vitaminB12', unit: 'µg' },
    { label: 'Vitamin C', key: 'vitaminC', unit: 'mg' },
    { label: 'Kwas linolowy', key: 'omega6Linoleic', unit: 'g' },
    { label: 'Kwas arachidonowy', key: 'omega6Arachidonic', unit: 'mg' },
];

export default function RecipeExcelTable({ analysis }) {
    const containerRef = useRef(null);
    const [showLeft, setShowLeft] = useState(false);
    const [showRight, setShowRight] = useState(false);

    const checkScroll = () => {
        if (!containerRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
        setShowLeft(scrollLeft > 20);
        setShowRight(scrollLeft < scrollWidth - clientWidth - 20);
    };

    useEffect(() => {
        const timer = setTimeout(checkScroll, 100);
        return () => clearTimeout(timer);
    }, [analysis?.ingredientDetails]);

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', checkScroll);
            window.addEventListener('resize', checkScroll);
            return () => {
                container.removeEventListener('scroll', checkScroll);
                window.removeEventListener('resize', checkScroll);
            };
        }
    }, []);

    if (!analysis || !analysis.ingredientDetails) return null;
    const { totals, norms, ratios, ingredientDetails } = analysis;

    const scroll = (dir) => {
        if (!containerRef.current) return;
        const amount = dir === 'left' ? -400 : 400;
        containerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    };

    const formatNumber = (val) => {
        if (val === undefined || val === null || isNaN(val)) return '-';
        if (val === 0) return '0,0';
        return val.toLocaleString('pl-PL', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    };

    const MACRO_NORMS = {
        protein: '50 - 65%',
        fat: '20 - 38%',
        water: '72 - 75%',
        carbohydrates: '0 - 5%',
    };

    return (
        <div className="mt-12 relative group/table">
            {/* Scroll Arrows */}
            {showLeft && (
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-ui-accent text-ui-bg p-3 rounded-2xl shadow-2xl hover:scale-110 active:scale-95 transition-all hidden md:flex items-center justify-center border border-white/20"
                >
                    <ChevronLeft size={24} />
                </button>
            )}
            {showRight && (
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-ui-accent text-ui-bg p-3 rounded-2xl shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center border border-white/20"
                >
                    <ChevronRight size={24} />
                </button>
            )}

            <div
                ref={containerRef}
                className="overflow-x-auto custom-scrollbar bg-ui-bg/30 rounded-[2.5rem] border border-ui-border"
            >
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-ui-card text-ui-text border-b border-ui-border">
                        <tr>
                            <th className="p-3 font-bold sticky left-0 bg-ui-card border-r border-ui-border z-10 w-40 md:w-48 text-[10px] md:text-sm">Składnik odżywczy</th>
                            <th className="p-3 font-bold text-center border-r border-ui-border w-20">Jedn.</th>
                            <th className="p-3 font-bold text-right border-r border-ui-border w-28">Norma</th>
                            <th className="p-3 font-bold text-right border-r border-ui-border bg-ui-accent/10 w-32">Suma w Przepisie</th>
                            {ingredientDetails.map((ing, idx) => (
                                <th key={idx} className="p-3 font-bold text-right text-xs max-w-[120px] truncate border-r border-ui-border/50" title={ing.name}>
                                    {ing.name}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-ui-border/30">
                        {NUTRIENT_ROWS.map((row, idx) => {
                            const isEven = idx % 2 === 0;
                            const rowBg = isEven ? 'bg-transparent' : 'bg-white/5';

                            let totalVal = '-';
                            let normVal = '-';

                            if (row.isRatio) {
                                totalVal = formatNumber(ratios[row.key]);
                                if (row.key === 'caP') normVal = '1,15';
                                if (row.key === 'kNa') normVal = '1,20 - 1,80';
                            } else {
                                totalVal = formatNumber(totals[row.key]);

                                // Add macro norms
                                if (MACRO_NORMS[row.key]) {
                                    normVal = MACRO_NORMS[row.key];
                                } else {
                                    // Map the norm DB keys correctly because norms object uses specific keys
                                    let normKey = row.key;
                                    if (norms[normKey]) {
                                        normVal = formatNumber(norms[normKey]);
                                    }
                                }

                                // Calculate and format percentages for macros
                                const dryMatter = totals.weight - totals.water;
                                if (row.key === 'protein') {
                                    const pct = dryMatter > 0 ? (totals.protein / dryMatter) * 100 : 0;
                                    totalVal = `${totalVal} (${formatNumber(pct)}%)`;
                                } else if (row.key === 'fat') {
                                    const pct = dryMatter > 0 ? (totals.fat / dryMatter) * 100 : 0;
                                    totalVal = `${totalVal} (${formatNumber(pct)}%)`;
                                } else if (row.key === 'carbohydrates') {
                                    const pct = dryMatter > 0 ? (totals.carbohydrates / dryMatter) * 100 : 0;
                                    totalVal = `${totalVal} (${formatNumber(pct)}%)`;
                                } else if (row.key === 'water') {
                                    const pct = totals.weight > 0 ? (totals.water / totals.weight) * 100 : 0;
                                    totalVal = `${totalVal} (${formatNumber(pct)}%)`;
                                } else if (row.key === 'fiber') {
                                    const pct = dryMatter > 0 ? (totals.fiber / dryMatter) * 100 : 0;
                                    totalVal = `${totalVal} (${formatNumber(pct)}%)`;
                                }
                            }

                            return (
                                <tr key={row.key} className={`${rowBg} hover:bg-ui-accent/10 transition-colors`}>
                                    <td className={`p-3 sticky left-0 border-r border-ui-border z-10 font-bold text-[10px] md:text-sm ${idx % 2 === 0 ? 'bg-ui-card' : 'bg-ui-card/95'}`}>
                                        {row.label}
                                    </td>
                                    <td className="p-3 text-center text-xs opacity-60 border-r border-ui-border">
                                        {row.unit}
                                    </td>
                                    <td className="p-3 text-right text-ui-text/70 border-r border-ui-border">
                                        {normVal}
                                    </td>
                                    <td className="p-3 text-right font-black text-ui-accent border-r border-ui-border bg-ui-accent/5">
                                        {totalVal}
                                    </td>
                                    {ingredientDetails.map((ing, iIdx) => {
                                        let val = '-';
                                        if (!row.isRatio) {
                                            const nVal = ing.nutrients[row.key];
                                            if (nVal !== undefined) {
                                                val = formatNumber(nVal);
                                            }
                                        }
                                        return (
                                            <td key={iIdx} className="p-3 text-right text-ui-text opacity-80 border-r border-ui-border/50 text-xs">
                                                {val !== '0,0' ? val : <span className="opacity-20">-</span>}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
