import { start } from './session.js';

// Global variables
var pieceType = "";

function clearGeneratedButtons() {
    const container = document.getElementById('button-container');
    if (container) {
        container.innerHTML = '';
    }
}


const backBtn = document.getElementById("back");
if (backBtn) {
    backBtn.addEventListener('click', () => {
        document.getElementById("main-menu").classList.remove('d-none');
        document.getElementById("menu").classList.add('d-none');
        clearGeneratedButtons(); 
    });
}


//Checks if a give pair is valid
function isValidPair(pieceType, sticker1, sticker2){
    switch(pieceType){
        case "LPs":
            return true;
        case "corners":
            return !cornersStickers.some(group => group.includes(sticker1) && group.includes(sticker2));
        case "edges":
            return !edges_stickers.some(group => group.includes(sticker1) && group.includes(sticker2));
    }
    
}

// Load the scheme
function getScheme() {
    let scheme = localStorage.getItem("scheme");
    if (scheme == null) {
        scheme = "ABCDEFGHIJKLMNOPQRSTUVWX";
    }
  return scheme;
}

// Deletes invalid sets (for one buffer only for now)
function deleteForbiddenSets(letter){
    let forbidden = [];
    switch(pieceType){
        case "LPs":
            return true;
        
        case "corners":
            forbidden = [UFR, FUR, RUF]; // UFR
            return !(forbidden.includes(letter));
    
        case "edges":
            forbidden = [UF, FU]; // UF
            return !(forbidden.includes(letter));
    }
}


export async function genButtons(piece) {
    clearGeneratedButtons();
    // Show selection menu
    document.getElementById("main-menu").classList.toggle('d-none');
    document.getElementById("menu").classList.toggle('d-none');

    pieceType = piece;

    const scheme = getScheme();
    const scheme_list = scheme.split("");

    // Corners stickers
    UBL = scheme[0];
    UBR = scheme[1];
    UFR = scheme[2];
    UFL = scheme[3];
    LUB = scheme[4];
    LUF = scheme[5];
    LDF = scheme[6];
    LDB = scheme[7];
    FUL = scheme[8];
    FUR = scheme[9];
    FDR = scheme[10];
    FDL = scheme[11];
    RUF = scheme[12];
    RUB = scheme[13];
    RDB = scheme[14];
    RDF = scheme[15];
    BUR = scheme[16];
    BUL = scheme[17];
    BDL = scheme[18];
    BDR = scheme[19];
    DFR = scheme[20];
    DFL = scheme[21];
    DBL = scheme[22];
    DBR = scheme[23];

    cornersStickers = [[UBL, BUL, LUB], [UBR, BUR, RUB], [UFR, FUR, RUF], [UFL, LUF, FUL], [DFL, FDL, LDF], [DFR, FDR, RDF], [DBL, BDL, LDB], [DBR, BDR, RDB]];

    //Edges stickers

    UB = scheme[0];
    UR = scheme[1];
    UF = scheme[2];
    UL = scheme[3];
    LU = scheme[4];
    LF = scheme[5];
    LD = scheme[6];
    LB = scheme[7];
    FU = scheme[8];
    FR = scheme[9];
    FD = scheme[10];
    FL = scheme[11];
    RU = scheme[12];
    RB = scheme[13];
    RD = scheme[14];
    RF = scheme[15];
    BU = scheme[16];
    BL = scheme[17];
    BD = scheme[18];
    BR = scheme[19];
    DF = scheme[20];
    DR = scheme[21];
    DB = scheme[22];
    DL = scheme[23];

    edges_stickers = [[UB, BU], [UR, RU], [UF, FU], [UL, LU], [FR, RF], [FL, LF], [BL, LB], [BR, RB], [DF, FD], [DR, RD], [DB, BD], [DL, LD]];

    const pice_type_sets = scheme_list.filter(deleteForbiddenSets)

    // 1. Get a reference to the HTML container element.
    const container = document.getElementById('button-container');

    const buttonStates = {};

    // 2. Loop through each text in our list to create the split buttons.
    pice_type_sets.forEach(label => {

        // a. Create the grid column div.
        const colDiv = document.createElement('div');
        colDiv.className = 'col-lg-2 col-md-4 col-sm-6 col-6';

        // b. Create the 'btn-group' wrapper.
        const btnGroupWrapper = document.createElement('div');
        btnGroupWrapper.className = 'btn-group w-100';
        btnGroupWrapper.setAttribute('role', 'group');

        // --- PRIMARY ACTION BUTTON (as a Checkbox) ---
        // c. Create the actual, hidden checkbox input.
        const primaryCheckbox = document.createElement('input');
        primaryCheckbox.type = 'checkbox';
        primaryCheckbox.className = 'btn-check'; // This class hides the default checkbox.
        primaryCheckbox.id = `check-main-${label}`;
        primaryCheckbox.autocomplete = 'off';

        // d. Create the label that LOOKS like a button.
        const primaryLabel = document.createElement('label');
        primaryLabel.className = 'btn btn-outline-success'; // Use an "outline" style for the unchecked state.
        primaryLabel.htmlFor = primaryCheckbox.id; // Links the label to the checkbox.
        primaryLabel.textContent = label;

        // e. Initialize and add a state-change listener to the primary checkbox.
        buttonStates[primaryCheckbox.id] = false; // Initial state is unchecked.
        primaryCheckbox.addEventListener('input', () => {
        const isChecked = primaryCheckbox.checked;

        // 1. Update the state for the main button itself.
        buttonStates[primaryCheckbox.id] = isChecked;

        // 2. Find all sub-checkboxes within THIS dropdown menu.
        const subCheckboxes = dropdownMenu.querySelectorAll('input[type="checkbox"]');

        // 3. Loop through them and update their state to match the main button.
        subCheckboxes.forEach(subCheckbox => {
            // Update the actual checkbox element's state on the page.
            subCheckbox.checked = isChecked;
            // Update the state in our tracker object.
            buttonStates[subCheckbox.id] = isChecked;
        });

    console.log('State updated by main button:', buttonStates);
    });

        // --- DROPDOWN TOGGLE (remains a simple button) ---
        // f. Create the dropdown toggle button (the arrow part).
        const toggleButton = document.createElement('button');
        toggleButton.type = 'button';
        toggleButton.className = 'btn btn-success dropdown-toggle dropdown-toggle-split';
        toggleButton.setAttribute('data-bs-toggle', 'dropdown');
        toggleButton.setAttribute('aria-expanded', 'false');
        toggleButton.innerHTML = `<span class="visually-hidden">Toggle Dropdown</span>`;

        // --- DROPDOWN MENU ---
        // g. Create the dropdown menu list.
        const dropdownMenu = document.createElement('ul');
        dropdownMenu.className = 'dropdown-menu';

        // h1. Create labels for dropdown buttons
        var dropdownLabel = [];
        for(let i  = 0; i < pice_type_sets.length; i++){
            if (isValidPair(pieceType, label, pice_type_sets[i])){
                dropdownLabel.push(label + pice_type_sets[i]);
            }
        }

        // h2. Create and add the placeholder items (as checkboxes) to the menu.
        dropdownLabel.forEach(itemText => {
            const safeItemTextId = itemText.replace(/\s+/g, '-').toLowerCase();
            
            // Each item in the menu is now also a checkbox/label pair.
            const li = document.createElement('li');

            const itemCheckbox = document.createElement('input');
            itemCheckbox.type = 'checkbox';
            itemCheckbox.className = 'btn-check';
            itemCheckbox.id = `check-sub-${label}-${safeItemTextId}`;
            itemCheckbox.autocomplete = 'off';
            itemCheckbox.className = 'btn btn-outline-success';

            const itemLabel = document.createElement('label');
            itemLabel.className = 'dropdown-item'; // It's a label, but styled like a dropdown item.
            itemLabel.htmlFor = itemCheckbox.id;
            itemLabel.textContent = itemText;
            
            // Initialize and add listener for the sub-item checkbox.
            buttonStates[itemCheckbox.id] = false;
            itemCheckbox.addEventListener('input', () => {
                buttonStates[itemCheckbox.id] = itemCheckbox.checked;
                console.log(buttonStates);
            });

            // Add the checkbox and its label to the list item.
            li.appendChild(itemCheckbox);
            li.appendChild(itemLabel);
            dropdownMenu.appendChild(li);
        });

        // i. Assemble the final component. Order matters!
        btnGroupWrapper.appendChild(primaryCheckbox); // Hidden checkbox first
        btnGroupWrapper.appendChild(primaryLabel);    // Then its visible label
        btnGroupWrapper.appendChild(toggleButton);    // Then the dropdown toggle
        btnGroupWrapper.appendChild(dropdownMenu);    // And finally the menu

        colDiv.appendChild(btnGroupWrapper);
        container.appendChild(colDiv);
    });

    let startButton = document.getElementById('start');

    // 1. Create a clean clone of the button. This clone has no event listeners.
    const newStartButton = startButton.cloneNode(true);

    // 2. Replace the old button in the webpage with our new, clean clone.
    startButton.parentNode.replaceChild(newStartButton, startButton);

    // 3. Update our variable to point to the new, clean button.
    startButton = newStartButton; 

    // 4. Now, we can safely add our new event listener.
    if (startButton) {
        startButton.addEventListener('click', () => {
            // This Set needs to be created INSIDE the listener
            // so it is fresh every time the button is clicked.
            const selectedComms = new Set();
            
            // Loop through the buttonStates for THIS session.
            for (const [buttonId, isChecked] of Object.entries(buttonStates)) {
                
                if (isChecked) {
                    const labelElement = document.querySelector(`label[for="${buttonId}"]`);

                    // This logic is now safe because the old listeners that
                    // were looking for non-existent labels are gone.
                    if (labelElement && labelElement.textContent.length == 2) {
                        selectedComms.add(labelElement.textContent);

                        if (document.getElementById('inverse').checked){
                            const reversed = labelElement.textContent.split("").reverse().join("");
                            selectedComms.add(reversed);
                        }
                    }
                }
            }

            // Log the final Set to the console to see the result.
            console.log("--- START CLICKED ---");
            console.log("Collected Labels:", selectedComms);

             // Hide content
            const contentWrapper = document.getElementById('menu');
            const sessionWrapper = document.getElementById('session');
            contentWrapper.classList.toggle('d-none');
            sessionWrapper.classList.toggle('d-none');
            
            // start session
            const commslist = [...selectedComms];
            start(commslist, pieceType);
        });
    } 
}




var UBL = "";
var UBR = "";
var UFR = "";
var UFL = "";
var LUB = "";
var LUF = "";
var LDF = "";
var LDB = "";
var FUL = "";
var FUR = "";
var FDR = "";
var FDL = "";
var RUF = "";
var RUB = "";
var RDB = "";
var RDF = "";
var BUR = "";
var BUL = "";
var BDL = "";
var BDR = "";
var DFR = "";
var DFL = "";
var DBL = "";
var DBR = "";

//Edges stickers

var UB = "";
var UR = "";
var UF = "";
var UL = "";
var LU = "";
var LF = "";
var LD = "";
var LB = "";
var FU = "";
var FR = "";
var FD = "";
var FL = "";
var RU = "";
var RB = "";
var RD = "";
var RF = "";
var BU = "";
var BL = "";
var BD = "";
var BR = "";
var DF = "";
var DR = "";
var DB = "";
var DL = "";


var cornersStickers = [];
var edges_stickers = [];

