const express = require("express");
const router = express.Router();
const Axios = require("axios");

module.exports = function (podoDB) {
  //add to queue
  router.post("/addQueue/:queued", async (req, res) => {
    try {
      let queueIndex = 1;
      const queueSong = req.params.queued;
      const userID = req.body.userID;

      let prepStatement = await podoDB.prepare(
        "SELECT * FROM queue WHERE userID = ?"
      );

      prepStatement.set(1, userID);

      const userQ = await podoDB.query(prepStatement);

      if (userQ.rows.length === 0) {
        await podoDB.put("queue", {
          userID: userID,
          queue: queueSong,
          queueID: queueIndex,
        });
      } else {
        let queueIndex = userQ.rows.length;

        queueIndex++;

        await podoDB.put("queue", {
          userID: userID,
          queue: queueSong,
          queueID: queueIndex,
        });
      }

      res.send("success adding queue");
    } catch (error) {
      console.error("Error adding queue", error);
    }
  });

  //get Queue
  router.get("/Queue/:id/:token", async (req, res) => {
    const userID = req.params.id;
    const spotifyToken = req.params.token;

    try {
      const spotQ = await Axios.get(
        `https://api.spotify.com/v1/me/player/queue`,
        {
          headers: {
            Authorization: `Bearer ${spotifyToken}`,
          },
        }
      );

      const queue = spotQ.data.queue;
      //console.log(queue)
      const userQ = await podoDB.query(
        `SELECT * FROM queue WHERE userID = ${userID}`
      );

      if (userQ.rows.length === 0) {
        //console.log(userQ.rows.length);
        return res.status(404).json({ error: "Queue Empty" });
      } else {
        const modiQueue = queue.slice(0, userQ.rows.length);
        console.log(modiQueue);
        res.json(modiQueue);
      }
    } catch (error) {
      console.error("Error fetching user queue:", error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  });

  router.get("/userQueue/:id", async (req, res) => {
    const userID = req.params.id;

    const userQ = await podoDB.query(
      `SELECT * FROM queue WHERE userID = ${userID}`
    );

    if (userQ.rows.length === 0) {
      console.log(userQ.rows.length);
      return res.status(404).send({ error: "Queue Empty", index: 1 });
    } else {
      const queue = [];

      for (let i = 0; i < userQ.rows.length; i++) {
        queue.push(userQ.rows[i]);
      }

      res.json(queue);
    }
  });

  router.delete("/userDeleteQueue/:id/:qIndex", async (req, res) => {
    try {
      const uri = req.params.id;
      const qIndex = req.params.qIndex;

      console.log(`id is ${qIndex}`);

      await podoDB.delete("queue", {
        queue: uri,
        queueID: qIndex,
      });

      res.json(+qIndex + 1);
    } catch (error) {}
  });

  //delete all
  router.delete("/DeleteAQueue/:id", async (req, res) => {
    try {
      const userID = req.params.id;

      console.log(userID)

      let prepStatement = await podoDB.prepare(
        "SELECT * FROM queue WHERE userID = ?"
      );
  
      prepStatement.set(1, userID);
  
      const userQ = await podoDB.query(prepStatement);

      //console.log(userQ.rows);

      const index = userQ.rows;

      const deletePromises = index.map(async (row) => {
        const queueID = row.queueID; // Assuming queueID is the name of the attribute that represents the queue ID
        try {
          await podoDB.delete("queue", {
            userID: userID,
            queueID: queueID,
          });
          console.log(`Deleted queue with ID ${queueID}`);
        } catch (error) {
          console.error(`Error deleting queue with ID ${queueID}:`, error);
        }
      });

      // Wait for all delete operations to complete
      await Promise.all(deletePromises);
    } catch (error) {
      console.error(error);
    }
  });

  return router;
};
