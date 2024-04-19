import React, { useState, useEffect } from "react";
import Axios from "axios";
import "./MusicOverlay.css";
import { IconContext } from "react-icons";
import { MdQueue } from "react-icons/md";
import { IoCaretBack } from "react-icons/io5";

const ArtistAlbumTracks = ({
  artistSelectedAlbum,
  spotifyAccessToken,
  trackSelected,
  userID
}) => {
  const [artistAlbumTracks, setArtistAlbumTracks] = useState([]);

  useEffect(() => {
    const fetchArtistAlbumTracks = async () => {
      try {
        //console.log("infor", artistSelectedAlbum)
        if (artistSelectedAlbum && artistSelectedAlbum !== null) {
          console.log(artistSelectedAlbum);
          const response = await Axios.get(
            `http://localhost:3001/spotify-api/albums/${artistSelectedAlbum.id}`,
            {
              headers: {
                Authorization: `Bearer ${spotifyAccessToken}`,
                "Content-Type": "application/json",
              },
            }
          );
          console.log(response.data);
          setArtistAlbumTracks(response.data);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchArtistAlbumTracks();
  }, [artistSelectedAlbum, spotifyAccessToken]);

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

  return (
    <div>
      {artistSelectedAlbum && (
        <div>
          <h4>{artistSelectedAlbum.name}</h4>
          <ul>
            {artistAlbumTracks.map((track, index) => (
              <div key={index}>
                <li className="track-item" onClick={() => trackSelected(track)}>
                  {artistSelectedAlbum.images.length ? (
                    <img
                      className="album-cover"
                      width={"15%"}
                      src={artistSelectedAlbum.images[2].url}
                      alt="Album Cover"
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
      )}
    </div>
  );
};

export default ArtistAlbumTracks;
