const express = require("express");
const router = express.Router();
const Axios = require("axios");
const loudness = require('loudness');

//get player SDK
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

//Plays tracks
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

//transfer Player
router.put("/transferPlayer/:token/:deviceID", async (req, res) => {
  try {
    const spotifyToken = req.params.token;
    const deviceID = [req.params.deviceID];
    //console.log(req.headers)
    //const token = req.header("Authorization").split("Bearer ")[1];

    const response = await Axios.put(
      `https://api.spotify.com/v1/me/player`,
      {
        device_ids: deviceID,
      },
      {
        headers: {
          Authorization: `Bearer ${spotifyToken}`,
        },
      }
    );
    //console.log("player", response.data);
    res.json(response.data);
    //console.log(deviceID)
  } catch (error) {
    console.error("Error playing song:", error.response.error);
    res.status(500).send(`Error playing song: ${error}`);
  }
});

//get Ava devices
router.get("/avaDevice/:token", async (req, res) => {
  try {
    const spotifyToken = req.params.token;
    //console.log(spotifyToken)
    //const token = req.header("Authorization").split("Bearer ")[1];

    const response = await Axios.get(
      `https://api.spotify.com/v1/me/player/devices`,
      {
        headers: {
          Authorization: `Bearer ${spotifyToken}`,
        },
      }
    );
    //console.log("player", response.data);
    res.json(response.data);
    // console.log(deviceID)
  } catch (error) {
    console.error("Error playing song:", error);
    res.status(500).send(`Error playing song: ${error}`);
  }
});

//get player State
router.get("/PlaybackState/:token", async (req, res) => {
  try {
    const spotifyToken = req.params.token;
    //console.log(spotifyToken)
    //const token = req.header("Authorization").split("Bearer ")[1];

    const response = await Axios.get(`https://api.spotify.com/v1/me/player`, {
      headers: {
        Authorization: `Bearer ${spotifyToken}`,
      },
    });
    //console.log("player", response.data);
    res.json(response.data);
    // console.log(deviceID)
  } catch (error) {
    console.error("Error Getting State:", error);
    res.status(500).send(`Error Getting State: ${error}`);
  }
});

//pause player
router.put("/pausePlayer/:token/:deviceID", async (req, res) => {
  try {
    const spotifyToken = req.params.token;
    const deviceID = req.params.deviceID;

    // console.log(deviceID, " ", spotifyToken)

    const response = await Axios.put(
      `https://api.spotify.com/v1/me/player/pause?device_id=${deviceID}`,
      null,
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

//resume player
router.put(
  "/resumePlayer/:uri/:token/:deviceID/:position_ms",
  async (req, res) => {
    try {
      const trackURI = [req.params.uri];
      const spotifyToken = req.params.token;
      const deviceID = req.params.deviceID;
      const position = req.params.position_ms;
      //console.log(req.headers)
      //const token = req.header("Authorization").split("Bearer ")[1];

      //console.log(deviceID);

      const response = await Axios.put(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceID}`,
        {
          uris: trackURI,
          position_ms: position,
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
  }
);

//get currently Playing
router.get("/currentlyPlaying/:token", async (req, res) => {
  try {
    const spotifyToken = req.params.token;
    //console.log(spotifyToken)
    //const token = req.header("Authorization").split("Bearer ")[1];

    const response = await Axios.get(
      `https://api.spotify.com/v1/me/player/currently-playing`,
      {
        headers: {
          Authorization: `Bearer ${spotifyToken}`,
        },
      }
    );
    //console.log("player", response.data);
    res.json(response.data);
    // console.log(deviceID)
  } catch (error) {
    console.error("Error Getting State:", error);
    res.status(500).send(`Error Getting State: ${error}`);
  }
});
//skip player
router.post("/skipPlayer/:token/:deviceID", async (req, res) => {
  try {
    const spotifyToken = req.params.token;
    const deviceID = req.params.deviceID;

    //console.log(req.headers)
    //const token = req.header("Authorization").split("Bearer ")[1];

    //console.log(deviceID);

    const response = await Axios.post(
      `https://api.spotify.com/v1/me/player/next?device_id=${deviceID}`,
      null,
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
//previous player
router.post("/previousPlayer/:token", async (req, res) => {
  try {
    const spotifyToken = req.params.token;
    //const deviceID = req.params.deviceID;

    //console.log(req.headers)
    //const token = req.header("Authorization").split("Bearer ")[1];

    //console.log(deviceID);

    const response = await Axios.post(
      `https://api.spotify.com/v1/me/player/previous`,
      null,
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
//player volume
//shuffle player
//queue player
router.get("/playerQueue/:token", async (req, res) => {
  try {
    const spotifyToken = req.params.token;
    //console.log(spotifyToken)
    //const token = req.header("Authorization").split("Bearer ")[1];

    const response = await Axios.get(
      `https://api.spotify.com/v1/me/player/queue`,
      {
        headers: {
          Authorization: `Bearer ${spotifyToken}`,
        },
      }
    );
    //console.log("player", response.data);
    res.json(response.data);
    // console.log(deviceID)
  } catch (error) {
    console.error("Error Getting State:", error);
    res.status(500).send(`Error Getting State: ${error}`);
  }
});
//add queue
router.post("/addToQueue/:uri/:token", async (req, res) => {
  try {
    const uri = req.params.uri;
    const spotifyToken = req.params.token;
    const deviceID = req.params.deviceID;

    //console.log(req.headers)
    //const token = req.header("Authorization").split("Bearer ")[1];

    //console.log(deviceID);

    const response = await Axios.post(
      `https://api.spotify.com/v1/me/player/queue?uri=${uri}`,
      null,
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
//seek player
router.put("/seekPlayer/:seekPosition/:token/:id", async (req, res) => {
  const seekPos = req.params.seekPosition;
  const token = req.params.token;
  const deviceId = req.params.id;

  console.log(seekPos);

  try {
    const response = await Axios.put(
      `https://api.spotify.com/v1/me/player/seek?position_ms=${seekPos}&device_id=${deviceId}`,
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    res.status(200).json({ message: "Successfully seeked", data: response.data });
  } catch (error) {
    console.error("Error seeking:", error);
    res.json(`seeked unsuccessful`);
  }
});

//volume
router.put("/volume/:volume/:deviceID/:token", async (req, res) => {
  const volume = req.params.volume;
  const deviceID = req.params.deviceID;
  const token = req.params.token;
  //console.log(token);
  try {
    // Update the player's volume using the Spotify Web API
    await loudness.setVolume(volume);
    const response = await Axios.put(
      `https://api.spotify.com/v1/me/player/volume?volume_percent=${volume}`,
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log(response.data);
    res.status(200).json(response.data); // Send response back to client
  } catch (error) {
    console.error("Error updating volume:", error.response.data);
    res
      .status(500)
      .json({ error: `Error updating volume ${error.response.data}` }); // Send error response back to client
  }
});

//get sys vol
router.get("/SYSVolume", async (req, res) => {
  try {
    const volume = await loudness.getVolume();
    res.status(200).json({ volume });
  } catch (error) {
    console.error("Error getting system volume:", error);
    res.status(500).json({ error: "Error getting system volume" });
  }
});
module.exports = router;
