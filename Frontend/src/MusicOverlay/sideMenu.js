import React from "react";
import { useEffect, useState } from "react";
import SearchResult from "./spotifySearch";
import Library from "./SpotifyLibrary";
import "./MusicOverlay.css";
import Axios from "axios";
import { IconContext } from "react-icons";
import { BiSearchAlt } from "react-icons/bi";
import PreLoader2 from "./PreLoader2"


const SideMenu = ({
  spotID,
  trackSelect,
  spotifyAccessToken,
  loginStatusID,
}) => {
  const [searchKey, setSearchKey] = useState();

  const [searchResults, setSearchResults] = useState({
    albums: [],
    artists: [],
    tracks: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [isLoading]);

  //search spotify api
  const searchSpotify = async (event) => {
    if (event) {
      event.preventDefault();
    }
    setIsLoading(true);
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

      setIsLoading(false)
      //console.log(searchResults.tracks);
    } catch (error) {
      console.error("Error:", error.response);
    }
  };

  const onTrackSelect = async (selected_Track) => {
    trackSelect(selected_Track);
    setSearchResults(null);
  };
  return (
    <>
      <div className="side-menu">
        <div>
          <div>
            <form className="spotify-search-form" onSubmit={searchSpotify}>
              <input
                className="spotify-search-input"
                type="text"
                onChange={(e) => setSearchKey(e.target.value)}
              />
              <button style={{
                      background: "transparent",
                      border: "none",
                      zIndex: 1,
                    }} type="submit">
                <IconContext.Provider value={{ size: "1em", color: "#27AE60" }}>
                  <BiSearchAlt />
                </IconContext.Provider>
              </button>
            </form>
          </div>
          {!isLoading && searchResults !== null ? (<div className="loading-container">
          <div className="loading">
            <PreLoader2 />
          </div>
        </div>) : (<>{searchResults !== null && (
            <SearchResult
              searchResults={searchResults}
              spotifyAccessToken={spotifyAccessToken}
              onTrackSelect={onTrackSelect}
              userID={loginStatusID}
            />
          )}</>)}

          <div>
            <Library
              token={spotifyAccessToken}
              spotID={spotID}
              onTrackSelect={onTrackSelect}
              userID={loginStatusID}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default SideMenu;
