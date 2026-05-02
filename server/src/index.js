const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { calculateRecipe } = require('./utils/calculator');
const { generateGuestRecipe } = require('./utils/guestCalculator');

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Remote Debug Logger
app.post('/api/log', (req, res) => {
    console.log('[BROWSER LOG]', JSON.stringify(req.body, null, 2));
    res.sendStatus(200);
});

// Auth Middleware
const authenticate = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (e) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// --- AUTH ROUTES ---
app.post('/api/auth/register', async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                acceptedTermsAt: new Date(),
                acceptedPrivacyAt: new Date()
            }
        });
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET);
        res.json({ token, user: { id: user.id, email: user.email } });
    } catch (e) {
        res.status(400).json({ error: 'User already exists' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email } });
});

// --- INGREDIENTS ---
app.get('/api/ingredients', async (req, res) => {
    const ingredients = await prisma.ingredient.findMany({
        orderBy: { name: 'asc' }
    });
    res.json(ingredients);
});

// --- RECIPES ---
app.post('/api/guest-calculator/generate', async (req, res) => {
    try {
        const { catWeight, activity, days, meatIds, vegetableId, boneMeatIds } = req.body;
        const result = await generateGuestRecipe(parseFloat(catWeight), activity, parseInt(days), meatIds, vegetableId, boneMeatIds || []);
        res.json(result);
    } catch (e) {
        console.error('Guest generation error:', e);
        res.status(500).json({ error: e.message || 'Failed to generate guest recipe' });
    }
});

app.post('/api/recipes/analyze', authenticate, async (req, res) => {
    const { catWeight, activity, items } = req.body;
    try {
        const ingredients = await Promise.all(items.map(async item => {
            const ing = await prisma.ingredient.findUnique({ where: { id: item.ingredientId } });
            return { ingredient: ing, amount: item.amount };
        }));

        const analysis = calculateRecipe(catWeight, ingredients, activity);
        res.json(analysis);
    } catch (e) {
        res.status(400).json({ error: 'Analysis failed' });
    }
});
app.post('/api/recipes', authenticate, async (req, res) => {
    try {
        const { name, catWeight, items } = req.body; // items: [{ ingredientId, amount }]
        if (!items || items.length === 0) return res.status(400).json({ error: 'Recipe is empty' });

        // Get full ingredient data
        const fullItems = await Promise.all(items.map(async (item) => {
            const ingredient = await prisma.ingredient.findUnique({ where: { id: item.ingredientId } });
            return { ingredient, amount: item.amount };
        }));

        const analysis = calculateRecipe(catWeight, fullItems);

        const recipe = await prisma.recipe.create({
            data: {
                name,
                userId: req.user.id,
                catWeight: parseFloat(catWeight) || 3.0,
                totalWeight: analysis.totals.weight,
                meatWeight: analysis.totals.meatWeight,
                items: {
                    create: items.map(item => ({
                        ingredientId: item.ingredientId,
                        amount: parseFloat(item.amount) || 0
                    }))
                }
            },
            include: { items: { include: { ingredient: true } } }
        });

        // --- Stock Deduction ---
        console.info(`[STOCK] Starting deduction for recipe ${recipe.id}`);
        await Promise.all(items.map(async (item) => {
            const stock = await prisma.magazineStock.findUnique({
                where: {
                    ingredientId_userId: {
                        ingredientId: item.ingredientId,
                        userId: req.user.id
                    }
                }
            });
            if (stock) {
                const oldAmount = parseFloat(stock.amount);
                const deductAmount = parseFloat(item.amount);
                const newAmount = Math.max(0, oldAmount - deductAmount);
                console.info(`[STOCK] Deducting ${deductAmount} from ${item.ingredientId}. Old: ${oldAmount}, New: ${newAmount}`);
                await prisma.magazineStock.update({
                    where: { id: stock.id },
                    data: { amount: newAmount }
                });
            } else {
                console.info(`[STOCK] No stock found for ${item.ingredientId}, skipping deduction`);
            }
        }));

        res.json({ recipe, analysis });
    } catch (e) {
        console.error('Save failed:', e);
        res.status(500).json({ error: 'Failed to save recipe' });
    }
});

app.get('/api/recipes', authenticate, async (req, res) => {
    const recipes = await prisma.recipe.findMany({
        where: { userId: req.user.id },
        include: { items: { include: { ingredient: true } } },
        orderBy: { createdAt: 'desc' }
    });
    res.json(recipes);
});

app.get('/api/recipes/:id', authenticate, async (req, res) => {
    const recipe = await prisma.recipe.findUnique({
        where: { id: req.params.id, userId: req.user.id },
        include: { items: { include: { ingredient: true } } }
    });
    if (!recipe) return res.status(404).json({ error: 'Not found' });

    const analysis = calculateRecipe(recipe.catWeight, recipe.items.map(i => ({
        ingredient: i.ingredient,
        amount: i.amount
    })));

    res.json({ recipe, analysis });
});

app.delete('/api/recipes/:id', authenticate, async (req, res) => {
    try {
        console.info(`[DELETE] Received request for recipe ${req.params.id} from user ${req.user.id}`);
        // Cascade delete handles RecipeItems automatically now
        await prisma.recipe.delete({
            where: { id: req.params.id, userId: req.user.id }
        });
        console.info(`[DELETE] Successfully removed recipe ${req.params.id}`);
        res.json({ success: true });
    } catch (e) {
        console.error('Delete failed:', e);
        res.status(500).json({ error: 'Failed to delete recipe' });
    }
});

// --- MAGAZINE (WAREHOUSE) ENDPOINTS ---

app.get('/api/magazine', authenticate, async (req, res) => {
    try {
        const stocks = await prisma.magazineStock.findMany({
            where: { userId: req.user.id },
            include: { ingredient: true }
        });
        res.json(stocks);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch magazine' });
    }
});

app.post('/api/magazine', authenticate, async (req, res) => {
    try {
        const { ingredientId, amount } = req.body;
        const stock = await prisma.magazineStock.upsert({
            where: {
                ingredientId_userId: { // Need unique constraint for this
                    ingredientId,
                    userId: req.user.id
                }
            },
            update: { amount: parseFloat(amount) },
            create: {
                ingredientId,
                userId: req.user.id,
                amount: parseFloat(amount)
            }
        });
        res.json(stock);
    } catch (e) {
        console.error('Magazine update failed:', e);
        res.status(500).json({ error: 'Failed to update magazine' });
    }
});

// --- SHOPPING LIST aggregator ---
app.post('/api/shopping-list', authenticate, async (req, res) => {
    const { recipeIds } = req.body;
    const recipes = await prisma.recipe.findMany({
        where: { id: { in: recipeIds }, userId: req.user.id },
        include: { items: { include: { ingredient: true } } }
    });

    const aggregation = {};
    recipes.forEach(r => {
        r.items.forEach(item => {
            const id = item.ingredientId;
            if (!aggregation[id]) {
                aggregation[id] = {
                    id,
                    name: item.ingredient.name,
                    amount: 0,
                    category: item.ingredient.category
                };
            }
            aggregation[id].amount += item.amount;
        });
    });

    // --- MAGAZINE STOCK AWARENESS ---
    const finalResults = await Promise.all(Object.values(aggregation).map(async (total) => {
        const stock = await prisma.magazineStock.findUnique({
            where: {
                ingredientId_userId: {
                    ingredientId: total.id,
                    userId: req.user.id
                }
            }
        });
        const inStock = stock ? stock.amount : 0;
        const needed = Math.max(0, total.amount - inStock);
        return {
            ...total,
            inStock,
            needed, // The actual quantity to buy
            fullyStocked: needed === 0
        };
    }));

    // --- OMEGA 3 LUNDERLAND (auto-calculated supplement) ---
    // Formula identical to Calculator: floor(meatWeight / (catWeight * 25)) * catWeight * 0.12
    let omega3Total = 0;
    recipes.forEach(r => {
        const days = Math.floor(r.meatWeight / (r.catWeight * 25));
        omega3Total += r.catWeight * days * 0.12;
    });
    omega3Total = parseFloat(omega3Total.toFixed(2));

    let omega3Item = null;
    if (omega3Total > 0) {
        // Look up ingredient by name for stock check
        const omega3Ingredient = await prisma.ingredient.findFirst({
            where: { name: { contains: 'Omega 3', mode: 'insensitive' } }
        });

        let inStock = 0;
        if (omega3Ingredient) {
            const stock = await prisma.magazineStock.findUnique({
                where: {
                    ingredientId_userId: {
                        ingredientId: omega3Ingredient.id,
                        userId: req.user.id
                    }
                }
            });
            inStock = stock ? parseFloat(stock.amount) : 0;
        }

        const needed = parseFloat(Math.max(0, omega3Total - inStock).toFixed(2));
        omega3Item = {
            id: omega3Ingredient?.id || '__omega3__',
            name: 'Lunderland Omega 3',
            category: 'Suplement',
            amount: omega3Total,
            inStock,
            needed,
            fullyStocked: needed === 0,
            isOmega3: true
        };
    }

    res.json({
        items: finalResults.filter(r => r.needed > 0),
        omega3Item
    });
});

// --- SETTINGS (Global Appearance) ---
app.get('/api/settings', async (req, res) => {
    try {
        let settings = await prisma.settings.findUnique({ where: { id: 1 } });
        if (!settings) {
            settings = await prisma.settings.create({ data: { id: 1, landingVariant: 'organic' } });
        }
        res.json(settings);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

app.post('/api/settings', authenticate, async (req, res) => {
    const { landingVariant } = req.body;
    // Admin check: only sebretu33@gmail.com can change global settings
    if (req.user.email !== 'sebretu33@gmail.com') {
        return res.status(403).json({ error: 'Forbidden: Only admin can change settings' });
    }

    try {
        const settings = await prisma.settings.upsert({
            where: { id: 1 },
            update: { landingVariant },
            create: { id: 1, landingVariant }
        });
        res.json(settings);
    } catch (e) {
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// --- ADMIN USERS LIST ---
app.get('/api/admin/users', authenticate, async (req, res) => {
    // Admin check: only sebretu33@gmail.com can see all users
    if (req.user.email !== 'sebretu33@gmail.com') {
        return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                createdAt: true,
                acceptedTermsAt: true,
                acceptedPrivacyAt: true
                // Do not return passwords
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(users);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
