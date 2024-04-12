import "./MusicOverlay.css";
import React, { useState, useEffect } from "react";
import Axios from "axios";

const FreePlayback = ({ currentSong, token }) => {
  const [playbackState, setPlaybackState] = useState(null);

  const [showQueue, setShowQueue] = useState(false);
  const [playerID, setPlayerID] = useState(null);

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        // Retrieve the user's cavailibe player device
        const response = await Axios.get(
          "http://localhost:3001/spotify-player/player",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log(response.data);
        setPlaybackState(response.data);
      } catch (error) {
        console.error("Error fetching playback state:", error);
      }
    };
    const fetchPlaybackState = async () => {
      try {
        // Retrieve the user's current playback state
        const response = await Axios.get(
          "http://localhost:3001/spotify-player/playerState",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log(response.data);
        setPlaybackState(response.data);
      } catch (error) {
        console.error("Error fetching playback state:", error);
      }
    };
    fetchPlayer();
    fetchPlaybackState();

    console.log(playbackState);
  }, []);

  const hardcodedQueue = [
    { title: "Song 4", artist: "Artist 4" },
    { title: "Song 5", artist: "Artist 5" },
    { title: "Song 6", artist: "Artist 6" },
  ];

  const PiscesURI = "spotify:track:5t8NXa2fugcTPsTfhVILmS";

  const handleToggleQueue = () => {
    setShowQueue(!showQueue);
  };

  const handlePlayPause = () => {};

  const handlePrevious = () => {};

  const handleNext = () => {};

  const handlePlay = () => {};

  const handlePlaySong = async (uri) => {
    try {
      await Axios.put(
        `http://localhost:3001/spotify-player/playTrack/${uri}/${token}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
    } catch (error) {
      console.error("Error playing song:", error);
    }
  };

  return (
    <div>
      <div style={{ display: showQueue ? "none" : "block" }}>
        <h2>Now Playing</h2>
        {currentSong ? (
          <div>
            <img src={currentSong.cover} alt="Album Cover" />
            <p>
              {currentSong.title} - {currentSong.artist}
            </p>
          </div>
        ) : (
          <p>-</p>
        )}
        <div>
          <button onClick={() => handlePlaySong(PiscesURI)}>
            Play Bitch Pisces
          </button>
          <button onClick={handlePrevious}>Previous</button>
          <button onClick={handlePlayPause}>Play/Pause</button>
          <button onClick={handleNext}>Next</button>
          <button onClick={handleToggleQueue}>Show Queue</button>
        </div>
      </div>
      <div style={{ display: showQueue ? "block" : "none" }}>
        <h2>Queue</h2>
        <ul>
          {hardcodedQueue.map((song, index) => (
            <li key={index}>
              {song.title} - {song.artist}
            </li>
          ))}
        </ul>
        <button onClick={handleToggleQueue}>Hide Queue</button>
      </div>
    </div>
  );
};

export default FreePlayback;
