const express = require("express");
const router = express.Router();
const Axios = require("axios");
const { head } = require("request");

router.post("/playerSDK", async (req, res) => {
  try {
    const response = await Axios.get("https://sdk.scdn.co/spotify-player.js");
    const sdkScript = response.data;

    // Set appropriate content type header
    res.setHeader("Content-Type", "text/javascript");
    // Send the SDK script content
    res.send(sdkScript);
    //console.log(sdkScript)
  } catch (error) {
    console.error("Error fetching Spotify Web Playback SDK:", error);
    res.status(500).send(`Error fetching Spotify Web Playback SDK: ${error}`);
  }
});

router.get("/playerState", async (req, res) => {
  try {
    const spotifyToken = req.header("Authorization").split("Bearer ")[1];

    const response = await Axios.get("https://api.spotify.com/v1/me/player", {
      headers: {
        Authorization: `Bearer ${spotifyToken}`,
        "Content-Type": "application/json",
      },
    });
    console.log("player", response.data);
    res.json(response.data);
  } catch (error) {
    console.error("Error fecthing Player State:", error);
    res.status(500).send(`Error fecthing Player State: ${error}`);
  }
});

router.get("/player", async (req, res) => {
    try {
      const spotifyToken = req.header("Authorization").split("Bearer ")[1];
  
      const response = await Axios.get(
        "https://api.spotify.com/v1/me/player/devices",
        {
          headers: {
            Authorization: `Bearer ${spotifyToken}`
          },
        }
      );
      console.log("player", response.data);
      res.json(response.data);
    } catch (error) {
      console.error("Error playing song:", error);
      res.status(500).send(`Error playing song: ${error}`);
    }
  });

router.put("/playTrack/:uri/:token", async (req, res) => {
  try {
    const trackURI = req.params.uri;
    const spotifyToken = req.params.token
    //console.log(req.headers)
    //const token = req.header("Authorization").split("Bearer ")[1];

    console.log(trackURI)

    const response = await Axios.put(
      "https://api.spotify.com/v1/me/player/play",  
      { 
        device_id: "a7da33f3e62b795aeafc38beb9d21857dda89c2a",
        uris: "spotify:track:69nWy17LLDqW5DcgDc37hq",
        position_ms: 0
    },
      {
        headers: {
          "Authorization": `Bearer ${spotifyToken}`,
          'Content-Type': 'application/json',
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

module.exports = router;
