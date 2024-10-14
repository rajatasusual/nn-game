let TUTORIAL = false;

function allowDrop(ev) {
    ev.preventDefault();
    // Highlight the workspace when a layer is dragged over it
    document.getElementById("workspace").style.border = "2px dashed #66bb66";
    document.getElementById("drop-message").style.display = "block"; // Show drop message
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.innerHTML);
    // Hide tooltip when dragging starts
    tooltip.style.display = 'none';
}

function drop(ev) {
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();

    document.getElementById("drop-message").style.display = "none";

    var data = ev.dataTransfer.getData("text");
    const draggedElement = document.querySelector(`.layer[data-layer="${data}"]`);

    // Reorder logic: Check if we're dragging an existing layer
    if (draggedElement) {
        const workspace = document.getElementById("workspace");

        // Find where to insert the dragged element (for reordering)
        const closestLayer = [...workspace.children].find(el => el !== draggedElement && ev.clientY < el.getBoundingClientRect().top);

        workspace.insertBefore(draggedElement, closestLayer || null); // Insert element before the closest layer
        checkLayerOrder(); // Check and update layer order
    } else {
        // Create a new layer element
        var newLayer = document.createElement("div");
        newLayer.textContent = data;
        newLayer.className = 'layer added-layer removable'; // Add removable class
        newLayer.style.padding = '10px';
        newLayer.style.margin = '5px 0';
        newLayer.style.backgroundColor = '#e0ffe0'; // Light green background
        newLayer.style.border = '1px solid #66bb66'; // Green border

        newLayer.name = data;

        function dragStart(ev) {
            ev.dataTransfer.setData("text", ev.target.getAttribute("data-layer"));
        }
        
        newLayer.setAttribute("data-layer", data + "-" + Date.now()); // For uniqueness
    
        // Make the layer draggable
        newLayer.setAttribute("draggable", "true");
        newLayer.addEventListener("dragstart", dragStart);

        // Add click event to remove the layer
        newLayer.addEventListener('contextmenu', () => {
            newLayer.remove(); // Remove the layer on click
            checkLayerAdded(newLayer.textContent); // Check if a layer is removed
            checkLayerOrder(); // Check the order after removal
        });

        newLayer.addEventListener('click', function () {
            openLayerConfigModal(newLayer);
        });

        // Append the new layer to the workspace
        document.getElementById("workspace").appendChild(newLayer);
        checkLayerAdded(data); // Check if a layer is added
        checkLayerOrder(); // Check the order after adding a layer   
    }

    // Remove the dashed border after dropping
    document.getElementById("workspace").style.border = "";
}


let tutorialSteps = [
    "Welcome to the Neural Network Builder! Start by dragging the Input Layer into the workspace.",
    "Great! Now add a Hidden Layer. This layer will help the network learn features.",
    "Next, let's add an Output Layer. This layer provides the final output of the network.",
    "Now that you've set up your layers, click the 'Train Model' button to start training!",
    "Once training is complete, you can enhance your model by adding activation layers like ReLU or Sigmoid."
];

let currentStep = 0;

function showTutorial() {
    const modal = document.getElementById("tutorial-modal");
    const tutorialText = document.getElementById("tutorial-text");
    tutorialText.textContent = tutorialSteps[currentStep];
    modal.style.display = "block";
    document.getElementById("start-tutorial").classList.add("tutorial-active"); // Indicate tutorial is active
}

// Update the button when the tutorial ends
function endTutorial() {
    TUTORIAL = false;
    document.getElementById("tutorial-modal").style.display = "none";
    document.getElementById("start-tutorial").classList.remove("tutorial-active"); // Reset button appearance
}

document.getElementById("close-modal").onclick = function () {
    document.getElementById("tutorial-modal").style.display = "none";
};

window.onclick = function (event) {
    const modal = document.getElementById("tutorial-modal");
    if (event.target === modal) {
        modal.style.display = "none";
    }
};

document.addEventListener('keydown', function (event) {
    if (event.key === "Escape") {
        document.getElementById("tutorial-modal").style.display = "none";
    }
});

function checkLayerAdded(layerType) {
    if (currentStep < tutorialSteps.length) {
        // Check for specific layer types to advance the tutorial
        if (
            (currentStep === 0 && layerType === 'Input Layer') ||
            (currentStep === 1 && layerType === 'Hidden Layer') ||
            (currentStep === 2 && layerType === 'Output Layer') ||
            (layerType === 'Train Model')
        ) {
            currentStep++;
            if (currentStep < tutorialSteps.length) {
                TUTORIAL && showTutorial();
            } else {
                endTutorial(); // End tutorial if steps are complete
            }
        } else if (currentStep > 0) {
            const tutorialText = document.getElementById("tutorial-text");

            // If layers are added but not in the right order, provide guidance
            if (layerType === 'Hidden Layer' && currentStep === 1) {
                tutorialText.textContent = "You're doing great! Remember to add the Output Layer next.";
            } else if (layerType === 'Output Layer' && currentStep === 2) {
                tutorialText.textContent = "Excellent! Now you can train your model.";
            } else {
                tutorialText.textContent = "Make sure to follow the tutorial steps!";
            }
            TUTORIAL && showTutorial(); // Show the updated tutorial text
        }
    }
}


function checkLayerOrder() {
    const layers = document.querySelectorAll('.added-layer');
    const layerTypes = Array.from(layers).map(layer => layer.name);

    // Define the correct order
    const correctOrder = ['Input Layer', 'Hidden Layer', 'Output Layer'];
    let currentIndex = 0;

    // Enable the train button if layers are added in the correct order
    const trainButton = document.getElementById("train-button");

    // Loop through layerTypes to check for the presence of core layers
    for (const layerType of layerTypes) {
        if (layerType === correctOrder[currentIndex]) {
            currentIndex++;
        }
        if (currentIndex === correctOrder.length && layerTypes[layerTypes.length - 1] === 'Output Layer') {
            trainButton.disabled = false;
            return;
        }
    }
    trainButton.disabled = true; // Disable if not all core layers are in correct order
}

document.getElementById("start-tutorial").onclick = function () {
    currentStep = 0; // Reset tutorial step
    TUTORIAL = true;
    showTutorial();
};

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

const trainButton = document.getElementById("train-button");

// Position the tooltip near the train button
trainButton.addEventListener("mouseenter", (event) => {
    const rect = trainButton.getBoundingClientRect();
    tooltip.className = "tooltip";
    tooltip.textContent = "Please arrange layers in the correct order: Input → Hidden → Output.";

    tooltip.style.display = "block";
    tooltip.style.left = `${rect.left + window.scrollX}px`;
    tooltip.style.top = `${rect.bottom + window.scrollY + 5}px`; // Position below the button
});

trainButton.addEventListener("mouseleave", () => {
    tooltip.style.display = "none"; // Hide tooltip
});

// Initially disable the train button
trainButton.disabled = true;

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

    // Simulate training over time
    let trainingInterval = setInterval(() => {
        if (progress < 100) {
            progress += 10; // Increase progress
            progressBar.value = progress;

            // Adjust metrics based on the layer configuration
            let totalNeurons = 0;
            let activationMultiplier = 1.0;

            layers.forEach(layer => {
                if (isDenseLayer(layer)) {
                    totalNeurons += parseInt(layer.neurons) || 1; // Add the number of neurons

                    // Modify performance based on activation function
                    switch (layer.activation) {
                        case 'relu':
                            activationMultiplier *= 0.95; // ReLU generally helps reduce loss
                            break;
                        case 'sigmoid':
                            activationMultiplier *= 1.05; // Sigmoid can be slower in convergence
                            break;
                        case 'tanh':
                            activationMultiplier *= 0.9; // Tanh can be more efficient
                            break;
                    }
                }
            });

            // Simulate loss reduction and accuracy improvement based on the configuration
            baseLoss *= Math.exp(-0.05 * totalNeurons * activationMultiplier); // Simulate loss reduction
            baseAccuracy += Math.min(10, totalNeurons * activationMultiplier); // Simulate accuracy increase

            // Update UI with new values
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

    checkLayerAdded('Train Model');
}

function isDenseLayer(layer) {
    return layer.name === 'Input Layer' || layer.name === 'Output Layer' || layer.name === 'Hidden Layer';
}

function openLayerConfigModal(layer) {
    const configOptions = document.getElementById('configOptions');
    configOptions.innerHTML = ''; // Clear previous content

    if (isDenseLayer(layer)) {
        configOptions.innerHTML = `
            <label for="neurons">Number of Neurons:</label>
            <input type="number" id="neurons" name="neurons" min="1" value="${layer.neurons || 1}">
            <label for="activation">Activation Function:</label>
            <select id="activation" name="activation">
                <option value="relu" ${layer.activation === 'relu' ? 'selected' : ''}>ReLU</option>
                <option value="sigmoid" ${layer.activation === 'sigmoid' ? 'selected' : ''}>Sigmoid</option>
                <option value="tanh" ${layer.activation === 'tanh' ? 'selected' : ''}>Tanh</option>
            </select>
        `;
    }

    document.getElementById('configModal').style.display = 'block';

    document.getElementById('saveConfigBtn').onclick = function () {
        saveLayerConfiguration(layer);
    };
}

function saveLayerConfiguration(layer) {
    const neuronsInput = document.getElementById('neurons');
    const activationInput = document.getElementById('activation');

    // Update layer configuration
    if (isDenseLayer(layer)) {
        layer.neurons = neuronsInput.value;
        layer.activation = activationInput.value;
    }

    closeConfigModal();
    updateLayerDisplay(layer);
}

function updateLayerDisplay(layer) {
    if (isDenseLayer(layer)) {
        layer.innerText = `${layer.name} (Dense with ${layer.neurons} neurons, ${layer.activation} activation)`;
    }
}

function closeConfigModal() {
    document.getElementById('configModal').style.display = 'none';
}