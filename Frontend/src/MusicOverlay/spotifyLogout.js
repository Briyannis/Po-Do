import React, { useEffect, useState } from "react";
import Axios from "axios";

const LogoutComponent = ({ loginStatusID, spotifyRefeshToken, spotifyAccessToken }) => {

    const [refreshToken, setRefreshToken] = useState(spotifyRefeshToken);
    const [accessToken, setAccessToken] = useState(spotifyAccessToken);

    const spotifyLogout = async () => {
        try {
              // Redirect to Spotify logout
              await Axios.get('http://localhost:3001/spotlogout');
    
           await Axios.delete(`http://localhost:3001/spotify-api/logout`, {
            data: {
              userID: loginStatusID,
            }
          })
            .then(() => {
              setAccessToken("");
              setRefreshToken("");
              //setLoggedin(false);
            })
            .catch((error) => {
              console.error("Error Logging Out:", error);
              //setLoggedin(false);
            });
            
        } catch (error) {
          console.error("Error Logging Out:", error);
        }
      }
  return (
    <button onClick={() => {window.location = "https://accounts.spotify.com/logout"}}>Logout</button>
  );
};

export default LogoutComponent;