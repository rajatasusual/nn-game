function allowDrop(ev) {
    ev.preventDefault();
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

    // Add click event to remove the layer
    newLayer.addEventListener('click', () => {
        newLayer.remove(); // Remove the layer on click
    });

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

async function loadModel() {
    try {
        const model = await tf.loadLayersModel('https://storage.googleapis.com/tfjs-models/tfjs/sentiment_cnn_v1/model.json');
        return model;
    } catch (error) {
        console.error('Error loading the model:', error);
    }
}

// Predict sentiment when the button is clicked
/*document.getElementById('predict-button').addEventListener('click', async () => {
    const inputText = document.getElementById('input-text').value;
    const model = await loadModel();
    const prediction = await predictSentiment(model, inputText);
    document.getElementById('prediction-result').innerText = `Predicted Sentiment: ${prediction}`;
});
*/

// Function to predict sentiment
async function predictSentiment(model, text) {
    const inputTensor = preprocess(text); // Call the preprocess function
    const prediction = model.predict(inputTensor);

    // Get the predicted class from the output
    const classId = prediction.argMax(-1).dataSync()[0]; // Assuming binary classification (0 or 1)
    return classId === 0 ? 'Negative' : 'Positive'; // Adjust based on your model's output
}

// Implement the preprocess function
function preprocess(text) {
    // Normalize text
    text = text.toLowerCase().replace(/[^\w\s]|_/g, '').replace(/\s+/g, ' ');

    // Tokenization using TensorFlow.js
    const tokens = text.split(/\s+/); // Simple tokenization

    // Example vocabulary mapping using the IMDB dataset (for demonstration)
    const vocabulary = {
        'the': 1,
        'and': 2,
        'is': 3,
        'a': 4,
        // Add more words based on the IMDB dataset...
    };

    // Convert tokens to numerical representation
    const tokenIndices = tokens.map(token => vocabulary[token] || 0);

    // Create a tensor of shape [1, maxLength]
    const maxLength = 20; // Adjust based on your model's requirements
    const paddedIndices = tokenIndices.slice(0, maxLength).concat(Array(maxLength - tokenIndices.length).fill(0));

    return tf.tensor2d([paddedIndices], [1, maxLength]); // Create a 2D tensor
}

document.getElementById('train-button').addEventListener('click', () => {
    const progressBar = document.getElementById("progress-bar");
    const progressText = document.getElementById("progress-text");
    const trainingProgress = document.getElementById("training-progress");
    const lossValue = document.getElementById("loss-value");
    const accuracyValue = document.getElementById("accuracy-value");
    const trainingMetrics = document.getElementById("training-metrics");
    const activationsList = document.getElementById("activations-list");
    const layerActivations = document.getElementById("layer-activations");

    trainingProgress.style.display = 'block'; // Show progress bar
    trainingMetrics.style.display = 'block'; // Show metrics section
    layerActivations.style.display = 'block'; // Show layer activations
    progressBar.value = 0; // Reset progress bar
    progressText.textContent = 'Training...';
    lossValue.textContent = '0.00'; // Reset loss
    accuracyValue.textContent = '0.00'; // Reset accuracy

    let progress = 0;
    let loss = 0;
    let accuracy = 0;

    const trainingInterval = setInterval(() => {
        progress += 10; // Increase progress
        progressBar.value = progress;
        progressText.textContent = `Training... ${progress}%`;

        // Update mock loss and accuracy
        loss += Math.random() * 0.1; // Simulated loss (0 to 1)
        accuracy = Math.min(100, accuracy + Math.random() * 10); // Simulated accuracy (0 to 100)

        lossValue.textContent = loss.toFixed(2);
        accuracyValue.textContent = accuracy.toFixed(2);

        // Update layer activations
        const layerNames = ["Input Layer", "Hidden Layer", "Output Layer"];
        const randomLayer = layerNames[Math.floor(Math.random() * layerNames.length)];
        const activation = document.createElement("li");
        activation.textContent = `${randomLayer} activated at ${loss.toFixed(2)} loss`;
        activationsList.appendChild(activation);

        if (progress >= 100) {
            clearInterval(trainingInterval);
            progressText.textContent = `Training complete! Final Accuracy: ${accuracy.toFixed(2)}%`; // Show final accuracy
            setTimeout(() => {
                trainingProgress.style.display = 'none'; // Hide progress after a moment
            }, 2000);
        }
    }, 500); // Update every 500ms to simulate training time
});