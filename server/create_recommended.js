const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Find valid user (first one)
    const user = await prisma.user.findFirst();
    if (!user) {
        console.log('No user found, skip seeding recipes');
        return;
    }

    // Recommended Recipe 1: Standard Chicken BARF
    const ingredients = [
        { name: 'Kurczak, pierś bez skóry', amount: 800 },
        { name: 'Kurczak, serca', amount: 100 },
        { name: 'Kurczak, żołądki', amount: 100 },
        { name: 'Mączka ze skorupek jaj kurzych', amount: 5 },
        { name: 'Sól morska niejodowana', amount: 2 },
        { name: 'Drożdże browarnicze', amount: 2 },
        { name: 'Tauryna', amount: 2 },
        { name: 'Tran z wątroby dorsza', amount: 5 }
    ];

    const items = [];
    for (const ing of ingredients) {
        const dbIng = await prisma.ingredient.findFirst({ where: { name: { contains: ing.name } } });
        if (dbIng) {
            items.push({ ingredientId: dbIng.id, amount: ing.amount });
        }
    }

    if (items.length > 0) {
        await prisma.recipe.create({
            data: {
                name: 'Polecany: Kurczak Klasyczny',
                userId: user.id,
                catWeight: 4,
                meatWeight: 1000,
                totalWeight: 1016,
                items: { create: items }
            }
        });
        console.log('Created recommended recipe: Kurczak Klasyczny');
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
