import React from "react";
import { useState, useEffect } from "react";
import Axios from "axios";
import "./Player.css";
import { IconContext } from "react-icons";
import { AiFillPlayCircle, AiFillPauseCircle } from "react-icons/ai";
import { BiSkipNext, BiSkipPrevious } from "react-icons/bi";

const Player = ({ token, currentSong, player, playerID, songInfo}) => {
  const [showQueue, setShowQueue] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState();
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackInfo, setTrackInfo] = useState({
    duration: 0,
    position: 0,
  });
  const [songPlaying, setSongPlaying] = useState();


  //console.log(player)
  //get the player info
  useEffect(() => {
    const test = async () => {
      try {
        const res = await Axios.get(
          `http://localhost:3001/spotify-player/avaDevice/${token}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const devices = res.data.devices;

        devices.forEach((device) => {
          //console.log(playerID)
          if (playerID === device.id) {
            //console.log(device);
            setDeviceInfo(device);
          }
        });
      } catch (error) {
        console.error("Error fetching device info:", error);
      }
    };

    if (player) {
      setTimeout(() => {
        test();
      }, 1000);
    }
  }, [player, playerID]);

  //transfer player
  useEffect(() => {
    const transfer = async () => {
      try {
        console.log(deviceInfo.id);
        const res = await Axios.put(
          `http://localhost:3001/spotify-player/transferPlayer/${token}/${deviceInfo.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(res.data);
      } catch (error) {
        console.error("Error transferring player:", error);
      }
    };

    if (deviceInfo) {
      setTimeout(() => {
        transfer();
      }, 1000);
    }
  }, [deviceInfo]);

  //get track duration/ player state
  useEffect(() => {
    const playerState = async () => {
      try {
        const res = await Axios.get(
          `http://localhost:3001/spotify-player/PlaybackState/${token}`
        );

        const res2 = await Axios.get(
            `http://localhost:3001/spotify-player/currentlyPlaying/${token}`
          );
        if (res.data && res2.data) {
          //console.log(res.data)
          const { item, progress_ms } = res.data; 
          songInfo(res2.data.item)
          setSongPlaying(item);
          setTrackInfo({
            duration: item.duration_ms || 0, 
            position: progress_ms || 0, 
          });
        }
      } catch (error) {
        console.error("Error getting player state:", error);
      }
    };

    if(player){const playerStateInterval = setInterval(playerState, 1000);

    return () => {
      clearInterval(playerStateInterval);
    };}
  }, [player]);
  const hardcodedQueue = [
    { title: "Song 4", artist: "Artist 4" },
    { title: "Song 5", artist: "Artist 5" },
    { title: "Song 6", artist: "Artist 6" },
  ];

  const PiscesURI = "spotify:track:5t8NXa2fugcTPsTfhVILmS";

  const handleToggleQueue = () => {
    setShowQueue(!showQueue);
  };

  const handlePause = async () => {
    if (player) {
      const response = await Axios.put(
        `http://localhost:3001/spotify-player/pausePlayer/${token}/${deviceInfo.id}`
      );
      setIsPlaying(false);
      console.log(response.status);
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

  //testing
  const handleResume = async (uri) => {
    if (player) {
      const response = await Axios.put(
        `http://localhost:3001/spotify-player/resumePlayer/${uri}/${token}/${deviceInfo.id}/${trackInfo.position}`
      );
      setIsPlaying(true);
      console.log(response.status);
    }
  };

  //plays selected track
  useEffect(() => {
    const handlePlay = async () => {
      if (player && currentSong.uri) {
       // console.log(`track: ${currentSong.uri}`)
        const response = await Axios.put(
          `http://localhost:3001/spotify-player/playTrack/${currentSong.uri}/${token}/${deviceInfo.id}`
        );
        setIsPlaying(true);
        console.log(response.status);
        //console.log(songInfo)
      }
    };
    handlePlay();
  }, [currentSong]);

  const handlePlaySong = async (uri) => {
    if (player) {
      const response = await Axios.put(
        `http://localhost:3001/spotify-player/playTrack/${uri}/${token}/${deviceInfo.id}`
      );
      setIsPlaying(true);
      console.log(response.status);
    }
}

  const progress = (trackInfo.position / trackInfo.duration) * 100;
  // console.log(trackInfo.duration)

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div>
      <div>
        {/* Progress bar */}
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>

        {/* Timestamps */}
        <div className="timestamps">
          <span>{formatTime(trackInfo.position)}</span>
          <span>{formatTime(trackInfo.duration)}</span>
        </div>
      </div>
      <div style={{ display: showQueue ? "none" : "block" }}></div>
      <div>
        <button onClick={() => handlePlaySong(PiscesURI)}>Play Pisces</button>
      </div>
      <div>
        <button className="playButton" onClick={handlePrevious}>
          <IconContext.Provider value={{ size: "1.5em", color: "#27AE60" }}>
            <BiSkipPrevious />
          </IconContext.Provider>
        </button>

        {!isPlaying ? (
          <button
            className="playButton"
            onClick={() => handleResume(songPlaying.uri)}
          >
            <IconContext.Provider value={{ size: "1.5em", color: "#27AE60" }}>
              <AiFillPlayCircle />
            </IconContext.Provider>
          </button>
        ) : (
          <button className="playButton" onClick={handlePause}>
            <IconContext.Provider value={{ size: "1.5em", color: "#27AE60" }}>
              <AiFillPauseCircle />
            </IconContext.Provider>
          </button>
        )}

        <button className="playButton" onClick={handleNext}>
          <IconContext.Provider value={{ size: "1.5em", color: "#27AE60" }}>
            <BiSkipNext />
          </IconContext.Provider>
        </button>
        <button onClick={handleToggleQueue}>Show Queue</button>
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

export default Player;
