import React from 'react';

const NUTRIENT_ROWS = [
    { label: 'Waga', key: 'weight', unit: 'g' },
    { label: 'Energia', key: 'energy', unit: 'kcal' },
    { label: 'Białko', key: 'protein', unit: 'g' },
    { label: 'Tłuszcz', key: 'fat', unit: 'g' },
    { label: 'Woda', key: 'water', unit: 'g' },
    { label: 'Węglowodany', key: 'carbohydrates', unit: 'g' },
    { label: 'Włókno', key: 'fiber', unit: 'g' },
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
    { label: 'Witamina A', key: 'vitaminA', unit: 'I.E.' },
    { label: 'Witamina D', key: 'vitaminD', unit: 'I.E.' },
    { label: 'Witamina E', key: 'vitaminE', unit: 'I.E.' },
    { label: 'Witamina B1', key: 'vitaminB1', unit: 'mg' },
    { label: 'Witamina B2', key: 'vitaminB2', unit: 'mg' },
    { label: 'Witamina B3', key: 'vitaminB3', unit: 'mg' },
    { label: 'Witamina B12', key: 'vitaminB12', unit: 'µg' },
    { label: 'Kwas linolowy', key: 'omega6Linoleic', unit: 'g' },
];

const fmt = (v) => {
    if (v === undefined || v === null || isNaN(v)) return '–';
    if (v === 0) return '0,0';
    return Number(v).toLocaleString('pl-PL', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
};

export default function RecipePrintTemplate({ recipe, analysis }) {
    if (!recipe || !analysis) return null;

    const { totals, norms, ratios, ingredientDetails } = analysis;
    const days = (recipe.meatWeight / (recipe.catWeight * 25)).toFixed(1);
    const dailyPortion = (recipe.totalWeight / parseFloat(days)).toFixed(0);
    const date = new Date(recipe.createdAt).toLocaleDateString('pl-PL', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    const MACRO_NORMS = { protein: '50–65%', fat: '20–38%', water: '72–75%', carbohydrates: '0–5%' };

    const getNormVal = (row) => {
        if (row.isRatio) {
            if (row.key === 'caP') return '1,15';
            if (row.key === 'kNa') return '1,20–1,80';
            return '–';
        }
        if (MACRO_NORMS[row.key]) return MACRO_NORMS[row.key];
        return norms && norms[row.key] ? fmt(norms[row.key]) : '–';
    };

    const getTotalVal = (row) => {
        if (row.isRatio) return fmt(ratios[row.key]);
        const v = totals[row.key];
        if (v === undefined) return '–';
        const dm = totals.weight - totals.water;
        if (row.key === 'protein') return `${fmt(v)} (${fmt(dm > 0 ? v / dm * 100 : 0)}%)`;
        if (row.key === 'fat') return `${fmt(v)} (${fmt(dm > 0 ? v / dm * 100 : 0)}%)`;
        if (row.key === 'water') return `${fmt(v)} (${fmt(totals.weight > 0 ? v / totals.weight * 100 : 0)}%)`;
        if (row.key === 'carbohydrates') return `${fmt(v)} (${fmt(dm > 0 ? v / dm * 100 : 0)}%)`;
        return fmt(v);
    };

    /* ---- inline styles (all print-safe, no Tailwind classes) ---- */
    const s = {
        page: {
            fontFamily: "'Source Sans 3', Arial, sans-serif",
            color: '#2d3436',
            background: 'white',
            padding: '0',
            margin: '0',
        },
        // Header bar
        header: {
            background: '#3A3F33',
            color: 'white',
            padding: '10mm 12mm 8mm',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
        },
        brandTitle: {
            fontSize: '8pt',
            fontWeight: 800,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            opacity: 0.7,
            marginBottom: '2mm',
        },
        recipeName: {
            fontSize: '22pt',
            fontWeight: 900,
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            textTransform: 'uppercase',
        },
        headerRight: {
            textAlign: 'right',
            fontSize: '8pt',
            opacity: 0.7,
            lineHeight: 1.6,
        },
        // Stat strip
        statStrip: {
            background: '#f4f5ef',
            borderBottom: '0.5pt solid #d0d5c8',
            display: 'flex',
            gap: 0,
        },
        statBox: {
            flex: 1,
            padding: '4mm 5mm',
            borderRight: '0.5pt solid #d0d5c8',
        },
        statLabel: {
            fontSize: '6pt',
            fontWeight: 800,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#6b7c49',
            marginBottom: '0.5mm',
        },
        statValue: {
            fontSize: '14pt',
            fontWeight: 900,
            color: '#3A3F33',
            lineHeight: 1,
        },
        statUnit: {
            fontSize: '7pt',
            fontWeight: 600,
            color: '#8a9a7a',
            marginLeft: '1mm',
        },
        // Content
        content: {
            padding: '8mm 12mm',
        },
        sectionTitle: {
            fontSize: '7pt',
            fontWeight: 800,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#6b7c49',
            borderBottom: '0.5pt solid #d0d5c8',
            paddingBottom: '1.5mm',
            marginBottom: '4mm',
            marginTop: '6mm',
            display: 'flex',
            alignItems: 'center',
            gap: '2mm',
        },
        // Ingredients grid
        ingredientsGrid: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '2mm',
        },
        ingredientCard: {
            border: '0.5pt solid #e0e4d8',
            borderRadius: '2mm',
            padding: '2.5mm 3mm',
            background: '#fafaf7',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        ingCategory: {
            fontSize: '6pt',
            fontWeight: 800,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#8a9a7a',
            marginBottom: '0.5mm',
        },
        ingName: {
            fontSize: '8pt',
            fontWeight: 700,
            color: '#2d3436',
        },
        ingAmount: {
            fontSize: '11pt',
            fontWeight: 900,
            color: '#6b7c49',
            textAlign: 'right',
        },
        ingUnit: {
            fontSize: '6pt',
            color: '#8a9a7a',
            display: 'block',
            textAlign: 'right',
        },
        // Analysis table
        table: {
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '7pt',
            lineHeight: 1.3,
        },
        th: {
            background: '#3A3F33',
            color: 'white',
            fontWeight: 700,
            padding: '1.5mm 2mm',
            textAlign: 'left',
            fontSize: '6.5pt',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
        },
        thRight: {
            background: '#3A3F33',
            color: 'white',
            fontWeight: 700,
            padding: '1.5mm 2mm',
            textAlign: 'right',
            fontSize: '6.5pt',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
        },
        tdLabel: {
            padding: '1mm 2mm',
            fontWeight: 700,
            color: '#2d3436',
            borderBottom: '0.3pt solid #e0e4d8',
            whiteSpace: 'nowrap',
        },
        tdUnit: {
            padding: '1mm 2mm',
            color: '#8a9a7a',
            fontSize: '6.5pt',
            borderBottom: '0.3pt solid #e0e4d8',
            textAlign: 'center',
        },
        tdNorm: {
            padding: '1mm 2mm',
            color: '#6b7c49',
            fontWeight: 600,
            borderBottom: '0.3pt solid #e0e4d8',
            textAlign: 'right',
        },
        tdTotal: {
            padding: '1mm 2mm',
            color: '#3A3F33',
            fontWeight: 800,
            borderBottom: '0.3pt solid #e0e4d8',
            textAlign: 'right',
            background: '#f4f5ef',
        },
        tdIng: {
            padding: '1mm 2mm',
            color: '#636e72',
            borderBottom: '0.3pt solid #e0e4d8',
            textAlign: 'right',
            fontSize: '6.5pt',
        },
        // Footer
        footer: {
            marginTop: '10mm',
            paddingTop: '4mm',
            borderTop: '0.5pt solid #d0d5c8',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        footerLeft: {
            fontSize: '7pt',
            fontWeight: 800,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#6b7c49',
        },
        footerRight: {
            fontSize: '6.5pt',
            color: '#b0b8a8',
            textAlign: 'right',
        },
    };

    return (
        <div style={s.page} className="recipe-print-wrapper">
            {/* ── HEADER ── */}
            <div style={s.header}>
                <div>
                    <div style={s.brandTitle}>ibarf.pl • Receptura BARF</div>
                    <div style={s.recipeName}>{recipe.name}</div>
                </div>
                <div style={s.headerRight}>
                    <div>Data: {date}</div>
                    <div>Kot: {recipe.catWeight} kg</div>
                    <div>Pokarm na {days} dni</div>
                </div>
            </div>

            {/* ── STAT STRIP ── */}
            <div style={s.statStrip}>
                {[
                    { label: 'Masa kota', value: recipe.catWeight, unit: 'kg' },
                    { label: 'Receptura na', value: days, unit: 'dni' },
                    { label: 'Porcja dzienna', value: dailyPortion, unit: 'g/dzień' },
                    { label: 'Masa całkowita', value: recipe.totalWeight.toFixed(0), unit: 'g' },
                    { label: 'Masa mięsa', value: recipe.meatWeight.toFixed(0), unit: 'g' },
                ].map((item, i) => (
                    <div key={i} style={{ ...s.statBox, borderRight: i < 4 ? '0.5pt solid #d0d5c8' : 'none' }}>
                        <div style={s.statLabel}>{item.label}</div>
                        <div style={s.statValue}>
                            {item.value}
                            <span style={s.statUnit}>{item.unit}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── CONTENT ── */}
            <div style={s.content}>
                {/* Ingredients */}
                <div style={s.sectionTitle}>
                    <span>▪</span> Składniki Mieszanki
                </div>
                <div style={s.ingredientsGrid}>
                    {recipe.items.map((item, i) => {
                        const isCap = item.ingredient.name.toLowerCase().includes('kapsułk') ||
                            item.ingredient.name.toLowerCase().includes('tablet');
                        return (
                            <div key={i} style={s.ingredientCard}>
                                <div>
                                    <div style={s.ingCategory}>{item.ingredient.category}</div>
                                    <div style={s.ingName}>{item.ingredient.name}</div>
                                </div>
                                <div>
                                    <div style={s.ingAmount}>
                                        {item.ingredient.name === 'Zoltko jajka' ? (item.amount / 18.5).toFixed(1) : item.amount}
                                    </div>
                                    <span style={s.ingUnit}>
                                        {item.ingredient.name === 'Zoltko jajka' || isCap ? 'szt.' : (item.ingredient.name.toLowerCase().includes('krew') ? 'ml' : 'g')}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Omega 3 Lunderland - suplement zalecany */}
                {(() => {
                    const daysNum = Math.floor(recipe.meatWeight / (recipe.catWeight * 25));
                    const omega3 = (recipe.catWeight * daysNum * 0.12).toFixed(2);
                    return (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f4f5ef', border: '0.5pt solid #d0d5c8', borderRadius: '3mm', padding: '3mm 5mm', marginTop: '4mm' }}>
                            <div>
                                <div style={{ fontSize: '6pt', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6b7c49', marginBottom: '1mm' }}>Suplement zalecany</div>
                                <div style={{ fontSize: '10pt', fontWeight: 900, color: '#3A3F33' }}>Lunderland Omega 3</div>
                                <div style={{ fontSize: '6pt', color: '#8a9a7a', marginTop: '0.5mm' }}>{recipe.catWeight} kg × {daysNum} dni × 0,12 g</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '18pt', fontWeight: 900, color: '#6b7c49', lineHeight: 1 }}>{omega3}</div>
                                <div style={{ fontSize: '7pt', color: '#8a9a7a' }}>g</div>
                            </div>
                        </div>
                    );
                })()}

                {/* Analysis table */}
                {analysis && ingredientDetails && (
                    <>
                        <div style={{ ...s.sectionTitle, marginTop: '8mm' }}>
                            <span>▪</span> Pełna Analiza Wartości Odżywczych
                        </div>
                        <table style={s.table}>
                            <thead>
                                <tr>
                                    <th style={s.th}>Składnik</th>
                                    <th style={s.thRight}>Jedn.</th>
                                    <th style={s.thRight}>Norma</th>
                                    <th style={s.thRight}>Suma</th>
                                    {ingredientDetails.map((ing, ii) => (
                                        <th key={ii} style={{ ...s.thRight, maxWidth: '18mm', fontSize: '5.5pt', whiteSpace: 'normal' }}>
                                            {ing.name.length > 22 ? ing.name.slice(0, 20) + '…' : ing.name}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {NUTRIENT_ROWS.map((row, ri) => {
                                    const bg = ri % 2 === 0 ? 'white' : '#fafaf7';
                                    return (
                                        <tr key={row.key} style={{ background: bg }}>
                                            <td style={s.tdLabel}>{row.label}</td>
                                            <td style={s.tdUnit}>{row.unit}</td>
                                            <td style={s.tdNorm}>{getNormVal(row)}</td>
                                            <td style={s.tdTotal}>{getTotalVal(row)}</td>
                                            {ingredientDetails.map((ing, ii) => {
                                                const v = row.isRatio ? null : ing.nutrients[row.key];
                                                return (
                                                    <td key={ii} style={s.tdIng}>
                                                        {v !== undefined && v !== null && v !== 0 ? fmt(v) : '–'}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </>
                )}

                {/* Footer */}
                <div style={s.footer}>
                    <div style={s.footerLeft}>ibarf.pl • Darmowy Kalkulator BARF</div>
                    <div style={s.footerRight}>
                        Wygenerowano: {new Date().toLocaleDateString('pl-PL')}<br />
                        Najlepsze wsparcie dietetyczne dla Twojego kota.
                    </div>
                </div>
            </div>
        </div>
    );
}
