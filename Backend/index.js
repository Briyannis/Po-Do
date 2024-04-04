const https = require("https");
const Axios = require("axios");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const podo = express();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const request = require("request");
const querystring = require("querystring");
const NoSQLClient = require("oracle-nosqldb").NoSQLClient;

/*Connects to DB*/
let podoDB = new NoSQLClient({
  region: "us-ashburn-1",
  auth: {
    iam: {
      tenantId:
        "ocid1.tenancy.oc1..aaaaaaaaa7tepkwvwcbu5eij2cqjdnh5rvdd3wensz25cgqtjbfxlgbvbddq",
      userId:
        "ocid1.user.oc1..aaaaaaaaqunwlxv4nj2gltly5ngdqvexryuxkmw7dvbkx5pxzx63rrrv4qrq",
      fingerprint: "49:aa:d6:de:a8:9e:73:4c:54:2c:82:03:d9:d5:dd:e3",
      privateKeyFile:
        "dbConfig/amayadavid885@gmail.com_2024-03-15T23_58_08.486Z.pem",
    },
  },
});
podo.use(express.json());
podo.use(cookieParser());
podo.use(
  cors({
    //frontend url
    origin: ["http://localhost:3000"],
    methods: ["POST", "GET", "DELETE", "PUT"],
    credentials: true,
  })
);
podo.use(bodyParser.urlencoded({ extended: true }));

/*Opens in port 3001 */
podo.listen(3001, () => {
  console.log("running on port 3001");
});

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
podo.get("/", verifyUser, (req, res) => {
  const userInfo = {
    id: req.id,
    username: req.username,
    email: req.email,
  };
  return res.json({ Status: "Success", userInfo });
});

//Post request to add User
podo.post("/podoDB/insertUser", async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;

    // Check if username already exists
    const usernameExists = await isUsernameTaken(username);
    if (usernameExists) {
      return res.status(400).json({ message: "Username already taken" });
    }

    // Check if email already exists
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

// Function to check if username is already taken
async function isUsernameTaken(username) {
  let prepStatement = await podoDB.prepare(
    "SELECT * FROM users WHERE username = ?"
  );

  prepStatement.set(1, username);

  const result = await podoDB.query(prepStatement);
  return result.rows.length > 0;
}

// Function to check if email is already taken
async function isEmailTaken(email) {
  let prepStatement = await podoDB.prepare(
    "SELECT * FROM users WHERE email = ?"
  );

  prepStatement.set(1, email);

  const result = await podoDB.query(prepStatement);
  return result.rows.length > 0;
}
//login
podo.post("/login", async (req, res) => {
  try {
    const user = req.body;
    const { id, username, password, email } = user;

    let prepStatement = await podoDB.prepare(
      "SELECT * FROM users WHERE username = ?"
    );

    prepStatement.set(1, username);

    const userQ = await podoDB.query(prepStatement);

    if (userQ.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
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
podo.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ Status: "Success" });
});

//Delete User request
podo.delete("/podoDB/deleteUser", async (req, res) => {
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
podo.post("/podoDB/updateUser", async (req, res) => {
  podoDB.query("", (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Error updating User" });
    }

    if (result.affectedRows === 0) {
      //User record not found in the database
      return res.status(404).json({ message: "Record not found" });
    }
    console.log(result);
    res.status(200).json({ message: "Table updated successfully" });
  });
});

//Task Table

//Get request to for Task table
podo.get("/podoDB/getTask", async (req, res) => {
  try {
    const userID = req.query.userID;

    if (!userID) {
      return res.status(400).send(`User ID is required, ID: ${userID}`);
    }

    const userTask = await podoDB.query(
      `SELECT * FROM tasks WHERE userID = ${userID}`
    );

    if (userTask.rows.length === 0) {
      return res
        .status(404)
        .send(`No tasks found for the user with ID: ${userID}`);
    }

    // Extracting tasks from the result
    const tasks = userTask.rows.map((row) => ({
      taskID: row.TaskID,
      task: row.Title,
      date: row.Date,
    }));

    console.log("Tasks found:", tasks);
    res.status(200).json(tasks);
  } catch (err) {
    console.error("Error executing query:", err);
    res.status(500).send("Error executing query");
  }
});

//Post request to add Task
podo.post("/podoDB/insertTask", async (req, res) => {
  try {
    const userID = req.body.userID;
    const task = req.body.task;
    const date = req.body.date;

    if (!userID) {
      res.status(400).send("userID NULL");
    }

    const result = await podoDB.put("tasks", {
      userID: userID,
      title: task,
      date: date,
    });
    console.log("Insert result:", result.success);

    res.status(200).json({ message: "Task inserted successfully" });
  } catch (err) {
    console.error("Error executing insert:", err);
    res.status(500).send("Error executing insert");
  }
});

//Delete Task request
podo.delete("/podoDB/deleteTask", async (req, res) => {
  try {
    const taskID = req.body.taskID;

    const deleteRes = await podoDB.delete("tasks", { taskID: taskID });
    console.log("Delete result:", deleteRes.success);
    res.status(200).send("Task deleted successfully");
  } catch (err) {
    console.error("Error executing query:", err);
    res.status(500).send("Error executing query");
  }
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
    res.status(200).json({ message: "task updated successfully" });
  });
});

//spotify api and db tokens
//save tokens to db
podo.post("/spotify-api/tokens", async (req, res) => {
  try {
    const userID = req.body.userID;
    const access_token = req.body.accessToken;
    const refresh_token = req.body.refreshToken;

    if (!userID) {
      res.status(400).send("userID NULL");
    }

    const result = await podoDB.put("spotifyAPI", {
      userID: userID,
      accessToken: access_token,
      refreshToken: refresh_token,
    });
    console.log("Insert result:", result.success);

    res.status(200).json({ message: "tokens inserted successfully" });
  } catch (err) {
    console.error("Error executing insert:", err);
    res.status(500).send("Error executing insert");
  }
});
//gets tokens
podo.get("/spotify-api/gettokens", async (req, res) => {
  try {
    const userID = req.query.userID;

    if (!userID) {
      return res.status(400).send(`User ID is required, ID: ${userID}`);
    }

    const userTokens = await podoDB.query(
      `SELECT * FROM spotifyAPI WHERE userID = ${userID}`
    );

    if (userTokens.rows.length === 0) {
      return res
        .status(404)
        .send(`No tokens found for the user with ID: ${userID}`);
    }

    const tokens = {
      accessToken: userTokens.rows[0].accessToken,
      refreshToken: userTokens.rows[0].refreshToken,
    };

    console.log("tokens found:", tokens);
    res.status(200).json(tokens);
  } catch (err) {
    console.error("Error executing query:", err);
    res.status(500).send("Error executing query");
  }
});

let redirect_uri = process.env.REDIRECT_URI || "http://localhost:3001/callback";

podo.get("/spotify-api/login", function (req, res) {
  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope: "user-read-private user-read-email",
        redirect_uri,
      })
  );
});

podo.get("/callback", function (req, res) {
  let code = req.query.code || null;
  let authOptions = {
    url: "https://accounts.spotify.com/api/token",
    form: {
      code: code,
      redirect_uri,
      grant_type: "authorization_code",
    },
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString("base64"),
    },
    json: true,
  };
  request.post(authOptions, function (error, response, body) {
    var access_token = body.access_token;
    var refresh_token = body.refresh_token;
    let uri = process.env.FRONTEND_URI || "http://localhost:3000";
    res.redirect(
      uri + "?access_token=" + access_token + "&refresh_token=" + refresh_token
    );
  });
});

//refresh token
podo.get("/spotify-api/refresh_token", function (req, res) {
  // Request body should contain the refresh token
  const refresh_token = req.query.refresh_token;

  console.log("refresh:", refresh_token);

  const authOptions = {
    url: "https://accounts.spotify.com/api/token",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(
          process.env.SPOTIFY_CLIENT_ID +
            ":" +
            process.env.SPOTIFY_CLIENT_SECRET
        ).toString("base64"),
    },
    form: {
      grant_type: "refresh_token",
      refresh_token: refresh_token,
    },
    json: true,
  };

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      const access_token = body.access_token;
      res.send({ access_token: access_token });
    } else {
      res.send({ error: "invalid_grant" });
    }
  });
});

podo.delete("/spotify-api/logout", async (req, res) => {
  try {
    const userID = req.body.userID;
    const originURL = req.headers.referer;

    const deleteRes = await podoDB.delete("spotifyAPI", { userID: userID });
    if (deleteRes.success) {
      // If deletion was successful and origin URL exists, redirect to it
      if (originURL) {
        res.redirect(originURL);
      } else {
        // If origin URL doesn't exist, redirect to the default URL
        res.redirect("/");
      }
      console.log("Logged out successfully");
    } else {
      // Handle the case where deletion was not successful
      console.error("Deletion failed");
      res.status(500).send("Deletion failed");
    }
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send("Error executing query");
  }
});

podo.get("/spotify-api/search", async (req, res) => {
  const { q } = req.query;
  const spotifyToken = req.header("Authorization").split("Bearer ")[1];
  try {
    const response = await Axios.get("https://api.spotify.com/v1/search", {
      headers: { Authorization: `Bearer ${spotifyToken}` },
      params: { q: q, type: "album,artist,track" },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error:", error);
    res.json({ error: spotifyToken });
  }
});
