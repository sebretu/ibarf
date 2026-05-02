/**
 * BARF Calculator Logic - 1:1 Port from Excel
 * Constants from Sheet: Analiza
 */

const NORMS_PER_KG_CAT = {
    calcium: 81.5,
    phosphorus: 70,
    magnesium: 12,
    sodium: 70, // mg
    potassium: 80, // mg
    chloride: 120, // mg
    iron: 1.768, // mg
    zinc: 1, // mg
    copper: 0.1, // mg
    manganese: 0.1, // mg
    iodine: 15.1, // µg
    selenium: 2, // µg
    taurine: 60, // mg
    vitaminA: 540, // I.E.
    vitaminD: 7.5, // I.E.
    vitaminE: 3, // I.E.
    vitaminK: 4, // µg
    vitaminB1: 0.1, // mg
    vitaminB2: 0.05, // mg
    vitaminB3: 0.8, // mg
    vitaminB5: 0.2, // mg
    vitaminB6: 0.08, // mg
    vitaminB7: 3, // µg
    vitaminB9: 20, // µg
    vitaminB12: 0.4, // µg
    vitaminC: 0, // mg
    omega6Linoleic: 0.25, // g
    omega6Arachidonic: 3, // mg
};

const MEAT_PORTION_PER_KG = 25; // 25g meat per 1kg cat

const calculateRecipe = (catWeight, ingredients, activity = 'średnia') => {
    // Activity Factor
    let activityFactor = 1.0;
    if (activity === 'niska') activityFactor = 0.8;
    if (activity === 'wysoka') activityFactor = 1.2;

    const adjustedMeatPortion = MEAT_PORTION_PER_KG * activityFactor;

    let totals = {
        weight: 0,
        meatWeight: 0,
        addedWater: 0,
        energy: 0,
        protein: 0,
        fat: 0,
        water: 0,
        carbohydrates: 0,
        fiber: 0,
        calcium: 0,
        phosphorus: 0,
        magnesium: 0,
        sodium: 0,
        potassium: 0,
        chloride: 0,
        iron: 0,
        zinc: 0,
        copper: 0,
        manganese: 0,
        iodine: 0,
        selenium: 0,
        taurine: 0,
        vitaminA: 0,
        vitaminD: 0,
        vitaminE: 0,
        vitaminK: 0,
        vitaminB1: 0,
        vitaminB2: 0,
        vitaminB3: 0,
        vitaminB5: 0,
        vitaminB6: 0,
        vitaminB7: 0,
        vitaminB9: 0,
        vitaminB12: 0,
        vitaminC: 0,
        omega6Linoleic: 0,
        omega6Arachidonic: 0,
    };

    let ingredientDetails = [];

    let baseNutrientsTotal = {};
    Object.keys(totals).forEach(k => baseNutrientsTotal[k] = 0);

    ingredients.forEach(item => {
        const { ingredient, amount } = item;
        const nameLower = (ingredient.name || '').toLowerCase();
        const isCapsule = nameLower.includes('kapsułk') || nameLower.includes('tablet');

        const factor = isCapsule ? amount : amount / 100;

        totals.weight += amount;
        const isBase = ingredient.category === 'Mieso' ||
            ingredient.category === 'Ryby' ||
            ingredient.category === 'Warzywa' ||
            ingredient.name.toLowerCase().includes('zoltko') ||
            ingredient.name.toLowerCase().includes('żółtko');

        if (ingredient.category === 'Mieso' || ingredient.category === 'Ryby') {
            totals.meatWeight += amount;
        }

        const details = {
            name: ingredient.name || 'Nieznany składnik',
            amount: amount,
            nutrients: {}
        };

        Object.keys(totals).forEach(key => {
            if (key !== 'weight' && key !== 'meatWeight' && key !== 'addedWater') {
                let nutrientAmount = 0;
                if (ingredient[key] !== undefined) {
                    if (isCapsule && key === 'vitaminE' && nameLower.includes('tokovit')) {
                        nutrientAmount = (ingredient[key] || 0) * amount;
                    } else {
                        nutrientAmount = (ingredient[key] || 0) * factor;
                    }
                }
                totals[key] += nutrientAmount;
                if (isBase) {
                    baseNutrientsTotal[key] += nutrientAmount;
                }
                details.nutrients[key] = nutrientAmount;
            }
        });
        ingredientDetails.push(details);
    });

    // --- DYNAMIC ADDED WATER (MOISTURE-BASED) ---
    // Goal: total water (from ingredients + added) should be 72–75% of total weight.
    // Target: 73% (midpoint). Only add water if current moisture < 72%.
    // Do NOT add water if ingredients already supply enough moisture.
    const MIN_MOISTURE = 0.72;
    const TARGET_MOISTURE = 0.73;
    const MAX_MOISTURE = 0.74;

    const currentMoisturePct = totals.weight > 0 ? totals.water / totals.weight : 0;

    if (currentMoisturePct < MIN_MOISTURE) {
        // How much water to add to reach TARGET_MOISTURE:
        // (water + X) / (weight + X) = TARGET
        // => X = (TARGET * weight - water) / (1 - TARGET)
        let requiredWater = (TARGET_MOISTURE * totals.weight - totals.water) / (1 - TARGET_MOISTURE);

        // Cap at MAX_MOISTURE
        const maxAddedWater = (MAX_MOISTURE * totals.weight - totals.water) / (1 - MAX_MOISTURE);
        if (requiredWater > maxAddedWater) requiredWater = maxAddedWater;

        if (requiredWater > 0) {
            totals.weight += requiredWater;
            totals.water += requiredWater;
            totals.addedWater = requiredWater;

            ingredientDetails.push({
                name: 'Woda (uzupełnienie wg normy Excel)',
                amount: requiredWater,
                nutrients: { water: requiredWater }
            });
        }
    }
    // If currentMoisturePct >= MIN_MOISTURE, the recipe already provides enough moisture — no water added.


    // Calculate norms based on total meat weight (linear scaling same as Excel)
    // Excel formula: Norm = (TotalMeat / AdjustedPortion) * NormPerKg
    const normFactor = totals.meatWeight / adjustedMeatPortion;

    const norms = {};
    Object.keys(NORMS_PER_KG_CAT).forEach(key => {
        let dbKey = key;
        // Map internal key to DB key if and only if they differ (they mostly match)
        if (key === 'linoleic') dbKey = 'omega6Linoleic';
        if (key === 'arachidonic') dbKey = 'omega6Arachidonic';

        norms[dbKey] = NORMS_PER_KG_CAT[key] * normFactor;
    });

    // Determine Status for each nutrient
    const tier1_independent = ['vitaminB1', 'iron', 'taurine', 'iodine', 'vitaminD'];
    const tier2_balanced = ['vitaminA'];
    // Tier 3 (Full Accounting): phosphorus, calcium, sodium, and others

    const analysis = {};
    Object.keys(norms).forEach(key => {
        let value = totals[key] || 0;

        // Match Excel: for Tier 1 and 2, "value" for analysis percentage 
        // should ignore the base (Meat/Yolks/Veg)
        // For Tier 1 (Independent), we technically should ignore everything but itself,
        // but since we only have totals and baseNutrientsTotal, subtracting base gets us 99% there.
        if (tier1_independent.includes(key) || tier2_balanced.includes(key)) {
            value = Math.max(0, value - (baseNutrientsTotal[key] || 0));
        }

        const norm = norms[key] || 0;
        const percentage = norm > 0 ? (value / norm) * 100 : 100;

        let status = 'OK';
        if (percentage < 90) status = 'LOW';
        if (percentage > 110) status = 'HIGH';

        analysis[key] = {
            value: totals[key],
            adjustedValue: value,
            norm,
            percentage,
            status
        };
    });

    const results = {
        totals,
        norms,
        analysis,
        ratios: {
            caP: totals.phosphorus !== 0 ? totals.calcium / totals.phosphorus : 0,
            kNa: totals.sodium !== 0 ? totals.potassium / totals.sodium : 0,
        },
        percentTS: totals.weight !== 0 ? (1 - (totals.water / totals.weight)) * 100 : 0,
        proteinTS: (totals.weight - totals.water) !== 0 ? (totals.protein / (totals.weight - totals.water)) * 100 : 0,
        ingredientDetails
    };

    return results;
};

module.exports = { calculateRecipe };
