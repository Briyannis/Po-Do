import React from "react";
import { useState, useEffect } from "react";
import Axios from "axios";
import "./Player.css";
import { IconContext } from "react-icons";
import { AiFillPlayCircle, AiFillPauseCircle } from "react-icons/ai";
import { BiSkipNext, BiSkipPrevious } from "react-icons/bi";
import Queue from "./Queue";

const Player = ({ token, currentSong, player, playerID, songInfo, userID }) => {
  const [showQueue, setShowQueue] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState();
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackInfo, setTrackInfo] = useState({
    duration: 0,
    position: 0,
  });
  const [songPlaying, setSongPlaying] = useState();
  const [qIndex, setQIndex] = useState(1);
  const [volume, setVolume] = useState(50);

  //console.log(player)
  //get the player info
  useEffect(() => {
    const avaDevice = async () => {
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

    if (player !== null && !deviceInfo) {
      setTimeout(() => {
        avaDevice();
      }, 1000);
    }
  }, [player, playerID]);

  //transfer player
  useEffect(() => {
    const transfer = async () => {
      try {
        //console.log(deviceInfo);
        const res = await Axios.put(
          `http://localhost:3001/spotify-player/transferPlayer/${token}/${deviceInfo.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        //console.log(res.data);
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

  //get track duration/ player state / queue
  useEffect(() => {
    const playerState = async () => {
      try {
        const res2 = await Axios.get(
          `http://localhost:3001/spotify-player/currentlyPlaying/${token}`
        );

        const res = await Axios.get(
          `http://localhost:3001/spotify-player/PlaybackState/${token}`
        );
        if (res.data && res2.data) {
          const { item, progress_ms } = res.data;
          //console.log(is_playing)
          songInfo(res2.data.item);
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

    if (player) {
      const playerStateInterval = setInterval(playerState, 1000);

      return () => {
        clearInterval(playerStateInterval);
      };
    }
  }, [player]);

  // seek
  const handleSeek = async (e) => {
    if (player && trackInfo.duration) {
      const container = e.currentTarget;
      const containerRect = container.getBoundingClientRect();
      const offsetX = e.clientX - containerRect.left;
      const containerWidth = containerRect.width;
      const percentageClicked = offsetX / containerWidth;
      const seekPosition = Math.floor(percentageClicked * trackInfo.duration);
      console.log(seekPosition)
  
      setTrackInfo({ ...trackInfo, position: seekPosition });
      const response = await Axios.put(
        `http://localhost:3001/spotify-player/seekPlayer/${seekPosition}/${token}/${deviceInfo.id}`
      );
      console.log("Response Status:", response.status);
    }
  };

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

  //previous
  const handlePrevious = async () => {
    if (player) {
      const response = await Axios.post(
        `http://localhost:3001/spotify-player/previousPlayer/${token}`
      );
      setIsPlaying(true);
      console.log(response.status);
    }
  };

  //Next
  const handleNext = async () => {
    if (player) {
      await Axios.post(
        `http://localhost:3001/spotify-player/skipPlayer/${token}/${deviceInfo.id}`
      );

      try {
        const Q = await Axios.get(
          `http://localhost:3001/queue/userQueue/${userID}`
        );

        const deleteQ = await Axios.delete(
          `http://localhost:3001/queue/userDeleteQueue/${userID}/${qIndex}`
        );
        console.log(deleteQ.data);
        setQIndex(deleteQ.data);
        setIsPlaying(true);
      } catch (error) {
        if (error.response.status === 404) {
          console.log(error.response.data.index);
          setIsPlaying(false);
          const index = error.response.data.index;
          setQIndex(index);
          await Axios.put(
            `http://localhost:3001/spotify-player/pausePlayer/${token}/${deviceInfo.id}`
          );
        } else {
          console.log("Error:", error);
        }
      }
    }
  };
  //console.log(qIndex);

  //resume
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
        console.log(`track: ${currentSong.uri}`);
        const response = await Axios.put(
          `http://localhost:3001/spotify-player/playTrack/${currentSong.uri}/${token}/${deviceInfo.id}`
        );
        //QueueReq();
        setIsPlaying(true);
        console.log(response.status);
        //console.log(songInfo)
      }
    };
    handlePlay();
    //console.log(currentSong);
  }, [currentSong]);

  //player testing

  // const handlePlaySong = async (uri) => {
  //   if (player) {
  //     const response = await Axios.put(
  //       `http://localhost:3001/spotify-player/playTrack/${uri}/${token}/${deviceInfo.id}`
  //     );
  //     setIsPlaying(true);
  //     console.log(response.status);
  //   }
  // };

  const progress = (trackInfo.position / trackInfo.duration) * 100;
  // console.log(trackInfo.duration)

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  //Volume
  const VolumeChange = async (event) => {
    const newVolume = parseInt(event.target.value);
    setVolume(newVolume);

    try {
      // Update the player's volume using the Spotify Web API
      const response = await Axios.put(
        `http://localhost:3001/spotify-player/volume/${newVolume}/${deviceInfo.id}/${token}`
      );
      console.log(response.data);
    } catch (error) {
      console.error("Error updating volume:", error.response.data);
    }
  };

  return (
    <div>
      <div>
        {/* Progress bar */}
        <div className="progress-container" onClick={handleSeek}>
        {/* Progress bar representation */}
        <div
          className="progress-bar"
          style={{ backgroundColor: "green", width: `${progress}%` }}
        ></div>
        </div>

        {/* Timestamps */}
        <div className="timestamps">
          <span>{formatTime(trackInfo.position)}</span>
          <span>{formatTime(trackInfo.duration)}</span>
        </div>
      </div>
      <div style={{ display: showQueue ? "none" : "block" }}></div>
      <div>
        <button className="playButton" onClick={() => handlePrevious()}>
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
          <button className="playButton" onClick={() => handlePause()}>
            <IconContext.Provider value={{ size: "1.5em", color: "#27AE60" }}>
              <AiFillPauseCircle />
            </IconContext.Provider>
          </button>
        )}

        <button className="playButton" onClick={() => handleNext()}>
          <IconContext.Provider value={{ size: "1.5em", color: "#27AE60" }}>
            <BiSkipNext />
          </IconContext.Provider>
        </button>
        <button onClick={handleToggleQueue}>Show Queue</button>

        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={VolumeChange}
        />
        <span>Volume: {volume}</span>
      </div>

      <div style={{ display: showQueue ? "block" : "none" }}>
        {showQueue && (
          <Queue
            token={token}
            userID={userID}
            selectedSong={currentSong}
            setQIndex={qIndex}
            songPlaying={songPlaying}
          />
        )}
      </div>
    </div>
  );
};

export default Player;
