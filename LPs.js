import { start } from './session.js';

// It takes the scheme
async function getScheme() {
    var scheme = JSON.parse(localStorage.getItem("scheme"));
    if (scheme == null){
        scheme = "ABCDEFGHIJKLMNOPQRSTUVWX";
    }

    return scheme;
}


async function main() {
    const scheme = await getScheme();
    const scheme_list = scheme.split("");

    // 1. Get a reference to the HTML container element.
    const container = document.getElementById('button-container');

    const buttonStates = {};

    // 2. Loop through each text in our list to create the split buttons.
    scheme_list.forEach(label => {

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
        for(let i  = 0; i < scheme.length; i++){
            dropdownLabel.push(label + scheme[i]);
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

    const startButton = document.getElementById('start');



const selectedComms = new Set();
// Start button
if (startButton) {
    startButton.addEventListener('click', () => {
        // a. Create a new Set to store the labels of checked buttons.
        // A Set automatically handles duplicates, which is useful.
        

        // b. Loop through our buttonStates object.
        // The `key` will be the checkbox ID (e.g., 'check-main-A').
        // The `value` will be `true` or `false`.
        for (const [buttonId, isChecked] of Object.entries(buttonStates)) {
            
            // c. If the button's state is `true` (it's checked)...
            if (isChecked) {
                // d. Find the corresponding <label> element for that checkbox.
                // The label's `for` attribute matches the checkbox's `id`.
                const labelElement = document.querySelector(`label[for="${buttonId}"]`);

                // e. If the label exists, add its text content to our Set.
                if (labelElement && labelElement.textContent.length == 2) {
                    selectedComms.add(labelElement.textContent);

                    // d. Inclide inverses
                    if (document.getElementById('inverse').checked){
                        selectedComms.add(labelElement.textContent);
                        const reversed = labelElement.textContent.split("").reverse().join("");
                        selectedComms.add(reversed);
                    }
                }
            }
        }

        // f. Log the final Set to the console to see the result.
        console.log("--- START CLICKED ---");
        console.log("Collected Labels:", selectedComms);
    });

    // Hide content
    const contentWrapper = document.getElementById('menu');
    const sessionWrapper = document.getElementById('session');

    startButton.addEventListener('click', () => {
            // Toggle the 'd-none' class on the content wrapper.
            // 'd-none' is a Bootstrap utility class for `display: none`.
            // classList.toggle() adds the class if it's not there, and removes it if it is.
            contentWrapper.classList.toggle('d-none');
            sessionWrapper.classList.toggle('d-none');
            // start session
            const commslist = [...selectedComms];
            start(commslist, pieceType, drillFactor);
        });
    } 
}

var drillFactor = 1
var pieceType = "LPs"
main();