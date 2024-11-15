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
// db.select("*").from('users').then(data => console.log(data))
// db.select("*").from("login").then((data) => console.log(data));

app.get("/", (req, res) => {
  res.send(database.users);
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

app.listen(process.env.PORT || 3000, () => {
  console.log("app is running on port 3000");
});
