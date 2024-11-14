const express = require("express");
const bodyparser = require('body-parser')
const bcrypt = require('bcrypt-nodejs')
const cors = require('cors')
const app = express();
app.use(bodyparser.json())
app.use(cors())
const database ={
    users: [
  {
    id: "123",
    name: "jone",
    email: "john@gmail.com",
    password: "cook",
    entries: 0,
    joined: new Date(),
  },
  {
    id: "124",
    name: "sally",
    email: "sally@gmail.com",
    password: "banana",
    entries: 0,
    joined: new Date(),
  },
]};

app.get("/", (req, res) => {
  res.send(database.users);
});
app.post("/signin", (req, res) => {
    console.log(req.body)
  //   bcrypt.compare('ann', "$2a$10$Yt1VePa988conRklfqJNYe8l.e7vS8azbI1upNdy3yIkdesC/Lgk2", function(err, res){
  //   console.log('first guess', res)
  // });
  // bcrypt.compare(res.body.password, database.users[0].password, function(err, res){
  //   console.log('first guess', res)
  // });
  let found = false
  database.users.forEach(user=>{
  if (
    req.body.email === user.email &&
    req.body.password === user.password
  ) {
    return res.json(user);
  } })
  if (!found) {
    // res.status(400).json('error loging in')
  }
});

app.get('/profile/:id',(req,res)=>{
    const {id} = req.params;
    // console.log(id)
    let flag = false 
    database.users.forEach(user=>{
        if (user.id === id) {
            flag = true
            return res.json(user)
        }
      })
    if (!flag) {
          res.status(404).json('no such user')
      }
})

app.post('/register',(req,res) => {
    const {email, name, password} = req.body
    bcrypt.hash(password, null, null, function(err, hash){
      // console.log(hash)
    })
    
    database.users.push({
      id: "125",
      name: name,
      email: email,
      password: password,
      entries: 0,
      joined: new Date(),
    });
    res.json(database.users[database.users.length-1])
})

app.put('/image', (req, res) => {
  const { id } = req.body;
  // console.log(id)
  let flag = false;
  database.users.forEach((user) => {
    if (user.id === id) {
      flag = true;
      user.entries++;
      return res.json(user.entries);
    }
  });
      if (!flag) {
        res.status(404).json("no such user");
      }
})

app.listen(process.env.PORT || 3000, () => {
  console.log("app is running on port 3000");
});
 
