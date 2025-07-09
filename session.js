import { stats } from './stats.js';
import { calculate } from './calculations.js';

var stopSession = false

function keyboardPress() {
    return new Promise((resolve, reject) => {
        const handleKeyDown = (event) => {
            window.removeEventListener('keydown', handleKeyDown);
            if (event.key === 'Escape' || stopSession) {
                reject(new Error('Operation cancelled by user.'));
            } 
            else {
                resolve(event.key);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
    });
}


function chooseWeightedRandom(items, weightKey = 'weight', base) {
  // 1. Calculate the effective weight for each item (base^weight) and the total.
  // This transformation ensures all weights are positive and scale exponentially.
  let totalEffectiveWeight = 0;
  const itemsWithEffectiveWeight = items.map(item => {
    const originalWeight = item[weightKey];
    const effectiveWeight = Math.pow(base, originalWeight);
    totalEffectiveWeight += effectiveWeight;
    return {
      originalItem: item,
      effectiveWeight: effectiveWeight,
    };
  });

  // Edge case: if all weights were -Infinity, total could be 0.
  if (totalEffectiveWeight === 0) {
    // Return a random item with equal probability.
    return items[Math.floor(Math.random() * items.length)];
  }

  // 2. Perform the standard "roulette wheel" selection on the new effective weights.
  const randomNumber = Math.random() * totalEffectiveWeight;

  let weightSum = 0;
  for (const item of itemsWithEffectiveWeight) {
    weightSum += item.effectiveWeight;
    if (randomNumber <= weightSum) {
      return item.originalItem; // Return the original item object
    }
  }
}


export async function start(selectedComms, pieceType, drillFactor) {
    const commDisplay = document.getElementById("comm");
    const stopBtn = document.getElementById("close");

    // Load timed comms
    var timedComms = JSON.parse(localStorage.getItem(pieceType));

    // If not any, make a template
    if (timedComms == null) {

        timedComms = {};
    }

    // Add not-present comms to the master list with a default weight
    selectedComms.forEach(key => {
    if (!(key in timedComms)) {
        timedComms[key] = { "times": [], "mean": 0, "deviation": 0, "weight": 1 };
    }
    });

    // --- CORRECTED SNIPPET ---
    // Create an object containing only the comms we want to practice.
    const selectedCommsData = Object.fromEntries(
        selectedComms
            .filter(key => key in timedComms) // Ensure we only include valid keys
            .map(key => [key, timedComms[key]])
    );
    

    // --- MAIN LOOP ---

    const clsButton = document.getElementById('close');
    stopSession = false;
    let abortController = null;

    if (clsButton){
        const statsWrapper = document.getElementById('stats');
        const sessionWrapper = document.getElementById('session');
        clsButton.addEventListener('click', () => {
                // Toggle the 'd-none' class on the content wrapper.
                // 'd-none' is a Bootstrap utility class for `display: none`.
                // classList.toggle() adds the class if it's not there, and removes it if it is.
                console.log("close button clicked");
                statsWrapper.classList.toggle('d-none');
                sessionWrapper.classList.toggle('d-none');
                stopSession = true;
                if (abortController) abortController.abort();
                
            });
    }

    const base = JSON.parse(localStorage.getItem("LPs_drillFactor"))

    while (!stopSession) {
        // Convert the data into an array suitable for our weighted random function.
        // This format is easier to work with: [{id: 'commName', weight: 5}, ...]
        const weightedList = Object.keys(selectedCommsData).map(commName => {
            return {
            id: commName,
            weight: timedComms[commName].weight
            };
        });

        // 1. CHOOSE A COMM USING WEIGHTED RANDOMNESS
        const chosenItem = chooseWeightedRandom(weightedList, "weight", base);
        const currentComm = chosenItem.id;

        // 2. DISPLAY AND TIME IT
        commDisplay.textContent = currentComm;

        

        try {
            abortController = new AbortController();
            //Send a calculation request
            
            timedComms = calculate(timedComms);

            const startTime = performance.now();
            await new Promise(r => setTimeout(r, 200));
            const pressedKey = await keyboardPress(); // Using your provided function name
            const endTime = performance.now();

            const time = ((endTime - startTime) / 1000).toFixed(2);

            // You can now update the data for the specific comm that was practiced
            // For example:
            console.log(time);
            timedComms[currentComm].times.push(parseFloat(time));
            


        } catch (error) {
            // This will catch the 'Escape' key press from keyboardPress()
            localStorage.setItem(pieceType, JSON.stringify(timedComms));
            console.log("boom");
            console.log("Loop interrupted:", error.message);
            break;
        }
    }
    localStorage.setItem(pieceType, JSON.stringify(timedComms));
    stats(timedComms, selectedComms );
}