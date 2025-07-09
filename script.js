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


async function saveScheme() {
    output = document.getElementById("scheme-output");
    const input = document.getElementById("scheme").value.toUpperCase();
    console.log(input.length);
    //Check if the input is right
    if (input.length != 24){
        output.innerText = "You need 24 letters!";
        return 1;
    }

    if (new Set(input).size != input.length){
        output.innerText = "Repeating letters!";
        return 1;
    }

    
    output.innerText = "";
    

    localStorage.setItem("scheme", JSON.stringify(input));
}