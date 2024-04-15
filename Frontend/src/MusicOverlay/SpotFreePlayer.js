import "./MusicOverlay.css";
import React, { useState, useEffect } from "react";
import Axios from "axios";
import 'spotify-audio-element';
import {
  MediaController,
  MediaControlBar,
  MediaTimeRange,
  MediaTimeDisplay,
  MediaVolumeRange,
  MediaPlayButton,
  MediaSeekBackwardButton,
  MediaSeekForwardButton,
  MediaMuteButton,
} from "media-chrome/dist/react";
import SpotifyAudioElement  from "spotify-audio-element"

const FreePlayback = ({ currentSong, token }) => {
  const [playbackState, setPlaybackState] = useState(null);

  const [showQueue, setShowQueue] = useState(false);
  const [playerID, setPlayerID] = useState(null);



  

  const hardcodedQueue = [
    { title: "Song 4", artist: "Artist 4" },
    { title: "Song 5", artist: "Artist 5" },
    { title: "Song 6", artist: "Artist 6" },
  ];

  const handleToggleQueue = () => {
    setShowQueue(!showQueue);
  };



  return (
    <div>
      <div style={{ display: showQueue ? "none" : "block" }}>
        <h2>Now Playing</h2>
        {currentSong ? (
          <div>
            <img src={currentSong.cover} alt="Album Cover" />
            <p>
              {currentSong.title} - {currentSong.artist}
            </p>
          </div>
        ) : (
          <p>-</p>
        )}
        <div>
          <MediaController>
          <div><spotify-audio
              src="https://open.spotify.com/track/6NcS85K1ZlXAZecBL6msRa"
              slot="media"
              controls
            ></spotify-audio>
            </div>
            <MediaControlBar>
              <MediaPlayButton></MediaPlayButton>
              <MediaTimeRange></MediaTimeRange>
              <MediaTimeDisplay showDuration></MediaTimeDisplay>
              <MediaVolumeRange></MediaVolumeRange>
            </MediaControlBar>
          </MediaController>
        </div>
      </div>
      <div style={{ display: showQueue ? "block" : "none" }}>
        <h2>Queue</h2>
        <ul>
          {hardcodedQueue.map((song, index) => (
            <li key={index}>
              {song.title} - {song.artist}
            </li>
          ))}
        </ul>
        <button onClick={handleToggleQueue}>Hide Queue</button>
      </div>
    </div>
  );
};

export default FreePlayback;
