const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const podo = express();
const mysql = require('mysql');

/*Connects to DB*/
const podoDB = mysql.createPool({
    host:,
    user:,
    password:,
    database:
});

podo.use(express.json());
podo.use(cors());
podo.use(bodyParser.urlencoded({extended: true}));

/*Opens in port 3001 */
podo.listen(3001, () => {
    console.log("running on port 3001");
});

//User Table

//Get request to for User table
podo.get("/podoDB/getUser", (req, res) => {
    podoDB.query("", (err, result) => {
        res.send(result);
    });
});

//Post request to add User
app.post("/podoDB/insertUser", (req, res) => {
    podoDB.query("", (err, result) => {
        console.log(result);
    });
    res.status(200).json({ message: "Table updated successfully"});
});

//Delete User request
podo.delete("/podoDB/deleteUser", (req, res) => {
    podoDB.query("", (err, result) => {
        if (err) console.log(err);
    });
    res.status(200).json({ message: "Table updated successfully"});
});

//Update User request
podo.post("/podoDB/updateTask", (req, res) => {
    podoDB.query("", (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Error updating table" });
          }

        if (result.affectedRows === 0) {
            //User record not found in the database
            return res.status(404).json({ message: "Record not found" });
          }
          console.log(result);
          res.status(200).json({ message: "Table updated successfully"});
    });
})


//Task Table

//Get request to for Task table
podo.get("/podoDB/getTask", (req, res) => {
    podoDB.query("", (err, result) => {
        res.send(result);
    });
});

//Post request to add Task
app.post("/podoDB/insertTask", (req, res) => {
    podoDB.query("", (err, result) => {
        console.log(result);
    });
    res.status(200).json({ message: "Table updated successfully"});
});

//Delete Task request
podo.delete("/podoDB/deleteTask", (req, res) => {
    podoDB.query("", (err, result) => {
        if (err) console.log(err);
    });
    res.status(200).json({ message: "Table updated successfully"});
});

//Update Task request
podo.post("/podoDB/updateTask", (req, res) => {
    podoDB.query("", (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Error updating table" });
          }

        if (result.affectedRows === 0) {
            //User record not found in the database
            return res.status(404).json({ message: "Record not found" });
          }
          console.log(result);
          res.status(200).json({ message: "Table updated successfully"});
    });
})