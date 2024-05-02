import React, { useState, useEffect } from "react";

function TimerNotify({ message, onClose }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
        setShow(false);
      onClose();
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div style={{ 
      position: "fixed", 
      color: "whitesmoke",
      marginRight: "60px",
      top: "10px", 
      right: "10px", 
      backgroundColor: "#4169e1", 
      padding: "10px",
      borderRadius: "5px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
      display: show ? "block" : "none",
    }}>
      {message}
    </div>
  );
}

export default TimerNotify;
