import React, { useState } from "react";
import moment from "moment";
import "./Calendar.css";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(moment());
  const [showFullMonth, setShowFullMonth] = useState(false);
  const [events, setEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventDate, setEventDate] = useState(null);
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [showEventDescription, setShowEventDescription] = useState(null);

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
      setEvents([
        ...events,
        {
          date: eventDate,
          name: eventName,
          description: eventDescription,
        },
      ]);
      setShowEventModal(false);
      setEventDate(null);
      setEventName("");
      setEventDescription("");
    }
  };

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
    <div className="calendar">
      <div className="calendar-header">
        <button onClick={prevMonth}>Prev</button>
        <h2>{currentDate.format("MMMM YYYY")}</h2>
        <button onClick={nextMonth}>Next</button>
        <button className="toggle-full-month" onClick={toggleFullMonth}>
          {showFullMonth ? "^" : "v"}
        </button>
        <button className="add-event" onClick={handleAddEvent}>
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
            <button onClick={handleSaveEvent}>Save</button>
            <button onClick={handleCancelEvent}>Cancel</button>
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
                : moment(currentDate).startOf("week").add(index, "days").date()
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
                      <div key={index} className="event-item">
                        {event.name}
                        {showEventDescription === event && (
                          <div className="event-description">
                            {event.description}
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
  );
};

export default Calendar;
