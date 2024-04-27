import React from "react";
import { useState, useEffect } from "react";
import Axios from "axios";
import PreLoader2 from "./PreLoader2";
import "./loading.css";

const Queue = ({ token, userID, selectedSong, setQIndex, songPlaying }) => {

  const [modQueue, setModQueue] = useState();
  const [isLoading, setIsLoading] = useState(true);



  useEffect(() => {
    const QueueReq = async () => {
      //setIsLoading(false);
      try {
        //console.log(queue);
        const res = await Axios.get(
          `http://localhost:3001/queue/Queue/${userID}/${token}`
        );

        //console.log(res.data)
        const Q = res.data
        setModQueue(Q)
        setIsLoading(false);
      
      } catch (error) {
        setIsLoading(false);
        console.error("Error fetching user queue:", error.message);
      }
    };

      QueueReq();


  }, [setQIndex, selectedSong, songPlaying]); 

  
  //console.log(modQueue)

  return (
    <div className="queue">
      {isLoading ? (
        <div className="loading-container">
          <div className="loading">
            <PreLoader2/>
          </div>
        </div>
      ) : (
        <>
          {!modQueue ? (<h4>Empty Queue</h4>) : (
            <div>
              <h2>Queue</h2>
              <ul>
                {modQueue.map((song, index) => (
                  <div key={index}>
                    <li>
                    <img
                          className="album-cover"
                          width={"15%"}
                          src={song.album.images[2].url}
                          alt="Track Cover"
                        />
                      {song.name} - {song.artists[0].name}
                    </li>
                  </div>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
  
};

export default Queue;
