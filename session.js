import { calculate } from './calculations.js';

var stopSession = false;

// ESC = reject
// Any other key = resolve
function keyboardPress(abortSignal) {
    return new Promise((resolve, reject) => {
        const handleKeyDown = (event) => {
            cleanup();
            if (event.key === 'Escape') {
                reject(new Error('Operation cancelled by user.'));
            } else {
                resolve(event.key);
            }
        };

        const handleAbort = () => {
            cleanup();
            reject(new Error('Operation cancelled via AbortController.'));
        };

        function cleanup() {
            window.removeEventListener('keydown', handleKeyDown);
            abortSignal?.removeEventListener('abort', handleAbort);
        }

        window.addEventListener('keydown', handleKeyDown);
        abortSignal?.addEventListener('abort', handleAbort);
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

    // Load timed comms
    var timedComms = JSON.parse(localStorage.getItem(pieceType));

    // If not any, make a template
    if (timedComms == null) {

        timedComms = {};
    }

    // Add lacking comms to the main comms list and create 1 session only times list
    let timesThisSession = {};
    selectedComms.forEach(key => {
    if (!(key in timedComms)) {
        timedComms[key] = { "times": [], "mean": 0, "deviation": 0, "weight": 1 };
    }
    timesThisSession[key] = { "times": [], "mean": 0, "deviation": 0, "weight": 1 };
    });

    // --- CORRECTED SNIPPET ---
    // Create an object containing only the comms we want to practice.
    let sessionCommsWithData = Object.fromEntries(
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
                abortController.abort();
            });
    }

    const base = JSON.parse(localStorage.getItem("LPs_drillFactor"))

    let currentComm = "";

    let skippedComms = [];

    while (!stopSession) {
        // Convert the data into an array suitable for our weighted random function.
        // This format is easier to work with: [{id: 'commName', weight: 5}, ...]
        const weightedList = Object.keys(sessionCommsWithData).map(commName => {
            return {
            id: commName,
            weight: timedComms[commName].weight
            };
        });

        // 1. CHOOSE A COMM USING WEIGHTED RANDOMNESS
        while (1) {
            var chosenItem = chooseWeightedRandom(weightedList, "weight", base);
            console.log("Chosen comm" + chosenItem);
            if (chosenItem.id != currentComm){
                break;
            }
        }

        currentComm = chosenItem.id;

        // 2. DISPLAY AND TIME IT
        commDisplay.textContent = currentComm;

        

        try {            
            var calculatedData = calculate(timedComms);
            timedComms = calculatedData.comms;

            const startTime = performance.now();

            
            await new Promise(r => setTimeout(r, 200));
            abortController = new AbortController(); // Create new controller for each loop
            const signal = abortController.signal;
            const pressedKey = await keyboardPress(signal);

            const endTime = performance.now();
            const time = ((endTime - startTime) / 1000).toFixed(2);

            // You can now update the data for the specific comm that was practiced
            // For example:
            console.log(time);
            timedComms[currentComm].times.push(parseFloat(time));
            timesThisSession[currentComm].times.push(parseFloat(time));
            console.log(sessionCommsWithData);
            


        } catch (error) {
            if(!stopSession){
                // ESP key skipps a comm

                //Do nothing if only two comms in the session
                console.log(error);
                //If it was skipped already once, remove it from the session
                if(Object.keys(sessionCommsWithData).length > 2){
                    if (skippedComms.includes(currentComm)){
                        console.log("Removed: " + currentComm);
                        delete sessionCommsWithData[currentComm];
                    } 
                    // If not add to skipped
                    else {
                        skippedComms.push(currentComm);
                        console.log("Skipped: " + skippedComms);
                    }
                    
                } else {
                    console.log("Can't remove, only 2 comms in the session");
                }
            }
        }
    }
    localStorage.setItem(pieceType, JSON.stringify(timedComms));

    
    //Stat screen

    //TODO: MAKE THE MEAN ONLY FROM TIMES FROM THE SESSION
    const sessionData = calculate(timesThisSession)
    let mean = sessionData.mean.toFixed(2);
    let stDeviation = sessionData.deviation.toFixed(2);

    //Show the data
    document.getElementById("mean").textContent = 'Mean: ' + mean;
    document.getElementById("stdeviation").textContent = "Standard deviation: " + stDeviation;
}