import "./MusicOverlay.css";
import "./loading.css";
import React, { useState, useEffect } from "react";
import Axios from "axios";
import Player from "./Player";
import PreLoader1 from "./PreLoader1";


const Playback = ({ token, userID, spotID }) => {
  const [player, setPlayer] = useState(undefined);
  const [device_id, setDeviceID] = useState();
  const [songName, setSongName] = useState();
  const [albumImage, setAlbumImage] = useState();
  const [songArtist, setSongArtist] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeSpotifySDK = async () => {
      try {
        const response = await Axios.post(
          "http://localhost:3001/spotify-player/playerSDK"
        );

        const script = document.createElement("script");
        //script.src = "https://sdk.scdn.co/spotify-player.js";
        //script.async = true;
        script.type = "text/javascript";
        script.text = response.data;
        document.body.appendChild(script);
      } catch (error) {
        console.error("Error fetching Spotify Web Playback SDK:", error);
      }
    };

    initializeSpotifySDK();
    //console.log(token)

    window.onSpotifyWebPlaybackSDKReady = async () => {
      const res = await Axios.get(
        "http://localhost:3001/spotify-player/SYSVolume"
      );
      //console.log(res.data.volume)
      const vol = res.data.volume / 100;
      const newPlayer = new window.Spotify.Player({
        name: "Web Playback SDK",
        getOAuthToken: (cb) => {
          cb(token);
        },
        enableMediaSession: true,
        volume: vol,
        robustness: "high",
      });

      //setPlayer(newPlayer);
      //console.log(newPlayer);

      newPlayer.addListener("ready", ({ device_id }) => {
        console.log("Ready with Device ID", device_id);
        setDeviceID(device_id);
        setLoading(false);
      });

      newPlayer.addListener("not_ready", ({ device_id }) => {
        console.log("Device ID has gone offline", device_id);
      });

      newPlayer.connect().then((success) => {
        if (success) {
          setPlayer(newPlayer);
          console.log(
            "The Web Playback SDK successfully connected to Spotify!"
          );
        }
      });
    };
  }, []);

  //console.log(loading);

  const songInfo = (song_Info) => {
    const { album, name, artists } = song_Info;
    setAlbumImage(album.images);
    setSongName(name);
    setSongArtist(artists[0].name);
  };

  // useEffect(() => {
  //   console.log(songName, albumImage, songArtist);
  // }, [songName, albumImage, songArtist]);

  return (
    <div>
      {loading ? (
        <div className="loading-container">
      <div className="loading">
        <PreLoader1/>
      </div>
    </div>
      ) : (
        <>
          <div>
            <Player
              token={token}
              player={player}
              playerID={device_id}
              songInfo={songInfo}
              userID={userID}
              loading={loading}
              spotID={spotID}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Playback;
