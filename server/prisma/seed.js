const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
    const data = JSON.parse(fs.readFileSync('/home/sebretu/barf-temp/full_logic.json', 'utf8'));

    const sheetsToSeed = [
        { name: 'Mieso', category: 'Mieso' },
        { name: 'Ryby', category: 'Ryby' },
        { name: 'Suplementy_naturalne', category: 'Suplementy' },
        { name: 'Tluszcze', category: 'Tluszcze' },
        { name: 'Preparaty', category: 'Preparaty' },
        { name: 'Warzywa', category: 'Warzywa' }
    ];

    for (const sheetInfo of sheetsToSeed) {
        const sheetData = data.sheets[sheetInfo.name].data;
        // Skip first 2 header rows
        for (let i = 2; i < sheetData.length; i++) {
            const row = sheetData[i];
            if (!row || !row[2]) continue; // Skip if no name

            const name = row[2];

            await prisma.ingredient.upsert({
                where: { name: name },
                update: {
                    category: sheetInfo.category,
                    energy: Number(row[3]) || 0,
                    protein: Number(row[4]) || 0,
                    fat: Number(row[5]) || 0,
                    water: Number(row[6]) || 0,
                    carbohydrates: Number(row[7]) || 0,
                    fiber: (sheetInfo.category === 'Suplementy' || sheetInfo.category === 'Preparaty' || sheetInfo.category === 'Warzywa') ? (Number(row[8]) || 0) : 0,
                    ash: (sheetInfo.category === 'Preparaty' || sheetInfo.category === 'Warzywa') ? (Number(row[9]) || 0) : 0,
                    calcium: Number(row[10]) || 0,
                    phosphorus: Number(row[11]) || 0,
                    magnesium: Number(row[12]) || 0,
                    sodium: Number(row[13]) || 0,
                    potassium: Number(row[14]) || 0,
                    chloride: Number(row[15]) || 0,
                    iron: Number(row[16]) || 0,
                    zinc: Number(row[17]) || 0,
                    copper: Number(row[18]) || 0,
                    manganese: Number(row[19]) || 0,
                    iodine: Number(row[20]) || 0,
                    selenium: Number(row[21]) || 0,
                    taurine: Number(row[22]) || 0,
                    vitaminA: Number(row[23]) || 0,
                    vitaminD: Number(row[24]) || 0,
                    vitaminE: Number(row[25]) || 0,
                    vitaminK: Number(row[26]) || 0,
                    vitaminB1: Number(row[27]) || 0,
                    vitaminB2: Number(row[28]) || 0,
                    vitaminB3: Number(row[29]) || 0,
                    vitaminB5: Number(row[30]) || 0,
                    vitaminB6: Number(row[31]) || 0,
                    vitaminB7: Number(row[32]) || 0,
                    vitaminB9: Number(row[33]) || 0,
                    vitaminB12: Number(row[34]) || 0,
                    vitaminC: Number(row[35]) || 0,
                    omega6Linoleic: Number(row[36]) || 0,
                    omega6Arachidonic: Number(row[37]) || 0,
                    description: row[38] || null
                },
                create: {
                    category: sheetInfo.category,
                    name: name,
                    energy: Number(row[3]) || 0,
                    protein: Number(row[4]) || 0,
                    fat: Number(row[5]) || 0,
                    water: Number(row[6]) || 0,
                    carbohydrates: Number(row[7]) || 0,
                    fiber: (sheetInfo.category === 'Suplementy' || sheetInfo.category === 'Preparaty' || sheetInfo.category === 'Warzywa') ? (Number(row[8]) || 0) : 0,
                    ash: (sheetInfo.category === 'Preparaty' || sheetInfo.category === 'Warzywa') ? (Number(row[9]) || 0) : 0,
                    calcium: Number(row[10]) || 0,
                    phosphorus: Number(row[11]) || 0,
                    magnesium: Number(row[12]) || 0,
                    sodium: Number(row[13]) || 0,
                    potassium: Number(row[14]) || 0,
                    chloride: Number(row[15]) || 0,
                    iron: Number(row[16]) || 0,
                    zinc: Number(row[17]) || 0,
                    copper: Number(row[18]) || 0,
                    manganese: Number(row[19]) || 0,
                    iodine: Number(row[20]) || 0,
                    selenium: Number(row[21]) || 0,
                    taurine: Number(row[22]) || 0,
                    vitaminA: Number(row[23]) || 0,
                    vitaminD: Number(row[24]) || 0,
                    vitaminE: Number(row[25]) || 0,
                    vitaminK: Number(row[26]) || 0,
                    vitaminB1: Number(row[27]) || 0,
                    vitaminB2: Number(row[28]) || 0,
                    vitaminB3: Number(row[29]) || 0,
                    vitaminB5: Number(row[30]) || 0,
                    vitaminB6: Number(row[31]) || 0,
                    vitaminB7: Number(row[32]) || 0,
                    vitaminB9: Number(row[33]) || 0,
                    vitaminB12: Number(row[34]) || 0,
                    vitaminC: Number(row[35]) || 0,
                    omega6Linoleic: Number(row[36]) || 0,
                    omega6Arachidonic: Number(row[37]) || 0,
                    description: row[38] || null
                }
            });
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
