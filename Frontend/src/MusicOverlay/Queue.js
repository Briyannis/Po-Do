import React from "react";
import { useState, useEffect } from "react";
import Axios from "axios";

const Queue = ({ token, userID, selectedSong }) => {
  const [queue, setQueue] = useState();
  const [modQueue, setModQueue] = useState();
  const [queueImages, setQueueImages] = useState();

  useEffect(() => {
    const spotQ = async () => {
      try {
        const res = await Axios.get(
          `http://localhost:3001/spotify-player/playerQueue/${token}`
        );
        const queueData = res.data.queue;

        //const images = queueData.map(song => song.album.images[2]); // Assuming you want the third image
        //setQueueImages(queueData.album.images);

        console.log(queueData.length);
        setQueue(queueData);
      } catch (error) {
        console.error("Error fetching Spotify queue:", error.message);
      }
    };

    spotQ();
  }, []); // Include token in the dependency array

  useEffect(() => {
    const QueueReq = async () => {
      try {
        //console.log(queue);
        const res = await Axios.get(
          `http://localhost:3001/queue/userQueue/${userID}`
        );
        const gottenQueue = res.data;
        console.log(gottenQueue);
        //console.log(queue);
        //setQueueSize(gottenQueue.length)

        const modiQueue = queue.slice(0, gottenQueue.length);

        const modiQueue2 = queue.slice(gottenQueue.length, queue.length);
        console.log("pause", modiQueue2)

        console.log(`new queue:`, modiQueue);
        setModQueue(modiQueue);
        
        //const queueImages = modQueue.map(song => song.album);
        console.log(queueImages);
        //setQueueImages(images);
      } catch (error) {
        console.error("Error fetching user queue:", error.message);
      }
    };

    QueueReq();


  }, [queue]); 

  
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
