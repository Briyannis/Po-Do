import React from "react";
import { useState, useEffect } from "react";
import Axios from "axios";
import "./loading.css";
import "./MusicOverlay.css";
import "./Player.css";
import { IconContext } from "react-icons";
import { AiFillPlayCircle, AiFillPauseCircle } from "react-icons/ai";
import { BiSkipNext, BiSkipPrevious } from "react-icons/bi";
import Queue from "./Queue";
import PreLoader1 from "./PreLoader1";
import SideMenu from "./sideMenu";
import { Range } from "react-range";
import { PiQueueFill } from "react-icons/pi";

const Player = ({
  token,
  player,
  playerID,
  userID,
  loading,
  spotID,
}) => {
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
  const [stillLoading, setStillLoading] = useState(true);
  const [songInfo, setSongInfo] = useState();

  const [songName, setSongName] = useState();
  const [albumImage, setAlbumImage] = useState();
  const [songArtist, setSongArtist] = useState();

  const [showSideMenu, setShowSideMenu] = useState(false);

  const [selectedTrack, setSelectedTrack] = useState([]);
  const [seekPos, setSeekPos] = useState();

  // Toggle side menu visibility
  const toggleSideMenu = () => {
    setShowSideMenu(!showSideMenu);
  };

  //console.log(player)
  //get the player info
  useEffect(() => {
    const avaDevice = async () => {
      try {
        const res = await Axios.get(
          `http://129.213.68.135/api/spotify-player/avaDevice/${token}`,
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

    if (player !== null && !deviceInfo && loading === false) {
      // setTimeout(() => {
      //   avaDevice();
      // }, 1000);
      avaDevice();
    }
  }, [player, playerID, loading]);

  //transfer player
  useEffect(() => {
    const transfer = async () => {
      try {
        //console.log(deviceInfo);
        const res = await Axios.put(
          `http://129.213.68.135/api/spotify-player/transferPlayer/${token}/${deviceInfo.id}`,
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

    if (deviceInfo && loading === false) {
      // setTimeout(() => {
      //   transfer();
      // }, 1000;
      transfer();
    }
  }, [deviceInfo, loading]);

  //get track duration/ player state / queue
  useEffect(() => {
    const playerState = async () => {
      try {
        const res2 = await Axios.get(
          `http://129.213.68.135/api/spotify-player/currentlyPlaying/${token}`
        );

        const res = await Axios.get(
          `http://129.213.68.135/api/spotify-player/PlaybackState/${token}`
        );
        if (res.data && res2.data) {
          const { item, progress_ms } = res.data;
          //console.log(is_playing)
          setSongInfo(res2.data.item);
          setSongPlaying(item);
          setTrackInfo({
            duration: item.duration_ms || 0,
            position: progress_ms || 0,
          });
        } else {
          playerState();
        }
        setStillLoading(loading);
      } catch (error) {
        console.error("Error getting player state:", error);
      }
    };

    if (player && loading === false) {
      const playerStateInterval = setInterval(playerState, 1000);

      return () => {
        clearInterval(playerStateInterval);
      };
    }
  }, [player, loading]);

  useEffect(() => {
    const getPlayingInfo = () => {
      if (songInfo) {
        //console.log(songInfo)
        const { album, name, artists } = songInfo;
        setAlbumImage(album.images);
        setSongName(name);
        setSongArtist(artists[0].name);
      }
    };

    getPlayingInfo();
  }, [songInfo]);

  // seek
  const handleSeek = async (e) => {
    if (player && trackInfo.duration) {
      const seekPosition = Math.floor((e / 100) * trackInfo.duration);
      setTrackInfo({ ...trackInfo, position: seekPosition });
      console.log(seekPosition);
      setSeekPos(seekPosition);

      setTrackInfo({ ...trackInfo, position: seekPosition });

      const response = await Axios.put(
        `http://129.213.68.135/api/spotify-player/seekPlayer/${seekPosition}/${token}/${deviceInfo.id}`
      );
      setTrackInfo({ ...trackInfo, position: seekPosition });

      console.log("Response Status:", response.status);
    }
  };
  const debounce = (func, delay) => {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  };

  const debouncedHandleSeek = debounce(handleSeek, 200);

  const handleToggleQueue = () => {
    setShowQueue(!showQueue);
  };

  const handlePause = async () => {
    if (player) {
      const response = await Axios.put(
        `http://129.213.68.135/api/spotify-player/pausePlayer/${token}/${deviceInfo.id}`
      );
      setIsPlaying(false);
      console.log(response.status);
    }
  };

  const [clickCount, setClickCount] = useState(0);

  const handleClick = async () => {
    if (clickCount % 2 === 0) {
      // First click action
      console.log("First click action");
      const response = await Axios.put(
        `http://129.213.68.135/api/spotify-player/seekPlayer/${0}/${token}/${deviceInfo.id}`
      );
    } else {
      // Second click action
      console.log("Second click action (handle previous)");
      handlePrevious();
    }
    setClickCount(prevCount => prevCount + 1); // Increment click count
  };

  //previous
  const handlePrevious = async () => {
    if (player) {
      const response = await Axios.post(
        `http://129.213.68.135/api/spotify-player/previousPlayer/${token}`
      );
      setIsPlaying(true);
      console.log(response.status);
    }
  };

  //Next
  const handleNext = async () => {
    if (player) {
      await Axios.post(
        `http://129.213.68.135/api/spotify-player/skipPlayer/${token}/${deviceInfo.id}`
      );

      try {
        const Q = await Axios.get(
          `http://129.213.68.135/api/queue/userQueue/${userID}`
        );

        const deleteQ = await Axios.delete(
          `http://129.213.68.135/api/queue/userDeleteQueue/${userID}/${qIndex}`
        );
        console.log(deleteQ.data);
        setQIndex(deleteQ.data);
        setIsPlaying(true);
      } catch (error) {
        if (error.response.status === 404) {
          setIsPlaying(false);
          //console.log(error.response.data.index);
          const index = error.response.data.index;
          setQIndex(index);
          await Axios.put(
            `http://129.213.68.135/api/spotify-player/pausePlayer/${token}/${deviceInfo.id}`
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
        `http://129.213.68.135/api/spotify-player/resumePlayer/${uri}/${token}/${deviceInfo.id}/${trackInfo.position}`
      );
      setIsPlaying(true);
      console.log(response.status);
    }
  };

  //plays selected track
  useEffect(() => {
    const handlePlay = async () => {
      if (player && selectedTrack.uri) {
        console.log(`track: ${selectedTrack.uri}`);
        const response = await Axios.put(
          `http://129.213.68.135/api/spotify-player/playTrack/${selectedTrack.uri}/${token}/${deviceInfo.id}`
        );
        //QueueReq();
        setIsPlaying(true);
        console.log(response.status);
        //console.log(songInfo)
      }
    };
    handlePlay();
    //console.log(currentSong);
  }, [selectedTrack]);

  //player testing

  // const handlePlaySong = async (uri) => {
  //   if (player) {
  //     const response = await Axios.put(
  //       `http://129.213.68.135/api/spotify-player/playTrack/${uri}/${token}/${deviceInfo.id}`
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
        `http://129.213.68.135/api/spotify-player/volume/${newVolume}/${deviceInfo.id}/${token}`
      );
      console.log(response.data);
    } catch (error) {
      console.error("Error updating volume:", error.response.data);
    }
  };

  const onTrackSelect = async (selected_Track) => {
    setSelectedTrack(selected_Track);
    setShowSideMenu(false);
    await Axios.delete(`http://129.213.68.135/api/queue/DeleteAQueue/${userID}`);
    setTimeout(() => {
      setSelectedTrack([]);
    }, 3000);
  };

  return (
    <div>
      {stillLoading ? (
        <div className="loading-container">
          <div className="loading">
            <PreLoader1 />
          </div>
        </div>
      ) : (
        <>
          <div className="menu-toggle">
            <button onClick={toggleSideMenu} className="menu-button">
              <div className="bar"></div>
              <div className="bar"></div>
              <div className="bar"></div>
            </button>
          </div>
          <div className="content-container">
            {showSideMenu && (
              <SideMenu
                spotID={spotID}
                spotifyAccessToken={token}
                loginStatusID={userID}
                trackSelect={onTrackSelect}
              />
            )}
            <h2>Now Playing</h2>
            {selectedTrack && (
              <div className="Cover">
                {albumImage && (
                  <img className="image" src={albumImage[1].url} alt="Album Cover" />
                )}
                <p className="title">
                  {songName} - {songArtist}
                </p>
              </div>
            )}
          </div>
          <div>
            {/* Progress bar */}
            <div className="progress-container">
              {/* Progress bar representation */}
              <div
                className="progress-bar"
                style={{ backgroundColor: "#14c91c", width: `${progress}%` }}
              ></div>
              <Range
                step={0.1}
                min={0}
                max={100}
                values={[progress]}
                onClick={handleSeek}
                onChange={(newValues) => {
                  debouncedHandleSeek(newValues[0]);
                }}
                renderTrack={({ props, children }) => (
                  <div
                    {...props}
                    style={{
                      ...props.style,
                      height: "5px",
                      marginTop: "-8px",
                      width: "100%",
                      opacity: 1,
                      backgroundColor: "transparent",
                    }}
                  >
                    {children}
                  </div>
                )}
                renderThumb={({ props }) => (
                  <div
                    {...props}
                    style={{
                      ...props.style,
                      width: "15px",
                      height: "15px",
                      borderRadius: "50%",
                      backgroundColor: "#14c91c",
                      cursor: "pointer",
                      position: "relative",

                    }}
                  />
                )}
              />
            </div>

            {/* Timestamps */}
            <div className="timestamps">
              <span>
                {isNaN(trackInfo.position)
                  ? formatTime(seekPos)
                  : formatTime(trackInfo.position)}
              </span>
              <span>{formatTime(trackInfo.duration)}</span>
            </div>
          </div>
          <div style={{ display: showQueue ? "none" : "block" }}></div>
          <div className="player-controls">
            <div className="player-controls-container">
              <button className="playButton" onClick={() => handleClick()}>
                <IconContext.Provider
                  value={{ size: "3em", color: "#14c91c" }}
                >
                  <BiSkipPrevious />
                </IconContext.Provider>
              </button>

              {!isPlaying ? (
                <button
                  className="playButton"
                  onClick={() => handleResume(songPlaying.uri)}
                >
                  <IconContext.Provider
                    value={{ size: "3em", color: "#14c91c" }}
                  >
                    <AiFillPlayCircle />
                  </IconContext.Provider>
                </button>
              ) : (
                <button className="playButton" onClick={() => handlePause()}>
                  <IconContext.Provider
                    value={{ size: "3em", color: "#14c91c" }}
                  >
                    <AiFillPauseCircle />
                  </IconContext.Provider>
                </button>
              )}

              <button className="playButton" onClick={() => handleNext()}>
                <IconContext.Provider
                  value={{ size: "3em", color: "#14c91c" }}
                >
                  <BiSkipNext />
                </IconContext.Provider>
              </button>
            </div>
            <div className="volume-control-container">
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={VolumeChange}
              />
              <button className="playButton" onClick={handleToggleQueue}>
                <IconContext.Provider
                  value={{ size: "3em", color: "#14c91c" }}
                >
                  <PiQueueFill />
                </IconContext.Provider>
              </button>
            </div>
          </div>

          <div style={{ display: showQueue ? "block" : "none" }}>
            {showQueue && (
              <Queue
                token={token}
                userID={userID}
                selectedSong={selectedTrack}
                setQIndex={qIndex}
                songPlaying={songPlaying}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Player;
