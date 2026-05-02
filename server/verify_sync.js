const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const names = [
        "Drożdże browarnicze Lunderland",
        "Hemoglobina wołowa suszona",
        "Sól himalajska"
    ];

    for (const name of names) {
        const ing = await prisma.ingredient.findUnique({ where: { name } });
        if (ing) {
            console.log(`Ingredient: ${name}`);
            console.log(`  Vitamin B1: ${ing.vitaminB1}`);
            console.log(`  Iron: ${ing.iron}`);
            console.log(`  Sodium: ${ing.sodium}`);
        } else {
            console.log(`Ingredient NOT FOUND: ${name}`);
        }
    }
}

check()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
