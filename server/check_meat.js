const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const names = [
        'Wieprzowina schab',
        'Kurczak pierś bez skóry',
        'Kurczak serce',
        'Kurczak żołądek',
        'Kurczak skrzydełka całe'
    ];

    for (const name of names) {
        const ing = await prisma.ingredient.findFirst({
            where: { name: { contains: name, mode: 'insensitive' } }
        });
        if (ing) {
            console.log(`${ing.name}: Iron=${ing.iron}, Sodium=${ing.sodium}, VitA=${ing.vitaminA}, Phos=${ing.phosphorus}, PhosPer100=${ing.phosphorus}`);
        } else {
            console.log(`${name}: Not found`);
        }
    }
}

main().finally(() => prisma.$disconnect());
