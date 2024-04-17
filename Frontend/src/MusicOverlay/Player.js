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
  const [qIndex, setQIndex] = useState();

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

  // useEffect(() => {
  //   const spotQ = async () => {
  //     const res = await Axios.get(
  //       `http://localhost:3001/spotify-player/playerQueue/${token}`
  //     );
  //     const queue = res.data.queue;

  //     //console.log(queue.length)
  //     //setQueueSize(queue.length)
  //   }

  //   spotQ();
  // }, [])

  // useEffect(() => {
  //   const QueueReq = async () => {
  //     try {

  //       const res = await Axios.get(`http://localhost:3001/queue/userQueue`, {userID: userID});
  //       //const queue = res.data.queue;
  //       //const currently_playing = res.data.currently_playing

  //       //const updatedQueue = queue.filter((song) => song.uri !== currently_playing?.uri);
        
  //       //setQueue(updatedQueue);

    

        

  //       // console.log(res.data)
  //     } catch (error) {
  //       console.error("Error fetching queue:", error);
  //     }
  //   };
  //   QueueReq();
  // }, []);



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

      const queue = await Axios.get(
        `http://localhost:3001/queue/userQueue/${userID}`
      );

      if(queue.status === 404){
        setQIndex(0);
      }

      

      //const res = await Axios.delete(`http://localhost:3001/queue/userDeleteQueue/${userID}`)

      setIsPlaying(true);
      console.log(songPlaying);
    }
  };

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
        // console.log(`track: ${currentSong.uri}`)
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
      </div>

      <div style={{ display: showQueue ? "block" : "none" }}>
        <button onClick={handleToggleQueue}>Hide Queue</button>
        {showQueue && (<Queue token={token} userID={userID} selectedSong={currentSong}/>)}
      </div>
    </div>
  );
};

export default Player;
