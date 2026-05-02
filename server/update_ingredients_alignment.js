const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const updates = [
        { name: 'Wątroba kurczaka', data: { vitaminA: 36941.53 } },
        { name: 'Tran z wątroby dorsza Lunderland', data: { vitaminD: 41489 } },
        { name: 'Mączka z alg morskich Lunderland', data: { iodine: 53114 } },
        { name: 'Sól himalajska', data: { sodium: 39300 } }
    ];

    for (const update of updates) {
        const result = await prisma.ingredient.updateMany({
            where: { name: { contains: update.name, mode: 'insensitive' } },
            data: update.data
        });
        console.log(`Updated ${update.name}: ${result.count} records affected.`);
    }
}

main().finally(() => prisma.$disconnect());
