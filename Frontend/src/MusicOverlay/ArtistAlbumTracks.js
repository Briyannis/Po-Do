import React, { useState, useEffect } from 'react';
import Axios from 'axios';

const ArtistAlbumTracks = ({ artistSelectedAlbum, spotifyAccessToken }) => {
  const [artistAlbumTracks, setArtistAlbumTracks] = useState([]);

  

  useEffect(() => {
    const fetchArtistAlbumTracks = async () => {
      try {
        console.log("infor", artistSelectedAlbum)
        if (artistSelectedAlbum && (artistSelectedAlbum !== "undefined")) {
          const response = await Axios.get(`http://localhost:3001/spotify-api/albums/${artistSelectedAlbum.id}`, {
            headers: {
              'Authorization': `Bearer ${spotifyAccessToken}`,
              'Content-Type': 'application/json'
            }
          });
          setArtistAlbumTracks(response.data);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchArtistAlbumTracks();
  }, [artistSelectedAlbum, spotifyAccessToken]);

  return (
    <div>
      {artistSelectedAlbum && (
        <div>
          <h4>{artistSelectedAlbum.name}</h4>
          <ul>
            {artistAlbumTracks.map((track, index) => (
              <li key={index}>
                {artistSelectedAlbum.images.length ? (
                  <img
                    width={"15%"}
                    src={artistSelectedAlbum.images[2].url}
                    alt="Album Cover"
                  />
                ) : (
                  <div>No Image</div>
                )}
                {track.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ArtistAlbumTracks;