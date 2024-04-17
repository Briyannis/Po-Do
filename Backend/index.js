const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const podo = express();
const NoSQLClient = require("oracle-nosqldb").NoSQLClient;
const { createProxyMiddleware } = require('http-proxy-middleware');


/*Connects to DB*/
const podoDB = new NoSQLClient({
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

const auth = require('./Auth')(podoDB);
const tasks = require('./Task')(podoDB);
const spotify = require('./Spotify')(podoDB);
const queue = require('./Queue')(podoDB);
const player = require('./SpotifyPlayer');
const Spotifylibray = require('./UserSpotifyLibrary');

podo.use('/auth', auth);
podo.use('/tasks', tasks);
podo.use('/spotify-api', spotify);
podo.use('/spotify-player', player);
podo.use('/queue', queue);
podo.use('/Spotifylibray', Spotifylibray);

// Define the target URL where you want to forward requests
const target = "http://localhost:3001";

//console.log(target)

podo.use(
  '/spotify-api/**',
  createProxyMiddleware({
    target: target,
    changeOrigin: true,
  }),
);



/*Opens in port 3001 */
podo.listen(3001, () => {
  console.log("running on port 3001");
});