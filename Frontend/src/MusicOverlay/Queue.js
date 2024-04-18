import React from "react";
import { useState, useEffect } from "react";
import Axios from "axios";

const Queue = ({ token, userID, selectedSong, setQIndex, songPlaying }) => {

  const [modQueue, setModQueue] = useState();



  useEffect(() => {
    const QueueReq = async () => {
      try {
        //console.log(queue);
        const res = await Axios.get(
          `http://localhost:3001/queue/Queue/${userID}/${token}`
        );

        //console.log(res.data)
        const Q = res.data
        setModQueue(Q)
      
      } catch (error) {
        console.error("Error fetching user queue:", error.message);
      }
    };

      QueueReq();


  }, [setQIndex, selectedSong, songPlaying]); 

  
  //console.log(modQueue)

  return (
    <div>
      {modQueue && (
        <div>
          <h2>Queue</h2>
          <ul>
            {modQueue.map((song, index) => (
              <div key={index}>
                <li>
                
                  {song.name} - {song.artists[0].name}
                </li>
              </div>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Queue;
