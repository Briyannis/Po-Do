import React, { useEffect } from "react";
import Axios from "axios";
import "./MusicOverlay.css"

const SpotifyLogin = ({ loginStatusID }) => {
  useEffect(() => {
    const code = async () => {
      const queryString = window.location.search;
      const params = new URLSearchParams(queryString);
      const refreshToken = params.get("refresh_token");
      const accessToken = params.get("access_token");

      //console.log("accessToken:", accessToken)
      //console.log("refresh", refreshToken)

      if (
        refreshToken &&
        accessToken &&
        refreshToken !== null &&
        accessToken !== null
      ) {
        try {
          const accInfo = await Axios.get(
            "http://localhost:3001/spotify-api/userInfo",
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          const data = accInfo.data;
          //console.log(data.product);
          const spotID = data.id;
          const accStatus = data.product;
          console.log(spotID);

          await Axios.post("http://localhost:3001/spotify-api/tokens", {
            userID: loginStatusID,
            accStatus: accStatus,
            accessToken: accessToken,
            refreshToken: refreshToken,
            spotifyID: spotID,
          });
        } catch (error) {
          console.error("Error posting tokens to database:", error);
        }
      }
    };

    code();
  }, []);

  const handleSpotifyLogin = () => {
    window.location.href = "http://localhost:3001/spotify-api/login";
  };

  return (
    <div style={{marginTop: "30px", marginLeft: "40px"}}>
      <button
        className="LoginButton"
        onClick={handleSpotifyLogin}
      >
        Login to Spotify
      </button>
    </div>
  );
};

export default SpotifyLogin;
