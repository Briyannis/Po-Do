import React, { useEffect, useState } from "react";
import "./MusicOverlay.css";
import SideMenu from "./SideMenu";
import Playback from "./musicCover";
import Axios from "axios";
import SpotifyLogin from "./spotifyLogin"
import SearchResult from "./spotifySearch";

const MusicPlayer = ({ auth, loginStatusID, darkmode }) => {
  //spotify api connection

  const [searchKey, setSearchKey] = useState();

  const [spotifyAccessToken, setSpotifyAccessToken] = useState();
  // eslint-disable-next-line
  const [spotifyRefreshToken, setSpotifyRefreshToken] = useState();

  const [initialRender, setInitialRender] = useState(true);
  const [selectedTrack, setSelectedTrack] = useState([]);
  const [hasPostedTokens, setHasPostedTokens] = useState(false);
  const [loggedin, setLoggedin] = useState(true);

  const [searchResults, setSearchResults] = useState({
    albums: [],
    artists: [],
    tracks: [],
  });

  const handleSpotifyLogin = () => {
    window.location = "http://localhost:3001/spotify-api/login";
    setLoggedin(true);
  };

  useEffect(() => {
    const queryString = window.location.search;
    const params = new URLSearchParams(queryString);
    const refreshToken = params.get("refresh_token");
    const accessToken = params.get("access_token");
    if (refreshToken && accessToken && !hasPostedTokens && loggedin) {
      Axios.post("http://localhost:3001/spotify-api/tokens", {
        userID: loginStatusID,
        accessToken: refreshToken,
        refreshToken: accessToken,
      })
        .then((response) => {
          const {
            refreshToken: storedRefreshToken,
            accessToken: storedAccessToken,
          } = response.data;
          setSpotifyRefreshToken(storedRefreshToken);
          setSpotifyAccessToken(storedAccessToken);
          setHasPostedTokens(true);
        })
        .catch((error) => {
          console.error("Error adding task:", error);
          console.log(error.response.data.message);
        });
    }
    const refreshAccessToken = () => {
      if (spotifyRefreshToken) {
        Axios.get(
          `http://localhost:3001/spotify-api/refresh_token?refresh_token=${spotifyRefreshToken}`
        )
          .then((response) => {
            const { access_token } = response.data;
            setSpotifyAccessToken(access_token);
          })
          .catch((error) => {
            console.error("Error refreshing access token:", error);
          });
      }
    };

    refreshAccessToken();
  }, [loginStatusID, hasPostedTokens, spotifyRefreshToken, loggedin]);

  



useEffect(() => {
  const SpotTokens = async () => {
    try {
      if (
        initialRender ||
        (auth &&
          loginStatusID &&
          (!spotifyAccessToken || !spotifyRefreshToken))
      ) {
        // First, fetch tokens from the server
        const tokensResponse = await Axios.get(`http://localhost:3001/spotify-api/gettokens?userID=${loginStatusID}`);
        const tokensData = tokensResponse.data;
        setSpotifyAccessToken(tokensData.accessToken);
        setSpotifyRefreshToken(tokensData.refreshToken);
        setInitialRender(false);

        // Then, refresh the access token if needed and save
        if (tokensData.refreshToken && tokensData.refreshToken !== "undefined") {
          const refreshResponse = await Axios.get(`http://localhost:3001/spotify-api/refresh_token?refresh_token=${tokensData.refreshToken}`);
          const { access_token } = refreshResponse.data;
          console.log(access_token);
          setSpotifyAccessToken(access_token);
          await Axios.post("http://localhost:3001/spotify-api/save_access_token", {
          userID: loginStatusID,
          accessToken: access_token,
          refreshToken: tokensData.refreshToken
        });
        }
      }
    } catch (error) {
      console.error("Error fetching or refreshing tokens:", error);
    }
  };

  
  SpotTokens();
  }, [
    auth,
    loginStatusID,
    spotifyAccessToken,
    spotifyRefreshToken,
    initialRender,
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
    console.log(spotifyAccessToken);
    try {
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

  const handleTrackSelection = (selectedTrack) => {
    // Do something with the selected track, such as updating state
    setSelectedTrack(selectedTrack);

    console.log(selectedTrack);
  };

  const handleTokenReceived = (refreshToken, accessToken) => {
    setSpotifyRefreshToken(refreshToken);
    setSpotifyAccessToken(accessToken);
    setHasPostedTokens(true);
  };


  //apple music connection

  //youtube music connection

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
        {loggedin && (
          <button onClick={handleSpotifyLogin}>Login</button>
        )}
      </div>
      {showSideMenu ? (
        <div className="side-menu">
          <div>
        <div>
          <form onSubmit={searchSpotify}>
        <input
                type="text"
                onChange={(e) => setSearchKey(e.target.value)}
              />
              <button type="submit">Search</button>
            </form></div>
        {searchResults ? (
          <SearchResult searchResults={searchResults} spotifyAccessToken={spotifyAccessToken}  onTrackSelect={handleTrackSelection}/>
        ) : (null)}
      </div>
        </div>
      ) : <div>
      {
        //<Playback  currentSong={selectedTrack} token={spotifyAccessToken}/>
      }
    </div>}
    </div>
  );
};

export default MusicPlayer;
