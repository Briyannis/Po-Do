import React, { useState } from "react";
import moment from "moment";
import "./Calendar.css";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(moment());
  const [showFullMonth, setShowFullMonth] = useState(false);

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

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button onClick={prevMonth}>Prev</button>
        <h2>{currentDate.format("MMMM YYYY")}</h2>
        <button onClick={nextMonth}>Next</button>
        <button className="toggle-full-month" onClick={toggleFullMonth}>
          {showFullMonth ? "^" : "v"}
        </button>
      </div>
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
