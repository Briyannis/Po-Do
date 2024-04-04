import React, { useEffect, useState } from "react";
import "./MusicOverlay.css";
import SideMenu from "./SideMenu";
import Playback from "./musicCover";
import Axios from "axios";

const libraryData = [
  {
    id: 1,
    title: "Album 1",
    songs: [
      { id: 1, title: "Song 1", artist: "Artist 1" },
      { id: 2, title: "Song 2", artist: "Artist 2" },
      { id: 3, title: "Song 3", artist: "Artist 3" },
    ],
  },
  {
    id: 2,
    title: "Album 2",
    songs: [
      { id: 4, title: "Song 4", artist: "Artist 4" },
      { id: 5, title: "Song 5", artist: "Artist 5" },
      { id: 6, title: "Song 6", artist: "Artist 6" },
    ],
  },
];

const SearchResult = ({ searchResults }) => (
  <div className="search-result-container">
    {/* Mapping albums */}
    {searchResults.albums.map((album, index) => (
      <div key={index} className="search-result">
        {album.images.length ? (
          <img width={"15%"} src={album.images[2].url} alt="Album Cover" />
        ) : (
          <div>No Image</div>
        )}
        <p>Title: {album.name}</p>
        <p>Artists: {album.artists.map((artist) => artist.name).join(", ")}</p>
      </div>
    ))}

    {/* Mapping artists */}
    {searchResults.artists.map((artist, index) => (
      <div key={index} className="search-result">
        <p>Artist: {artist.name}</p>
        {artist.images.length ? (
          <img width={"15%"} src={artist.images[2].url} alt="" />
        ) : (
          <div>No Image</div>
        )}
      </div>
    ))}

    {/* Mapping tracks */}
    {searchResults.tracks.map((track, index) => (
      <div key={index} className="search-result">
        {track.album.images.length ? (
          <img
            width={"15%"}
            src={track.album.images[2].url}
            alt="Track Cover"
          />
        ) : (
          <div>No Image</div>
        )}
        <p>Track: {track.name}</p>
      </div>
    ))}
  </div>
);

const MusicPlayer = ({ auth, loginStatusID, darkmode }) => {
  //spotify api connection

  const [spotifyAccessToken, setSpotifyAccessToken] = useState();
  // eslint-disable-next-line
  const [spotifyRefreshToken, setSpotifyRefreshToken] = useState();

  const [hasPostedTokens, setHasPostedTokens] = useState(false);
  const [initialRender, setInitialRender] = useState(true);

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
  console.log(loggedin);

  //stores tokens and config dark/light mode

  
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

  //get tokens
  useEffect(() => {
    if (
      initialRender ||
      (auth &&
        loginStatusID &&
        loggedin &&
        (!spotifyAccessToken || !spotifyRefreshToken || !hasPostedTokens))
    ) {
      Axios.get(
        `http://localhost:3001/spotify-api/gettokens?userID=${loginStatusID}`
      )
        .then((response) => {
          const tokens = response.data;
          setSpotifyAccessToken(tokens.accessToken);
          setSpotifyRefreshToken(tokens.refreshToken);
          setInitialRender(false);
        })
        .catch((error) => {
          console.error("Error Getting tokens:", error);
        });
    }
  }, [
    auth,
    loginStatusID,
    spotifyAccessToken,
    spotifyRefreshToken,
    hasPostedTokens,
    initialRender,
    loggedin,
  ]);

  //checks user is still logged out to remove their token
  useEffect(() => {
    if (!auth) {
      setSpotifyAccessToken("");
      setSpotifyRefreshToken("");
    }
  }, [auth]);

  //logout of spotify
  const spotifyLogout = async () => {
    try {
      window.location.href = "https://accounts.spotify.com/logout";

      await Axios.delete(`http://localhost:3001/spotify-api/logout`, {
        data: {
          userID: loginStatusID,
        },
      })
        .then(() => {
          setSpotifyAccessToken("");
          setSpotifyRefreshToken("");
          setLoggedin(false);
        })
        .catch((error) => {
          console.error("Error Logging Out:", error);
          setLoggedin(false);
        });
      window.location.href = "http://localhost:3000";
    } catch (error) {
      console.error("Error Logging Out:", error);
    }
  };

  console.log(loggedin);

  // const searchSpotify = async (event) => {
  //   if (event) {
  //     event.preventDefault();
  //   }
  //   try {
  //     const response = await Axios.get(
  //       "http://localhost:3001/spotify-api/search",
  //       {
  //         headers: {
  //           Authorization: `Bearer ${spotifyAccessToken}`,
  //         },
  //         params: {
  //           q: searchKey,
  //         },
  //       }
  //     );

  //     // Access the data from the response
  //     //const data = response.data;

  //     //   const results = {
  //     //     albums: response.data.albums.items,
  //     //     artists: response.data.artists.items,
  //     //     tracks: response.data.tracks.items
  //     //   };
  //     //   console.log(results)
  //     setSearchResults({
  //       albums: response.data.albums.items,
  //       artists: response.data.artists.items,
  //       tracks: response.data.tracks.items,
  //     });
  //     //console.log(searchResults.tracks);
  //   } catch (error) {
  //     console.error("Error:", error.response);
  //   }
  // };

  //apple music connection

  //youtube music connection

  //music player UI
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);

  // Play selected song
  const playSong = (song) => {
    setCurrentSong(song);
  };

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
        {!loggedin ? (
          <>
            <button onClick={spotifyLogout}>Logout</button>
            </>
        ) : (
          <button onClick={handleSpotifyLogin}>Login</button>
        )}
      </div>
      {showSideMenu ? (
        <div className="side-menu">
          <SideMenu library={libraryData} spotifyAccessToken={spotifyAccessToken} />
        </div>
      ) : <div>
      <Playback currentSong={currentSong} />
    </div>}
      <SearchResult searchResults={searchResults} />
    </div>
  );
};

export default MusicPlayer;
