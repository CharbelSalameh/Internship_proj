const express = require("express");
const cors = require("cors");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

const excelFilePath = path.join(__dirname, "users.xlsx");

function readUsersFromExcel() {
    if (!fs.existsSync(excelFilePath)) {
        return [];
    }

    const workbook = XLSX.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const users = XLSX.utils.sheet_to_json(sheet);

    return users;
}

function saveUsersToExcel(users) {
    const worksheet = XLSX.utils.json_to_sheet(users);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

    XLSX.writeFile(workbook, excelFilePath);
}

app.get("/api/health", function(req, res) {
    res.json({
        message: "Backend is running"
    });
});

app.get("/api/users", function(req, res) {
    const users = readUsersFromExcel();

    res.json(users);
});

app.post("/api/users", function(req, res) {
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const gender = req.body.gender;

    if (!firstname || !lastname || !gender) {
        return res.status(400).json({
            message: "firstname, lastname, and gender are required"
        });
    }

    const users = readUsersFromExcel();

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

    let newId = 1;

    if (users.length > 0) {
        const ids = users.map(function(user) {
            return Number(user.id);
        });

        newId = Math.max(...ids) + 1;
    }

    const newUser = {
        id: newId,
        firstname: firstname,
        lastname: lastname,
        gender: gender
    };

    users.push(newUser);

    saveUsersToExcel(users);

    res.status(201).json(newUser);
});

app.delete("/api/users/:id", function(req, res) {
    const id = Number(req.params.id);

    const users = readUsersFromExcel();

    const filteredUsers = users.filter(function(user) {
        return Number(user.id) !== id;
    });

    if (users.length === filteredUsers.length) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    saveUsersToExcel(filteredUsers);

    res.json({
        message: "User deleted"
    });
});

app.get("/", function(req, res) {
    res.send("Backend API is running");
});

app.get("/api/profile-data", function(req, res) {
  const nameParam = String(req.query.name || "").trim();

  res.json({
    personName: nameParam || "Guest"
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, function() {
    console.log("Server running on port " + PORT);
});