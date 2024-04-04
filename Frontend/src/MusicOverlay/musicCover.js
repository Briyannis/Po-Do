import React from 'react';
import "./MusicOverlay.css";
import { useState } from 'react';

const Playback = ({ currentSong }) => {
    const [showQueue, setShowQueue] = useState(false);
  
    const hardcodedQueue = [
      { title: "Song 4", artist: "Artist 4" },
      { title: "Song 5", artist: "Artist 5" },
      { title: "Song 6", artist: "Artist 6" }
    ];
  
    const handleToggleQueue = () => {
      setShowQueue(!showQueue);
    };
  
    const handlePlayPause = () => {
      // Implement play/pause functionality
    };
  
    const handlePrevious = () => {
      // Implement previous song functionality
    };
  
    const handleNext = () => {
      // Implement next song functionality
    };
  
    return (
      <div>
        <div style={{ display: showQueue ? 'none' : 'block' }}>
          <h2>Now Playing</h2>
          {currentSong ? (
            <div>
              <img src={currentSong.cover} alt="Album Cover" />
              <p>{currentSong.title} - {currentSong.artist}</p>
            </div>
          ) : (
            <p>-</p>
          )}
          <div>
            <button onClick={handlePrevious}>Previous</button>
            <button onClick={handlePlayPause}>Play/Pause</button>
            <button onClick={handleNext}>Next</button>
            <button onClick={handleToggleQueue}>Show Queue</button>
          </div>
        </div>
        <div style={{ display: showQueue ? 'block' : 'none' }}>
          <h2>Queue</h2>
          <ul>
            {hardcodedQueue.map((song, index) => (
              <li key={index}>{song.title} - {song.artist}</li>
            ))}
          </ul>
          <button onClick={handleToggleQueue}>Hide Queue</button>
        </div>
      </div>
    );
  };
  


export default Playback;
