import { genButtons } from './selectionMenu.js';

// async function sendData() {
//     const input = document.getElementById("input").value;

//     const response = await fetch("http://127.0.0.1:8000/process", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json"
//         },
//         body: JSON.stringify({ text: input })
//     });

//     const data = await response.json();
//     document.getElementById("output").innerText = "Result: " + data.result;
// }


function saveScheme() {
  const output = document.getElementById("scheme-output-text");
  const input = document.getElementById("scheme").value.toUpperCase();

  console.log("saveScheme called");
  console.log("Input length:", input.length);

  if (input.length !== 24) {
    output.innerText = "You need 24 letters!";
    return;
  }

  if (new Set(input).size !== input.length) {
    output.innerText = "Repeating letters!";
    return;
  }

  localStorage.setItem("scheme", input);
  output.innerText = "Scheme saved!";
}

async function saveDrill() {
    const input = document.getElementById("drill").value.replace(/\D/g, '');
    localStorage.setItem("LPs_drillFactor", input);
}

const clnBtn = document.getElementById("clear");
clnBtn.addEventListener('click', () => {
                localStorage.removeItem("LPs");
                localStorage.removeItem("corners");
                localStorage.removeItem("edges");
            });


window.saveDrill = saveDrill;
window.saveScheme = saveScheme;
window.genButtons = genButtons;