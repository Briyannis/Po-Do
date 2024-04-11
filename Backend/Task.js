const express = require('express');
const router = express.Router();

module.exports = function(podoDB){
    //Task Table

//Get request to for Task table
router.get("/podoDB/getTask", async (req, res) => {
    try {
      const userID = req.query.userID;
  
      if (!userID) {
        return res.status(400).send(`User ID is required, ID: ${userID}`);
      }
  
      const userTask = await podoDB.query(
        `SELECT * FROM tasks WHERE userID = ${userID}`
      );
  
      if (userTask.rows.length === 0) {
        return res
          .status(404)
          .send(`No tasks found for the user with ID: ${userID}`);
      }
  
      // Extracting tasks from the result
      const tasks = userTask.rows.map((row) => ({
        taskID: row.TaskID,
        task: row.Title,
        date: row.Date,
        descrip: row.Descrip,
      }));
  
      console.log("Tasks found:", tasks);
      res.status(200).json(tasks);
    } catch (err) {
      console.error("Error executing query:", err);
      res.status(500).send("Error executing query");
    }
  });
  
  //Post request to add Task
  router.post("/podoDB/insertTask", async (req, res) => {
    try {
      const userID = req.body.userID;
      const task = req.body.task;
      const date = req.body.date;
      const descrip = req.body.descrip;
  
      if (!userID) {
        res.status(400).send("userID NULL");
      }
  
      const result = await podoDB.put("tasks", {
        userID: userID,
        title: task,
        date: date,
        descrip: descrip
      });
      console.log("Insert result:", result.success);
  
      res.status(200).json({ message: "Task inserted successfully" });
    } catch (err) {
      console.error("Error executing insert:", err);
      res.status(500).send("Error executing insert");
    }
  });
  
  //Delete Task request
  router.delete("/podoDB/deleteTask", async (req, res) => {
    try {
      const taskID = req.body.taskID;
  
      const deleteRes = await podoDB.delete("tasks", { taskID: taskID });
      console.log("Delete result:", deleteRes.success);
      res.status(200).send("Task deleted successfully");
    } catch (err) {
      console.error("Error executing query:", err);
      res.status(500).send("Error executing query");
    }
  });
  
  //Update Task request
  router.post("/podoDB/updateTask", (req, res) => {
    podoDB.query("", (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Error updating table" });
      }
  
      if (result.affectedRows === 0) {
        //User record not found in the database
        return res.status(404).json({ message: "Record not found" });
      }
      console.log(result);
      res.status(200).json({ message: "task updated successfully" });
    });
  });

  return router;
}