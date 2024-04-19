import React, { useEffect, useState } from "react";
import "./MusicOverlay.css";
import Playback from "./musicCover";
import Axios from "axios";
import SpotifyLogin from "./spotifyLogin";


const MusicPlayer = ({ auth, loginStatusID, darkmode, spotLog }) => {
  //spotify api connection

  const [searchKey, setSearchKey] = useState();

  const [spotifyAccessToken, setSpotifyAccessToken] = useState();
  // eslint-disable-next-line
  const [spotifyRefreshToken, setSpotifyRefreshToken] = useState();
  const [spotID, setSpotID] = useState();


  const [initialRender, setInitialRender] = useState(true);
  const [selectedTrack, setSelectedTrack] = useState([]);

 

  useEffect(() => {
    const SpotTokens = async () => {
      try {
        if (
          initialRender ||
          (auth &&
            loginStatusID &&
            (!spotifyAccessToken || !spotifyRefreshToken))
        ) {
          //setAccStatus("");
          // First, fetch tokens from the server
          const response = await Axios.get(
            `http://localhost:3001/spotify-api/gettokens?userID=${loginStatusID}`
          );
          const tokens = response.data;

          //const status = tokens.accStatus;
          const spotID = tokens.spotID;

          if (
            tokens.accessToken !== null &&
            tokens.refreshToken !== null &&
            tokens.accStatus !== null
          ) {
            setSpotifyAccessToken(tokens.accessToken);
            setSpotifyRefreshToken(tokens.refreshToken);
            setSpotID(spotID)
            setInitialRender(false);
          }

          // Then, refresh the access token if needed and save
          if (tokens.refreshToken || tokens.refreshToken !== "undefined") {
            //console.log(tokens.accStatus)
            const refreshResponse = await Axios.get(
              `http://localhost:3001/spotify-api/refresh_token?refresh_token=${tokens.refreshToken}`
            );
            const { access_token } = refreshResponse.data;
            //console.log(access_token);
            setSpotifyAccessToken(access_token);
            await Axios.post("http://localhost:3001/spotify-api/tokens", {
              userID: loginStatusID,
              accStatus: tokens.accStatus,
              accessToken: access_token,
              refreshToken: tokens.refreshToken,
              spotifyID: spotID,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching or refreshing tokens:", error);
      }
    };

    SpotTokens();
    //console.log(`updated status: ${accStatus}`);

    const interval = setInterval(() => {
      SpotTokens();
    }, 3300000);
  }, [auth]);

  //checks user is logged out to remove their token
  useEffect(() => {
    if (!auth) {
      setSpotifyAccessToken("");
      setSpotifyRefreshToken("");
    }
  }, [auth]);

  


  // useEffect(() => {
  //   console.log(selectedTrack);
  // }, [selectedTrack]);


  return (
    <div id="player" className="music-player">
      <h1>Music Player</h1>
      <div className="menu-toggle">
        {!spotifyAccessToken && (<SpotifyLogin loginStatusID={loginStatusID} />)}
      </div>
      <div className="content-container">
        <div className="player-container">
          {/* Render the player component */}
          {spotifyAccessToken && (
            <>
            <Playback token={spotifyAccessToken} userID={loginStatusID} spotID={spotID}/>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
