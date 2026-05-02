const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const newIngredients = [
    // [Ca, P] preparations
    { name: 'Fosforan dwuwapniowy (25,5/18)', category: 'Preparaty', calcium: 25500, phosphorus: 18000 },
    { name: 'Fosforan dwuwapniowy (29/22)', category: 'Preparaty', calcium: 29000, phosphorus: 22000 },
    { name: 'Mączka kostna GRAU z kości wołowych', category: 'Preparaty', calcium: 35700, phosphorus: 25600 },
    { name: 'Mączka kostna kozia', category: 'Preparaty', calcium: 14000, phosphorus: 12000 },
    { name: 'Mączka kostna (30/14)', category: 'Preparaty', calcium: 30000, phosphorus: 14000 },
    { name: 'Mączka kostna (35/15)', category: 'Preparaty', calcium: 35000, phosphorus: 15000 },
    { name: 'Mączka kostna (35/25)', category: 'Preparaty', calcium: 35000, phosphorus: 25000 },
    { name: 'Mączka kostna (56/41)', category: 'Preparaty', calcium: 56000, phosphorus: 41000 },
    // Calcium supplements
    { name: 'Cytrynian wapnia 21%', category: 'Suplementy', calcium: 21000, phosphorus: 0 },
    { name: "Mączka ze skorupek Lilly's Bar", category: 'Suplementy', calcium: 37000, phosphorus: 0 },
    { name: 'Mączka ze skorupek Lunderland', category: 'Suplementy', calcium: 37000, phosphorus: 0 },
    { name: 'Mączka ze skorupek cdVet', category: 'Suplementy', calcium: 37000, phosphorus: 0 },
    { name: 'Grau Kalzium Plus', category: 'Suplementy', calcium: 30000, phosphorus: 0 },
    { name: 'Wapno z alg (Algenkalk Lilly\'s Bar)', category: 'Suplementy', calcium: 34000, phosphorus: 0 },
    { name: 'Wapno z alg (Algenkalk Lunderland)', category: 'Suplementy', calcium: 34000, phosphorus: 0 },
    { name: "Węglan wapnia 37% Lilly's Bar", category: 'Suplementy', calcium: 37000, phosphorus: 0 },
    { name: 'Fortan 40 (węglan wapnia 40%)', category: 'Suplementy', calcium: 40000, phosphorus: 0 }
];

async function main() {
    for (const ing of newIngredients) {
        await prisma.ingredient.upsert({
            where: { name: ing.name },
            update: ing,
            create: {
                ...ing,
                protein: 0, fat: 0, water: 0, carbohydrates: 0, fiber: 0, ash: 0,
                magnesium: 0, sodium: 0, potassium: 0, chloride: 0, iron: 0, zinc: 0, copper: 0, manganese: 0, iodine: 0, selenium: 0,
                taurine: 0, vitaminA: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0, vitaminB1: 0, vitaminB2: 0, vitaminB3: 0, vitaminB5: 0,
                vitaminB6: 0, vitaminB7: 0, vitaminB9: 0, vitaminB12: 0, vitaminC: 0, omega6Linoleic: 0, omega6Arachidonic: 0
            }
        });
    }
    console.log('Seeded new ingredients successfully.');
}

main().catch(e => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});
