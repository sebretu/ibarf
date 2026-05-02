const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const ingredients = await prisma.ingredient.findMany({
        where: {
            potassium: { gt: 0 }
        },
        orderBy: {
            potassium: 'desc'
        },
        take: 30
    });
    console.log(JSON.stringify(ingredients.map(i => ({ name: i.name, potassium: i.potassium, category: i.category })), null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
