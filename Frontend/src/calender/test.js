import React, { useState, useEffect } from "react";
import moment from "moment";
import "./Calendar.css";
import Axios from "axios";

const Calendar = ({ auth, event, loginStatusID, eventCal }) => {
  const [currentDate, setCurrentDate] = useState(moment());
  const [showFullMonth, setShowFullMonth] = useState(false);
  const [events, setEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventDate, setEventDate] = useState(null);
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [showEventDescription, setShowEventDescription] = useState(null);
  const [newTime, setNewTime] = useState("");

  const handleEventMouseEnter = (event) => {
    setShowEventDescription(event);
  };

  function handleTimeInputChange(event) {
    setNewTime(event.target.value);
  }

  useEffect(() => {
    if (auth) {
      //load users tasks
      localStorage.removeItem("guestTasks");
      const todaysTask = localStorage.getItem("TodaysTasks");
      Axios.get(
        `http://129.213.68.135/api/tasks/podoDB/getTask?userID=${loginStatusID}`
      )
        .then((response) => {
          if (todaysTask === null) {
            setEvents(response.data);
          } else if (todaysTask !== null) {
            const tasks = response.data;

            setEvents(tasks);
          }
        })
        .catch((error) => {
          console.error("Error Getting task:", error);
        });
    }
    console.log(auth);
    if (auth === false) {
      // Load guest tasks from local storage
      const guestTasks = JSON.parse(localStorage.getItem("guestTasks")) || [];

      // Compare the Date objects
      guestTasks.sort((a, b) => {
        const timeA = new Date(`2000-01-01T${a.timestamp}`);
        const timeB = new Date(`2000-01-01T${b.timestamp}`);

       
        return timeA - timeB;
      });

      setEvents(guestTasks);
    }
  }, [auth]);

  //console.log(events)

  const getEvents = () => {
    if (auth === false) {
      console.log("this is geust")
      const storedTasks = JSON.parse(localStorage.getItem("guestTasks")) || [];
      setEvents(storedTasks);

      // Listen for changes in local storage
      const handleStorageChange = (event) => {
        if (event.key === "guestTasks") {
          const updatedTasks = JSON.parse(event.newValue) || [];
          setEvents(updatedTasks);
        }
      };

      window.addEventListener("storage", handleStorageChange);

      return () => {
        window.removeEventListener("storage", handleStorageChange);
      };
    } else if(auth === true){
      Axios.get(
        `http://129.213.68.135/api/tasks/podoDB/getTask?userID=${loginStatusID}`
      )
        .then((response) => {

            setEvents(response.data);
          
        })
        .catch((error) => {
          console.error("Error Getting task:", error);
        });
    }
   }

  useEffect(() => {

   getEvents()
  }, [event]);

  //console.log(events);

  const daysInMonth = () => {
    return currentDate.daysInMonth();
  };

  const firstDayOfMonth = () => {
    let firstDay = moment(currentDate).startOf("month").format("d");
    return firstDay;
  };

  const prevMonth = () => {
    setCurrentDate(moment(currentDate).subtract(1, "month"));
  };

  const nextMonth = () => {
    setCurrentDate(moment(currentDate).add(1, "month"));
  };

  const toggleFullMonth = () => {
    setShowFullMonth(!showFullMonth);
  };

  const handleAddEvent = () => {
    setShowEventModal(true);
  };

  const handleSaveEvent = () => {
    if (eventDate && eventName) {

      const formattedDate = eventDate.toISOString().split("T")[0];

      const newEvent = {
        task: eventName,
        descrip: eventDescription,
        date: formattedDate,
        timestamp: newTime,
      }
      if(auth){
        //user
        console.log(formattedDate)
        const dateTimeString = formattedDate + "T" + newTime;
        console.log(dateTimeString)
        const event = { task: eventName, descrip: eventDescription, date: dateTimeString };

        Axios.post("http://129.213.68.135/api/tasks/podoDB/insertTask", {
        userID: loginStatusID,
        ...event,
      }).then((response) => {
        if(response.status === 200){
          getEvents();
        }
        
      } )

      }else {
        //guest
        const events = JSON.parse(localStorage.getItem("guestTasks")) || [];

        const Events = [...events, newEvent];

        //for calendar event output
        const updatedEvents = Events.map((tasks) => ({
          name: tasks.task,
          description: tasks.descrip,
          date: tasks.date,
          timestamp: tasks.timestamp
        }))

        localStorage.setItem("guestTasks", JSON.stringify(Events));
        console.log(updatedEvents)
        setEvents(updatedEvents);

      }
      
      setShowEventModal(false);
      eventCal(true)
      setEventDate(null);
      setEventName("");
      setEventDescription("");
    }
  };

  //console.log(events)

  const handleCancelEvent = () => {
    setShowEventModal(false);
    setEventDate(null);
    setEventName("");
    setEventDescription("");
  };

  const handleEventClick = (event) => {
    setShowEventDescription(event);
  };

  const handleEventMouseLeave = () => {
    setShowEventDescription(null);
  };

  


  return (
    <>
      <div className="calendar">
        <div className="calendar-header">
          <button className="button" onClick={prevMonth}>
            Prev
          </button>
          <h2>{currentDate.format("MMMM YYYY")}</h2>
          <button className="button" onClick={nextMonth}>
            Next
          </button>
          <button
            className="button toggle-full-month"
            onClick={toggleFullMonth}
          >
            {showFullMonth ? "^" : "v"}
          </button>
          {/* auth or guest*/}
          <button className="button add-event" onClick={handleAddEvent}>
            +
          </button>
        </div>
        {showEventModal && (
          <div className="event-modal">
            <h3>Add Event</h3>
            <label>
              Date:
              <input
                type="date"
                value={eventDate ? eventDate.format("YYYY-MM-DD") : ""}
                onChange={(e) => setEventDate(moment(e.target.value))}
              />
            </label>
            <div>
              Time:
                <input
                  type="time"
                  className="time-input"
                  value={newTime}
                  onChange={handleTimeInputChange}
                />
              </div>
            <label>
              Event Name:
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
              />
            </label>
            <label>
              Event Description:
              <textarea
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
              ></textarea>
            </label>
            <div className="event-modal-actions">
              {/* auth or guest*/}
              <button className="button" onClick={handleSaveEvent}>
                Save
              </button>
              <button className="button" onClick={handleCancelEvent}>
                Cancel
              </button>
            </div>
          </div>
        )}
        <div className="calendar-body">
          <div className="calendar-weekdays">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="calendar-weekday">
                {day}
              </div>
            ))}
          </div>
          <div className="calendar-days">
            {showFullMonth
              ? Array.from({ length: firstDayOfMonth() }, () => "").map(
                  (_, index) => <div key={index} className="calendar-day"></div>
                )
              : []}
            {Array.from(
              { length: showFullMonth ? daysInMonth() : 7 },
              (_, index) =>
                showFullMonth
                  ? index + 1
                  : moment(currentDate)
                      .startOf("week")
                      .add(index, "days")
                      .date()
            ).map((day) => (
              <div key={day} className="calendar-day">
                {day}
                {events.some((event) =>
                  moment(event.date).isSame(
                    moment(currentDate)
                      .startOf("month")
                      .add(day - 1, "days"),
                    "day"
                  )
                ) && (
                  <div
                    className="event-indicator"
                    onMouseEnter={() =>
                      handleEventClick(
                        events.find((event) =>
                          moment(event.date).isSame(
                            moment(currentDate)
                              .startOf("month")
                              .add(day - 1, "days"),
                            "day"
                          )
                        )
                      )
                    }
                    onMouseLeave={handleEventMouseLeave}
                  >
                    {events
                      .filter((event) =>
                        moment(event.date).isSame(
                          moment(currentDate)
                            .startOf("month")
                            .add(day - 1, "days"),
                          "day"
                        )
                      )
                      .map((event, index) => (
                        <div
                          key={index}
                          className="event-item"
                          onMouseEnter={() => handleEventMouseEnter(event)}
                          onMouseLeave={handleEventMouseLeave}
                        >
                          {event.task}
                          {showEventDescription === event && (
                            <div className="event-description">
                              {event.descrip}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Calendar;
