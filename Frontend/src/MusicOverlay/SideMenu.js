import React from 'react';
import { useState } from 'react';
import "./MusicOverlay.css";
import Axios from 'axios'

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


const SideMenu = ({ library, spotifyAccessToken }) => {
    const [selectedAlbum, setSelectedAlbum] = useState(null);
    const [searchKey, setSearchKey] = useState();
    const [searchResults, setSearchResults] = useState({
      albums: [],
      artists: [],
      tracks: [],
    });

    const searchSpotify = async (event) => {
      if (event) {
        event.preventDefault();
      }
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
  
    // Function to handle album selection
    const handleAlbumSelect = (album) => {
      setSelectedAlbum(album);
    };
  
    // // Function to handle song selection within the selected album
    // const handleSongSelectInAlbum = (song) => {
    //   // Pass the selected song to the handleSongSelect function
    //   handleSongSelect(song);
    // };
  
    return (
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
          <SearchResult searchResults={searchResults} />
        ) : (
          <ul className="library-list">
            {library.map(album => (
              <li key={album.id}>
                <img src={album.cover} alt="Album Cover" />
                <h3 onClick={() => handleAlbumSelect(album)}>{album.title}</h3>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };
  

export default SideMenu;



