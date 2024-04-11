import "./MusicOverlay.css";
import React, { useState, useEffect } from "react";
import Axios from "axios";

const Playback = ({ currentSong, token }) => {
  const [showQueue, setShowQueue] = useState(false);
  const [player, setPlayer] = useState(null);
  //const [script, setScript] = useState();

  const hardcodedQueue = [
    { title: "Song 4", artist: "Artist 4" },
    { title: "Song 5", artist: "Artist 5" },
    { title: "Song 6", artist: "Artist 6" },
  ];

  const PiscesURI = "spotify:track:5t8NXa2fugcTPsTfhVILmS";

  const handleToggleQueue = () => {
    setShowQueue(!showQueue);
  };

  const handlePlayPause = () => {
    if (player) {
      player
        .togglePlay()
        .then(() => {
          console.log("Playback toggled");
        })
        .catch((error) => {
          console.error("Error toggling playback:", error);
        });
    }
  };

  const handlePrevious = () => {
    if (player) {
      player
        .previousTrack()
        .then(() => {
          console.log("Previous track played");
        })
        .catch((error) => {
          console.error("Error playing previous track:", error);
        });
    }
  };

  const handleNext = () => {
    if (player) {
      player
        .nextTrack()
        .then(() => {
          console.log("Next track played");
        })
        .catch((error) => {
          console.error("Error playing next track:", error);
        });
    }
  };

  window.onSpotifyWebPlaybackSDKReady = () => {};

  useEffect(() => {
    const initializeSpotifySDK = async () => {
      try {
        const response = await Axios.post("http://localhost:3001/spotify-api/playerSDK");
        {const script = document.createElement("script");
        //console.log(response)
        //script.src = "http://localhost:3001/spotify-api/playerSDK";
        const data = response.data
        //console.log(data);
        script.type = 'text/javascript';
        script.text = data

        //console.log(script)

        document.body.appendChild(script);}

        window.onSpotifyWebPlaybackSDKReady = () => {
          //console.log("SDK ready");
          const player = new window.Spotify.Player({
            name: "Web Playback SDK",
            getOAuthToken: (cb) => {
              cb(token);
            },
            volume: 0.5,
          });

          setPlayer(player);

          //console.log("new", player);

          player.addListener("ready", ({ device_id }) => {
            console.log("Player is ready", device_id);
            //newPlayer.connect();
          });

          player.addListener("not_ready", ({ device_id }) => {
            console.log("Device ID has gone offline", device_id);
          });

          player.connect();
        };
      } catch (error) {
        console.error("Error fetching Spotify Web Playback SDK:", error);
      }
    };

    initializeSpotifySDK();
  }, [token]);

  const handlePlay = () => {
    if (player && currentSong && currentSong.uri) {
      player
        .play({
          uris: [currentSong.uri],
        })
        .then(() => {
          console.log("Playback started");
        })
        .catch((error) => {
          console.error("Error starting playback:", error);
        });
    }
  };

  const handlePlaySong = (uri) => {
    //console.log(player.device_id);
    console.log(player);
    if (player) {
      player
        .togglePlay({
          uris: [uri],
        })
        .then(() => {
          console.log("Playback started for track:", uri);
        })
        .catch((error) => {
          console.error("Error starting playback:", error);
        });
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
          <button onClick={() => handlePlaySong(PiscesURI)}>Play Pisces</button>
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

export default Playback;
