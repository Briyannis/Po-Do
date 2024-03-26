import React, { useState } from 'react';
import '../styles.css'; // Importing styles

const Home = () => {
    function toggleDropdown() {
        const dropdown = document.getElementById("dropdownMenu");
        dropdown.style.display = (dropdown.style.display === "block") ? "none" : "block";
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
  
      const toggleForm = () => setIsSignUp(!isSignUp);
      const toggleForgotPassword = () => setForgotPassword(!forgotPassword);
  
      const handleSubmit = event => {
          event.preventDefault();
          // Implement form submission logic here
      };
  
      const handleForgotPassword = event => {
          event.preventDefault();
          // Implement forgot password logic here
      };

      return (
        <div className="signup-popup" id="signupPopup">
            <div className="signup-content">
                <span className="close" onClick={closeSignUpPopup}>&times;</span> {/*<!-- Close button -->*/}
                <h2>{forgotPassword ? 'Forgot Password' : isSignUp ? 'Sign Up' : 'Sign In'}</h2>
                {!forgotPassword && (
                    <form id="signupForm" onSubmit={handleSubmit}>
                        {isSignUp && <input type="email" placeholder="Email" required/>}
                        <input type="text" placeholder="Username" required/>
                        <input type="password" placeholder="Password" required/>
                        <button type="submit">{isSignUp ? 'Sign Up' : 'Sign In'}</button>
                        <a href="#" onClick={toggleForm}>Sign {isSignUp ? 'In' : 'Up'}</a>
                    </form>
                )}
                {!isSignUp && !forgotPassword && (
                    <a href="#" onClick={toggleForgotPassword}>
                        Forgot Password?
                    </a>
                )}
                {forgotPassword && (
                    <div>
                        <input type="text" placeholder="Enter your email" required/>
                        <button type="submit">Reset Password</button>
                        <a href="#" onClick={toggleForgotPassword}>Sign In</a>
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
                    <a href="#">Mode <button onClick={lightMode}>Light</button> / <button onClick={darkMode}>Dark</button></a>
                    <a href="#" onClick={openSignUpPopup}>Sign Up</a>
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

                <div className="todo-list">
                    <h4>To-Do List</h4>
                    <ul>
                        <li>Task 1</li>
                        <li>Task 2</li>
                        <li>Task 3</li>
                    </ul>
                </div>

                <div className="cont">
                    <div className="container">
                        <div id="time">
                            <span className="digit" id="hr">00</span>
                            <span className="txt">Hr</span>
                            <span className="digit" id="min">00</span>
                            <span className="txt">Min</span>
                            <span className="digit" id="sec">00</span>
                            <span className="txt">Sec</span>
                            <span className="digit" id="count">00</span>
                        </div>
                        <div id="buttons">
                            <button className="btn" id="start">Start</button>
                            <button className="btn" id="Pause">Pause</button>
                            <button className="btn" id="reset">Reset</button>
                        </div>
                    </div>

                    <div className="music-overlay">Music overlay: <br/> Spotify <br/> Apple Music</div>
                </div>
            </div>

            <SignUpSignInForm />
        </div>
    );
}

export default Home;
