import React from "react";
import { useEffect, useState } from "react";
import Axios from "axios";

const Library = ({ spotID, token }) => {
  const [album, setAlbums] = useState();
  const [track, setTracks] = useState();

  useEffect(() => {
    const getLibrary = async () => {
      albums = await Axios.get(
        `http://localhost:3001/Spotifylibray/usersSavedAlbums/${token}`
      );
      tracks = await Axios.get(
        `http://localhost:3001/Spotifylibray/usersSavedTracks/${token}`
      );

      console.log(albums.items)
      console.log(tracks.items)

      setAlbums(albums);
      setTracks(tracks);
    };
    getLibrary();
  }, []);

  return (
    <div>
      <div></div>
    </div>
  );
};

export default Library;
