const express = require("express");
const router = express.Router();
const Axios = require("axios");

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
      res.status(500).send(`Error fetching Spotify Web Playback SDK: ${error.message}`);
    }
  });


  module.exports = router;