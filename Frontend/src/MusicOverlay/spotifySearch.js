import React from "react";
import "./MusicOverlay.css";
import { useState, useEffect} from "react";
import Axios from "axios";

const SearchResult = ({ searchResults, spotifyAccessToken, onTrackSelect}) => {

  const [selectedAlbum, setSelectedAlbum] = useState();
  const [selectedArtist, setSelectedArtist] = useState();
  const [albumTracks, setAlbumTracks] = useState([]);
  const [artistTracks, setArtistTracks] = useState([]);
  const [artistAlbums, setArtistAlbums] = useState([]);
  const [artistSelectedAlbum, setArtistSelectedAlbum] = useState([]);
  const [ArtistAlbumTracks, setArtistAlbumTracks] = useState([]);

  

  useEffect(() => {

    //gets albums tracks
    const albumsTracks = async () => {
      try{
        //console.log(selectedAlbum.id)
        if (selectedAlbum) {
          
          //console.log("id is", id)
        const response = await Axios.get(`http://localhost:3001/spotify-api/albums/${selectedAlbum.id}`, {
          headers: {
            'Authorization': `Bearer ${spotifyAccessToken}`,
            'Content-Type': 'application/json'
          }
        });
            setAlbumTracks(response.data);
      }
      }catch(error){
        console.log(error);
      }
    }

    //gets artisit tracks
    const artistsTracks = async () => {
      try{
         //console.log(selectedArtist)
        if (selectedArtist) {

          //console.log(selectedArtist.id);

        const response = await Axios.get(`http://localhost:3001/spotify-api/artistsTracks/${selectedArtist.id}`, {
          headers: {
            'Authorization': `Bearer ${spotifyAccessToken}`,
            'Content-Type': 'application/json'
          }
        });
        //console.log("data", response.data.tracks);
        setArtistTracks(response.data.tracks);
      }
      }catch(error){
        console.log(error);
      }
    }
//gets artist albums
    const artistsAlbums = async () => {
      try{
         //console.log(selectedArtist)
        if (selectedArtist) {
         // console.log("id", selectedArtist)
        const response = await Axios.get(`http://localhost:3001/spotify-api/artistsAlbums/${selectedArtist.id}`, {
          headers: {
            'Authorization': `Bearer ${spotifyAccessToken}`,
            'Content-Type': 'application/json'
          }
        });
        //console.log("albums2", response.data);
        setArtistAlbums(response.data);
      }
      }catch(error){
        console.log(error);
      }
    }

    //get selected album tracks
    // const artistAlbumsTracks = async () => {
    //   try{
    //     //console.log(selectedAlbum.id)
    //     if (artistSelectedAlbum) {
    //       //console.log("id is", id)
    //     const response = await Axios.get(`http://localhost:3001/spotify-api/albums/${artistSelectedAlbum.id}`, {
    //       headers: {
    //         'Authorization': `Bearer ${spotifyAccessToken}`,
    //         'Content-Type': 'application/json'
    //       }
    //     });
    //     setArtistAlbumTracks(response.data);
    //   }
    //   }catch(error){
    //     console.log(error);
    //   }
    // }
    albumsTracks(); 

    artistsTracks();

    artistsAlbums();

    //artistAlbumsTracks();

  }, [selectedAlbum, spotifyAccessToken, selectedArtist, artistSelectedAlbum, artistAlbums]);

  //back to search results from artist
  const artistBack = () => {
    setArtistAlbums(null); 
    setArtistTracks(null);
    setSelectedArtist(null);
  }

   //console.log("tracks:", artistTracks);
 //console.log("albums:", artistAlbums);
  //console.log("artist albums:", artistsAlbumTracks);

  //console.log(searchResults.albums[0].uri)

  //console.log(artistAlbums)

    
  return (
    <div >
      {//search results list
      }
      {!selectedAlbum && !selectedArtist && (
        <>
        <h4>Songs</h4>
        <div className="scroll">
          {searchResults.tracks.map((track, index) => (
            <div key={index} className="search-result">
              <li onClick={() => onTrackSelect(track)}>
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
              </li>
            </div>
          ))}
          </div>
          <h4>Artists</h4>
          <div className="scroll">
          {searchResults.artists.map((artist, index) => (
            <div key={index} className="search-result">
              <li onClick={() => setSelectedArtist(artist)}>
                <p>Artist: {artist.name}</p>
                {artist.images.length ? (
                  <img width={"15%"} src={artist.images[2].url} alt="" />
                ) : (
                  <div>No Image</div>
                )}
              </li>
            </div>
          ))}
          </div>
          <h4>Albums</h4>
          <div className="scroll">
          {searchResults.albums.map((album, index) => (
            <div key={index} className="search-result">
              <li onClick={() => setSelectedAlbum(album)}>
                {album.images.length ? (
                  <img
                    width={"15%"}
                    src={album.images[2].url}
                    alt="Album Cover"
                  />
                ) : (
                  <div>No Image</div>
                )}
                <p>Title: {album.name}</p>
                <p>
                  Artists:{" "}
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
          <button onClick={() => setSelectedAlbum(null)}/>
          <h4>{selectedAlbum.name}</h4>
          <ul>
            {albumTracks.map((track, index) => (
              <li key={index}>
                {selectedAlbum.images.length ? (
                  <img
                    width={"15%"}
                    src={selectedAlbum.images[2].url}
                    alt="Album Cover"
                  />
                ) : (
                  <div>No Image</div>
                )}
                {track.name}</li>
            ))}
          </ul>
        </div>
      )}

{//shows selected artist
}
      {selectedArtist && artistTracks && artistAlbums && (
        <div>
          <button onClick={artistBack}/>
          <h2>{selectedArtist.name}</h2>
          
          <h4>Albums</h4>
          <div className="scroll">
            <ul>
            {artistAlbums.map((album, index) => (
              <li key={index} onClick={() => setArtistSelectedAlbum(album)}>
                {album.images.length ? (
                  <img
                    width={"15%"}
                    src={album.images[2].url}
                    alt="Album Cover"
                  />
                ) : (
                  <div>No Image</div>
                )}
                {album.name}</li>
            ))}
          </ul>
          </div>
{
  //shows selected artist albums
}
          {artistSelectedAlbum && (
          <div>
            <button onClick={setArtistAlbumTracks(null)}/>
            <h4>{artistSelectedAlbum.name}</h4>
            <ul>
              {ArtistAlbumTracks.map((track, index) => (
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
                  {track.name}</li>
              ))}
            </ul>
          </div>
      )}

          <h4>Songs</h4>
          <div className="scroll">
          <ul>
            {artistTracks.map((track, index) => (
              <li key={index}>
                {track.album.images.length ? (
                  <img
                    width={"15%"}
                    src={track.album.images[2].url}
                    alt="Track Cover"
                  />
                ) : (
                  <div>No Image</div>
                )}
                {track.name}</li>
            ))}
          </ul>
          </div>
        </div>
      )}
    </div>
  );
};


export default SearchResult;
