const fs = require('fs');
const file = '/home/sebretu/barf-app/client/src/pages/Recipes.jsx';
let content = fs.readFileSync(file, 'utf8');

// Find the line with Detale Receptury
const splitPoint = content.indexOf('<div className="p-10 border-b border-ui-border flex justify-between items-start">');

const fixedContent = content.substring(0, splitPoint) + `<div className="p-10 border-b border-ui-border flex justify-between items-start">
                                <div>
                                    <span className="ui-subheading mb-2">Detale Receptury</span>
                                    <h2 className="text-4xl font-black uppercase tracking-tighter text-ui-text">{selectedRecipe.name}</h2>
                                    <p className="text-ui-muted text-xs font-bold uppercase tracking-widest mt-2">{new Date(selectedRecipe.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => deleteRecipe(selectedRecipe.id)}
                                        className="p-4 bg-ui-danger text-white hover:bg-red-600 transition-all rounded-2xl flex items-center gap-3 font-black text-sm px-8 shadow-xl"
                                    >
                                        <Trash2 size={20} /> SKASUJ TRWALE
                                    </button>
                                    <button onClick={() => setSelectedRecipe(null)} className="p-4 bg-ui-text/5 hover:bg-ui-text/10 transition-all rounded-2xl group">
                                        <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                                    <div className="bg-ui-text/5 p-6 rounded-3xl border border-ui-border">
                                        <span className="ui-subheading !text-[9px]">Masa Kota</span>
                                        <div className="text-3xl font-black text-ui-text mt-2">{selectedRecipe.catWeight}kg</div>
                                    </div>
                                    <div className="bg-ui-text/5 p-6 rounded-3xl border border-ui-border">
                                        <span className="ui-subheading !text-[9px]">Na Ile Dni</span>
                                        <div className="text-3xl font-black text-ui-text mt-2">
                                            {(selectedRecipe.meatWeight / (selectedRecipe.catWeight * 25)).toFixed(1)}
                                        </div>
                                    </div>
                                    <div className="bg-ui-text/5 p-6 rounded-3xl border border-ui-border">
                                        <span className="ui-subheading !text-[9px]">Waga Porcji Dz.</span>
                                        <div className="text-3xl font-black text-ui-text mt-2">
                                            {(selectedRecipe.totalWeight / (selectedRecipe.meatWeight / (selectedRecipe.catWeight * 25))).toFixed(0)}g
                                        </div>
                                    </div>
                                    <div className="bg-ui-text/5 p-6 rounded-3xl border border-ui-border">
                                        <span className="ui-subheading !text-[9px]">Masa Całkowita</span>
                                        <div className="text-3xl font-black text-ui-text mt-2">{selectedRecipe.totalWeight.toFixed(0)}g</div>
                                    </div>
                                    <div className="bg-ui-text/5 p-6 rounded-3xl border border-ui-border">
                                        <span className="ui-subheading !text-[9px]">Masa Mięsa</span>
                                        <div className="text-3xl font-black text-ui-accent mt-2">{selectedRecipe.meatWeight.toFixed(0)}g</div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="ui-subheading mb-6">Składniki Mieszanki</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {selectedRecipe.items.map((item, idy) => (
                                            <div key={idy} className="flex items-center justify-between p-5 bg-ui-text/5 rounded-[2rem] border border-ui-border group hover:border-ui-accent/30 transition-all">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-black uppercase text-ui-muted tracking-widest">{item.ingredient.category}</span>
                                                    <span className="text-sm font-black text-ui-text">{item.ingredient.name}</span>
                                                </div>
                                                <div className="text-xl font-black text-ui-accent">
                                                    {item.amount}
                                                    <span className="text-[10px] opacity-30 text-ui-text ml-1">
                                                        {item.ingredient.name.toLowerCase().includes('kapsułk') || item.ingredient.name.toLowerCase().includes('tablet') ? 'SZT' : 'G'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {selectedRecipeAnalysis && (
                                    <div className="pt-8 border-t border-ui-border mt-8">
                                        <h3 className="ui-subheading mb-6">Pełna Analiza Przepisu</h3>
                                        <RecipeExcelTable analysis={selectedRecipeAnalysis} />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Recipes;
`;

fs.writeFileSync(file, fixedContent);
console.log("Fixed!");
