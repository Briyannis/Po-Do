const express = require("express");
const router = express.Router();
const Axios = require("axios");

router.get("/usersSavedAlbums/:token", async (req, res) => {
    try {
      const spotifyToken = req.params.token
      //console.log(spotifyToken)
      //const token = req.header("Authorization").split("Bearer ")[1];
  
      const response = await Axios.get(
        `https://api.spotify.com/v1/me/albums?limit=50`,  
        {
          headers: {
            "Authorization": `Bearer ${spotifyToken}`,
          },
        }
      );
      //console.log("player", response.data.items);
      res.json(response.data.items.map(item => item.album))
     // console.log(deviceID)
    } catch (error) {
  
      console.error("Error Getting State:", error);
      res.status(500).send(`Error Getting State: ${error}`);
    }
  });

  router.get("/usersSavedTracks/:token", async (req, res) => {
    try {
      const spotifyToken = req.params.token
      //console.log(spotifyToken)
      //const token = req.header("Authorization").split("Bearer ")[1];
  
      const response = await Axios.get(
        `https://api.spotify.com/v1/me/tracks?limit=50&market=us`,  
        {
          headers: {
            "Authorization": `Bearer ${spotifyToken}`,
          },
        }
      );
      //console.log("player", response.data.items);
      res.json(response.data.items.map(item => item.track))
     // console.log(deviceID)
    } catch (error) {
  
      console.error("Error Getting State:", error);
      res.status(500).send(`Error Getting State: ${error}`);
    }
  });

  router.get("userSavedPlaylist/:token/:userID", async (req, res) => {
    try {
        const spotifyToken = req.params.token 
        const userID = req.params.userID

    const response = await Axios.get(
        `https://api.spotify.com/v1/users/${userID}/playlists?limit=50&`,  
        {
          headers: {
            "Authorization": `Bearer ${spotifyToken}`,
          },
        }
      );} catch (error) {
        console.error(`error fetching playlist: ${error}`);
      }
  })

module.exports = router;