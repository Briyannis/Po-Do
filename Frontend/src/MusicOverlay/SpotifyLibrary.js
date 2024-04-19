import React from "react";
import "./MusicOverlay.css";
import { useState, useEffect } from "react";
import Axios from "axios";
import { IconContext } from "react-icons";
import "./Player.css";
import { MdQueue } from "react-icons/md";
import { IoCaretBack } from "react-icons/io5";
import PreLoader2 from "./PreLoader2";
import "./loading.css";

const Library = ({ spotID, token, onTrackSelect, userID }) => {
  const [album, setAlbums] = useState();
  const [track, setTracks] = useState();
  const [isLoading, setIsLoading] = useState(true);

  const [selectedAlbum, setSelectedAlbum] = useState();
  const [albumTracks, setAlbumTracks] = useState([]);

  useEffect(() => {
    const getLibrary = async () => {
      const albums = await Axios.get(
        `http://localhost:3001/Spotifylibray/usersSavedAlbums/${token}`
      );
      const tracks = await Axios.get(
        `http://localhost:3001/Spotifylibray/usersSavedTracks/${token}`
      );

      //console.log(albums);
      //console.log(tracks);

      setAlbums(albums.data);
      //setAlbumsArt(album.data.artists)
      setTracks(tracks.data);
      //setTracksArt(t.artists)
      setIsLoading(false);
    };
    getLibrary();

    //setTracks(track.)
  }, [token]);

  useEffect(() => {
    const albumsTracks = async () => {
      try {
        if (selectedAlbum && selectedAlbum !== null) {
          //console.log(selectedAlbum.id)

          const response = await Axios.get(
            `http://localhost:3001/spotify-api/albums/${selectedAlbum.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
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
    albumsTracks();
  }, [selectedAlbum]);

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
        `http://localhost:3001/spotify-player/addToQueue/${track.uri}/${token}`
      );
      console.log(res.status);

      //addToParentQueue(track.uri);
    } catch (error) {
      console.error("Error adding track to queue:", error);
    }
  };

  //console.log(album)

  return (
    <div style={{ marginTop: "50px" }}>
      {isLoading ? (
        <div className="loading-container">
          <div className="loading">
            <PreLoader2 />
          </div>
        </div>
      ) : (
        <>
          {track && album && !selectedAlbum ? (
            <>
              <div className="scroll">
                <h4>Albums</h4>
                {album.map((albumItem, index) => (
                  <div key={index} className="search-result">
                    <li
                      className="track-item"
                      onClick={() => setSelectedAlbum(albumItem)}
                    >
                      {albumItem.images.length ? (
                        <img
                          className="album-cover"
                          width={"15%"}
                          src={albumItem.images[0].url}
                          alt="Album Cover"
                        />
                      ) : (
                        <div>No Image</div>
                      )}
                      <p className="track-name">
                        {albumItem.name} - {albumItem.artists[0].name}
                      </p>
                    </li>
                  </div>
                ))}
              </div>
              <div className="scroll">
                <h4>Songs</h4>
                {track.map((trackItem, index) => (
                  <div key={index} className="search-result">
                    <li
                      className="track-item"
                      style={{ zIndex: 0 }}
                      onClick={() => onTrackSelect(trackItem)}
                    >
                      {trackItem.album.images.length ? (
                        <img
                          className="album-cover"
                          width={"15%"}
                          src={trackItem.album.images[0].url}
                          alt="Track Cover"
                        />
                      ) : (
                        <div>No Image</div>
                      )}
                      <p className="track-name">
                        {trackItem.name} - {trackItem.artists[0].name}
                      </p>
                      <button
                        style={{
                          background: "transparent",
                          border: "none",
                          zIndex: 1,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          AddToQueue(trackItem);
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
              </div>
            </>
          ) : (
            <>
              {selectedAlbum && (
                <div>
                  <button
                    style={{
                      background: "transparent",
                      border: "none",
                      marginLeft: "-35px",
                    }}
                    onClick={() => setSelectedAlbum(null)}
                  >
                    <IconContext.Provider
                      value={{ size: "1em", color: "#27AE60" }}
                    >
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
                            {selectedAlbum.name} -{" "}
                            {selectedAlbum.artists[0].name}
                          </p>
                          <button
                            style={{
                              background: "transparent",
                              border: "none",
                              zIndex: 1,
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              AddToQueue(selectedAlbum);
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
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Library;
