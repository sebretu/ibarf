const { calculateRecipe } = require('./calculator');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

const baseCategories = ['muscleMeat', 'hearts', 'gizzards', 'otherOrgans', 'bones', 'fish', 'yolks', 'vegetables', 'readyProducts'];
const tier1_independent = ['vitaminB1', 'iron', 'taurine', 'iodine', 'vitaminD'];
const tier2_balanced = ['vitaminA'];

async function getRequiredIngredients(meatIds, vegetableId) {
    const allIngredients = await prisma.ingredient.findMany();
    
    const findIng = (keywords) => {
        return allIngredients.find(i => {
            const nameLower = i.name.toLowerCase();
            return keywords.every(kw => nameLower.includes(kw.toLowerCase()));
        });
    };

    const mainMeats = meatIds.map(id => allIngredients.find(i => i.id === id)).filter(Boolean);

    return {
        mainMeats,
        vegetable: allIngredients.find(i => i.id === vegetableId),
        chickenHearts: findIng(['kurczak', 'serc']),
        chickenStomachs: findIng(['kurczak', 'żołądek']) || findIng(['kurczak', 'zoladek']),
        liver: findIng(['kurczak', 'wątrob']),
        yolk: findIng(['zoltko']) || findIng(['żółtko']),
        tran: findIng(['tran', 'lunderland']),
        algi: findIng(['alg', 'lunderland']),
        drozdz: findIng(['drożdże', 'lunderland']) || findIng(['drożdż']),
        hemo: findIng(['hemoglobina']),
        vitE: findIng(['tokovit']) || findIng(['vit e']),
        tauryna: findIng(['tauryn']),
        fosfor: findIng(['mączka kostna grau']) || findIng(['mączka kostna (35']) || findIng(['mączka kostna']),
        skorupki: findIng(['skorupek', 'lunderland']) || findIng(['skorupek']) || findIng(['calcium']),
        sol: findIng(['sól', 'z morza']) || findIng(['sól', 'morsk']) || findIng(['sól']),
        omega3: findIng(['omega 3', 'lunderland']) || findIng(['omega3', 'lunderland'])
    };
}

function computeDose(ingredient, nutrientKey, currentMeatTotal, currentItems, isCalcium = false) {
    if (!ingredient) {
        console.warn(`Ingredient for ${nutrientKey} not found!`);
        return 0;
    }

    const nKey = nutrientKeyMap[nutrientKey];
    let target = (currentMeatTotal / 25) * (NORMS[nutrientKey] || 0);

    const nameLower = ingredient.name.toLowerCase();
    const isCapsule = nameLower.includes('kapsułk') || nameLower.includes('tablet');

    if (isCalcium) {
        let totalPhosphorus = 0;
        currentItems.forEach(item => {
            const ing = item.ingredient;
            if (ing && ing.phosphorus) {
                const itemCapsule = ing.name.toLowerCase().includes('kapsułk') || ing.name.toLowerCase().includes('tablet');
                totalPhosphorus += itemCapsule ? (ing.phosphorus * item.amount) : (ing.phosphorus * item.amount / 100);
            }
        });
        target = totalPhosphorus * 1.15;
    }

    let currentLevel = 0;

    // In the guest calculator we always count ALL items (base meat + supplements)
    // for computing current levels. This avoids over-supplementing because
    // base meat already contributes iron, vitD, vitA etc.
    currentItems.forEach(item => {
        const ing = item.ingredient;
        if (ing && ing[nKey]) {
            const itemCapsule = ing.name.toLowerCase().includes('kapsułk') || ing.name.toLowerCase().includes('tablet');
            currentLevel += itemCapsule ? (ing[nKey] * item.amount) : (ing[nKey] * item.amount / 100);
        }
    });

    const needed = Math.max(0, target - currentLevel);
    const perUnit = isCapsule ? (ingredient[nKey] || 0) : (ingredient[nKey] || 0) / 100;

    let amountCalculated = 0;
    if (perUnit > 0) {
        amountCalculated = needed / perUnit;

        // Side effect limits
        const sideEffects = ['potassium', 'sodium', 'vitaminA'];
        sideEffects.forEach(seKey => {
            if (seKey === nKey) return;
            // For vitaminA side-effect limit, only check when the ingredient being dosed can add vitaminA (like liver)
            if (seKey === 'vitaminA' && (ingredient.vitaminA || 0) === 0) return;
            const seTargetBaseKey = Object.keys(nutrientKeyMap).find(k => nutrientKeyMap[k] === seKey);
            const seTargetBase = (currentMeatTotal / 25) * (NORMS[seTargetBaseKey] || 0);
            if (seTargetBase === 0) return;
            
            let buffer = 1.10;
            if (seKey === 'vitaminA') buffer = 1.05; // Strict cap: liver vitA max 105% of norm
            if (seKey === 'potassium') {
                if (['sodium', 'iron', 'calcium', 'phosphorus', 'vitaminA', 'vitaminD', 'iodine', 'vitaminB1'].includes(nKey)) {
                    buffer = 1.50; // Allow 150% buffer for potassium
                }
            }
            const seTarget = seTargetBase * buffer;

            let seCurrentLevel = 0;
            currentItems.forEach(item => {
                const seIng = item.ingredient;
                if (seIng && seIng[seKey]) {
                    const itemCapsule = seIng.name.toLowerCase().includes('kapsułk') || seIng.name.toLowerCase().includes('tablet');
                    seCurrentLevel += itemCapsule ? (seIng[seKey] * item.amount) : (seIng[seKey] * item.amount / 100);
                }
            });

            const sePerUnit = (ingredient[seKey] || 0) / 100;
            if (sePerUnit > 0) {
                const maxAllowed = Math.max(0, seTarget - seCurrentLevel) / sePerUnit;
                if (amountCalculated > maxAllowed) amountCalculated = maxAllowed;
            }
        });

        if (isCapsule) amountCalculated = Math.ceil(amountCalculated * 2) / 2;
    }

    return parseFloat(amountCalculated.toFixed(2));
}

async function generateGuestRecipe(catWeight, activity, days, meatIds, vegetableId) {
    let activityFactor = 1.0;
    if (activity === 'niska') activityFactor = 0.8;
    if (activity === 'wysoka') activityFactor = 1.2;

    const dailyMeat = catWeight * 25 * activityFactor;
    const totalMeat = dailyMeat * days;

    const ings = await getRequiredIngredients(meatIds, vegetableId);
    if (!ings.mainMeats.length) throw new Error("Wybrane mięso nie istnieje w bazie.");

    let proportions = new Array(ings.mainMeats.length).fill(1 / ings.mainMeats.length);
    if (ings.mainMeats.length === 2) {
        const f1 = ings.mainMeats[0].fat || 0;
        const f2 = ings.mainMeats[1].fat || 0;
        if (f1 !== f2) {
            const TARGET_FAT = 10; // Target ~10g fat per 100g
            let p1 = (TARGET_FAT - f2) / (f1 - f2);
            p1 = Math.max(0.25, Math.min(0.75, p1)); // max 75%
            proportions = [p1, 1 - p1];
        } else {
            proportions = [0.5, 0.5];
        }
    }

    const items = [];
    ings.mainMeats.forEach((meat, idx) => {
        const p = proportions[idx < proportions.length ? idx : 0];
        const meatAmount = parseFloat(((totalMeat * 0.85) * p).toFixed(2));
        items.push({ ingredient: meat, amount: meatAmount, isBase: true });
    });
    if (ings.chickenHearts) items.push({ ingredient: ings.chickenHearts, amount: parseFloat((totalMeat * 0.075).toFixed(2)), isBase: true });
    if (ings.chickenStomachs) items.push({ ingredient: ings.chickenStomachs, amount: parseFloat((totalMeat * 0.075).toFixed(2)), isBase: true });
    
    if (ings.vegetable) items.push({ ingredient: ings.vegetable, amount: parseFloat((totalMeat * 0.10).toFixed(2)), isBase: true });

    // Yolk rule: 1 yolk per 1kg of meat. 1 yolk ≈ 17g actual weight
    // Store yolkCount so we can report it as SZT in the return value
    let yolkCount = 0;
    if (ings.yolk) {
        yolkCount = Math.round(totalMeat / 1000);
        const yolkAmount = yolkCount * 17;
        items.push({ ingredient: { ...ings.yolk, _yolkCount: yolkCount }, amount: parseFloat(yolkAmount.toFixed(2)), isBase: true });
    }

    // Sequence of Supplements
    const sequence = [
        { key: 'vitA', ing: ings.liver }, // Liver acts as a supplement for Vit A
        { key: 'vitD', ing: ings.tran },
        { key: 'bGroup', ing: ings.drozdz },
        { key: 'iron', ing: ings.hemo },
        { key: 'vitE', ing: ings.vitE },
        { key: 'taurine', ing: ings.tauryna },
        { key: 'sodium', ing: ings.sol }, // Compute sodium before iodine so overlapping iodine is subtracted
        { key: 'iodine', ing: ings.algi }, 
        { key: 'phosphorus', ing: ings.fosfor }, // Compute phosphorus before calcium
        { key: 'calcium', ing: ings.skorupki, isCalcium: true }
    ];

    sequence.forEach(step => {
        if (!step.ing) return;
        const dose = computeDose(step.ing, step.key, totalMeat, items, step.isCalcium);
        if (dose > 0) {
            items.push({ ingredient: step.ing, amount: dose, isBase: false });
        }
    });

    const cleanItems = items.map(i => ({ ingredient: i.ingredient, amount: i.amount }));

    const analysis = calculateRecipe(catWeight, cleanItems, activity);

    const waterDetail = analysis.ingredientDetails && analysis.ingredientDetails.find(i => i.name === 'Woda (uzupełnienie wg normy Excel)');
    if (waterDetail && waterDetail.amount > 0) {
        cleanItems.push({
            ingredient: { name: 'Woda', category: 'Wypełniacz' },
            amount: parseFloat(waterDetail.amount.toFixed(2))
        });
    }

    // OMEGA 3 LUNDERLAND — formula: catWeight * days * 0.12
    const omega3Amount = parseFloat((catWeight * days * 0.12).toFixed(2));
    const omega3Ingredient = ings.omega3 || { name: 'Lunderland Omega 3', category: 'Suplementy zalecane' };
    cleanItems.push({
        ingredient: { ...omega3Ingredient, name: 'Lunderland Omega 3', category: 'Suplement zalecany', _isOmega3: true },
        amount: omega3Amount
    });

    // Annotate yolk items with count for SZT display
    const finalItems = cleanItems.map(item => {
        if (item.ingredient._yolkCount) {
            return { ...item, _yolkCount: item.ingredient._yolkCount };
        }
        return item;
    });

    return {
        items: finalItems,
        analysis,
        catWeight,
        totalMeat,
        meatWeight: analysis.totals.meatWeight,
        totalWeight: analysis.totals.weight
    };
}

module.exports = { generateGuestRecipe };
