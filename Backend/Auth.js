const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = function(podoDB){
//User Table

//verify User
const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
  
    if (!token) {
      return res.status(401).json({ message: "Token Not Provided" });
    } else {
      jwt.verify(token, "L8nLHz2b6m7SfuEHybYMJgPxA0gBSag", (err, decoded) => {
        if (err) {
          return res.status(401).json({ message: "Authentication Error" });
        } else {
          req.username = decoded.username;
          req.id = decoded.id;
          req.email = decoded.email;
          next();
        }
      });
    }
  };
  //Get request to for User table
  router.get("/", verifyUser, (req, res) => {
    const userInfo = {
      id: req.id,
      username: req.username,
      email: req.email,
    };
    return res.json({ Status: "Success", userInfo });
  });
  
  //Post request to add User
  router.post("/podoDB/insertUser", async (req, res) => {
    try {
      const username = req.body.username;
      const password = req.body.password;
      const email = req.body.email;
  
      // Checks if username already exists
      const usernameExists = await isUsernameTaken(username);
      if (usernameExists) {
        return res.status(400).json({ message: "Username already taken" });
      }
  
      // Checks if email already exists
      const emailExists = await isEmailTaken(email);
      if (emailExists) {
        return res.status(400).json({ message: "Email already registered" });
      }
  
      const hashPass = await bcrypt.hash(password, 10);
  
      const result = await podoDB.put("users", {
        username: username,
        password: hashPass,
        email: email,
      });
      console.log("Insert result:", result.success);
  
      res.status(200).json({ message: "User inserted successfully" });
    } catch (err) {
      console.error("Error executing insert:", err);
      res.status(500).send("Error executing insert");
    }
  });
  
  //checks if username is already taken
  async function isUsernameTaken(username) {
    let prepStatement = await podoDB.prepare(
      "SELECT * FROM users WHERE username = ?"
    );
  
    prepStatement.set(1, username);
  
    const result = await podoDB.query(prepStatement);
    return result.rows.length > 0;
  }
  
  // checks if email is already taken
  async function isEmailTaken(email) {
    let prepStatement = await podoDB.prepare(
      "SELECT * FROM users WHERE email = ?"
    );
  
    prepStatement.set(1, email);
  
    const result = await podoDB.query(prepStatement);
    return result.rows.length > 0;
  }
  //login
  router.post("/login", async (req, res) => {
    try {
      const username = req.body.username;
      const password = req.body.password;
  
      let prepStatement = await podoDB.prepare(
        "SELECT * FROM users WHERE username = ?"
      );
  
      prepStatement.set(1, username);
  
      const userQ = await podoDB.query(prepStatement);
  
      if (userQ.rows.length === 0) {
        return res.status(404).json({ error: "User not found:", username});
        console.log(username);
      }
  
      const hashPass = userQ.rows[0].Password;
  
      const isPasswordValid = await bcrypt.compare(password, hashPass);
      console.log(isPasswordValid);
  
      if (isPasswordValid) {
        const userInfo = {
          id: userQ.rows[0].ID,
          username: userQ.rows[0].Username,
          email: userQ.rows[0].Email,
        };
  
        //req.session.user = userInfo;
  
        //generate token
        const token = jwt.sign(
          {
            username: userQ.rows[0].Username,
            email: userQ.rows[0].Email,
            id: userQ.rows[0].ID,
          },
  
          "L8nLHz2b6m7SfuEHybYMJgPxA0gBSag",
          { expiresIn: "1d" }
        );
        res.cookie("token", token, { httpOnly: true });
  
        return res.status(200).json({ message: "LogIn Success", userInfo });
      } else {
        return res.status(400).json({ message: "Invalid password" });
      }
    } catch (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ message: "Error Running Query" });
    }
  });
  
  //logout
  router.get("/logout", (req, res) => {
    res.clearCookie("token");
    return res.json({ Status: "Success" });
  });
  
  //Delete User request
  router.delete("/podoDB/deleteUser", async (req, res) => {
    try {
      const ID = req.body.id;
      const deleteRes = await podoDB.delete("users", { id: ID });
      console.log("Delete result:", deleteRes.success);
      res.status(200).send("User deleted successfully");
    } catch (err) {
      console.error("Error executing query:", err);
      res.status(500).send("Error executing query");
    }
  });
  
  //Update User request
  router.post("/updateUser", async (req, res) => {
    try {
      const username = req.query.username;
      const email = req.query.email;
      const userId = req.query.userID;
      const oldPass = req.query.oldPass;
      const newPass = req.query.newPass;

      console.log("update")
  
      let prepStatement = await podoDB.prepare(
        "SELECT * FROM users WHERE ID = ?"
      );
  
      prepStatement.set(1, userId);
  
      const user = await podoDB.query(prepStatement);
  
      if (user.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      //checks user info and auth
      if (username) {
        const usernameExists = await isUsernameTaken(username);
        if (usernameExists) {
          return res.status(400).json({ message: "Username already taken" });
        }
  
        user.rows[0].Username = username;
      } else if (email) {
        const emailExists = await isEmailTaken(email);
        if (emailExists) {
          return res.status(400).json({ message: "Email already registered" });
        }
  
        user.rows[0].Email = email;
      } else if (oldPass && newPass) {
        let prepStatement = await podoDB.prepare(
          "SELECT * FROM users WHERE ID = ?"
        );
  
        prepStatement.set(1, userId);
  
        const userQ = await podoDB.query(prepStatement);
  
        if (userQ.rows.length === 0) {
          return res.status(404).json({ error: "User not found" });
        }
  
        const hashPass = userQ.rows[0].Password;
  
        const isPasswordValid = await bcrypt.compare(oldPass, hashPass);
  
        if (isPasswordValid) {
          const newHashPass = await bcrypt.hash(newPass, 10);
  
          user.rows[0].Password = newHashPass;
        }else{
          res.status(400).send("Invaild Password");
        }
      }
  
      const userInfo = {
        id: user.rows[0].ID,
        username: user.rows[0].Username,
        email: user.rows[0].Email,
      };
  
      await podoDB.put("users", user.rows[0]);
  
      res.send(userInfo);
    } catch (err) {
      console.error(err);
    }
  });

  return router;
}