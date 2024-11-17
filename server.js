const express = require("express");
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
