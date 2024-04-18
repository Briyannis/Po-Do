import React from "react";
import "./MusicOverlay.css";
import { useState, useEffect } from "react";
import Axios from "axios";
import { IconContext } from "react-icons";
import { GrFormAdd } from "react-icons/gr";

const Library = ({ spotID, token, onTrackSelect, userID }) => {
  const [album, setAlbums] = useState();
  const [track, setTracks] = useState();

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
      setTracks(tracks.data);
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
    <div>
      {track && album && !selectedAlbum ? (
        <>
          <div className="scroll">
            <h4>Albums</h4>
            {album.map((albumItem, index) => (
              <div key={index} className="search-result">
                <li onClick={() => setSelectedAlbum(albumItem)}>
                  {albumItem.images.length ? (
                    <img
                      width={"15%"}
                      src={albumItem.images[0].url}
                      alt="Album Cover"
                    />
                  ) : (
                    <div>No Image</div>
                  )}
                  <p>Album: {albumItem.name}</p>
                </li>
              </div>
            ))}
          </div>
          <div className="scroll">
            <h4>Songs</h4>
            {track.map((trackItem, index) => (
              <div key={index} className="search-result">
                <li onClick={() => onTrackSelect(trackItem)}>
                  {trackItem.album.images.length ? (
                    <img
                      width={"15%"}
                      src={trackItem.album.images[0].url}
                      alt="Track Cover"
                    />
                  ) : (
                    <div>No Image</div>
                  )}
                  <p>Track: {trackItem.name}</p>
                  <button
                    onClick={() => {
                       AddToQueue(trackItem);
                    }}
                  >
                    <IconContext.Provider
                      value={{ size: "1em", color: "#27AE60" }}
                    >
                      <GrFormAdd />
                    </IconContext.Provider>
                  </button>
                </li>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p>Loading...</p>
      )}

      {selectedAlbum && (
        <div>
          <button onClick={() => setSelectedAlbum(null)} />
          <h4>{selectedAlbum.name}</h4>
          <ul>
            {albumTracks.map((track, index) => (
              <div key={index}>
                <li onClick={() => onTrackSelect(track)}>
                  {selectedAlbum.images.length ? (
                    <img
                      width={"15%"}
                      src={selectedAlbum.images[2].url}
                      alt="Album Cover"
                    />
                  ) : (
                    <div>No Image</div>
                  )}
                  {track.name}
                </li>
              </div>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Library;
