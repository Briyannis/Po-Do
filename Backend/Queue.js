const express = require("express");
const router = express.Router();

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
  router.get("/userQueue/:id", async (req, res) => {
    const userID = req.params.id;

    //console.log(req.params.id)

    const userQ = await podoDB.query(`SELECT * FROM queue WHERE userID = ${userID}`);


    if (userQ.rows.length === 0) {
        console.log(userQ.rows.length)
      return res.status(404).send({ error: "Queue Empty" });
    }else{
        const queue = [];

        for (let i = 0; i < userQ.rows.length; i++) {
            queue.push(userQ.rows[i]);
        }

        res.json(queue);

    }
  });

  router.delete("/userDeleteQueue/:id/:qIndex", async (req, res) => {
    const uri = req.params.id;
    const qIndex = req.params.qIndex;

    const deleteRes = await podoDB.delete("queue", { queue: uri, queueID: qIndex });

    console.log(deleteRes.status)
  });

  return router;
};
