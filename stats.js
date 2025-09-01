import { calculate } from './calculations.js';

"use strict";


document.addEventListener("DOMContentLoaded", () => {
    // Data for dropdowns
    const data = {
        corners: {
        buffer: ["UFR", "C2", "C3", "C4", "C5", "C6", "C7"],
        sets: ["A", "B", "D","E","F","G","H","I","K","L","M","N","O","P","R","S","T","U","W","Z","Ż"],
        },
        edges: {
        buffer: ["UF", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "E9", "E10", "E11"],
        sets: ["A", "B", "D","E","F","G","H","J","K","L","Ł","M","N","O","P","R","S","T","U","W","Z","Ż"],
        },
        lps: {
        buffer: [], // LPs don't have buffer
        sets: ["A", "B","C", "D","E","F","G","H","I","J","K","L","Ł","M","N","O","P","R","S","T","U","W","Z","Ż"],
        },
    };

    // Get elements
    const pieceTypeSelect = document.getElementById("pieceType");
    const bufferSelect = document.getElementById("buffer");
    const setsSelect = document.getElementById("sets");

    const globalAoText = document.getElementById("globalAo");
    const globalStdText = document.getElementById("globalStd");
    const setsAo = document.getElementById("setsByAo");


    // Sanity check: if any element is missing, warn and bail
    if (!pieceTypeSelect || !bufferSelect || !setsSelect) {
        console.error("One or more required elements were not found by ID.");
        return;
    }

    // Helpers
    const resetSelect = (select) => {
        select.innerHTML = '<option value="">-- Select --</option>';
    };

    const populateDropdown = (select, items) => {
        resetSelect(select);
        items.forEach((item) => {
        const opt = document.createElement("option");
        opt.value = item;
        opt.textContent = item;
        select.appendChild(opt);
        });
    };

    // Function to update URL parameters
    const updateUrl = () => {
        const params = new URLSearchParams(window.location.search);
        const pieceType = pieceTypeSelect.value;
        const buffer = bufferSelect.value;
        const sets = setsSelect.value;

        if (pieceType) {
        params.set("pieceType", pieceType);
        } else {
        params.delete("pieceType");
        }

        if (buffer && !bufferSelect.disabled) {
        params.set("buffer", buffer);
        } else {
        params.delete("buffer");
        }

        if (sets) {
        params.set("sets", sets);
        } else {
        params.delete("sets");
        }

        // Replace the current URL without reloading the page
        window.history.replaceState({}, "", `${window.location.pathname}?${params}`);
};

function findKeysByLetter(lettersArray, sourceDictionary) {
  const resultDictionary = {};

  // Initialize resultDictionary with empty arrays for each letter
  lettersArray.forEach(letter => {
    resultDictionary[letter] = [];
  });

  for (const letter of lettersArray) {
    const searchLetter = letter.toLowerCase(); // Case-insensitive search

    for (const key in sourceDictionary) {
      if (Object.hasOwnProperty.call(sourceDictionary, key)) {
        const lowerCaseKey = key.toLowerCase(); // Case-insensitive search

        if (lowerCaseKey.includes(searchLetter)) {
          resultDictionary[letter][key] = sourceDictionary[key]; // Add original key
        }
      }
    }
  }
  return resultDictionary; // This returns an object
}



  const updateOutput = () => {
    const piece = pieceTypeSelect.value || "None";
    const buffer = bufferSelect.disabled ? "N/A" : bufferSelect.value || "None";
    const set = setsSelect.value || "None";
    


    //Global stats
    const allComms = JSON.parse(localStorage.getItem(piece));
    const commsData = calculate(allComms);

    globalAoText.textContent = "Average: " + commsData.mean.toFixed(2);
    globalStdText.textContent = "σ: " + commsData.deviation.toFixed(2);

    const setsDataRaw = findKeysByLetter(data[piece].sets, allComms);

    for (const [key, value] of Object.entries(setsDataRaw)) {
      setsDataRaw[key] = calculate(setsDataRaw[key]);
    } 

    console.log(setsDataRaw);

    const entries = Object.entries(setsDataRaw);

    // 2. Sort the array of entries based on the 'mean' property.
    // We want slowest (highest mean) on top, so we sort in descending order.
    entries.sort((a, b) => {
      // a[1] refers to the value part of the entry (e.g., { MEAN: 10})
      // a[1].mean accesses the mean property.
      return b[1].mean - a[1].mean; // For descending sort
    });

    // 3. Generate the paragraphs from the sorted entries.
    let paragraphsHtml = "";
    entries.forEach(entry => {
      const letter = entry[0];       // The letter (e.g., 'A')
      const mean = entry[1].mean;    // The time (e.g., 2500)
      paragraphsHtml += `<p>${letter}: ${mean.toFixed(2)}</p>\n`;
    });

    setsAo.innerHTML = paragraphsHtml;


    // Always update URL when output is updated
    updateUrl();
  };



  // Function to load selections from URL
  const loadFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const urlPieceType = params.get("pieceType");
    const urlBuffer = params.get("buffer");
    const urlSets = params.get("sets");

    // Set piece type if found in URL
    if (urlPieceType && data[urlPieceType]) {
      pieceTypeSelect.value = urlPieceType;
      // Trigger change to populate buffer and sets dropdowns
      const event = new Event('change');
      pieceTypeSelect.dispatchEvent(event);

      // Now set buffer and sets if they exist
      if (urlBuffer) {
        bufferSelect.value = urlBuffer;
      }
      if (urlSets) {
        setsSelect.value = urlSets;
      }
    }
    // After loading, ensure output and URL are consistent
    updateOutput();
  };

  // Events
  pieceTypeSelect.addEventListener("change", () => {
    const selected = pieceTypeSelect.value;

    resetSelect(bufferSelect);
    resetSelect(setsSelect);

    if (!selected) {
      bufferSelect.disabled = true;
      updateOutput();
      return;
    }

    // Buffer logic
    if (selected === "corners" || selected === "edges") {
      bufferSelect.disabled = false;
      populateDropdown(bufferSelect, data[selected].buffer);
    } else {
      bufferSelect.disabled = true;
    }

    // Sets always active and based on selected type
    populateDropdown(setsSelect, data[selected].sets);

    updateOutput();
  });

  bufferSelect.addEventListener("change", updateOutput);
  setsSelect.addEventListener("change", updateOutput);

  // Initial paint and load from URL
  loadFromUrl();
});