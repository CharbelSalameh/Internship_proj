const express = require("express");
const cors = require("cors");
const{ connectToDb, getDB } = require('./dataBase');
const { ObjectId } = require('mongodb');
const path = require("path");
const multer = require("multer");
let db; 
const app = express();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

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

        const usersWithImageInfo = users.map(function(user) {
            return {
                _id: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                gender: user.gender,
                hasImage: !!(
                    user.image &&
                    user.image.data
                )
            };
        });
        res.status(200).json(usersWithImageInfo);
    })
    .catch(() => {
        res.status(500).json({
            error: "could not fetch the documents"
        });
    });
});

app.post("/api/users",upload.single("image"), async function(req, res) {
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
        gender: gender,
        image:req.file?{
            data:req.file.buffer,
            contentType:req.file.mimetype
        }:null
        };

        const result = await db.collection("users").insertOne(newUser);

        res.status(201).json({
        _id: result.insertedId,
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        gender: newUser.gender,
        hasImage: newUser.image !== null
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

app.get("/api/users/:id", function(req, res) {

    if (ObjectId.isValid(req.params.id)) {
    db.collection("users")
    .findOne({
        _id: new ObjectId(req.params.id)
    })
    .then(result => {
        if (!result) {
            return res.status(404).json({
                error: "user not found"
            });
        }

        res.status(200).json({
            _id: result._id,
            firstname: result.firstname,
            lastname: result.lastname,
            gender: result.gender,
            hasImage: result.image !== null
        });
    })
    .catch(err => {
        console.error("Error fetching user:", err);
        res.status(500).json({
            error: "could not fetch the document"
        });
    });
  }
});

app.patch("/api/users/:id", upload.single("image"), function(req, res) {

    if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            error: "invalid user id"
        });
    }

    const updates = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        gender: req.body.gender
    };
    
    if (req.file) {
        updates.image = {
            data: req.file.buffer,
            contentType: req.file.mimetype
        };
    }

    db.collection("users")
        .findOneAndUpdate(
        { _id: new ObjectId(req.params.id)},
        { $set: updates },
        { returnDocument: "after"}
    )
    .then(result => {

        if (!result) {
            return res.status(404).json({
                error: "user not found"
            });
        }
        res.status(200).json({
            _id: result._id,
            firstname: result.firstname,
            lastname: result.lastname,
            gender: result.gender,
            hasImage: result.image !== null
        });
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({
            error: "could not update the document"
        });
    });
});

app.get("/api/users/:id/image", function(req, res) {

    if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            error: "invalid user id"
        });
    }

    db.collection("users")
    .findOne({
        _id: new ObjectId(req.params.id)
    })
    .then(result => {
        if (!result) {
            return res.status(404).json({
                error: "user not found"
            });
        }

        if (!result.image || !result.image.data) {
            return res.status(404).json({
                error: "no image found"
            });
        }

        res.set("Content-Type", result.image.contentType);

        res.send(result.image.data.buffer || result.image.data);
    })
    .catch(err => {
        console.error("Error fetching image:", err);

        res.status(500).json({
            error: "could not fetch the image"
        });
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