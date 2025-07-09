async function saveDrill() {
    const input = document.getElementById("drill").value.replace(/\D/g, '');
    localStorage.setItem("LPs_drillFactor", input);
}