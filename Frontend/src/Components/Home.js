import React from "react";
import "../styles.css"; //Importing styles
import Timer from "../timer/Timer";
import Settings from "../timer/Settings";
import { useState } from "react";
import SettingsContext from "../timer/SettingsContext";
import ToDoList from "../todolist/ToDoList";
import Axios from "axios";

const Home = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [workMinutes, setWorkMinutes] = useState(45);
  const [breakMinutes, setBreakMinutes] = useState(15);
  function toggleDropdown() {
    const dropdown = document.getElementById("dropdownMenu");
    dropdown.style.display =
      dropdown.style.display === "block" ? "none" : "block";
  }
  function openSignUpPopup() {
    const signupPopup = document.getElementById("signupPopup");
    signupPopup.style.display = "block";
  }

  function closeSignUpPopup() {
    const signupPopup = document.getElementById("signupPopup");
    signupPopup.style.display = "none";
  }

  function darkMode() {
    let element = document.body;
    element.className = "dark-mode";
  }

  function lightMode() {
    let element = document.body;
    element.className = "light-mode";
  }

  const SignUpSignInForm = () => {
    const [isSignUp, setIsSignUp] = useState(true);
    const [forgotPassword, setForgotPassword] = useState(false);

    //user info

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");

    const toggleForm = () => setIsSignUp(!isSignUp);
    const toggleForgotPassword = () => setForgotPassword(!forgotPassword);

    Axios.defaults.withCredentials = true;
    const handleSubmit = (event) => {
      event.preventDefault();
      if (isSignUp) {
        // Implement sign-up logic here
        Axios.post("http://localhost:3001/podoDB/insertUser", {
          username: username,
          email: email,
          password: password,
        })
          .then((response) => {
            console.log(response.data);

            closeSignUpPopup();
          })
          .catch((error) => {
            console.error("Error signing up:", error);
            alert("User already exists");
          });
      } else {
        // Implement sign-in logic here
        Axios.post("http://localhost:3001/podoDB/login", {
          username: username,
          password: password,
        })
          .then((response) => {
            console.log(response.data);
            closeSignUpPopup();
          })
          .catch((error) => {
            console.error("Error signing in:", error);
            alert("Username or Password Incorrect");
          });
      }
    };

    const handleForgotPassword = (event) => {
      event.preventDefault();
      // Implement forgot password logic here
    };

    return (
      <div className="signup-popup" id="signupPopup">
        <div className="signup-content">
          <span className="close" onClick={closeSignUpPopup}>
            &times;
          </span>{" "}
          {/*<!-- Close button -->*/}
          <h2>
            {forgotPassword
              ? "Forgot Password"
              : isSignUp
              ? "Sign Up"
              : "Sign In"}
          </h2>
          {!forgotPassword && (
            <form id="signupForm" onSubmit={handleSubmit}>
              {isSignUp && (
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  required
                />
              )}
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                }}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                required
              />
              <button type="submit">{isSignUp ? "Sign Up" : "Sign In"}</button>
              <a href="#" onClick={toggleForm}>
                Sign {isSignUp ? "In" : "Up"}
              </a>
            </form>
          )}
          {!isSignUp && !forgotPassword && (
            <a href="#" onClick={toggleForgotPassword}>
              Forgot Password?
            </a>
          )}
          {forgotPassword && (
            <div>
              <input type="text" placeholder="Enter your email" required />
              <button type="submit">Reset Password</button>
              <a href="#" onClick={toggleForgotPassword}>
                Sign In
              </a>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <header>
        <h1>Po-Do</h1>
        <div className="hamburger-menu" onClick={toggleDropdown}>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>
        <div id="DarkModetext"></div>
        <div className="dropdown-menu" id="dropdownMenu">
          <a href="#">
            Mode <button onClick={lightMode}>Light</button> /{" "}
            <button onClick={darkMode}>Dark</button>
          </a>
          <a href="#" onClick={openSignUpPopup}>
            Sign Up
          </a>
          <a href="#">Settings</a>
        </div>
        {/*<!-- Add light/dark option, settings, signup/login, -->*/}
      </header>

      <div className="content">
        <div className="calendar-container">
          <table>
            <tr>
              <th>Sunday</th>
              <th>Monday</th>
              <th>Tuesday</th>
              <th>Wednesday</th>
              <th>Thursday</th>
              <th>Friday</th>
              <th>Saturday</th>
            </tr>
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          </table>
          <div className="dropdown-arrow"></div>
          <div className="dropdown-content">
            {/*<!-- Full month calendar here -->*/}
            <table>
              <caption>March 2024</caption>
              <tr>
                <th>Sun</th>
                <th>Mon</th>
                <th>Tue</th>
                <th>Wed</th>
                <th>Thu</th>
                <th>Fri</th>
                <th>Sat</th>
              </tr>
              <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td>1</td>
                <td>2</td>
              </tr>
              <tr>
                <td>3</td>
                <td>4</td>
                <td>5</td>
                <td>6</td>
                <td>7</td>
                <td>8</td>
                <td>9</td>
              </tr>
              {/*<!-- Add more rows -->*/}
            </table>
          </div>
        </div>
        <div>
          <ToDoList />
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
            Music overlay: <br /> Spotify <br /> Apple Music
          </div>
        </div>
      </div>

      <SignUpSignInForm />
    </div>
  );
};

export default Home;
