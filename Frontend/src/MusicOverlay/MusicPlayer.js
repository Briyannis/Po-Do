import React, { useEffect, useState } from "react";
import "./MusicOverlay.css";
import Playback from "./musicCover";
import Axios from "axios";
import SpotifyLogin from "./spotifyLogin";
import SearchResult from "./spotifySearch";
import FreePlayback from "./SpotFreePlayer";

const MusicPlayer = ({ auth, loginStatusID, darkmode }) => {
  //spotify api connection

  const [searchKey, setSearchKey] = useState();

  const [spotifyAccessToken, setSpotifyAccessToken] = useState();
  // eslint-disable-next-line
  const [spotifyRefreshToken, setSpotifyRefreshToken] = useState();
  const [accStatus, setAccStatus] = useState("");
  //let stat = "";

  const [initialRender, setInitialRender] = useState(true);
  const [selectedTrack, setSelectedTrack] = useState([]);
  const [loggedin, setLoggedin] = useState(false);

  const [searchResults, setSearchResults] = useState({
    albums: [],
    artists: [],
    tracks: [],
  });

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

          const status = tokens.accStatus
          
          if (
            tokens.accessToken !== null &&
            tokens.refreshToken !== null &&
            tokens.accStatus !== null
          ) {
           await setSpotifyAccessToken(tokens.accessToken);
            setSpotifyRefreshToken(tokens.refreshToken);
            setAccStatus(status);
            setInitialRender(false);
            setLoggedin(true);
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
              refreshToken: tokens.refreshToken
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
  }, [
    auth
  ]);

  //checks user is logged out to remove their token
  useEffect(() => {
    if (!auth) {
      setSpotifyAccessToken("");
      setSpotifyRefreshToken("");
    }
  }, [auth]);

  //search spotify api
  const searchSpotify = async (event) => {
    if (event) {
      event.preventDefault();
    }
    //console.log(spotifyAccessToken);
    try {
      console.log(spotifyAccessToken);
      const response = await Axios.get(
        "http://localhost:3001/spotify-api/search",
        {
          headers: {
            Authorization: `Bearer ${spotifyAccessToken}`,
          },
          params: {
            q: searchKey,
          },
        }
      );
      setSearchResults({
        albums: response.data.albums.items,
        artists: response.data.artists.items,
        tracks: response.data.tracks.items,
      });
      //console.log(searchResults.tracks);
    } catch (error) {
      console.error("Error:", error.response);
    }
  };

  const onTrackSelect = (selected_Track) => {
    setSelectedTrack(selected_Track);
    setShowSideMenu(false)
  };

  // useEffect(() => {
  //   console.log(selectedTrack);
  // }, [selectedTrack]);

  //music player UI
  const [showSideMenu, setShowSideMenu] = useState(false);

  // Toggle side menu visibility
  const toggleSideMenu = () => {
    setShowSideMenu(!showSideMenu);
  };

  return (
    <div id="player" className="music-player">
      <h1>Music Player</h1>
      <div className="menu-toggle">
        <button onClick={toggleSideMenu} className="menu-button">
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </button>
        {!loggedin && <SpotifyLogin loginStatusID={loginStatusID} />}
      </div>
      <div className="content-container">
        {showSideMenu && (
          <div className="side-menu">
            <div>
              <div>
                <form onSubmit={searchSpotify}>
                  <input type="text" onChange={(e) => setSearchKey(e.target.value)} />
                  <button type="submit">Search</button>
                </form>
              </div>
              {searchResults && (
                <SearchResult
                  searchResults={searchResults}
                  spotifyAccessToken={spotifyAccessToken}
                  onTrackSelect={onTrackSelect}
                />
              )}
            </div>
          </div>
        )}
        <div className="player-container">
          {/* Render the player component */}
          {loggedin && (
            <Playback currentSong={selectedTrack} token={spotifyAccessToken} />
          )}
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
