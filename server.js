const express = require("express");
const fetch = require("node-fetch");
const bodyparser = require("body-parser");
const bcrypt = require("bcrypt-nodejs");
const cors = require("cors");
const app = express();
app.use(bodyparser.json());
app.use(cors());
const knex = require("knex");
const db = knex({
  client: "pg",
  connection: {
    host: "dpg-csroifjqf0us73bqvbsg-a.oregon-postgres.render.com",
    port: 5432,
    user: "postgresql",
    password: "m9cMsv8az0Inu4ss0gWfS2gFKNogXytk",
    database: "postgresql_x4c9",
    ssl: {
      rejectUnauthorized: false, // Set to true in production for better security
    },
  },
});
// postgresql://postgresql:m9cMsv8az0Inu4ss0gWfS2gFKNogXytk@dpg-csroifjqf0us73bqvbsg-a.oregon-postgres.render.com/postgresql_x4c9
// "https://smartfacebackend.onrender.com"
// db.select("*").from('users').then(data => console.log(data))
// db.select("*").from("login").then((data) => console.log(data));

// async function createTables() {
//   try {
//     // Check and create users table
//     const usersExists = await db.schema.hasTable("users");
//     if (!usersExists) {
//       await db.schema.createTable("users", (table) => {
//         table.increments("id").primary(); // Auto-incrementing primary key
//         table.string("name", 100).notNullable(); // Name column
//         table.text("email").unique().notNullable(); // Email column
//         table.bigInteger("entries").defaultTo(0); // Entries column
//         table.timestamp("joined").notNullable(); // Joined timestamp
//       });
//       console.log("Users table created successfully.");
//     } else {
//       console.log("Users table already exists.");
//     }

//     // Check and create login table
//     const loginExists = await db.schema.hasTable("login");
//     if (!loginExists) {
//       await db.schema.createTable("login", (table) => {
//         table.increments("id").primary(); // Auto-incrementing primary key
//         table.text("email").unique().notNullable(); // Email column
//         table.string("hash", 100).notNullable(); // Hash column for password
//       });
//       console.log("Login table created successfully.");
//     } else {
//       console.log("Login table already exists.");
//     }
//   } catch (err) {
//     console.error("Error creating tables:", err);
//   } 
//   // finally {
//   //   await db.destroy(); // Close the database connection
//   // }
// }

// // Call the function to create the tables
// createTables();

app.get("/", (req, res) => {
  res.send(db.select("*").from("users"));
});

app.post("/signin", (req, res) => {
  db.select("email", "hash")
    .from("login")
    .where("email", "=", req.body.email)
    .then((data) => {
      const valid = bcrypt.compareSync(req.body.password, data[0].hash);
      if (valid) {
        return db.select("*")
          .from("users")
          .where("email", "=", req.body.email)
          .then((user) => {
            res.json(user[0]);
          })
          .catch((err) => res.status(400).json("error loging in"));
      } else {
        res.status(400).json("wrong credential")
      }
    })
    .catch((err) => res.status(400).json("wrong credential"));
});

app.get("/profile/:id", (req, res) => {
  const { id } = req.params;
  db.select("*")
    .from("users")
    .where({ id: id })
    .then((user) => {
      if (user.length) {
        res.json(user[0]);
      } else {
        res.status(404).json("no such user");
      }
    });
});

app.post("/api/analyze", async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  // const { modelId, modelVersionId, user_app_id, inputs } = req.body;
  const { IMAGE_URL } = req.body;
  const USER_ID = "clarifai";
  const APP_ID = "main";
  const MODEL_ID = "face-detection";
  const MODEL_VERSION_ID = "6dc7e46bc9124c5c8824be4822abe105";
  const modelId = MODEL_ID;
  const modelVersionId = MODEL_VERSION_ID;
  const user_app_id = {
    user_id: USER_ID,
    app_id: APP_ID,
  };
  // console.log("Request Body:", req.body); // Log the request body

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
          inputs: [
            {
              data: {
                image: {
                  url: IMAGE_URL,
                },
              },
            },
          ], // Pass the inputs received from the request
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

app.post("/register", (req, res) => {
  const { email, name, password } = req.body;
  const hash = bcrypt.hashSync(password);
  db.transaction((trx) => {
    trx
      .insert({
        hash: hash,
        email: email,
      })
      .into("login")
      .returning("email")
      .then((loginemail) => {
        return trx("users")
          .returning("*")
          .insert({ email: loginemail[0]['email'], name: name, joined: new Date() })
          .then((users) => {
            res.json(users[0]);
          });
      })
      .then(trx.commit)
      .catch(trx.rollback);
  })
  .catch(err => res.status(400).json("unable to register"));
});

app.put("/image", (req, res) => {
  const { id } = req.body;
  db("users")
    .where("id", "=", id)
    .increment("entries", 1)
    .returning("entries")
    .then((entries) => {
      res.json(entries[0]["entries"]);
    })
    .catch((err) => res.status(400).json("unable to get entries"));
});

app.put("/update", (req, res) => {
  const { email, name, password } = req.body; // Extract email, name, and password from request body

  if ((!email) || (!name) || (!password)) {
    return res.status(400).json("all field required is required");
  }

  const hash = bcrypt.hashSync(password); // Hash the new password

  db.transaction((trx) => {
    trx("login")
      .where({ email: email })
      .update({hash: hash }) // Update email and hash in the login table
      .then(() => {
        return trx("users")
        .returning("*")
        .where({ email: email })
        .update({ name: name }) // Update name in the users table
        .then((users) => {
            res.json(users[0]);
          });
      })
      .then(trx.commit)
      .catch((err) => {
        trx.rollback();
        res.status(400).json("Unable to update user");
      });
  })
    // .then(() => res.json("User updated successfully"))
    .catch((err) => res.status(400).json("Transaction error"));
});

app.delete("/delete", (req, res) => {
  const { email } = req.body; // Extract email from request body

  if (!email) {
    return res.status(400).json("Email is required");
  }

  db.transaction((trx) => {
    trx
      .delete()
      .from("login")
      .where({ email: email })
      .then(() => {
        return trx("users").where({ email: email }).delete();
      })
      .then(trx.commit)
      .catch((err) => {
        trx.rollback();
        res.status(400).json("Unable to delete user");
      });
  })
    .then(() => res.json("User deleted successfully"))
    .catch((err) => res.status(400).json("Transaction error"));
});

app.listen(process.env.PORT || 3000, () => {
  console.log("app is running on port 3000");
});
