import { calculate } from './calculations.js';
import { stats } from './sessionStats.js';

var stopSession = false;

function isTouchDevice() {
  return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
}


// ESC = reject
// Any other key = resolve
const skipBtn = document.getElementById("skipBtn");
function waitForInput(signal) {
    // Immediately reject if the signal was already aborted before we even started listening
    if (signal?.aborted) {
        return Promise.reject(new Error('Operation cancelled before it began.'));
    }

    return new Promise((resolve, reject) => {
        const handleKey = (event) => {
            cleanup();
            if (event.key === 'Escape' || stopSession) {
                reject(new Error('Operation cancelled by user.'));
            } else {
                resolve('keyboard');
            }
        };

        const handleClick = () => {
            cleanup();
            if (stopSession) {
                reject(new Error('Operation cancelled by user.'));
            } else {
                resolve('touch');
            }
        };
        
        // This handler is just for the skip button, which is a specific type of rejection
        const handleSkip = () => {
            cleanup();
            reject(new Error('Input skipped by user.')); // Use a specific error message
        }

        // This handler reacts to the clsButton being clicked
        const handleAbort = () => {
            cleanup();
            reject(new Error('Session stopped by AbortController.'));
        }

        function cleanup() {
            window.removeEventListener('keydown', handleKey);
            document.removeEventListener('click', handleClick);
            skipBtn.removeEventListener('click', handleSkip);
            //  Also remove the abort listener to prevent memory leaks
            signal?.removeEventListener('abort', handleAbort);
        }

        window.addEventListener('keydown', handleKey);
        if (isTouchDevice()) {
            document.addEventListener('click', handleClick);
        }
        skipBtn.addEventListener('click', handleSkip);

        // Listen for the abort event on the signal
        signal?.addEventListener('abort', handleAbort);
    });
}

function chooseWeightedRandom(items, weightKey = 'weight', base) {
  // 1. Calculate the effective weight for each item (base^weight) and the total.
  // This transformation ensures all weights are positive and scale exponentially.
  let totalEffectiveWeight = 0;
  const itemsWithEffectiveWeight = items.map(item => {
    const originalWeight = item[weightKey];
    const effectiveWeight = originalWeight;
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

let skippedComms = [];
function skip(sessionCommsWithData, currentComm){
    // ESP key skipps a comm

    //Do nothing if only two comms in the session
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

//Starts session here
export async function start(selectedComms, pieceType, drillFactor) {
    const commDisplay = document.getElementById("comm");
    const nextDisplay = document.getElementById("next");

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
        timedComms[key] = { "times": [], "mean": 0, "deviation": 0, "weight": 10 };
    }
    timesThisSession[key] = { "times": [], "mean": 0, "deviation": 0, "weight": 10 };
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
        const statsWrapper = document.getElementById('session-stats');
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

    const base = JSON.parse(localStorage.getItem("LPs_drillFactor"));

    let currentComm = "";
    let nextComm = "";

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
            console.log(weightedList);
            if (nextComm == ""){
                nextComm = chosenItem.id;
            }
            if (chosenItem.id != nextComm){
                break;
            }
            console.log("Chosen: " + chosenItem.id);
        }

        currentComm = nextComm;
        nextComm = chosenItem.id;

        // 2. DISPLAY AND TIME IT
        commDisplay.textContent = currentComm;
        nextDisplay.textContent = "Next: " + nextComm;
        

        try {            
            var calculatedData = calculate(timedComms);
            timedComms = calculatedData.comms;

            const startTime = performance.now();

            
            await new Promise(r => setTimeout(r, 200));
            abortController = new AbortController(); // Create new controller for each loop
            const signal = abortController.signal;
            const pressedKey = await waitForInput(signal);

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
                skip(sessionCommsWithData, currentComm);
            }
        }
    }
    localStorage.setItem(pieceType, JSON.stringify(timedComms));

    
    //Stat screen

    //TODO: MAKE THE MEAN ONLY FROM TIMES FROM THE SESSION
    const sessionData = calculate(timesThisSession);
    stats(sessionData, skippedComms);
}