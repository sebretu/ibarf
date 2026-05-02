const { generateGuestRecipe } = require('./server/src/utils/guestCalculator');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    // Kurczak pierś bez skóry (ID might be needed... let's fetch it)
    const all = await prisma.ingredient.findMany();
    const meat = all.find(i => i.name.toLowerCase().includes('kurczak pierś'));
    const veg = all.find(i => i.name.toLowerCase().includes('dynia'));
    if (!meat) { console.log('Meat not found'); return; }
    
    // catWeight=15(so huge), days=50 -> to match user's massive numbers roughly
    try {
        const res = await generateGuestRecipe(15, 'średnia', 50, [meat.id], veg ? veg.id : null);
        console.log(res.items.map(i => `${i.ingredient.name}: ${i.amount}`).join('\n'));
    } catch(e) {
        console.error(e);
    }
}
run();
