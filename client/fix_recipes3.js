const fs = require('fs');
const file = '/home/sebretu/barf-app/client/src/pages/Recipes.jsx';
let content = fs.readFileSync(file, 'utf8');

const splitPoint = content.indexOf('Składniki Mieszanki');

// we want to go back to the opening <div> for that block, which is just before it
const replaceIndex = content.lastIndexOf('<div>', splitPoint);

// Then we want to go back to the previous line and see if there's a </div> there that should be removed. 
// Let's just slice until the grid ends.
const gridIndex = content.indexOf('<div className="grid grid-cols-1 md:grid-cols-5 gap-6">');
const endOfGridStr = 'g</div>\n                                    </div>\n                                </div>\n';
const gridEndIndex = content.indexOf(endOfGridStr, gridIndex);

if (gridEndIndex > 0) {
    const keepText = content.substring(0, gridEndIndex + endOfGridStr.length);
    const newEnd = `
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
    fs.writeFileSync(file, keepText + newEnd);
    console.log("Fixed part 3!");
} else {
    console.log("Could not find grid end");
}

