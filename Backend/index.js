const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const podo = express();
const bcrypt = require('bcrypt');
const NoSQLClient = require('oracle-nosqldb').NoSQLClient

/*Connects to DB*/
let podoDB = new NoSQLClient({
    region: "us-ashburn-1",
    auth: {
        iam: {
            tenantId: "ocid1.tenancy.oc1..aaaaaaaaa7tepkwvwcbu5eij2cqjdnh5rvdd3wensz25cgqtjbfxlgbvbddq",
            userId: "ocid1.user.oc1..aaaaaaaaqunwlxv4nj2gltly5ngdqvexryuxkmw7dvbkx5pxzx63rrrv4qrq",
            fingerprint: "49:aa:d6:de:a8:9e:73:4c:54:2c:82:03:d9:d5:dd:e3",
            privateKeyFile: "/Users/davidamaya/Downloads/amayadavid885@gmail.com_2024-03-15T23_58_08.486Z.pem"
        }
    }
});


podo.use(express.json());
podo.use(cors({
    origin: ["http://localhost:3001"],
    methods: ["POST", "GET"],
    credentials: true
}));
podo.use(bodyParser.urlencoded({extended: true}));
podo.use(cookieParser());
podo.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60 * 24
    }
    
}))

/*Opens in port 3001 */
podo.listen(3001, () => {
    console.log("running on port 3001");
});


//User Table

//Get request to for User table
podo.get("/podoDB/getUser", async (req, res) => {
    try {
        const result = await podoDB.query('SELECT * FROM users');
        
        // Extracting rows from the result
        const rows = result.rows;
        console.log('Query result:', rows); 

        res.send(rows);
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Error executing query');
    }
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
            return res.status(400).json({ message: 'Username already taken' });
        }

        // Check if email already exists
        const emailExists = await isEmailTaken(email);
        if (emailExists) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const hashPass = await bcrypt.hash(password, 10);

        const result = await podoDB.put('users', {username: username, password: hashPass, email: email});
        console.log('Insert result:', result.success);

        res.status(200).json({ message: "User inserted successfully"});
    } catch (err) {
        console.error('Error executing insert:', err);
        res.status(500).send('Error executing insert');
    }
    });

    // Function to check if username is already taken
async function isUsernameTaken(username) {
    let prepStatement = await podoDB.prepare(
        'SELECT * FROM users WHERE username = ?');
    
    prepStatement.set(1, username);
    
    const result = await podoDB.query(prepStatement); 
    return result.rows.length > 0;
}

// Function to check if email is already taken
async function isEmailTaken(email) {
    let prepStatement = await podoDB.prepare(
        'SELECT * FROM users WHERE email = ?');
    
    prepStatement.set(1, email);
    
    const result = await podoDB.query(prepStatement); 
    return result.rows.length > 0;
}

podo.post("/podoDB/login", async (req, res) => {
    try{
        const username = req.body.username
        const password = req.body.password

        let prepStatement = await podoDB.prepare(
            'SELECT * FROM users WHERE username = ?');
        
        prepStatement.set(1, username);
        
        const user = await podoDB.query(prepStatement); 

        if (user.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const hashPass = user.rows[0].Password;

        const isPasswordValid = await bcrypt.compare(password, hashPass);

        if (isPasswordValid) {
            req.session.username = username;
            res.status(200).json({ message: 'User logIn successfully', username: req.session.username});
        } else {
            res.status(400).json({ error: 'Invalid password' });
        }
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Error executing query' });
    }
});


//Delete User request
podo.delete("/podoDB/deleteUser", async (req, res) => {
    try{
    const ID = req.body.id
    const deleteRes = await client.delete('users', {id:ID});
        console.log('Delete result:', deleteRes.success);
        res.status(200).send('User deleted successfully');
    }catch(err) {
        console.error('Error executing query:', err);
        res.status(500).send('Error executing query');
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
          res.status(200).json({ message: "Table updated successfully"});
    });
})


//Task Table

//Get request to for Task table
podo.get("/podoDB/getTask", async (req, res) => {
    try {
        const result = await podoDB.query('SELECT * FROM users.tasks');
        
        // Extracting rows from the result
        const rows = result.rows;
        console.log('Query result:', rows); 

        res.send(rows);
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Error executing query');
    }
});

//Post request to add Task
podo.post("/podoDB/insertTask", (req, res) => {
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