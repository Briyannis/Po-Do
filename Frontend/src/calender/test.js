//import {`[Calendar](#calendar), [CalendarList](#calendarlist), [Agenda](#agenda)`} from 'react-native-calendars';

import React, { useState } from "react";
import { Calendar, LocaleConfig } from "react-native-calendars";

const App = () => {
  const [selected, setSelected] = useState("");

  return (
    <Calendar
      onDayPress={(day) => {
        setSelected(day.dateString);
      }}
      markedDates={{
        [selected]: {
          selected: true,
          disableTouchEvent: true,
          selectedDotColor: "orange",
        },
      }}
    />
  );
};

export default App;

<Calendar
  onDayPress={(day) => {
    console.log("selected day", day);
  }}
/>;
