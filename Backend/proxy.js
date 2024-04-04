const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Define your Spotify API endpoint
const spotifyApiUrl = 'https://api.spotify.com';

// Create proxy middleware
const spotifyProxy = createProxyMiddleware({
  target: spotifyApiUrl,
  changeOrigin: true,
  headers: {
    'Access-Control-Allow-Origin': 'http://localhost:3000', // Adjust this to your frontend's origin
    'Access-Control-Allow-Credentials': 'true',
  },
});

// Use the proxy middleware for requests to the Spotify API
app.use('/v1', spotifyProxy);

// Start the server
const port = 3002; // Adjust this to the desired port
app.listen(port, () => {
  console.log(`Proxy server is running on port ${port}`);
});

app.get("/SpotifyApi", async (req, res) => {
    try {
      // Retrieve parameters from request query
      const { spotifyToken, searchKey } = req.query;
  
      // Make a request to the Spotify API using Axios
      const response = await Axios.get("https://api.spotify.com/v1/search", {
        headers: {
          Authorization: `Bearer ${spotifyToken}`,
          'Content-Type': 'application/json',
        },
        params: { q: searchKey, type: "artist" },
        withCredentials: true,
      });
  
      // Return the response from the Spotify API to the client
      res.send(response.data);
    } catch (error) {
      // Handle errors
      console.error("Error:", error);
      res.status(500).send("Internal Server Error");
    }
  });