import React, { useEffect } from "react";
import Axios from "axios";

const SpotifyLogin = ({ loginStatusID, setSpotifyAccessToken, setSpotifyRefreshToken }) => {
    useEffect(() => {
      const code = async () => {
        const queryString = window.location.search;
        const params = new URLSearchParams(queryString);
        const refreshToken = params.get("refresh_token");
        const accessToken = params.get("access_token");
  
        if (refreshToken && accessToken) {
          try {
            await Axios.post("http://localhost:3001/spotify-api/tokens", {
              userID: loginStatusID,
              accessToken: accessToken,
              refreshToken: refreshToken,
            });
            setSpotifyAccessToken(accessToken);
            setSpotifyRefreshToken(refreshToken);
          } catch (error) {
            console.error("Error posting tokens to database:", error);
          }
        }
      };
  
      code();
    }, [loginStatusID, setSpotifyAccessToken, setSpotifyRefreshToken]);
  
    const handleSpotifyLogin = () => {
      window.location.href = "http://localhost:3001/spotify-api/login";
    };
  
    return (
      <div>
        <button onClick={handleSpotifyLogin}>Login</button>
      </div>
    );
  };
  
  export default SpotifyLogin;