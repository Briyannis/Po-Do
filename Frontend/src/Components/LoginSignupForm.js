import "../styles.css"; //Importing styles
import { useState } from "react";
import Axios from "axios";

const AuthForm = ({ setLoginStatus, setAuth }) => {
  function closeSignUpPopup() {
    const signupPopup = document.getElementById("signupPopup");
    signupPopup.style.display = "none";
  }

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

  Axios.defaults.withCredentials = true;

  const handleSubmit = (event) => {
    if(event){
      event.preventDefault();
    }

    const { username, email, password } = formValues;

    if (isSignUp) {
      // Implement sign-up logic here
      Axios.post("http://localhost:3001/auth/podoDB/insertUser", {
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
      login();
    }
  };

  async function login() {
    try {
      const response = await Axios.post("http://localhost:3001/auth/login", {
        username: formValues.username,
        password: formValues.password,
      });
      console.log(response.data.message);
      console.log(response.data.userInfo);
      setLoginStatus(response.data.userInfo);
      setAuth(true);
      closeSignUpPopup();
    } catch (error) {
      console.error("Error signing in:", error);
      if (error.response && error.response.status === 404) {
        alert("User Not Found");
      } else {
        alert(
          error.response
            ? error.response.data.message
            : "Unknown error occurred"
        );
      }
    }
  }
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
              Sign {isSignUp ? "In" : "Up"}
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

export default AuthForm;
