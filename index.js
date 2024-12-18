const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;
// Change these to whatever model and image URL you want to use

// Enable CORS for all routes
// app.use(cors({ origin: "*" })); // Allow requests from your React app
app.use(cors({ origin: "*" }));
// Middleware to parse JSON bodies
app.use(express.json());

// Define the API endpoint to handle requests to Clarifai
app.post("/api/analyze", async (req, res) => {
  const USER_ID = "clarifai";
  const APP_ID = "main";
  res.set("Access-Control-Allow-Origin", "*");
  // const { modelId, modelVersionId, user_app_id, inputs } = req.body;
  const { inputs } = req.body;
  const MODEL_ID = "face-detection";
  const MODEL_VERSION_ID = "6dc7e46bc9124c5c8824be4822abe105";
  const modelId = MODEL_ID;
  const modelVersionId = MODEL_VERSION_ID;
  const user_app_id = {
    user_id: USER_ID,
    app_id: APP_ID,
  };
  console.log("Request Body:", req.body); // Log the request body

  try {
    const response = await fetch(
      `https://api.clarifai.com/v2/models/${modelId}/versions/${modelVersionId}/outputs`,
      {
        method: "POST",
        headers: {
          Authorization: `Key 8c694cbc06244d128411b68082b403e3`, // Replace with your actual API key
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_app_id: user_app_id, // Include the user_app_id here
          inputs: inputs, // Pass the inputs received from the request
        }),
      }
    );
    // console.log(response);

    if (!response.ok) {
      const errorText = await response.text(); // Get the response text for debugging
      throw new Error(`Error from Clarifai API: ${errorText}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server error: " + error.message });
  }
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
