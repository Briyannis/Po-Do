import React, { useEffect } from "react";
import "../styles.css";
import Timer from "../timer/Timer";
import Settings from "../timer/Settings";
import { useState } from "react";
import SettingsContext from "../timer/SettingsContext";
import ToDoList from "../todolist/ToDoList";
import Axios from "axios";
import AuthForm from "./LoginSignupForm";
import Cookies from "js-cookie";
import MusicPlayer from "../MusicOverlay/MusicPlayer";
import Calendar from "../calender/test";
import UserSettings from "./UserSettings";
import { IoMdSunny, IoMdMoon } from "react-icons/io";

const Home = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [workMinutes, setWorkMinutes] = useState(45);
  const [breakMinutes, setBreakMinutes] = useState(15);
  const [spotLog, setSpotLog] = useState(false);
  const [loading, setLoading] = useState(true);

  //login states
  const [loginStatus, setLoginStatus] = useState("");
  const [auth, setAuth] = useState(false);

  const [darkmode, setDarkMode] = useState(false);

  //Renders authentications for loggedin user
  useEffect(() => {
    const token = Cookies.get("token");
    Axios.get("http://localhost:3001/auth/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.data.Status === "Success") {
          setAuth(true);
          setLoginStatus((prevLoginStatus) => ({
            ...prevLoginStatus,
            id: res.data.userInfo.id,
            email: res.data.userInfo.email,
            username: res.data.userInfo.username,
          }));
        } else {
          setAuth(false);
          console.log(res.data.message);
        }
      })
      .catch((error) => {
        console.error("No User Signed In", error);
        setAuth(false);
      });
  }, []);

  function toggleDropdown() {
    const dropdown = document.getElementById("dropdownMenu");
    dropdown.style.display =
      dropdown.style.display === "block" ? "none" : "block";
  }
  const openSignUpPopup = (event) => {
    event.preventDefault();
    const signupPopup = document.getElementById("signupPopup");
    signupPopup.style.display = "block";
  };

  function darkMode() {
    let element = document.body;
    element.className = "dark-mode";
    setDarkMode(true);
  }

  function lightMode() {
    let element = document.body;
    element.className = "light-mode";
    setDarkMode(false);
  }

  function handleLogOut(event) {
    Axios.get("http://localhost:3001/auth/logout")
      .then((res) => {
        if (res.data.Status === "Success") {
          window.location.reload(true);
        } else {
          alert("error");
        }
      })
      .catch((err) => console.log(err));
  }

  const openSettings = (event) => {
    event.preventDefault();
    const signupPopup = document.getElementById("settings");
    signupPopup.style.display = "block";
  };

  const updateLoginStatus = (status) => {
    setLoginStatus(status);
  };

  const loggedIn = (loggedIn) => {
    setSpotLog(loggedIn);
  };

  return (
    <div>
      {auth ? (
        <header>
          <h1>Po-Do</h1>
          <h2>Hello {loginStatus.username}</h2>
          <div className="hamburger-menu" onClick={toggleDropdown}>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </div>
          <div id="DarkModetext"></div>
          <div className="dropdown-menu" id="dropdownMenu">
            <a href="/#">
              Mode <button onClick={lightMode}>Light</button> /{" "}
              <button onClick={darkMode}>Dark</button>
            </a>
            <a href="/#" onClick={openSettings}>
              Settings
            </a>
            <a href="/#" onClick={handleLogOut}>
              Log Out
            </a>
          </div>
          {/*<!-- Add light/dark option, settings, signup/login, -->*/}
        </header>
      ) : (
        // Render content for guests
        <header>
          <h1>Po-Do</h1>
          <div className="hamburger-menu" onClick={toggleDropdown}>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </div>
          <div id="DarkModetext"></div>
          <div className="dropdown-menu" id="dropdownMenu">
              <a href="/#" onClick={lightMode}> <IoMdSunny/>Light</a>
              <a href="/#" onClick={darkMode}> <IoMdMoon/> Dark</a>
            <a href="/#" onClick={openSignUpPopup}>
              Sign Up
            </a>
          </div>
        </header>
      )}

      <div className="content">
        <div>
          <div className="calendar-container">
            <Calendar />
          </div>
          <div>
          <ToDoList loginStatusID={loginStatus.id} auth={auth} />
          </div>
        </div>
        <div className="cont">
          <div className="container">
            <main>
              <SettingsContext.Provider
                value={{
                  showSettings,
                  setShowSettings,
                  workMinutes,
                  breakMinutes,
                  setWorkMinutes,
                  setBreakMinutes,
                }}
              >
                {showSettings ? <Settings /> : <Timer />}
              </SettingsContext.Provider>
            </main>
          </div>
          <div className="music-overlay">
            {/* Render the MusicPlayer component in the background */}
            {auth ? (
              <MusicPlayer
                auth={auth}
                loginStatusID={loginStatus.id}
                darkmode={darkmode}
                spotLog={spotLog}
                style={{ display: "none" }}
              />
            ) : (
              <div className="music-overlay">
              <h1>Music Player</h1>
              <buttton className="signupMenubutton" onClick={openSignUpPopup}>
                Sign Up
              </buttton>
              </ div>
            )}
          </div>
        </div>
      </div>

      <AuthForm setLoginStatus={setLoginStatus} setAuth={setAuth} />
      <UserSettings
        updateLoginStatus={updateLoginStatus}
        userID={loginStatus.id}
        email={loginStatus.email}
        username={loginStatus.username}
        loggedIn={loggedIn}
      />
    </div>
  );
};

export default Home;
