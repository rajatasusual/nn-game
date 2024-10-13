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

// Load the sentiment analysis model
async function loadModel() {
    // Replace with the actual path to your pre-trained model
    const model = await tf.loadLayersModel('path/to/sentiment/model.json');
    return model;
}

// Predict sentiment when the button is clicked
document.getElementById('predict-button').addEventListener('click', async () => {
    const inputText = document.getElementById('input-text').value;
    const model = await loadModel();
    const prediction = await predictSentiment(model, inputText);
    document.getElementById('prediction-result').innerText = `Predicted Sentiment: ${prediction}`;
});

// Function to predict sentiment
async function predictSentiment(model, text) {
    // Preprocess the input text (tokenization, vectorization) based on the model requirements
    const inputTensor = preprocess(text); // Implement the preprocess function according to your model
    const prediction = model.predict(inputTensor);
    
    // Get the predicted class from the output
    const classId = prediction.argMax(-1).dataSync()[0]; // Assuming binary classification (0 or 1)
    return classId === 0 ? 'Negative' : 'Positive'; // Adjust based on your model's output
}

// Implement the preprocess function as needed for your model
function preprocess(text) {
    // Example of preprocessing: tokenization and padding
    // You'll need to implement this based on how your model expects input.
    // Return a tensor that matches the model's input shape.
}