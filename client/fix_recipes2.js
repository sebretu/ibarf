const fs = require('fs');
const file = '/home/sebretu/barf-app/client/src/pages/Recipes.jsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');

// Find the line that has only "                                </div>" after "Masa Mięsa"
let hitMasaMiesa = false;
let extraneousLineIdx = -1;

for(let i=0; i<lines.length; i++) {
    if (lines[i].includes('Masa Mięsa')) hitMasaMiesa = true;
    if (hitMasaMiesa && lines[i].includes('</div>') && !lines[i].includes('border')) {
        extraneousLineIdx = i + 1; // The </div> after Masa Miesa div closes the grid.
        // Wait, the one after that closes flex-1
        if (lines[i+1].trim() === '</div>') {
            extraneousLineIdx = i + 1;
            break;
        }
    }
}

let newLines = [];
let passedEnd = false;
for (let i = 0; i < lines.length; i++) {
    if (i === extraneousLineIdx) {
        console.log("Removing line:", i+1, lines[i]);
        continue; // Skip the extraneous </div>
    }
    if (lines[i].includes('<RecipeExcelTable')) {
        passedEnd = true;
        newLines.push(lines[i]);
        // push until the next closing div for the analysis block
        newLines.push(lines[i+1]);
        // Now append the rest and break
        const correctEnd = `                        </div>
                    </motion.div>
                </div>
            )}
            </AnimatePresence>
        </div>
    );
};

export default Recipes;`;
        newLines.push(correctEnd);
        break;
    }
    
    newLines.push(lines[i]);
}

fs.writeFileSync(file, newLines.join('\n'));
console.log("Fixed part 2!");
