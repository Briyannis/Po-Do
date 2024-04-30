import React, { useState } from "react";
import "./tdlindex.css";
import Axios from "axios";
import { useEffect } from "react";
import { TiDelete } from "react-icons/ti";
import { IconContext } from "react-icons";
import { FaArrowUp } from "react-icons/fa6";
import { FaArrowDownLong } from "react-icons/fa6";
import { IoIosAddCircle } from "react-icons/io";

const ToDoList = ({ loginStatusID, auth, event, eventCal }) => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [newTaskDate, setNewTaskDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [descrip, setDescrip] = useState("");
  const TIME_LIMIT = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  const CHECK_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds

  function handleInputChange(event) {
    setNewTask(event.target.value);
  }

  function handleDateInputChange(event) {
    setNewTaskDate(event.target.value);
  }

  function handleTimeInputChange(event) {
    setNewTime(event.target.value);
  }

  function handleDescInputChange(event) {
    setDescrip(event.target.value);
  }

  function addTask() {
    if (
      newTask.trim() !== "" &&
      descrip.trim() !== "" &&
      newTaskDate.trim() !== "" &&
      newTime.trim() !== ""
    ) {
      const dateTimeString = newTaskDate + "T" + newTime;
      const task = { task: newTask, descrip: descrip, date: dateTimeString };

      const today = new Date();
      const formattedToday = today.toISOString().split("T")[0];

      

      if (task === null && newTaskDate === formattedToday) {
        setTasks(task);
      } else if (newTaskDate === formattedToday) {
        setTasks((t) => [...t, task]);
      }
      setNewTask("");
      setNewTaskDate("");
      setDescrip("");
      Axios.post("http://localhost:3001/tasks/podoDB/insertTask", {
        userID: loginStatusID,
        ...task,
      })
        .then((response) => {
          console.log(response.data.message);
        })
        .catch((error) => {
          console.error("Error adding task:", error);
          console.log(error.response.data.message);
        });

      event(true);
    }
  }

  //gets users task
  useEffect(() => {
    const userTasks = () => {
      if (auth && loginStatusID) {
        const todaysTask = localStorage.getItem("TodaysTasks");

        console.log(todaysTask);

        Axios.get(
          `http://localhost:3001/tasks/podoDB/getDayTask?userID=${loginStatusID}`
        )
          .then((response) => {
            if (todaysTask === null) {
              setTasks(response.data);
            } else if (todaysTask !== null) {
              const task = response.data;
              const localTask = JSON.parse(todaysTask);
              const sortedTasks = localTask.map((localTask) =>
                task.find((task) => task.taskID === localTask.taskID)
              );

              setTasks(sortedTasks);
            }
          })
          .catch((error) => {
            console.error("Error Getting task:", error);
          });
      }
    };

    userTasks();
  }, [auth, loginStatusID]);

  useEffect(() => {
    const localTask = localStorage.getItem("TodaysTasks");

    if(localTask === null){
      localStorage.removeItem("TodaysTasks");
    }
  }, [tasks, eventCal])

  // Inside the second useEffect
  useEffect(() => {
    console.log("tasks", tasks);
  }, [tasks]);

  //add guest task and save tasks
  function guestAddTask() {
    if (
      newTask.trim() !== "" &&
      descrip.trim() !== "" &&
      newTaskDate.trim() !== ""
    ) {
      const task = {
        task: newTask,
        descrip: descrip,
        date: newTaskDate,
        timestamp: newTime,
      };

      // Retrieve existing tasks from local storage
      const tasks = JSON.parse(localStorage.getItem("guestTasks")) || [];

      // Add the new task to the existing list of tasks
      const updatedTasks = [...tasks, task];

      //sort task by date
      updatedTasks.sort((x, y) => new Date(x.date) - new Date(y.date));

      // Store the updated list of tasks back into local storage
      localStorage.setItem("guestTasks", JSON.stringify(updatedTasks));

      // Update state to reflect the new list of tasks
      const today = new Date();
      const formattedToday = today.toISOString().split("T")[0]; // Get today's date in yyyy-mm-dd format

      // Filter tasks for today's date
      const tasksForToday = updatedTasks.filter(
        (task) => task.date === formattedToday
      );

      tasksForToday.sort((a, b) => {
        const timeA = new Date(`2000-01-01T${a.timestamp}`);
        const timeB = new Date(`2000-01-01T${b.timestamp}`);

        // Compare the Date objects
        return timeA - timeB;
      });

      setTasks(tasksForToday);

      console.log(updatedTasks);
      // Clear input fields
      setNewTask("");
      setNewTaskDate("");
      setNewTime("");
      setDescrip("");
      event(true);
    }
  }

  //localStorage.removeItem("guestTasks");

  useEffect(() => {
    if (auth) {
      localStorage.removeItem("guestTasks");
      setTasks(null);
    } else if (auth === false) {
      // Load guest tasks from local storage
      const guestTasks = JSON.parse(localStorage.getItem("guestTasks")) || [];

      // Set the guest tasks as the initial state for tasks
      const today = new Date();
      const formattedToday = today.toISOString().split("T")[0]; // Get today's date in yyyy-mm-dd format

      // Filter tasks for today's date
      const tasksForToday = guestTasks.filter(
        (task) => task.date === formattedToday
      );

      setTasks(tasksForToday);

      // Start interval to check and update guest tasks periodically
      const interval = setInterval(() => {
        const currentTime = Date.now();
        const updatedTasks = guestTasks.filter(
          (task) => currentTime - task.timestamp < TIME_LIMIT
        );
        setTasks(updatedTasks);
        localStorage.setItem("guestTasks", JSON.stringify(updatedTasks));
      }, CHECK_INTERVAL);

      return () => clearInterval(interval);
    }
  }, [CHECK_INTERVAL, TIME_LIMIT, auth]);

  // Retrieve the task from the user task table to delete
  function deleteTask(index) {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    const task = tasks[index];
    const taskID = task.taskID;

    Axios.delete("http://localhost:3001/tasks/podoDB/deleteTask", {
      data: {
        taskID: taskID,
      },
    })
      .then((response) => {

        let tasks = JSON.parse(localStorage.getItem("TodaysTasks"))
        const indexToRemove = tasks.findIndex(task => task.taskID === taskID);
        if (indexToRemove !== -1) {
          tasks.splice(indexToRemove, 1);
          localStorage.setItem("TodaysTasks", JSON.stringify(tasks));
        } else {
          console.log("Task with taskID", taskID, "not found.");
        }
        setTasks(tasks);
        event(true);
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Error deleting task:", error); // Log any errors
      });
  }

  // Retrieve the task from the geust task local storage to delete
  function guestDeleteTask(index) {
    let guestTasks = JSON.parse(localStorage.getItem("guestTasks")) || [];

    const today = new Date();
    const formattedToday = today.toISOString().split("T")[0]; // Get today's date in yyyy-mm-dd format

    // Filter tasks for today's date
    const tasksForToday = guestTasks.filter(
      (task) => task.date === formattedToday
    );

    tasksForToday.sort((a, b) => {
      const timeA = new Date(`2000-01-01T${a.timestamp}`);
      const timeB = new Date(`2000-01-01T${b.timestamp}`);

      // Compare the Date objects
      return timeA - timeB;
    });

    const updatedTasks = tasksForToday.filter((_, i) => i !== index);

    guestTasks = guestTasks.filter((task) => task.date !== formattedToday);
    guestTasks = [...guestTasks, ...updatedTasks];

    localStorage.setItem("guestTasks", JSON.stringify(guestTasks));

    setTasks(updatedTasks);
    event(true);
  }

  function moveTaskUp(index) {
    if (index > 0) {
      const updatedTasks = [...tasks];
      [updatedTasks[index], updatedTasks[index - 1]] = [
        updatedTasks[index - 1],
        updatedTasks[index],
      ];
      localStorage.setItem("TodaysTasks", JSON.stringify(updatedTasks));
      setTasks(updatedTasks); // Update state with the updatedTasks array

      if (!auth) {
        const guestTasks = JSON.parse(localStorage.getItem("guestTasks")) || [];
        [guestTasks[index - 1], guestTasks[index]] = [
          guestTasks[index],
          guestTasks[index - 1],
        ];
        localStorage.setItem("guestTasks", JSON.stringify(guestTasks));
        event(true);
      }
    }
  }

  function moveTaskDown(index) {
    if (index < tasks.length - 1) {
      const updatedTasks = [...tasks];
      [updatedTasks[index], updatedTasks[index + 1]] = [
        updatedTasks[index + 1],
        updatedTasks[index],
      ];
      localStorage.setItem("TodaysTasks", JSON.stringify(updatedTasks));
      setTasks(updatedTasks);

      if (!auth) {
        const guestTasks = JSON.parse(localStorage.getItem("guestTasks")) || [];
        [guestTasks[index], guestTasks[index + 1]] = [
          guestTasks[index + 1],
          guestTasks[index],
        ];
        localStorage.setItem("guestTasks", JSON.stringify(guestTasks));
        event(true);
      }
    }
  }

  //open/close task modal
  const openTaskPopup = () => {
    const taskPopup = document.getElementById("taskPopup");
    taskPopup.style.display = "block";
  };

  const closeTaskPopup = (event) => {
    if (event) {
      event.preventDefault();
    }
    const taskPopup = document.getElementById("taskPopup");
    taskPopup.style.display = "none";
  };

  return (
    <div className="to-do-list">
      <h1>To Do List</h1>
      <button
        href="/#"
        className="button"
        style={{
          background: "none",
          display: "inline-block",
          width: "fit-content",
          padding: "1px",
          marginTop: "10px",
          marginLeft: "400px",
        }}
        onClick={openTaskPopup}
      >
        <IconContext.Provider
          value={{ size: "1em", color: "#4169e1", className: "icon" }}
        >
          <IoIosAddCircle />
        </IconContext.Provider>
      </button>
      {auth ? (
        <div id="taskPopup" className="signup-popup">
          <div className="signup-content">
            <form onSubmit={addTask}>
              <div>
                <input
                  type="text"
                  placeholder="Enter a task..."
                  value={newTask}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Enter Descriptions..."
                  value={descrip}
                  onChange={handleDescInputChange}
                />
              </div>
              <div>
                <input
                  type="date"
                  className="date-input"
                  value={newTaskDate}
                  onChange={handleDateInputChange}
                />
              </div>
              <div>
                <input
                  type="time"
                  className="time-input"
                  value={newTime}
                  onChange={handleTimeInputChange}
                />
              </div>
              <div>
                <button
                  className="add button"
                  onClick={(event) => {
                    event.preventDefault();
                    addTask();
                    closeTaskPopup();
                  }}
                >
                  Add
                </button>
                <button
                  className="add button"
                  onClick={(event) => closeTaskPopup(event)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        //guest render
        <div id="taskPopup" className="signup-popup">
          <div className="signup-content">
            <form onSubmit={guestAddTask}>
              <div>
                <input
                  type="text"
                  placeholder="Enter a task..."
                  value={newTask}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Enter Descriptions..."
                  value={descrip}
                  onChange={handleDescInputChange}
                />
              </div>
              <div>
                <input
                  type="date"
                  className="date-input"
                  value={newTaskDate}
                  onChange={handleDateInputChange}
                />
              </div>
              <div>
                <input
                  type="time"
                  className="time-input"
                  value={newTime}
                  onChange={handleTimeInputChange}
                />
              </div>
              <div>
                <button
                  className="add button"
                  onClick={(event) => {
                    event.preventDefault();
                    guestAddTask();
                    closeTaskPopup();
                  }}
                >
                  Add
                </button>
                <button
                  className="cancel button"
                  onClick={(event) => closeTaskPopup(event)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ol className="scroll">
        <div>
          {tasks &&
            tasks.map((task, index) => (
              <li key={index}>
                <span className="text">
                  <strong style={{ display: "flex" }}>Task:</strong> {task.task}
                </span>
                {auth ? (
                  <button
                    className="button"
                    style={{
                      background: "none",
                      display: "inline-block",
                      width: "fit-content",
                      padding: "1px",
                    }}
                    onClick={() => deleteTask(index)}
                  >
                    <IconContext.Provider
                      value={{
                        size: "1em",
                        color: "red",
                        className: "deleteB",
                      }}
                    >
                      <TiDelete />
                    </IconContext.Provider>
                  </button>
                ) : (
                  <button
                    className="button"
                    style={{
                      background: "none",
                      display: "inline-block",
                      width: "fit-content",
                      padding: "1px",
                    }}
                    onClick={() => guestDeleteTask(index)}
                  >
                    <IconContext.Provider
                      value={{
                        size: "1em",
                        color: "red",
                        className: "deleteB",
                      }}
                    >
                      <TiDelete />
                    </IconContext.Provider>
                  </button>
                )}
                <button
                  className="button"
                  style={{
                    background: "none",
                    display: "inline-block",
                    width: "fit-content",
                    padding: "1px",
                  }}
                  onClick={() => moveTaskUp(index)}
                >
                  <IconContext.Provider
                    value={{ size: "1em", color: "#4169e1", className: "icon" }}
                  >
                    <FaArrowUp />
                  </IconContext.Provider>
                </button>
                <button
                  className="button"
                  style={{
                    background: "none",
                    display: "inline-block",
                    width: "fit-content",
                    padding: "1px",
                  }}
                  onClick={() => moveTaskDown(index)}
                >
                  <IconContext.Provider
                    value={{ size: "1em", color: "#4169e1" }}
                  >
                    <FaArrowDownLong />
                  </IconContext.Provider>
                </button>
              </li>
            ))}
        </div>
      </ol>
    </div>
  );
};

export default ToDoList;
