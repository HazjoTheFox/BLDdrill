export async function stats(sessionData, skippedComms){
    let mean = sessionData.mean.toFixed(2);
    let stDeviation = sessionData.deviation.toFixed(2);

    // Show the data
    document.getElementById("mean").textContent = 'Mean: ' + mean;
    document.getElementById("stdeviation").textContent = "Standard deviation: " + stDeviation;

    document.getElementById("skipped").textContent = "Skipped:" + skippedComms;

    // Sort comms by times
    var selectedComms = Object.keys(sessionData.comms).map(function(key) {
        return [key, sessionData.comms[key].mean];
    });

    selectedComms.sort(function(first, second) {
        return second[1] - first[1];
    });


    const commStatContainer = document.getElementById('commStatContainer')
    //Show comms with mean
    selectedComms.forEach(data => {
         // Create a comm textbox assosiated with a mean
        const oneComm = document.createElement('h4');

        oneComm.textContent = data[0] + ": " + data[1] + " (" + sessionData.comms[data[0]].times.length + ")";

        // Assemble everything
        commStatContainer.appendChild(oneComm);
    });
}