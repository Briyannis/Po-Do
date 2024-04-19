const express = require("express");
const router = express.Router();
const request = require("request");
const querystring = require("querystring");
const Axios = require("axios");

module.exports = function (podoDB) {
  //spotify api and db tokens
  //save tokens to db
  router.post("/tokens", async (req, res) => {
    try {
      const userID = req.body.userID;
      const access_token = req.body.accessToken;
      const refresh_token = req.body.refreshToken;
      const accStatus = req.body.accStatus;
      const spotID = req.body.spotifyID;
      console.log(`spotify id ${spotID}`);

      if (!userID) {
        res.status(400).send("userID NULL");
      }

      const result = await podoDB.put("spotifyAPI", {
        userID: userID,
        accStatus: accStatus,
        accessToken: access_token,
        refreshToken: refresh_token,
        spotifyID: spotID,
      });
      console.log("Insert result:", result.success);

      res.status(200).json({ message: "tokens inserted successfully" });
    } catch (err) {
      console.error("Error executing insert:", err);
      res.status(500).send("Error executing insert");
    }
  });
  //gets tokens
  router.get("/gettokens", async (req, res) => {
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

      console.log("status", userTokens.rows[0].accStatus);

      const tokens = {
        accessToken: userTokens.rows[0].accessToken,
        refreshToken: userTokens.rows[0].refreshToken,
        accStatus: userTokens.rows[0].accStatus,
        spotID: userTokens.rows[0].spotifyID,
      };

      console.log("tokens found:", tokens);
      res.status(200).json(tokens);
    } catch (err) {
      console.error("Error executing query:", err);
      res.status(500).send("Error executing query");
    }
  });

  let redirect_uri =
    process.env.REDIRECT_URI || "http://localhost:3001/spotify-api/callback";

  var generateRandomString = function (length) {
    var text = "";
    var possible =
      "&$Si%t{v!Y=Lz{YeW5#kLtuJG22)BKm*@@T2P+6mdyRvL+HT#+5hqB@KnuBn";

    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

  const scopes = [
    "streaming",
    "user-read-private",
    "user-read-email",
    "user-modify-playback-state",
    "user-read-playback-state",
    "user-read-currently-playing",
    "user-library-read",
    "user-library-modify"
  ];

  router.get("/login", function (req, res) {
    var state = generateRandomString(16);
    res.redirect(
      "https://accounts.spotify.com/authorize?" +
        querystring.stringify({
          response_type: "code",
          client_id: process.env.SPOTIFY_CLIENT_ID,
          scope: scopes.join(" "),
          redirect_uri,
          state,
        })
    );
  });

  router.get("/callback", function (req, res) {
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
        "Content-Type": "application/x-www-form-urlencoded",
      },
      json: true,
    };
    request.post(authOptions, function (error, response, body) {
      var access_token = body.access_token;
      var refresh_token = body.refresh_token;
      //console.log(body);
      //console.log(access_token, "refresh", refresh_token )
      let uri = process.env.FRONTEND_URI || "http://localhost:3000";
      //console.log(access_token);
      res.redirect(
        uri +
          "?access_token=" +
          access_token +
          "&refresh_token=" +
          refresh_token
      );
    });
  });

  //refresh token
  router.get("/refresh_token", function (req, res) {
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
        console.log(access_token);
        res.send({ access_token: access_token });
      } else {
        res.send({ error: "invalid_grant" });
      }
    });
  });

  router.delete("/logout/:userID", async (req, res) => {
    try {
      const userID = req.params.userID;

      console.log(userID)

      const deleteRes = await podoDB.delete("spotifyAPI", { userID: userID });
      
        console.log("Logged out successfully", deleteRes.status);
      
    } catch (error) {
      console.error("Error executing query:", error);
      res.status(500).send("Error executing query");
    }
  });

  router.get("/search", async (req, res) => {
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
      res.send({ error: error });
    }
  });

  router.get("/spotlogout", async (req, res) => {
    await podoDB.delete("spotifyAPI", { userID: userID });
    // Redirect to Spotify logout page
    res.redirect("https://accounts.spotify.com/logout");

    // After a timeout, redirect back
    setTimeout(() => {
      res.redirect("http://localhost:3001/logout/callback");
    }, 5000);
  });

  //gets album tracks
  router.get("/albums/:id", async (req, res) => {
    try {
      const id = req.params.id;
      console.log(id);
      if (id === null) {
        console.log(id);
        res.status(500).json({ error: "ID is undefinded" });
      }
      const spotifyToken = req.header("Authorization").split("Bearer ")[1];
      const response = await Axios.get(
        `https://api.spotify.com/v1/albums/${id}`,
        {
          headers: {
            Authorization: `Bearer ${spotifyToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) {
        const data = response.data;
        res.json(data.tracks.items);
      } else if (response.status === 400) {
        res.json(response.data);
      }
    } catch (error) {
      console.error("Error fetching album tracks:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  //get artist albums and tracks
  router.get("/artistsTracks/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const spotifyToken = req.header("Authorization").split("Bearer ")[1];

      const response = await Axios.get(
        `https://api.spotify.com/v1/artists/${id}/top-tracks`,
        {
          headers: {
            Authorization: `Bearer ${spotifyToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) {
        const data = response.data;
        console.log(data);
        res.json(data);
      } else {
        res.send(id);
        throw new Error("Failed to fetch artist info");
      }
    } catch (error) {
      console.error("Error fetching artist info:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  //gets Artist albums
  router.get("/artistsAlbums/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const spotifyToken = req.header("Authorization").split("Bearer ")[1];

      const response = await Axios.get(
        `https://api.spotify.com/v1/artists/${id}/albums`,
        {
          headers: {
            Authorization: `Bearer ${spotifyToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) {
        res.json(response.data.items);
      } else {
        res.send(response.data);
        throw new Error("Failed to fetch artist info");
      }
    } catch (error) {
      console.error("Error fetching artist info:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  //get User info
  router.get("/userInfo", async (req, res) => {
    try {
      const spotifyToken = req.header("Authorization").split("Bearer ")[1];

      const response = await Axios.get("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${spotifyToken}`,
        },
      });

      if (response.status === 200) {
        res.send(response.data);
        console.log(response.data);
      }
    } catch (error) {
      console.error("Error fetching artist info:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  router.put("/playTrack/:uri/:token/:deviceID", async (req, res) => {
    try {
      const trackURI = [req.params.uri];
      const spotifyToken = req.params.token;
      const deviceID = req.params.deviceID;
      //console.log(req.headers)
      //const token = req.header("Authorization").split("Bearer ")[1];

      //console.log(deviceID)

      const response = await Axios.put(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceID}`,
        {
          uris: trackURI,
          position_ms: 0,
        },
        {
          headers: {
            Authorization: `Bearer ${spotifyToken}`,
          },
        }
      );
      //console.log("player", response.data);
      res.json(response.data);
    } catch (error) {
      console.error("Error playing song:", error);
      res.status(500).send(`Error playing song: ${error}`);
    }
  });

  return router;
};
