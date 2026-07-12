const express = require("express");
const cors = require("cors");
const{ connectToDb, getDB } = require('./dataBase');
const { ObjectId } = require('mongodb');
const path = require("path");

let db; 
const app = express();

app.use(cors());
app.use(express.json());


async function getUsers() {
  
    const users = await db.collection("users")
      .find()
      .sort({ firstname: 1 })
      .toArray();

    return users;
  
}

app.get("/api/health", function(req, res) {
    res.json({
        message: "Backend is running"
    });
});

app.get("/api/users", function(req, res) {
    getUsers()
        .then(users => {
            res.status(200).json(users);
        })
        .catch(()=>{
            res.status(500).json({error:"could not fetch the documents"})
        })
});

app.post("/api/users", async function(req, res) {
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const gender = req.body.gender;

  if (!firstname || !lastname || !gender) {
    return res.status(400).json({
      message: "firstname, lastname, and gender are required"
    });
  }

  try {
    const users = await getUsers();

    const exists = users.some(function(user) {
      return user.firstname === firstname &&
             user.lastname === lastname &&
             user.gender === gender;
    });

    if (exists) {
      return res.status(409).json({
        message: "User already exists"
      });
    }

    const newUser = {
      firstname: firstname,
      lastname: lastname,
      gender: gender
    };

    const result = await db.collection("users").insertOne(newUser);

    res.status(201).json({
      _id: result.insertedId,
      firstname: newUser.firstname,
      lastname: newUser.lastname,
      gender: newUser.gender
    });

  } catch (err) {
    res.status(500).json({
      error: "could not create a new document"
    });
  }
});

app.delete("/api/users/:id", function(req, res) {
   if (ObjectId.isValid(req.params.id)){
          db.collection('users')
          .deleteOne({_id:new ObjectId(req.params.id)})
          .then(result=>{
          res.status(200).json(result)
          }).catch(err=>{
              res.status(500).json({error:"could not fetch the document"})
          })
          req.params.id
      }else{
          res.status(500).json({error:"not valid document id"})
      }
    
});

app.get("/api/profile-data", function(req, res) {
  const nameParam = String(req.query.name || "").trim();

  res.json({
    personName: nameParam || "Guest"
  });
});

const PORT = process.env.PORT || 3000;

connectToDb((err) => {
  if (!err) {
    db = getDB();

    app.listen(PORT, function() {
      console.log("Server running on port " + PORT);
    });
  } else {
    console.log("Could not connect to database");
  }});