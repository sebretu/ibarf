import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight, ChevronLeft, Plus, Trash2, CheckCircle,
    AlertCircle, Scale, Beef, TestTube, Save,
    Search, Info, TrendingUp, List, ArrowRight, Cat,
    Droplet, Layers
} from 'lucide-react';
import RecipeExcelTable from '../components/RecipeExcelTable';

const API_URL = '/api';

const SearchableSelect = ({ value, onChange, options, placeholder, allIngredients }) => {
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
                className="w-full bg-ui-bg border border-ui-border rounded-xl py-4 px-6 text-sm font-bold text-ui-text cursor-pointer flex justify-between items-center group/select hover:border-ui-accent/50 transition-all shadow-sm"
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
                        className="absolute z-[10000] mt-2 left-0 right-0 bg-ui-card border border-ui-border rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
                    >
                        <div className="p-3 bg-ui-text/5 border-b border-ui-border">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ui-text/20" size={14} />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Wyszukaj składnik..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-ui-bg border border-ui-border rounded-lg py-2 pl-9 pr-4 text-xs font-bold text-ui-text outline-none focus:ring-1 focus:ring-ui-accent"
                                />
                            </div>
                        </div>
                        <div className="max-h-60 overflow-y-auto custom-scrollbar bg-ui-card">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map(opt => (
                                    <div
                                        key={opt.id}
                                        onClick={() => {
                                            onChange(opt.id);
                                            setIsOpen(false);
                                            setSearchTerm('');
                                        }}
                                        className={`py-3 px-6 text-[11px] font-bold cursor-pointer transition-all flex items-center justify-between
                                            ${opt.id === value ? 'bg-ui-accent text-ui-bg' : 'text-ui-text hover:bg-ui-accent/10 hover:pl-8'}`}
                                    >
                                        <span className="truncate">{opt.name}</span>
                                        {opt.id === value && <CheckCircle size={12} />}
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 px-6 text-[10px] font-bold opacity-30 italic text-center">Nie znaleziono składników</div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const Calculator = ({ token }) => {
    const [step, setStep] = useState(1);
    const [recipeName, setRecipeName] = useState('');
    const [catWeight, setCatWeight] = useState(4);
    const [activity, setActivity] = useState('średnia');
    const [allIngredients, setAllIngredients] = useState([]);

    // Detailed Wizard State
    const [selections, setSelections] = useState({
        muscleMeat: [],
        hearts: [],
        gizzards: [],
        otherOrgans: [],
        bones: [],
        yolks: { id: '', amount: 0 },
        readyProducts: { id: '', amount: 0 },
        vitA: { id: '', amount: 0 },
        fish: { id: '', amount: 0 },
        vitD: { id: '', amount: 0 },
        iodine: { id: '', amount: 0 },
        bGroup: { id: '', amount: 0 },
        iron: { id: '', amount: 0 },
        vitE: { id: '', amount: 0 },
        animalFat: [],
        fishOil: { id: '', amount: 0 },
        caP: { id: '', amount: 0 },
        calcium: { id: '', amount: 0 },
        sodium: { id: '', amount: 0 },
        vegetables: { id: '', amount: 0 },
        taurine: { id: '', amount: 0 }
    });

    // Local state for current selection in each group
    const [localSelections, setLocalSelections] = useState({});

    const [analysis, setAnalysis] = useState(null);
    const [totalMeat, setTotalMeat] = useState(0);

    // Calculate total meat whenever selections change
    useEffect(() => {
        let meat = 0;
        ['muscleMeat', 'hearts', 'gizzards', 'otherOrgans', 'bones', 'fish'].forEach(k => {
            const list = selections[k];
            if (Array.isArray(list)) {
                list.forEach(item => {
                    meat += parseFloat(item.amount) || 0;
                });
            }
        });
        setTotalMeat(meat);
    }, [selections]);

    useEffect(() => {
        axios.get(`${API_URL}/ingredients`)
            .then(res => {
                console.log("Fetched ingredients:", res.data.length);
                setAllIngredients(res.data);
                if (res.data.length === 0) alert("UWAGA: Serwer zwrócił pustą listę składników.");
            })
            .catch(err => {
                console.error("Fetch error:", err);
                alert("BŁĄD POŁĄCZENIA: Nie można pobrać składników z serwera. " + err.message);
            });

        // Load from localStorage
        const saved = localStorage.getItem('barf_recipe_progress');
        if (saved) {
            try {
                const { selections: s, catWeight: w, activity: a, step: st } = JSON.parse(saved);
                if (s) {
                    // Ensure Taurine has the fixed ID if it's missing or old
                    if (!s.taurine?.id) {
                        s.taurine = { id: '6bdbf1ae-211d-4e8b-bee3-ad53d6bc95f5', amount: 0 };
                    }
                    setSelections(s);
                }
                if (w) setCatWeight(w);
                if (a) setActivity(a);
                if (st) setStep(st);
                if (JSON.parse(saved).recipeName) setRecipeName(JSON.parse(saved).recipeName);
            } catch (e) {
                console.error("Failed to load progress", e);
            }
        } else {
            // New recipe: Initialize Taurine with fixed ID
            setSelections(prev => ({
                ...prev,
                taurine: { id: '6bdbf1ae-211d-4e8b-bee3-ad53d6bc95f5', amount: 0 }
            }));
        }
    }, []);

    // Save to localStorage
    useEffect(() => {
        if (allIngredients.length > 0) { // Don't save initial empty state
            localStorage.setItem('barf_recipe_progress', JSON.stringify({
                selections, catWeight, activity, step, recipeName
            }));
        }
    }, [selections, catWeight, activity, step]);

    const resetRecipe = () => {
        try {
            console.info('[CLICK] Reset triggered');
            if (window.remoteLog) window.remoteLog({ type: 'info', message: 'Reset triggered' });

            localStorage.removeItem('barf_recipe_progress');
            window.location.href = '/'; // Redirect to root where calculator lives
        } catch (e) {
            console.error('Reset error:', e);
            alert('Błąd podczas resetowania: ' + e.message);
        }
    };

    const addItemToList = (key) => {
        const current = localSelections[key];
        console.log(`Add to list [${key}]`, current);
        if (!current || !current.id || !current.amount) {
            alert(`Wybierz składnik i wpisz ilość dla grupy: ${key}`);
            return;
        }

        setSelections(prev => ({
            ...prev,
            [key]: [...prev[key], { ...current }]
        }));

        // Clear local selection
        setLocalSelections(prev => ({
            ...prev,
            [key]: { id: '', amount: 0 }
        }));
        alert('Składnik dodany do listy.');
    };

    const removeItemFromList = (key, index) => {
        setSelections(prev => ({
            ...prev,
            [key]: prev[key].filter((_, i) => i !== index)
        }));
    };

    const updateItemAmountInList = (key, index, amount) => {
        setSelections(prev => ({
            ...prev,
            [key]: prev[key].map((item, i) => i === index ? { ...item, amount: parseFloat(amount) || 0 } : item)
        }));
    };



    const runAnalysis = async () => {
        try {
            const items = [];
            Object.entries(selections).forEach(([key, val]) => {
                if (Array.isArray(val)) {
                    val.forEach(item => {
                        if (item.id && parseFloat(item.amount) > 0) {
                            items.push({ ingredientId: item.id, amount: parseFloat(item.amount) });
                        }
                    });
                } else if (val && val.id && parseFloat(val.amount) > 0) {
                    items.push({ ingredientId: val.id, amount: parseFloat(val.amount) });
                }
            });

            if (items.length === 0) return;

            const res = await axios.post('/api/recipes/analyze',
                { catWeight, activity, items },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setAnalysis(res.data);
        } catch (e) {
            console.error('Analysis failed', e);
        }
    };

    useEffect(() => {
        runAnalysis();
    }, [selections, catWeight, activity]);

    useEffect(() => {
        if (step === 9) {
            syncAllAuto();
        }
    }, [step]);

    const calculateSingleDose = (key, ingredientId, allSel, allIngs) => {
        const ingredient = allIngs.find(i => i.id === ingredientId);
        if (!ingredient) return allSel[key];

        // Calculate total meat weight for this current state
        let currentMeatTotal = 0;
        const meatCategories = ['muscleMeat', 'hearts', 'gizzards', 'otherOrgans', 'bones', 'fish'];

        meatCategories.forEach(k => {
            const val = allSel[k];
            if (Array.isArray(val)) {
                val.forEach(item => {
                    currentMeatTotal += parseFloat(item.amount) || 0;
                });
            } else if (val && val.id) {
                currentMeatTotal += parseFloat(val.amount) || 0;
            }
        });

        if (currentMeatTotal === 0) return allSel[key];

        const NORMS = {
            vitA: 540, vitD: 7.5, fish: 7.5, iodine: 15.1,
            iron: 1.768, vitE: 3.0, bGroup: 0.1, sodium: 70, taurine: 60,
            calcium: 81.5, caP: 70, potassium: 80, magnesium: 12
        };

        const nutrientKeyMap = {
            vitA: 'vitaminA', vitD: 'vitaminD', fish: 'vitaminD',
            iodine: 'iodine', iron: 'iron', vitE: 'vitaminE',
            bGroup: 'vitaminB1', sodium: 'sodium', taurine: 'taurine',
            calcium: 'calcium', caP: 'phosphorus', potassium: 'potassium', magnesium: 'magnesium'
        };

        let amountCalculated = 0;
        const nameLower = ingredient.name.toLowerCase();
        const isCapsule = nameLower.includes('kapsułk') || nameLower.includes('tablet');

        if (key === 'vegetables') {
            amountCalculated = currentMeatTotal * 0.10;
        } else if (key === 'readyProducts') {
            if (nameLower.includes('felini')) amountCalculated = currentMeatTotal * 0.0125;
            else if (nameLower.includes('catfortan')) amountCalculated = currentMeatTotal * 0.01;
            else if (nameLower.includes('easy b.a.r.f')) amountCalculated = currentMeatTotal * 0.01;
        } else {
            const nKey = nutrientKeyMap[key];
            if (nKey) {
                let target = (currentMeatTotal / 25) * (NORMS[key] || 0);

                if (key === 'calcium') {
                    let totalPhosphorus = 0;
                    Object.values(allSel).forEach(v => {
                        const items = Array.isArray(v) ? v : [v];
                        items.forEach(item => {
                            if (!item.id || !item.amount) return;
                            const ing = allIngs.find(i => i.id === item.id);
                            if (ing && ing.phosphorus) {
                                const isOldCapsule = ing.name.toLowerCase().includes('kapsułk') || ing.name.toLowerCase().includes('tablet');
                                totalPhosphorus += isOldCapsule ? (ing.phosphorus * parseFloat(item.amount)) : (ing.phosphorus * (parseFloat(item.amount) || 0) / 100);
                            }
                        });
                    });
                    target = totalPhosphorus * 1.15;
                }

                const baseCategories = ['muscleMeat', 'hearts', 'gizzards', 'otherOrgans', 'bones', 'fish', 'yolks', 'vegetables', 'readyProducts'];
                const tier1_independent = ['vitaminB1', 'iron', 'taurine', 'iodine', 'vitaminD'];
                const tier2_balanced = ['vitaminA'];

                let currentLevel = 0;

                // Tier 1: Supplements that provide 100% and ignore EVERYTHING else (no subtraction)
                if (tier1_independent.includes(nKey)) {
                    currentLevel = 0;
                } else if (tier2_balanced.includes(nKey)) {
                    // Tier 2: Vitamins balance against other supplements but ignore base (meat/yolks/bones/organs)
                    currentLevel = 0;
                    Object.entries(allSel).forEach(([k, v]) => {
                        if (k === key || baseCategories.includes(k)) return;
                        const items = Array.isArray(v) ? v : [v];
                        items.forEach(item => {
                            if (!item.id || !item.amount) return;
                            const ing = allIngs.find(i => i.id === item.id);
                            if (ing && ing[nKey]) {
                                const isItemCapsule = ing.name.toLowerCase().includes('kapsułk') || ing.name.toLowerCase().includes('tablet');
                                currentLevel += isItemCapsule ? (ing[nKey] * parseFloat(item.amount)) : (ing[nKey] * (parseFloat(item.amount) || 0) / 100);
                            }
                        });
                    });
                } else {
                    // Tier 3: Full accounting (subtract everything including meat base)
                    Object.entries(allSel).forEach(([k, v]) => {
                        if (k === key) return;
                        const items = Array.isArray(v) ? v : [v];
                        items.forEach(item => {
                            if (!item.id || !item.amount) return;
                            const ing = allIngs.find(i => i.id === item.id);
                            if (ing && ing[nKey]) {
                                const isItemCapsule = ing.name.toLowerCase().includes('kapsułk') || ing.name.toLowerCase().includes('tablet');
                                currentLevel += isItemCapsule ? (ing[nKey] * parseFloat(item.amount)) : (ing[nKey] * (parseFloat(item.amount) || 0) / 100);
                            }
                        });
                    });
                }

                const needed = Math.max(0, target - currentLevel);
                const perUnit = isCapsule ? (ingredient[nKey] || 0) : (ingredient[nKey] || 0) / 100;

                if (perUnit > 0) {
                    amountCalculated = needed / perUnit;
                    const sideEffects = ['potassium', 'sodium', 'vitaminA'];
                    sideEffects.forEach(seKey => {
                        if (seKey === nKey) return;
                        const seTargetBase = (currentMeatTotal / 25) * (NORMS[Object.keys(nutrientKeyMap).find(k => nutrientKeyMap[k] === seKey)] || 0);
                        if (seTargetBase === 0) return;
                        let buffer = 1.10;
                        if (seKey === 'potassium') {
                            if (['sodium', 'iron', 'calcium', 'phosphorus', 'vitaminA', 'vitaminD', 'iodine', 'vitaminB1'].includes(nKey)) {
                                buffer = 1.50; // Allow 150% buffer for K side-effect to ensure core nutrients reach 100%
                            }
                        }
                        const seTarget = seTargetBase * buffer;

                        let seCurrentLevel = 0;
                        if (tier1_independent.includes(seKey)) {
                            seCurrentLevel = 0;
                        } else {
                            Object.entries(allSel).forEach(([k, v]) => {
                                if (k === key) return;
                                if (tier2_balanced.includes(seKey) && baseCategories.includes(k)) {
                                    return;
                                }
                                const items = Array.isArray(v) ? v : [v];
                                items.forEach(item => {
                                    if (!item.id || !item.amount) return;
                                    const seIng = allIngs.find(i => i.id === item.id);
                                    if (seIng && seIng[seKey]) {
                                        const isSeCapsule = seIng.name.toLowerCase().includes('kapsułk') || seIng.name.toLowerCase().includes('tablet');
                                        seCurrentLevel += isSeCapsule ? (seIng[seKey] * parseFloat(item.amount)) : (seIng[seKey] * (parseFloat(item.amount) || 0) / 100);
                                    }
                                });
                            });
                        }
                        const sePerUnit = (ingredient[seKey] || 0) / 100;
                        if (sePerUnit > 0) {
                            const maxAllowed = Math.max(0, seTarget - seCurrentLevel) / sePerUnit;
                            if (amountCalculated > maxAllowed) amountCalculated = maxAllowed;
                        }
                    });
                    if (isCapsule) amountCalculated = Math.ceil(amountCalculated * 2) / 2;
                }
            }
        }

        return { ...allSel[key], amount: amountCalculated.toFixed(2), id: ingredientId };
    };

    const autoCalculateDose = (key, ingredientId) => {
        setSelections(prev => {
            const newObj = calculateSingleDose(key, ingredientId, prev, allIngredients);
            return { ...prev, [key]: newObj };
        });
    };

    // Global Auto-update for dosages when selections or totalMeat changes
    useEffect(() => {
        if (totalMeat === 0) return;

        const autoKeys = [
            'vegetables', 'vitA', 'vitD', 'iodine', 'bGroup', 'iron', 'vitE',
            'animalFat', 'fishOil', 'taurine', 'caP', 'calcium', 'sodium'
        ];

        // Ensure auto-calc runs sequentially to handle dependencies
        autoKeys.forEach(key => {
            const current = selections[key];
            if (current && current.id && !Array.isArray(current)) {
                autoCalculateDose(key, current.id);
            }
        });
    }, [totalMeat]);

    const findTopContributor = (nutrientKey) => {
        let maxVal = 0;
        let topIngName = null;
        let topCategory = null;
        let topId = null;

        Object.entries(selections).forEach(([cat, val]) => {
            const items = Array.isArray(val) ? val : [val];
            items.forEach(item => {
                if (!item.id || !item.amount) return;
                const ing = allIngredients.find(i => i.id === item.id);
                if (!ing) return;

                const isCapsule = ing.name.toLowerCase().includes('kapsułk') || ing.name.toLowerCase().includes('tablet');
                const contribution = isCapsule ? (ing[nutrientKey] || 0) * parseFloat(item.amount) : ((ing[nutrientKey] || 0) * parseFloat(item.amount)) / 100;

                if (contribution > maxVal) {
                    maxVal = contribution;
                    topIngName = ing.name;
                    topCategory = cat;
                    topId = item.id;
                }
            });
        });

        return { name: topIngName, category: topCategory, id: topId, value: maxVal };
    };

    const getSuggestion = (nutrientKey) => {
        if (nutrientKey === 'magnesium' || nutrientKey === 'potassium') return null;
        if (!analysis || !analysis.analysis[nutrientKey]) return null;
        const entry = analysis.analysis[nutrientKey];
        if (entry.status === 'OK') return null;

        const nutrientToCategory = {
            vitaminA: 'vitA',
            vitaminD: 'vitD',
            iodine: 'iodine',
            iron: 'iron',
            vitaminE: 'vitE',
            sodium: 'sodium',
            taurine: 'taurine',
            calcium: 'calcium',
            phosphorus: 'caP',
            magnesium: 'mineral',
            potassium: 'mineral'
        };

        const autoKeysForNutrients = {
            vitaminA: 'vitA', vitaminD: 'vitD', iodine: 'iodine', iron: 'iron',
            vitaminE: 'vitE', sodium: 'sodium', taurine: 'taurine',
            calcium: 'calcium', phosphorus: 'caP'
        };

        // If it's HIGH, we look for a contributor to reduce, ONLY for manual (non-auto) nutrients.
        // Special case: even if it's an auto-nutrient (like sodium), if it's HIGH it means the manual background
        // or the specific supplement (like Himalayan Salt adding potassium) is problematic.
        if (entry.status === 'HIGH') {
            const contributor = findTopContributor(nutrientKey);
            if (contributor.name) {
                const nameLower = contributor.name.toLowerCase();
                let customMsg = `Składnika ${nutrientKey} jest za dużo. Głównym źródłem jest ${contributor.name}. Rozważ jego redukcję.`;

                if (nutrientKey === 'potassium') {
                    if (nameLower.includes('algi') || nameLower.includes('alg morsk')) {
                        customMsg = `Potasu jest za dużo. Głównym źródłem jest ${contributor.name} (dodawana dla jodu). Rozważ jej redukcję lub poszukaj preparatu z czystszym jodem.`;
                    } else if (nameLower.includes('sól himalajsk')) {
                        customMsg = `Potasu jest za dużo. Głównym źródłem jest ${contributor.name}. Zmień na zwykłą sól (NaCl), która nie zawiera potasu.`;
                    } else if (contributor.category === 'muscleMeat' || contributor.category === 'hearts') {
                        customMsg = `Potasu jest za dużo. Mięso (${contributor.name}) ma go sporo, ale sprawdź najpierw algi i sól. Jeśli one są OK, dopiero wtedy rozważ redukcję tego mięsa.`;
                    }
                } else if (nutrientKey === 'sodium' && nameLower.includes('sól himalajsk')) {
                    customMsg = `Sodu jest za dużo. Rozważ redukcję ${contributor.name} lub zmianę na sól o mniejszym dawkowaniu.`;
                }

                return {
                    type: 'reduce',
                    category: contributor.category,
                    selectionId: contributor.id,
                    ingredientName: contributor.name,
                    message: customMsg
                };
            }
        }

        // Handle SILENT AUTOMATION and BLOCKED AUTO-KEYS (LOW status)
        if (autoKeysForNutrients[nutrientKey]) {
            // Special Case: Sodium or Iron is LOW but it's an auto-key. This means it's BLOCKED/CAPPED.
            if (nutrientKey === 'sodium' && entry.status === 'LOW') {
                const kEntry = analysis.analysis.potassium;
                if (kEntry && kEntry.status === 'HIGH') {
                    const saltSel = selections.sodium;
                    const usedHimalayan = saltSel && (Array.isArray(saltSel) ? saltSel : [saltSel]).some(s => s.id && allIngredients.find(i => i.id === s.id)?.name.toLowerCase().includes('himalajsk'));
                    if (usedHimalayan) {
                        return {
                            type: 'add',
                            category: 'sodium',
                            message: `Sodu jest ZA MAŁO (tylko ${entry.percentage}%), a Potasu ZA DUŻO. Sól himalajska podbija potas i blokuje dawkę sodu. Zmień na czystą sól (NaCl), aby dobić sód.`
                        };
                    }
                }
            }
            if (nutrientKey === 'iron' && entry.status === 'LOW') {
                const kEntry = analysis.analysis.potassium;
                if (kEntry && kEntry.status === 'HIGH') {
                    return {
                        type: 'add',
                        category: 'iron',
                        message: `Żelaza jest za mało (${entry.percentage}%). Potas jest blisko limitu i blokuje dawkę hemoglobiny. Rozważ redukcję innych źródeł potasu (np. algi, sól himalajska).`
                    };
                }
            }
            return null; // Silent for other auto-keys
        }

        const category = nutrientToCategory[nutrientKey];
        if (!category) return null;

        let selection = selections[category];
        if (Array.isArray(selection)) {
            selection = selection.find(s => s.id) || selection[0];
        }

        if (!selection || !selection.id) {
            let msg = `Składnik ${nutrientKey} poza normą. Wybierz suplement w sekcji ${category}.`;
            if (nutrientKey === 'magnesium') msg = `Magnez jest za niski. Dodaj preparat magnezowy (np. Magnez) w sekcji Minerały.`;
            if (nutrientKey === 'potassium' && entry.status === 'LOW') msg = `Potas jest za niski. Rozważ dodanie suplementu potasu w sekcji Minerały.`;

            return {
                type: 'empty',
                category,
                categoryLabel: category === 'mineral' ? 'Minerały' : (category === 'caP' ? 'Wapń/Fosfor' : category),
                message: msg
            };
        }

        const ingredient = allIngredients.find(i => i.id === selection.id);
        if (!ingredient) return null;

        const nameLower = ingredient.name.toLowerCase();
        const isCapsule = nameLower.includes('kapsułk') || nameLower.includes('tablet');

        const currentTotal = entry.value;
        const targetTotal = entry.norm;
        const diffNutrient = targetTotal - currentTotal;

        const perUnit = isCapsule ? (ingredient[nutrientKey] || 0) : (ingredient[nutrientKey] || 0) / 100;
        if (perUnit === 0) return null;

        let diffAmount = diffNutrient / perUnit;
        if (isCapsule) diffAmount = Math.round(diffAmount * 2) / 2;

        return {
            type: 'apply',
            category,
            selectionId: selection.id,
            ingredientName: ingredient.name,
            diffAmount: parseFloat(diffAmount.toFixed(2)),
            isCapsule
        };
    };

    const applySuggestion = (suggestion) => {
        const { category, selectionId, diffAmount } = suggestion;
        setSelections(prev => {
            if (Array.isArray(prev[category])) {
                const newList = prev[category].map(item => {
                    if (item.id === selectionId) {
                        return { ...item, amount: (parseFloat(item.amount) + diffAmount).toFixed(2) };
                    }
                    return item;
                });
                return { ...prev, [category]: newList };
            }

            const currentAmount = parseFloat(prev[category].amount) || 0;
            const newAmount = Math.max(0, currentAmount + diffAmount);
            return {
                ...prev,
                [category]: { ...prev[category], amount: newAmount.toFixed(2) }
            };
        });
    };
    const syncAllAuto = () => {
        const autoKeys = [
            'vegetables', 'vitA', 'vitD', 'iodine', 'bGroup', 'iron', 'vitE',
            'animalFat', 'fishOil', 'taurine', 'caP', 'calcium', 'sodium'
        ];

        setSelections(prev => {
            let nextState = { ...prev };
            autoKeys.forEach(key => {
                const current = nextState[key];
                if (current && current.id && !Array.isArray(current)) {
                    const newObj = calculateSingleDose(key, current.id, nextState, allIngredients);
                    nextState = { ...nextState, [key]: newObj };
                }
            });
            return nextState;
        });
    };

    const handleUpdateSelection = (key, field, value) => {
        if (Array.isArray(selections[key])) {
            setLocalSelections(prev => ({
                ...prev,
                [key]: { ...(prev[key] || { id: '', amount: 0 }), [field]: value }
            }));
        } else {
            setSelections(prev => ({
                ...prev,
                [key]: { ...prev[key], [field]: value }
            }));

            // Auto-trigger calculation when ID changes for non-multi keys
            if (field === 'id') {
                if (value) {
                    autoCalculateDose(key, value);
                } else {
                    // Reset to 0 if ingredient cleared
                    setSelections(prev => ({
                        ...prev,
                        [key]: { ...prev[key], amount: 0 }
                    }));
                }
            }
        }
    };

    const renderDropdownGroup = (label, selectionKey, filterFn) => {
        const ingredients = allIngredients.filter(filterFn);
        const isMulti = Array.isArray(selections[selectionKey]);
        const currentLocal = localSelections[selectionKey] || { id: '', amount: 0 };
        const addedItems = isMulti ? selections[selectionKey] : [];

        return (
            <div className="bg-ui-text/5 p-8 rounded-[2rem] border border-ui-border group hover:border-ui-accent/30 transition-all">
                <h4 className="ui-subheading mb-6">{label}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                    <div className="space-y-4">
                        <SearchableSelect
                            value={isMulti ? currentLocal.id : selections[selectionKey].id}
                            onChange={(id) => handleUpdateSelection(selectionKey, 'id', id)}
                            options={ingredients}
                            allIngredients={allIngredients}
                            placeholder="Wybierz składnik..."
                        />
                        <div className="relative">
                            <input
                                type="number"
                                placeholder="Ilość (g)"
                                value={(isMulti ? currentLocal.amount : selections[selectionKey].amount) || ''}
                                onChange={(e) => handleUpdateSelection(selectionKey, 'amount', e.target.value)}
                                className="w-full bg-ui-bg border border-ui-border rounded-xl py-4 px-6 text-sm font-bold text-ui-accent outline-none focus:ring-1 focus:ring-ui-accent transition-all"
                            />
                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black opacity-30">
                                {(() => {
                                    const sel = isMulti ? currentLocal : selections[selectionKey];
                                    const ing = allIngredients.find(i => i.id === sel.id);
                                    if (ing && (ing.name.toLowerCase().includes('kapsułk') || ing.name.toLowerCase().includes('tablet'))) return 'SZTUK';
                                    return 'GRAM';
                                })()}
                            </span>
                        </div>
                    </div>
                </div>

                {isMulti && (
                    <button
                        onClick={() => addItemToList(selectionKey)}
                        disabled={!currentLocal.id || !currentLocal.amount}
                        className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all
                                ${currentLocal.id && currentLocal.amount ? 'bg-ui-accent text-ui-bg' : 'bg-ui-text/10 text-ui-text/20 cursor-not-allowed'}`}
                    >
                        <Plus size={16} /> Dodaj do listy
                    </button>
                )}

                {isMulti && addedItems.length > 0 && (
                    <div className="mt-8 space-y-3 pt-6 border-t border-ui-border/30">
                        {addedItems.map((item, idx) => {
                            const ing = allIngredients.find(i => i.id === item.id);
                            return (
                                <div key={idx} className="flex items-center justify-between gap-4 bg-ui-bg/50 p-4 rounded-xl border border-ui-border/50">
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[10px] font-bold text-ui-accent truncate">{ing?.name}</div>
                                    </div>
                                    <div className="w-24 relative">
                                        <input
                                            type="number"
                                            value={item.amount}
                                            onChange={(e) => updateItemAmountInList(selectionKey, idx, e.target.value)}
                                            className="w-full bg-transparent border-b border-ui-accent/20 text-xs font-black text-ui-text outline-none focus:border-ui-accent transition-all "
                                        />
                                        <span className="absolute right-0 bottom-0 text-[8px] opacity-20 font-black">G</span>
                                    </div>
                                    <button
                                        onClick={() => removeItemFromList(selectionKey, idx)}
                                        className="text-ui-danger hover:scale-110 transition-transform p-2"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    const saveRecipe = async () => {
        try {
            const items = [];
            Object.entries(selections).forEach(([key, val]) => {
                if (Array.isArray(val)) {
                    val.forEach(item => {
                        if (item.id && item.amount > 0) items.push({ ingredientId: item.id, amount: parseFloat(item.amount) || 0 });
                    });
                } else {
                    if (val.id && val.amount > 0) items.push({ ingredientId: val.id, amount: parseFloat(val.amount) || 0 });
                }
            });

            console.info("Saving recipe with items:", items);
            const res = await axios.post(`${API_URL}/recipes`, {
                name: recipeName || 'Luksusowa Mieszanka ' + new Date().toLocaleDateString(),
                catWeight: parseFloat(catWeight) || 3.0,
                items
            }, { headers: { Authorization: `Bearer ${token}` } });

            console.info("Save response:", res.data);
            alert('Sukces: Przepis został zdeponowany w Twoim skarbcu.');
        } catch (e) {
            console.error('Save failed details:', e.response?.data || e.message);
            alert('Błąd zapisu: ' + (e.response?.data?.error || 'Problem z serwerem lub autoryzacją.'));
        }
    };

    const renderGauge = (label, key, unit = 'mg') => {
        if (!analysis || !analysis.analysis[key]) return null;
        const info = analysis.analysis[key];
        const { value, norm, percentage, status } = info;

        const isOk = status === 'OK';
        const colorClass = isOk ? 'bg-ui-success' : (status === 'LOW' ? 'bg-ui-warning' : 'bg-ui-danger');
        const statusLabel = isOk ? '✅ OK' : (status === 'LOW' ? '⚠️ ZA MAŁO' : (status === 'HIGH' ? '❌ ZA DUŻO' : ''));

        const suggestion = getSuggestion(key);

        return (
            <div className="relative group/gauge">
                <div className="bg-ui-text/5 p-6 rounded-3xl border border-ui-border hover:border-ui-accent/30 transition-all duration-300 group">
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
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                            className={`h-full ${colorClass} shadow-[0_0_15px_rgba(0,0,0,0.3)] transition-all duration-500`}
                        />
                    </div>
                    <div className="mt-3 flex justify-between items-center opacity-40">
                        <span className="text-[10px] font-bold uppercase tracking-widest italic">Norma: {norm.toFixed(1)}</span>
                        <span className={`text-[10px] font-black ${isOk ? 'text-ui-success' : ''}`}>
                            {percentage.toFixed(0)}%
                        </span>
                    </div>
                </div>

                {/* Suggestion "Cloud" popup */}
                <AnimatePresence>
                    {suggestion && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute z-[100] top-full mt-4 left-0 right-0 p-6 bg-ui-accent rounded-3xl shadow-2xl border border-white/20 text-ui-bg"
                        >
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-ui-accent rotate-45 border-l border-t border-white/20" />
                            <div className="flex items-start gap-4">
                                <Info className="shrink-0 w-6 h-6 mt-1" />
                                <div className="flex-1">
                                    <p className="text-xs font-black uppercase tracking-widest mb-2 opacity-80">Inteligentna Sugestia</p>

                                    {suggestion.type === 'apply' && (
                                        <>
                                            <p className="text-sm font-bold leading-tight mb-4">
                                                Proponuję {suggestion.diffAmount > 0 ? 'dodać' : 'odjąć'} <span className="underline italic">{Math.abs(suggestion.diffAmount).toFixed(2)}{suggestion.isCapsule ? ' szt.' : 'g'}</span> {suggestion.ingredientName}, aby zbilansować ten składnik.
                                            </p>
                                            <button
                                                onClick={() => applySuggestion(suggestion)}
                                                className="w-full bg-ui-bg text-ui-text py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-ui-text hover:text-ui-bg transition-all shadow-xl active:scale-95"
                                            >
                                                Zatwierdź Zmianę
                                            </button>
                                        </>
                                    )}

                                    {suggestion.type === 'reduce' && (
                                        <p className="text-sm font-bold leading-tight">{suggestion.message}</p>
                                    )}

                                    {suggestion.type === 'empty' && (
                                        <p className="text-sm font-bold leading-tight">{suggestion.message}</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-ui-bg pt-24 md:pt-32 pb-20 px-4 md:px-6 max-w-[1600px] mx-auto overflow-x-hidden w-full">
            <div className="grid grid-cols-12 gap-6 md:gap-12 w-full">
                {/* Left Column: Wizard */}
                <div className="col-span-12 lg:col-span-8">
                    <div className="mb-16 flex items-center justify-between px-4">
                        <div className="flex items-center gap-6 overflow-x-auto pb-4 custom-scrollbar">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(s => (
                                <div key={s} className="flex flex-col items-center gap-3 shrink-0">
                                    <div
                                        onClick={() => setStep(s)}
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs transition-all duration-500 cursor-pointer
                                        ${step === s ? 'bg-ui-accent text-ui-bg scale-110 shadow-[0_0_30px_rgba(56,189,248,0.4)]' :
                                                step > s ? 'bg-ui-success text-ui-text' : 'bg-ui-text/5 text-ui-text/20 border border-ui-border opacity-40'}`}
                                    >
                                        {s}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="ui-glass-card min-h-[600px] flex flex-col relative p-6 md:p-10">
                        {step === 1 && (
                            <div className="space-y-12">
                                <div className="flex items-center gap-6 mb-12">
                                    <div className="w-16 h-16 bg-ui-accent/10 rounded-2xl flex items-center justify-center">
                                        <Scale className="text-ui-accent w-8 h-8" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-ui-text">Profil Kota</h2>
                                        <span className="ui-subheading">Krok 1: Dane podstawowe</span>
                                    </div>
                                </div>

                                <div className="group">
                                    <h4 className="ui-subheading mb-4 ml-1">Nazwa Receptury</h4>
                                    <input
                                        type="text"
                                        placeholder="np. Uczta Maine Coona"
                                        value={recipeName}
                                        onChange={(e) => setRecipeName(e.target.value)}
                                        className="w-full bg-ui-text/5 border border-ui-border rounded-3xl py-4 md:py-6 px-6 md:px-8 text-xl md:text-2xl font-black text-ui-text outline-none focus:ring-2 focus:ring-ui-accent/20 focus:border-ui-accent/50 transition-all shadow-inner mb-8"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="group">
                                        <h4 className="ui-subheading mb-4 ml-1">Waga kota (kg)</h4>
                                        <input
                                            type="number"
                                            value={catWeight}
                                            onChange={(e) => setCatWeight(e.target.value)}
                                            className="w-full bg-ui-text/5 border border-ui-border rounded-3xl py-4 md:py-8 px-6 md:px-8 text-2xl md:text-4xl font-black text-ui-text outline-none focus:ring-2 focus:ring-ui-accent/20 focus:border-ui-accent/50 transition-all shadow-inner"
                                        />
                                    </div>
                                    <div className="group">
                                        <h4 className="ui-subheading mb-4 ml-1">Aktywność</h4>
                                        <select
                                            value={activity}
                                            onChange={(e) => setActivity(e.target.value)}
                                            className="w-full bg-ui-text/5 border border-ui-border rounded-3xl py-4 md:py-8 px-6 md:px-8 text-xl md:text-2xl font-black text-ui-text outline-none appearance-none"
                                        >
                                            <option value="niska">Niska</option>
                                            <option value="średnia">Średnia</option>
                                            <option value="wysoka">Wysoka</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-8">
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="w-16 h-16 bg-ui-accent/10 rounded-2xl flex items-center justify-center">
                                        <Beef className="text-ui-accent w-8 h-8" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-ui-text">Podstawa Mięsna</h2>
                                        <span className="ui-subheading">Krok 2: Mięso i kości</span>
                                    </div>
                                </div>
                                {renderDropdownGroup('Mięso mięśniowe', 'muscleMeat', i => {
                                    const n = i.name.toLowerCase().normalize('NFC');
                                    const isOrgan = n.includes('serc') ||
                                        n.includes('żołą') ||
                                        n.includes('żolą') ||
                                        n.includes('zolad') ||
                                        n.includes('wątrób') ||
                                        n.includes('watrob') ||
                                        n.includes('nerk') ||
                                        n.includes('płuc') ||
                                        n.includes('pluc') ||
                                        n.includes('śledzion') ||
                                        n.includes('sledzion') ||
                                        n.includes('mózg') ||
                                        n.includes('mozg');
                                    return i.category === 'Mieso' && !isOrgan && !n.includes('kość');
                                })}
                                {renderDropdownGroup('Serca', 'hearts', i => i.name.toLowerCase().includes('serc'))}
                                {renderDropdownGroup('Żołądki', 'gizzards', i => {
                                    const n = i.name.toLowerCase().normalize('NFC');
                                    return n.includes('żołą') || n.includes('żolą') || n.includes('zolad');
                                })}
                                {renderDropdownGroup('Inne podroby', 'otherOrgans', i => {
                                    const name = i.name.toLowerCase();
                                    const isOtherOrgan = (name.includes('wątrób') || name.includes('watrob') ||
                                        name.includes('nerk') ||
                                        name.includes('płuc') || name.includes('pluc') ||
                                        name.includes('śledzion') || name.includes('sledzion') ||
                                        name.includes('mózg') || name.includes('mozg') ||
                                        name.includes('ozór') || name.includes('ozor') ||
                                        name.includes('podrob'));
                                    return (i.category === 'Mieso' || i.category === 'Podroby') && isOtherOrgan && !name.includes('serc') && !name.includes('żołądk') && !name.includes('zoladk');
                                })}
                                {renderDropdownGroup('Mięso z kośćmi', 'bones', i => i.name.toLowerCase().includes('kość') || i.name.toLowerCase().includes('skrzyd'))}

                                <div className="p-6 md:p-8 bg-ui-accent/10 rounded-2xl border border-ui-accent/20 flex items-start md:items-center gap-6">
                                    <div className="shrink-0 pt-1 md:pt-0">
                                        <Info className="text-ui-accent w-6 h-6" />
                                    </div>
                                    <p className="text-sm md:text-base font-bold text-ui-text leading-relaxed">
                                        <span className="text-ui-accent uppercase tracking-wider block mb-2 md:mb-1">WSKAZÓWKA:</span>
                                        Mięso z kośćmi powinno stanowić około 15% mieszanki. Serca i wątróbka oraz inne podroby powinny stanowić maksymalnie ok. 30% mieszanki. Szczególną uwagę należy zwrócić na mięso wieprzowe – powinno być ono stosowane wyłącznie z pewnego źródła i po wcześniejszym przebadaniu pod kątem obecności wirusa choroby Aujeszky’ego, który jest śmiertelnie niebezpieczny dla kotów.
                                    </p>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-8">
                                <div className="flex items-center gap-6 mb-8">
                                    <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-ui-text">Dodatki Podstawowe</h2>
                                </div>

                                {/* Żółtka jaj - specialized pieces input */}
                                <div className="bg-ui-text/5 p-6 md:p-8 rounded-[2rem] border border-ui-border group hover:border-ui-accent/30 transition-all">
                                    <h4 className="ui-subheading mb-6 flex items-center gap-3">
                                        Żółtka jaj (sztuki)
                                        <span className="text-ui-accent text-[10px] font-black uppercase tracking-widest bg-ui-accent/10 px-3 py-1 rounded-full">1szt. na kg mięsa</span>
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex items-center bg-ui-bg border border-ui-border rounded-xl py-4 px-6 text-sm font-bold text-ui-text/30 cursor-not-allowed">
                                            Zoltko jajka
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                placeholder="Ilość szt."
                                                value={selections.yolks.amount ? (selections.yolks.amount / 18.5) : ''}
                                                onChange={(e) => {
                                                    const pieces = parseFloat(e.target.value) || 0;
                                                    const yolkIng = allIngredients.find(i => i.name === 'Zoltko jajka');
                                                    setSelections(prev => ({
                                                        ...prev,
                                                        yolks: { id: yolkIng?.id || '', amount: pieces * 18.5 }
                                                    }));
                                                }}
                                                className="w-full bg-ui-bg border border-ui-border rounded-xl py-4 px-6 text-sm font-bold text-ui-accent outline-none focus:ring-1 focus:ring-ui-accent transition-all"
                                            />
                                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black opacity-30">SZTUK</span>
                                        </div>
                                    </div>
                                    <p className="mt-4 text-[10px] opacity-40 font-bold italic">*Przyjęto uśrednioną wagę 18.5g na jedno żółtko.</p>
                                </div>

                                {renderDropdownGroup('Gotowe preparaty', 'readyProducts', i => {
                                    const readyList = [
                                        'Catfortan',
                                        'easy B.a.r.F basic',
                                        'easy B.a.r.F plus',
                                        'easy B.a.r.F sensitive',
                                        'Felini Complete',
                                        'Felini Renal',
                                        'Nekton Cat-VM',
                                        'Vitakalk'
                                    ];
                                    return readyList.includes(i.name);
                                })}
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-8">
                                <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-ui-text leading-none">Suplementy Naturalne,<br /> Witamina A i Witamina D</h2>

                                {renderDropdownGroup('Witamina A (Wątroba)', 'vitA', i => {
                                    const vitAList = [
                                        'Wątroba indycza', 'Wątroba kacza', 'Wątroba kurczaka',
                                        'Wątroba wieprzowa', 'Wątroba wołowa', 'Wątroba cielęca',
                                        'Wątroba gęsia', 'Wątroba jagnięca'
                                    ];
                                    return vitAList.includes(i.name);
                                })}

                                {renderDropdownGroup('Ryby', 'fish', i => {
                                    const fishList = [
                                        'Dorsz dziki', 'Dorsz hodowlany', 'Flądra', 'Halibut biały',
                                        'Krewetka surowa', 'Łosoś dziki', 'Łosoś hodowlany', 'Okoń',
                                        'Pstrąg strumieniowy', 'Sola', 'Szczupak', 'Tuńczyk', 'Węgorz'
                                    ];
                                    return fishList.includes(i.name);
                                })}

                                {renderDropdownGroup('Witamina D', 'vitD', i => {
                                    const vitDList = [
                                        'Tran z wątroby dorsza Lilly\'s Bar',
                                        'Tran z wątroby dorsza cdVet',
                                        'Tran z wątroby dorsza Lunderland',
                                        'Olej z dzikiego łososia Lunderland',
                                        'Olej z kiełków pszenicy'
                                    ];
                                    return vitDList.includes(i.name);
                                })}
                            </div>
                        )}

                        {step === 5 && (
                            <div className="space-y-8">
                                <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-ui-text">Suplementy Naturalne - Inne Witaminy i Minerały</h2>
                                {renderDropdownGroup('Jod', 'iodine', i => {
                                    const iodineNames = ['Mączka z alg morskich', "Mączka z alg morskich Lilly's Bar", 'Mączka z alg morskich Lunderland', 'Mączka z alg morskich Koebers'];
                                    return iodineNames.includes(i.name);
                                })}
                                {renderDropdownGroup('Witaminy z grupy B', 'bGroup', i => {
                                    return i.name.toLowerCase().includes('drożdże') || i.name.toLowerCase().includes('hefe');
                                })}
                                {renderDropdownGroup('Żelazo', 'iron', i => {
                                    const ironNames = ['Fortain', 'Hemoglobina wieprzowa Pokusa', 'Hemoglobina wołowa suszona', 'Krew wołowa świeża (płynna)', 'Krew gęsia świeża (płynna)'];
                                    return ironNames.includes(i.name);
                                })}
                                {renderDropdownGroup('Witamina E', 'vitE', i => {
                                    const eNames = ['Tokovit E 100 (kapsułka)', 'Tokovit E 200 (kapsułka)', 'Solgar witamina E 134mg (200IU) kapsułka', 'Witamina E (firmy Allcura)'];
                                    return eNames.includes(i.name);
                                })}
                            </div>
                        )}

                        {step === 6 && (
                            <div className="space-y-8">
                                <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-ui-text">Tłuszcze</h2>
                                {renderDropdownGroup('Tłuszcz zwierzęcy', 'animalFat', i => i.category === 'Tluszcze' && !i.name.toLowerCase().includes('olej'))}
                                {renderDropdownGroup('Oleje rybne', 'fishOil', i => i.name.toLowerCase().includes('olej rybi') || i.name.toLowerCase().includes('łosoś'))}
                            </div>
                        )}

                        {step === 7 && (
                            <div className="space-y-8">
                                <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-ui-text">Wapno i Fosfor</h2>
                                {renderDropdownGroup('Preparaty Wapń/Fosfor', 'caP', i => {
                                    const prepNames = [
                                        'Fosforan dwuwapniowy (25,5/18)', 'Fosforan dwuwapniowy (29/22)',
                                        'Mączka kostna GRAU z kości wołowych', 'Mączka kostna kozia',
                                        'Mączka kostna (30/14)', 'Mączka kostna (35/15)',
                                        'Mączka kostna (35/25)', 'Mączka kostna (56/41)'
                                    ];
                                    return prepNames.includes(i.name) || i.name.toLowerCase().includes('fosfor');
                                })}
                                {renderDropdownGroup('Wapń', 'calcium', i => {
                                    const caNames = [
                                        'Cytrynian wapnia 21%', 'Mączka ze skorupek Lilly\'s Bar',
                                        'Mączka ze skorupek Lunderland', 'Mączka ze skorupek cdVet',
                                        'Grau Kalzium Plus', 'Wapno z alg (Algenkalk Lilly\'s Bar)',
                                        'Wapno z alg (Algenkalk Lunderland)', 'Węglan wapnia 37% Lilly\'s Bar',
                                        'Fortan 40 (węglan wapnia 40%)'
                                    ];
                                    return caNames.includes(i.name) || i.name.toLowerCase().includes('wapń') || i.name.toLowerCase().includes('skorupki');
                                })}
                                {renderDropdownGroup('Sód', 'sodium', i => i.name.toLowerCase().includes('sól') || i.name.toLowerCase().includes('sód'))}
                                {renderDropdownGroup('Warzywa', 'vegetables', i => i.category === 'Warzywa')}
                            </div>
                        )}

                        {step === 8 && (
                            <div className="space-y-8">
                                <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-ui-text">Tauryna i Woda</h2>

                                {/* Taurine - Fixed Selection */}
                                <div className="bg-ui-text/5 p-6 md:p-8 rounded-[2rem] border border-ui-border group hover:border-ui-accent/30 transition-all">
                                    <h4 className="ui-subheading mb-6">Tauryna</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                                        <div className="flex items-center bg-ui-bg border border-ui-border rounded-xl py-4 px-6 text-sm font-bold text-ui-text/30 cursor-not-allowed">
                                            {allIngredients.find(i => i.id === '6bdbf1ae-211d-4e8b-bee3-ad53d6bc95f5')?.name || 'Tauryna'}
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                placeholder="Ilość (g)"
                                                value={selections.taurine.amount || ''}
                                                onChange={(e) => handleUpdateSelection('taurine', 'amount', e.target.value)}
                                                className="w-full bg-ui-bg border border-ui-border rounded-xl py-4 px-6 text-sm font-bold text-ui-accent outline-none focus:ring-1 focus:ring-ui-accent transition-all"
                                            />
                                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black opacity-30">GRAM</span>
                                        </div>
                                    </div>
                                    <p className="mt-4 text-[10px] opacity-40 font-bold italic">*Tauryna jest dodawana na stałe do każdej receptury i wyliczana automatycznie.</p>
                                </div>

                                <div className="bg-ui-success/10 p-10 rounded-[3rem] border border-ui-success/20">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <span className="ui-subheading block mb-2">Automatyczne Nawodnienie</span>
                                            <h3 className="text-2xl md:text-4xl font-black text-ui-text italic">Woda do dodania</h3>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-5xl md:text-7xl font-black text-ui-success italic tracking-tighter">
                                                {analysis ? (Math.max(0, (Math.floor(totalMeat / (catWeight * 25)) * (catWeight * 36.5)) - analysis.totals.weight + analysis.totals.addedWater)).toFixed(0) : '0'}
                                            </span>
                                            <span className="text-xl font-bold ml-2 opacity-40">ml</span>
                                        </div>
                                    </div>
                                    <p className="mt-6 text-sm opacity-60">*Wyliczone automatycznie (standardowo 20% masy całkowitej dla optymalnej wilgotności).</p>
                                </div>
                            </div>
                        )}

                        {step === 9 && (
                            <div className="space-y-12">
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="w-16 h-16 bg-ui-success/10 rounded-2xl flex items-center justify-center">
                                        <TrendingUp className="text-ui-success w-8 h-8" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-ui-text">Podsumowanie i Analiza</h2>
                                        <span className="ui-subheading">Krok 9: Weryfikacja balansu</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                {analysis && (
                                    <>
                                        <div className="p-6 md:p-10 rounded-[3rem] bg-gradient-to-br from-ui-card to-black border border-ui-border relative overflow-hidden group shadow-2xl">
                                            <div className="absolute inset-0 bg-ui-accent/5 blur-[80px] pointer-events-none" />
                                            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                                                <div>
                                                    <span className="ui-subheading mb-3 block !text-white">Równowaga Ca:P</span>
                                                    <div className="flex items-end gap-4">
                                                        <span className={`text-5xl md:text-7xl font-black italic tracking-tighter ${Math.abs(analysis.ratios.caP - 1.15) < 0.1 ? 'text-ui-success' : 'text-ui-warning'}`}>
                                                            {analysis.ratios.caP.toFixed(2)}
                                                        </span>
                                                        <span className="text-xl font-bold text-white/40 mb-2">/ 1.15</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="ui-subheading mb-3 block !text-white">Równowaga K:Na</span>
                                                    <div className="flex items-end gap-4">
                                                        <span className={`text-5xl md:text-7xl font-black italic tracking-tighter ${Math.abs(analysis.ratios.kNa - 1.5) < 0.3 ? 'text-ui-success' : 'text-ui-warning'}`}>
                                                            {analysis.ratios.kNa.toFixed(2)}
                                                        </span>
                                                        <span className="text-xl font-bold text-white/40 mb-2">/ 1.50</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6 md:p-10 rounded-[3rem] bg-gradient-to-br from-ui-card to-black border border-ui-border relative overflow-hidden group shadow-2xl mt-8">
                                            <div className="absolute inset-0 bg-ui-success/5 blur-[80px] pointer-events-none" />
                                            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                                                <div>
                                                    <span className="ui-subheading mb-3 block !text-white">Porcja Dzienna</span>
                                                    <div className="flex items-end gap-4">
                                                        <span className="text-5xl md:text-7xl font-black italic tracking-tighter text-ui-success">
                                                            {(catWeight * 42.375).toFixed(0)}
                                                        </span>
                                                        <span className="text-xl font-bold text-white/40 mb-2">g / dobę</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="ui-subheading mb-3 block !text-white">Wystarczy na</span>
                                                    <div className="flex items-end gap-4">
                                                        <span className="text-5xl md:text-7xl font-black italic tracking-tighter text-ui-success">
                                                            {analysis ? Math.floor(totalMeat / (catWeight * 25)) : '0'}
                                                        </span>
                                                        <span className="text-xl font-bold text-white/40 mb-2">dni</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Omega 3 Lunderland auto-calculation */}
                                {analysis && (() => {
                                    const days = Math.floor(totalMeat / (catWeight * 25));
                                    const omega3 = (parseFloat(catWeight) * days * 0.12).toFixed(2);
                                    return (
                                        <div className="p-6 md:p-10 rounded-[3rem] bg-gradient-to-br from-ui-card to-black border border-ui-border relative overflow-hidden shadow-2xl">
                                            <div className="absolute inset-0 bg-ui-accent/5 blur-[80px] pointer-events-none" />
                                            <div className="relative z-10 flex items-center justify-between gap-8">
                                                <div className="flex-1">
                                                    <span className="ui-subheading mb-2 block !text-white">Suplement zalecany</span>
                                                    <h3 className="text-xl md:text-3xl font-black text-white">Lunderland Omega 3</h3>
                                                    <p className="text-xs text-white/40 font-bold mt-2 italic">
                                                        {catWeight} kg × {days} dni × 0,12 g
                                                    </p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <span className="text-5xl md:text-7xl font-black italic tracking-tighter text-ui-accent">
                                                        {omega3}
                                                    </span>
                                                    <span className="text-xl font-bold ml-2 text-white/40">g</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}

                                <RecipeExcelTable analysis={analysis} />
                            </div>
                        )}

                        {/* Navigation Controls */}
                        <div className="mt-12 flex justify-between items-center border-t border-ui-border/50 pt-10 relative z-[9000]">
                            <div className="flex items-center gap-8">
                                <button
                                    onClick={() => setStep(s => Math.max(1, s - 1))}
                                    disabled={step === 1}
                                    className="flex items-center gap-2 text-ui-text/40 hover:text-ui-text transition-colors font-bold text-xs uppercase tracking-widest disabled:opacity-0 disabled:pointer-events-none"
                                >
                                    <ChevronLeft size={16} /> Wstecz
                                </button>

                                <button
                                    onClick={resetRecipe}
                                    className="flex items-center gap-2 text-ui-text/20 hover:text-ui-accent transition-colors font-bold text-[10px] uppercase tracking-widest px-4 py-2 rounded-lg hover:bg-ui-text/5 pointer-events-auto cursor-pointer relative z-[100]"
                                >
                                    <Trash2 size={12} /> Resetuj Przepis
                                </button>
                            </div>

                            <div className="flex items-center gap-6">
                                {step < 9 ? (
                                    <button
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setStep(s => s + 1); }}
                                        className="relative z-[9999] bg-white text-black px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-ui-accent hover:text-ui-text transition-all shadow-[0_20px_40px_-10px_rgba(255,255,255,0.2)] flex items-center gap-3 group cursor-pointer pointer-events-auto active:scale-95"
                                    >
                                        Następny Etap <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); saveRecipe(); }}
                                        className="relative z-[9999] bg-ui-success text-ui-text px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_-10px_rgba(34,197,94,0.3)] flex items-center gap-3 group cursor-pointer pointer-events-auto"
                                    >
                                        <Save className="w-6 h-6" /> Zapisz w Skarbcu
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Recipe Summary */}
                <div className="col-span-12 lg:col-span-4 mt-12 lg:mt-0">
                    <div className="ui-glass-card h-full sticky top-32 !p-6 md:!p-10 flex flex-col">
                        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-ui-border/50">
                            <div className="p-3 bg-ui-accent/10 rounded-2xl">
                                <List className="text-ui-accent w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-tighter text-ui-text">Mieszanka</h3>
                        </div>

                        <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar max-h-[600px]">
                            {Object.entries(selections).map(([key, val]) => {
                                const list = Array.isArray(val) ? val : [val];
                                return list.filter(s => s.id && s.amount > 0).map((s, idx) => {
                                    const ingredient = allIngredients.find(i => i.id === s.id);
                                    const isCap = ingredient?.name.toLowerCase().includes('kapsułk') || ingredient?.name.toLowerCase().includes('tablet');
                                    const isLiquid = ingredient?.name.toLowerCase().includes('krew') || key === 'water';

                                    let displayAmount = s.amount;
                                    let unit = 'g';

                                    if (key === 'yolks') {
                                        displayAmount = (s.amount / 18.5).toFixed(1);
                                        unit = 'szt.';
                                    } else if (isCap) {
                                        displayAmount = s.amount;
                                        unit = 'szt.';
                                    } else if (isLiquid) {
                                        unit = 'ml';
                                    }

                                    return (
                                        <div key={`${key}-${idx}`} className="bg-ui-text/5 p-5 rounded-[2rem] border border-ui-border group transition-all relative">
                                            <div className="absolute right-6 top-6 opacity-10 group-hover:opacity-30 transition-opacity">
                                                {isCap ? <Layers size={14} /> : <Droplet size={14} />}
                                            </div>
                                            <div className="text-[8px] font-black uppercase text-ui-muted mb-2 tracking-widest">{key}</div>
                                            <div className="text-sm font-black text-ui-text mb-4 leading-tight">{ingredient?.name}</div>
                                            <div className="text-xl font-black text-ui-accent">{displayAmount} <span className="text-[10px] opacity-30 text-ui-text">{unit}</span></div>
                                        </div>
                                    );
                                });
                            })}
                            {/* Omega 3 Lunderland auto-calculated */}
                            {analysis && (() => {
                                const days = Math.floor(totalMeat / (catWeight * 25));
                                const omega3 = (parseFloat(catWeight) * days * 0.12).toFixed(2);
                                if (parseFloat(omega3) <= 0) return null;
                                return (
                                    <div className="bg-ui-accent/10 p-5 rounded-[2rem] border border-ui-accent/20 group transition-all relative">
                                        <div className="text-[8px] font-black uppercase text-ui-accent mb-2 tracking-widest">Suplement</div>
                                        <div className="text-sm font-black text-ui-text mb-4 leading-tight">Lunderland Omega 3</div>
                                        <div className="text-xl font-black text-ui-accent">{omega3} <span className="text-[10px] opacity-30 text-ui-text">g</span></div>
                                    </div>
                                );
                            })()}
                        </div>

                        {analysis && (
                            <div className="mt-10 pt-8 border-t border-ui-border space-y-6">
                                <div className="flex justify-between items-center group">
                                    <span className="ui-subheading">Masa Mieszanki</span>
                                    <span className="text-3xl font-black tracking-tighter text-ui-text">
                                        {analysis.totals.weight.toFixed(0)} <span className="text-xs font-bold opacity-30">g</span>
                                    </span>
                                </div>
                                <div className="flex justify-between items-center group">
                                    <span className="ui-subheading">Surowe Mięso</span>
                                    <span className="text-3xl font-black tracking-tighter text-ui-accent">
                                        {analysis.totals.meatWeight.toFixed(0)} <span className="text-xs font-bold opacity-30 text-ui-text">g</span>
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
};

export default Calculator;
