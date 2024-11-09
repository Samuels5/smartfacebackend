// const express = require("express");
// const fetch = require("node-fetch"); // Use require for node-fetch
// const cors = require("cors");

// const app = express();
// const PORT = 5000;

// // Enable CORS for all routes
// app.use(cors({ origin: "http://localhost:3000" })); // Allow requests from your React app

// // Middleware to parse JSON bodies
// app.use(express.json());

// // Define the API endpoint to handle requests to Clarifai
// app.post("/api/analyze", async (req, res) => {
//   const { modelId, modelVersionId, inputs } = req.body;

//   console.log("Request Body:", req.body); // Log the request body

//   try {
//     const response = await fetch(
//       `https://api.clarifai.com/v2/models/${modelId}/versions/${modelVersionId}/outputs`,
//       {
//         method: "POST",
//         headers: {
//           Authorization: `Key 8c694cbc06244d128411b68082b403e3`, // Replace with your actual API key
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ inputs }),
//       }
//     );

//     if (!response.ok) {
//       const errorText = await response.text(); // Get the response text for debugging
//       throw new Error(`Error from Clarifai API: ${errorText}`);
//     }

//     const data = await response.json();
//     res.json(data);
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ error: "Server error: " + error.message });
//   }
// });

// app.listen(PORT, () =>
//   console.log(`Server running on http://localhost:${PORT}`)
// );
const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Enable CORS for all routes
// app.use(cors({ origin: "*" })); // Allow requests from your React app
app.use(cors({ origin: true }));

// Middleware to parse JSON bodies
app.use(express.json());

// Define the API endpoint to handle requests to Clarifai
app.post("/api/analyze", async (req, res) => {
  const { modelId, modelVersionId, user_app_id, inputs } = req.body;

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
    console.log(response);

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

app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
// const express = require("express");
// const fetch = require("node-fetch");
// const cors = require("cors");

// const app = express();
// const PORT = 5000;

// // Enable CORS for all routes with specific headers for preflight requests
// app.use(cors());

// // Middleware to parse JSON bodies
// app.use(express.json());

// // Define the API endpoint to handle requests to Clarifai
// app.post("/api/analyze", async (req, res) => {
//   const { modelId, modelVersionId, user_app_id, inputs } = req.body;

//   console.log("Request Body:", req.body); // Log the request body

//   try {
//     const response = await fetch(
//       `https://api.clarifai.com/v2/models/${modelId}/versions/${modelVersionId}/outputs`,
//       {
//         method: "POST",
//         headers: {
//           Authorization: `Key 8c694cbc06244d128411b68082b403e3`, // Replace with your actual API key
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           user_app_id: user_app_id, // Include the user_app_id here
//           inputs: inputs, // Pass the inputs received from the request
//         }),
//       }
//     );

//     if (!response.ok) {
//       const errorText = await response.text(); // Get the response text for debugging
//       throw new Error(`Error from Clarifai API: ${errorText}`);
//     }

//     const data = await response.json();
//     res.json(data);
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ error: "Server error: " + error.message });
//   }
// });

// app.listen(PORT, () =>
//   console.log(`Server running on http://localhost:${PORT}`)
// );
