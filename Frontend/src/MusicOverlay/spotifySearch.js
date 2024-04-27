import React from "react";
import "./MusicOverlay.css";
import { useState, useEffect } from "react";
import Axios from "axios";
import ArtistAlbumTracks from "./ArtistAlbumTracks";
import { IconContext } from "react-icons";
import { MdQueue } from "react-icons/md";
import { IoCaretBack } from "react-icons/io5";
import PreLoader2 from "./PreLoader2";
import "./loading.css";

const SearchResult = ({
  searchResults,
  spotifyAccessToken,
  onTrackSelect,
  userID,
}) => {
  const [selectedAlbum, setSelectedAlbum] = useState();
  const [selectedArtist, setSelectedArtist] = useState();
  const [albumTracks, setAlbumTracks] = useState([]);
  const [artistTracks, setArtistTracks] = useState([]);
  const [artistAlbums, setArtistAlbums] = useState([]);
  const [artistSelectedAlbum, setArtistSelectedAlbum] = useState([]);
  const [once, setOnce] = useState(1);
  const [hideArtist, setHidArtist] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // depends? selectedAlbum, once, spotifyAccessToken, selectedArtist, artistSelectedAlbum, artistAlbums

  useEffect(() => {
    //gets albums tracks
    const albumsTracks = async () => {
      try {
        if (selectedAlbum && selectedAlbum !== null) {
          //console.log(selectedAlbum.id)

          const response = await Axios.get(
            `http://localhost:3001/spotify-api/albums/${selectedAlbum.id}`,
            {
              headers: {
                Authorization: `Bearer ${spotifyAccessToken}`,
                "Content-Type": "application/json",
              },
            }
          );
          setAlbumTracks(response.data);
          //console.log(response.data);
        }
      } catch (error) {
        console.log(error);
      }
    };

    //gets artisit tracks
    const artistsTracks = async () => {
      try {
        if (selectedArtist && selectedArtist !== null && once === 1) {
          setOnce(0);

          console.log("Artist", selectedArtist);

          const response = await Axios.get(
            `http://localhost:3001/spotify-api/artistsTracks/${selectedArtist.id}`,
            {
              headers: {
                Authorization: `Bearer ${spotifyAccessToken}`,
                "Content-Type": "application/json",
              },
            }
          );
          //console.log("data", response.data.tracks);
          setArtistTracks(response.data.tracks);
        }
      } catch (error) {
        console.log(error);
      }
    };
    //gets artist albums
    const artistsAlbums = async () => {
      try {
        if (selectedArtist && selectedArtist !== null) {
          //console.log("id", selectedArtist)
          const response = await Axios.get(
            `http://localhost:3001/spotify-api/artistsAlbums/${selectedArtist.id}`,
            {
              headers: {
                Authorization: `Bearer ${spotifyAccessToken}`,
                "Content-Type": "application/json",
              },
            }
          );
          //console.log("albums2", response.data);
          setArtistAlbums(response.data);
        }
      } catch (error) {
        console.log(error);
      }
    };

    albumsTracks();

    artistsTracks();

    artistsAlbums();
    //setArtistSelectedAlbum(null);
  }, [selectedAlbum, selectedArtist, artistSelectedAlbum, artistAlbums]);

  //back to search results from artist
  const artistBack = () => {
    //setArtistAlbums(null);
    //setArtistTracks(null);
    setSelectedArtist(null);
  };

  const artistAlbumBack = () => {
    setHidArtist(false);
    setArtistSelectedAlbum(null);
  };

  //artist album track selection
  const trackSelected = async (selected_Track) => {
    onTrackSelect(selected_Track);
    setArtistSelectedAlbum(null);
  };

  const AddToQueue = async (track) => {
    //console.log(`track ${track}, device id ${device_ID}`)
    try {
      await Axios.post(`http://localhost:3001/queue/addQueue/${track.uri}`, {
        userID: userID,
      }).catch((error) => {
        console.log(`error inserting: ${error}`);
      });

      //console.log(addQueue.data);

      const res = await Axios.post(
        `http://localhost:3001/spotify-player/addToQueue/${track.uri}/${spotifyAccessToken}`
      );
      console.log(res.status);

      //addToParentQueue(track.uri);
    } catch (error) {
      console.error("Error adding track to queue:", error);
    }
  };
  //console.log("tracks:", artistTracks);
  //console.log("albums:", artistAlbums);
  //console.log("artist albums:", artistsAlbumTracks);

  //console.log(searchResults.albums[0].uri)

  //console.log(searchResults);

  return (
    <div className="scroll">
      <div>
        {
          //search results list
        }
        {!selectedAlbum &&
          !selectedArtist &&
          (searchResults.tracks.length !== 0 ||
            searchResults.artists.length !== 0 ||
            searchResults.albums.length !== 0) && (
            <>
              <div className="scroll">
                <h4>Songs</h4>
                {searchResults.tracks.map((track, index) => (
                  <div key={index} className="search-result">
                    <li
                      className="track-item"
                      onClick={() => onTrackSelect(track)}
                    >
                      {track.album.images.length ? (
                        <img
                          className="album-cover"
                          width={"15%"}
                          src={track.album.images[2].url}
                          alt="Track Cover"
                        />
                      ) : (
                        <div>No Image</div>
                      )}
                      <p className="track-name">
                        {track.name} - {track.artists[0].name}
                      </p>
                      <button
                        style={{
                          background: "transparent",
                          border: "none",
                          zIndex: 1,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          AddToQueue(track);
                        }}
                      >
                        <IconContext.Provider
                          value={{ size: "1em", color: "#27AE60" }}
                        >
                          <MdQueue />
                        </IconContext.Provider>
                      </button>
                    </li>

                    <div></div>
                  </div>
                ))}
              </div>
              <div className="scroll">
                <h4>Artists</h4>
                {searchResults.artists.map((artist, index) => (
                  <div key={index} className="search-result">
                    <li
                      className="track-item"
                      onClick={() => setSelectedArtist(artist)}
                    >
                      {artist.images.length ? (
                        <img
                          className="album-cover"
                          width={"15%"}
                          src={artist.images[2].url}
                          alt=""
                        />
                      ) : (
                        <div>No Image</div>
                      )}
                      <p className="track-name">{artist.name}</p>
                    </li>
                  </div>
                ))}
              </div>
              <div className="scroll">
                <h4>Albums</h4>
                {searchResults.albums.map((album, index) => (
                  <div key={index} className="search-result">
                    <li
                      className="track-item"
                      onClick={() => setSelectedAlbum(album)}
                    >
                      {album.images.length ? (
                        <img
                          className="album-cover"
                          width={"15%"}
                          src={album.images[2].url}
                          alt="Album Cover"
                        />
                      ) : (
                        <div>No Image</div>
                      )}
                      <p className="track-name">{album.name} - </p>
                      <p className="track-name">
                        {album.artists.map((artist) => artist.name).join(", ")}
                      </p>
                    </li>
                  </div>
                ))}
              </div>
            </>
          )}

        {
          //shows selected albums
        }
        {selectedAlbum && (
          <div>
            <button 
            style={{
              background: "transparent",
              border: "none",
              marginLeft: "-35px",
            }}
            onClick={() => setSelectedAlbum(null)}>
            <IconContext.Provider value={{ size: "1em", color: "#27AE60" }}>
                  <IoCaretBack />
                </IconContext.Provider>
               </button>
            <h4>{selectedAlbum.name}</h4>
            <ul>
              {albumTracks.map((track, index) => (
                <div key={index}>
                  <li
                    className="track-item"
                    onClick={() => onTrackSelect(track)}
                  >
                    {selectedAlbum.images.length ? (
                      <img
                        className="album-cover"
                        width={"15%"}
                        src={selectedAlbum.images[2].url}
                        alt="Album Cover"
                      />
                    ) : (
                      <div>No Image</div>
                    )}
                    <p className="track-name">
                      {track.name} - {track.artists[0].name}
                    </p>
                  </li>
                </div>
              ))}
            </ul>
          </div>
        )}

        {
          //shows selected artist
        }
        {selectedArtist && artistTracks && artistAlbums && (
          <div>
            {selectedArtist && hideArtist === false && (
              <button style={{
                background: "transparent",
                border: "none",
                marginLeft: "-35px",
              }} onClick={artistBack}>
                <IconContext.Provider value={{ size: "1em", color: "#27AE60" }}>
                  <IoCaretBack />
                </IconContext.Provider>
              </button>
            )}
            {artistSelectedAlbum && hideArtist === true && (
              <button
                onClick={artistAlbumBack}
                style={{
                  background: "transparent",
                  border: "none",
                  marginLeft: "-35px",
                }}
              >
                <IconContext.Provider value={{ size: "1em", color: "#27AE60" }}>
                  <IoCaretBack />
                </IconContext.Provider>
              </button>
            )}
            <h2>{selectedArtist.name}</h2>

            {selectedArtist && hideArtist === false && (
              <div>
                <div className="scroll">
                  <h4>Albums</h4>
                  <ul>
                    {artistAlbums.map((album, index) => (
                      <div key={index}>
                        <li
                          className="track-item"
                          onClick={() => {
                            setArtistSelectedAlbum(album);
                            setHidArtist(true);
                          }}
                        >
                          {album.images.length ? (
                            <img
                              className="album-cover"
                              width={"15%"}
                              src={album.images[2].url}
                              alt="Album Cover"
                            />
                          ) : (
                            <div>No Image</div>
                          )}
                          <p className="track-name">
                            {album.name} - {album.artists[0].name}
                          </p>
                        </li>
                      </div>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            {
              //shows selected artist albums
            }
            {artistSelectedAlbum && (
              <ArtistAlbumTracks
                userID={userID}
                artistSelectedAlbum={artistSelectedAlbum}
                spotifyAccessToken={spotifyAccessToken}
                trackSelected={trackSelected}
              />
            )}

            {selectedArtist && hideArtist === false && (
              <div>
                <div className="scroll">
                  <h4>Songs</h4>
                  <ul>
                    {artistTracks.map((track, index) => (
                      <div key={index}>
                        <li
                          className="track-item"
                          onClick={() => onTrackSelect(track)}
                        >
                          {track.album.images.length ? (
                            <img
                              width={"15%"}
                              src={track.album.images[2].url}
                              alt="Track Cover"
                            />
                          ) : (
                            <div>No Image</div>
                          )}
                          <p className="track-name">
                            {" "}
                            {track.name} - {track.artists[0].name}{" "}
                          </p>
                          <button
                            style={{
                              background: "transparent",
                              border: "none",
                              zIndex: 1,
                            }}
                            onClick={() => {
                              AddToQueue(track);
                            }}
                          >
                            <IconContext.Provider
                              value={{ size: "1em", color: "#27AE60" }}
                            >
                              <MdQueue />
                            </IconContext.Provider>
                          </button>
                        </li>
                      </div>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResult;
