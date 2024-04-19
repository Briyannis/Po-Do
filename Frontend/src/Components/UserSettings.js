import React from "react";
import "../styles.css";
import { useState } from "react";
import Axios from "axios";

const UserSettings = ({
  updateLoginStatus,
  username,
  email,
  userID,
}) => {
  function closeSettings() {
    const signupPopup = document.getElementById("settings");
    signupPopup.style.display = "none";
  }

  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [showUpdateNameForm, setShowUpdateNameForm] = useState(false);
  const [changePass, setChangePass] = useState(false);

  const handleChangePassClick = () => {
    setChangePass(true);
  };

  const handleUpdateEmailClick = () => {
    setShowUpdateForm(true);
  };

  const handleUpdateUserClick = (e) => {
    setShowUpdateNameForm(true);
  };

  const [formValues, setFormValues] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [oldPass, setOldPass] = useState("");

  const handleUpdates = () => {
    Axios.post(
      `http://localhost:3001/auth/updateUser?userID=${userID}&username=${formValues.username}&email=${formValues.email}&newPass=${formValues.password}&oldPass=${oldPass}`
    )
      .then((res) => {
        updateLoginStatus(res.data);
        setChangePass(false);
        setShowUpdateForm(false);
        setShowUpdateNameForm(false);
        setFormValues({
          username: "",
          email: "",
          password: "",
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleSpotLogout = async () => {
    console.log(userID);
    await Axios.delete(
      `http://localhost:3001/spotify-api/logout/${userID}`,
      { userID: userID }
    ).then ((res) => {
      window.location.href = "https://accounts.spotify.com/logout";

    }).catch((err) => {
      console.log(err);
    })
   
    
  };

  return (
    <div className="signup-popup" id="settings">
      <div className="signup-content">
        <span className="close" onClick={closeSettings}>
          &times;
        </span>{" "}
        {!changePass ? (
          <>
            <h2>Account Information</h2>
            <h3 style={{ margin: "0", marginRight: "10px" }}>Email</h3>
            {showUpdateForm ? (
              <div style={{ display: "flex", alignItems: "center" }}>
                <input
                  type="email"
                  placeholder="Email"
                  value={formValues.email}
                  onChange={(e) =>
                    setFormValues({ ...formValues, email: e.target.value })
                  }
                  style={{ marginRight: "10px" }}
                />
                <button onClick={handleUpdates} style={{ marginLeft: "10px" }}>
                  Update
                </button>
                <button
                  onClick={() => {
                    setShowUpdateForm(false);
                    setFormValues({
                      username: "",
                      email: "",
                      password: "",
                    });
                  }}
                  style={{ marginLeft: "10px" }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center" }}>
                <h5>{email}</h5>
                <button
                  onClick={handleUpdateEmailClick}
                  style={{ marginLeft: "10px" }}
                >
                  Update
                </button>
              </div>
            )}
            <h3 style={{ margin: "0", marginRight: "10px" }}>Username</h3>
            {showUpdateNameForm ? (
              <div style={{ display: "flex", alignItems: "center" }}>
                <input
                  type="text"
                  placeholder="Username"
                  value={formValues.username}
                  onChange={(e) =>
                    setFormValues({ ...formValues, username: e.target.value })
                  }
                  style={{ marginRight: "10px" }}
                />
                <button onClick={handleUpdates} style={{ marginLeft: "10px" }}>
                  Update
                </button>
                <button
                  onClick={() => {
                    setShowUpdateNameForm(false);
                    setFormValues({
                      username: "",
                      email: "",
                      password: "",
                    });
                  }}
                  style={{ marginLeft: "10px" }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center" }}>
                <h5>{username}</h5>
                <button
                  style={{ marginLeft: "10px" }}
                  onClick={handleUpdateUserClick}
                >
                  Update
                </button>
              </div>
            )}
            <h2>Change Password</h2>
            <button
              style={{ margin: "0", marginRight: "10px" }}
              onClick={handleChangePassClick}
            >
              Change Password
            </button>
            <h2 style={{ margin: "0", marginRight: "10px" }}>
              Linked Accounts
            </h2>
            <div style={{ display: "flex", alignItems: "center" }}>
              <h3>Spotify</h3>
              <button style={{ marginLeft: "10px" }} onClick={handleSpotLogout}>
                unlink
              </button>
            </div>
          </>
        ) : (
          <div>
            <h2>Change Passowrd</h2>
            <h3>Old Password</h3>
            <input
              type="text"
              placeholder="Old Password"
              onChange={(e) => setOldPass(e.target.value)}
              style={{ marginRight: "10px" }}
            />
            <h3>New Password</h3>
            <input
              type="text"
              placeholder="New Password"
              onChange={(e) =>
                setFormValues({ ...formValues, password: e.target.value })
              }
              style={{ marginRight: "10px" }}
            />
            <button onClick={handleUpdates} style={{ marginLeft: "10px" }}>
              Update
            </button>
            <button
              onClick={() => setChangePass(false)}
              style={{ marginLeft: "10px" }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSettings;
