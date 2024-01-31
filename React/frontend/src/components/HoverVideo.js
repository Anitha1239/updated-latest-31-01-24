// HoverVideo.js
import React, { useState } from "react";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { fontWeight } from "@mui/system";
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';

const HoverVideo = ({ imageSrc, videoSrc, title, description }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ position: "relative", width: "100%", height: "500px" }}
    >
      {isHovered ? (
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
          <video
            autoPlay
            loop
            muted={isMuted}
            playsInline
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          >
            <source src={videoSrc} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <button
            onClick={() => setIsMuted(!isMuted)}
            style={{
              position: "absolute",
              bottom: "10px",
              left: "10px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "white",
              fontSize: "30px",
            }}
          >
            {isMuted ? <VolumeUpIcon /> : <VolumeOffIcon />}
          </button>
        </div>
      ) : (
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
          <img
            src={imageSrc}
            alt="Thumbnail"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "10px",
              left: "10px",
              textAlign: "left",
              color: "white",
              padding: "10px", // Increased padding for better appearance
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "3em",
                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
              }}
            >
              {title}
            </h2>
            <p
              style={{
                fontSize: "1.2em",
                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
                width: "450px",
                marginBottom: "100px",
                color:"white",
                fontWeight:"bold"
              }}
            >
              {description}
            </p>

            {/* Adjust the size of the PlayArrowIcon */}
            {/* <PlayArrowIcon style={{ fontSize: 50, color: "white" }} /> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default HoverVideo;
