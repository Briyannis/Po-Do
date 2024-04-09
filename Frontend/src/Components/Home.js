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

const Home = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [workMinutes, setWorkMinutes] = useState(45);
  const [breakMinutes, setBreakMinutes] = useState(15);

  //login states
  const [loginStatus, setLoginStatus] = useState("");
  const [auth, setAuth] = useState(false);

  const [darkmode, setDarkMode] = useState(false);

  //Renders authentications for loggedin user
  useEffect(() => {
    const token = Cookies.get("token");
    Axios.get("http://localhost:3001", {
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

  function closeSignUpPopup() {
    const signupPopup = document.getElementById("signupPopup");
    signupPopup.style.display = "none";
  }

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
    Axios.get("http://localhost:3001/logout")
      .then((res) => {
        if (res.data.Status === "Success") {
          window.location.reload(true);
        } else {
          alert("error");
        }
      })
      .catch((err) => console.log(err));
  }
  // eslint-disable-next-line
  const SignUpSignInForm = ({ setLoginStatus }) => {
    const [isSignUp, setIsSignUp] = useState(true);
    const [forgotPassword, setForgotPassword] = useState(false);

    //user info

    const [formValues, setFormValues] = useState({
      username: "",
      email: "",
      password: "",
    });

    // const [editedValue, setEditedValue] = useState({
    //   username: "",
    //   email: "",
    //   password: "",
    // });

    const toggleForm = () => setIsSignUp(!isSignUp);
    const toggleForgotPassword = () => setForgotPassword(!forgotPassword);
    const handleSubmit = async (event) => {
      event.preventDefault();
      const { username, email, password } = formValues;

      if (isSignUp) {
        // Implement sign-up logic here
        await Axios.post("http://localhost:3001/podoDB/insertUser", {
          username: username,
          email: email,
          password: password,
        })
          .then((response) => {
            console.log(response.data.message);
            closeSignUpPopup();
          })
          .catch((error) => {
            console.error("Error signing up:", error);
            alert(error.response.data.message);
          });
      } else {
        // Implement sign-in logic here
        Axios.post("http://localhost:3001/login", {
          username: username,
          password: password,
        })
          .then((response) => {
            console.log(response.data.message);
            console.log(response.data.userInfo);
            //login
            setLoginStatus(response.data.userInfo);
            setAuth(true);
            closeSignUpPopup();
          })
          .catch((error) => {
            console.error("Error signing in:", error);
            if (error.response && error.response.status === 404) {
              // Handle 404 error (user not found) here
              alert("User Not Found");
            } else {
              // Handle other errors
              alert(
                error.response
                  ? error.response.data.message
                  : "Unknown error occurred"
              );
            }
          });
      }
    };
    // eslint-disable-next-line
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
                  value={formValues.email}
                  onChange={(e) =>
                    setFormValues({ ...formValues, email: e.target.value })
                  }
                  required
                />
              )}
              <input
                type="text"
                placeholder="Username"
                value={formValues.username}
                onChange={(e) =>
                  setFormValues({ ...formValues, username: e.target.value })
                }
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={formValues.password}
                onChange={(e) =>
                  setFormValues({ ...formValues, password: e.target.value })
                }
                required
              />
              <button type="submit">{isSignUp ? "Sign Up" : "Sign In"}</button>
              <a href="/#" onClick={toggleForm}>
                Sign {isSignUp ? "Up" : "In"}
              </a>
            </form>
          )}
          {!isSignUp && !forgotPassword && (
            <a href="/#" onClick={toggleForgotPassword}>
              Forgot Password?
            </a>
          )}
          {forgotPassword && (
            <div>
              <input type="text" placeholder="Enter your email" required />
              <button type="submit">Reset Password</button>
              <a href="/#" onClick={toggleForgotPassword}>
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
            <a href="/#">Settings</a>
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
            <a href="/#">
              Mode <button onClick={lightMode}>Light</button> /{" "}
              <button onClick={darkMode}>Dark</button>
            </a>
            <a href="/#" onClick={openSignUpPopup}>
              Sign Up
            </a>
          </div>
          {/*<!-- Add light/dark option, settings, signup/login, -->*/}
        </header>
      )}

      <div className="content">
        <div className="calendar-container">
          <Calendar />
        </div>
        <div>
          <ToDoList loginStatusID={loginStatus.id} auth={auth} />
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

          {auth ? (
            <div className="music-overlay">
              <MusicPlayer
                auth={auth}
                loginStatusID={loginStatus.id}
                darkmode={darkmode}
              />
            </div>
          ) : (
            <div className="music-overlay">
              <h2>Sign IN</h2>
            </div>
          )}
        </div>
      </div>

      <AuthForm setLoginStatus={setLoginStatus} setAuth={setAuth} />
    </div>
  );
};

export default Home;
