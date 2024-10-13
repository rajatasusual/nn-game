function allowDrop(ev) {
    ev.preventDefault();
    // Highlight the workspace when a layer is dragged over it
    document.getElementById("workspace").style.border = "2px dashed #66bb66";
    document.getElementById("drop-message").style.display = "block"; // Show drop message
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.innerHTML);
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");

    // Create a new layer element
    var newLayer = document.createElement("div");
    newLayer.textContent = data;
    newLayer.className = 'layer added-layer removable'; // Add removable class
    newLayer.style.padding = '10px';
    newLayer.style.margin = '5px 0';
    newLayer.style.backgroundColor = '#e0ffe0'; // Light green background
    newLayer.style.border = '1px solid #66bb66'; // Green border

    // Show layer description
    const layerInfo = ev.target.dataset.info || "Layer added.";
    const infoMessage = document.createElement("p");
    infoMessage.textContent = layerInfo; // Add info message
    infoMessage.style.fontStyle = 'italic';
    document.getElementById("workspace").appendChild(infoMessage);

    // Add click event to remove the layer
    newLayer.addEventListener('click', () => {
        newLayer.remove(); // Remove the layer on click
        infoMessage.remove(); // Remove info message on layer removal
    });

    // Reset border and drop message
    document.getElementById("workspace").style.border = "";
    document.getElementById("drop-message").style.display = "none"; // Hide drop message

    // Append the new layer to the workspace
    document.getElementById("workspace").appendChild(newLayer);
}

// Tooltip functionality
const tooltip = document.getElementById("tooltip");

document.querySelectorAll('.layer').forEach(layer => {
    layer.addEventListener('mouseover', (event) => {
        const info = event.target.dataset.info; // Get tooltip info from data attribute
        tooltip.textContent = info;
        tooltip.style.display = 'block';
        tooltip.style.left = `${event.pageX + 10}px`; // Position to the right of the mouse
        tooltip.style.top = `${event.pageY + 10}px`; // Position below the mouse
    });

    layer.addEventListener('mousemove', (event) => {
        tooltip.style.left = `${event.pageX + 10}px`;
        tooltip.style.top = `${event.pageY + 10}px`;
    });

    layer.addEventListener('mouseout', () => {
        tooltip.style.display = 'none'; // Hide tooltip
    });
});

document.getElementById("train-button").addEventListener("click", trainModel);

function trainModel() {
    const progressBar = document.getElementById("progress-bar");
    const progressText = document.getElementById("progress-text");
    const trainingMetrics = document.getElementById("training-metrics");
    const lossValue = document.getElementById("loss-value");
    const accuracyValue = document.getElementById("accuracy-value");
    const layerActivations = document.getElementById("layer-activations");
    const activationsList = document.getElementById("activations-list");

    // Reset the progress bar and text
    progressBar.value = 0;
    progressText.textContent = "Training... 0%";
    trainingMetrics.style.display = "none";
    layerActivations.style.display = "none";

    // Show the training progress
    document.getElementById("training-progress").style.display = "block";

    const layers = document.querySelectorAll('.added-layer');
    let progress = 0;
    let baseLoss = 1.0; // Starting loss
    let baseAccuracy = 50; // Starting accuracy

    let trainingInterval = setInterval(() => {
        if (progress < 100) {
            progress += 10; // Increase progress
            progressBar.value = progress;

            // Adjust metrics based on the number of layers
            const numLayers = layers.length;
            if (numLayers > 0) {
                baseLoss *= Math.exp(-0.05 * numLayers); // Simulate loss reduction
                baseAccuracy += Math.min(10, numLayers * 5); // Simulate accuracy increase
            }

            lossValue.textContent = baseLoss.toFixed(2);
            accuracyValue.textContent = Math.min(100, baseAccuracy).toFixed(2);
            progressText.textContent = `Training... ${progress}%`;

        } else {
            clearInterval(trainingInterval);
            progressText.textContent = "Training Complete!";
            trainingMetrics.style.display = "block";
            layerActivations.style.display = "block";

            // Simulate layer activations
            activationsList.innerHTML = ""; // Clear previous activations
            layers.forEach(layer => {
                const activationValue = (Math.random() * 100).toFixed(2);
                const listItem = document.createElement("li");
                listItem.textContent = `${layer.textContent} Activation: ${activationValue}`;
                activationsList.appendChild(listItem);
            });
        }
    }, 100); // Update every second
}