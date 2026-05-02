const { calculateRecipe } = require('./src/utils/calculator');

// Test Case: 4kg cat, 100g meat
// According to Analiza Sheet Row 13: Wapń norm is 80 mg/kg KGW.
// Excel logic: Norm = (TotalMeat / 25) * Constant
// Expected Calcium Norm = (100 / 25) * 80 = 320 mg.

const mockIngredient = {
    id: 'test-id',
    category: 'Mieso',
    name: 'Test Meat',
    calcium: 10, // 10mg per 100g in DB
    phosphorus: 100, // 100mg per 100g
};

const results = calculateRecipe(4, [{ ingredient: mockIngredient, amount: 100 }]);

console.log('--- NUMERICAL VERIFICATION ---');
console.log('Meat Weight:', results.totals.meatWeight, 'g');
console.log('Calculated Calcium Norm:', results.norms.calcium, 'mg');
console.log('Matching Excel (320 mg)?', results.norms.calcium === 320);
console.log('Calcium Total (10mg/100g * 100g):', results.totals.calcium, 'mg');
console.log('Ca/P Ratio:', results.ratios.caP);
console.log('------------------------------');

if (results.norms.calcium !== 320) {
    process.exit(1);
}
