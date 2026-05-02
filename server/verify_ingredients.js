const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const names = [
        'Wątroba kurczaka',
        'Tran z wątroby dorsza Lunderland',
        'Mączka z alg morskich Lunderland',
        'Sól himalajska'
    ];

    for (const name of names) {
        const ing = await prisma.ingredient.findFirst({
            where: { name: { contains: name, mode: 'insensitive' } }
        });
        console.log(`Ingredient: ${name}`);
        if (ing) {
            console.log(JSON.stringify({
                name: ing.name,
                category: ing.category,
                vitaminA: ing.vitaminA,
                vitaminD: ing.vitaminD,
                iodine: ing.iodine,
                sodium: ing.sodium
            }, null, 2));
        } else {
            console.log('Not found');
        }
    }
}

main().finally(() => prisma.$disconnect());
