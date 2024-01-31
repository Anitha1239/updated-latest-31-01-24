import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Thumbnails.css";
import { AuthContext } from "../context/authContext";



const Thumbnails = ({profileId}) => {
  const [genres, setGenres] = useState([]);
  const [moviesByGenre, setMoviesByGenre] = useState({});
  const [currentPosition, setCurrentPosition] = useState(0);
  const containerRef = useRef(null);
  const [showNotifications, setShowNotifications] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const [hoveredGenreId, setHoveredGenreId] = useState(null);

  useEffect(() => {
    axios
      .get("http://192.168.30.118:8800/genres")
      .then((response) => {
        setGenres(response.data);
        fetchMoviesByGenre(response.data);
      })
      .catch((error) => {
        console.error("Error fetching genres:", error);
      });

    // Add a click event listener to the document body
    document.body.addEventListener("click", handleBodyClick);

    // Clean up the event listener when the component is unmounted
    return () => {
      document.body.removeEventListener("click", handleBodyClick);
    };
  }, []);

  const fetchMoviesByGenre = (genres) => {
    const genrePromises = genres.map((genre) => {
      return axios
      .get(`http://192.168.30.118:8800/getMoviesByGenre/${genre.id}/${profileId}`,)
        .then((response) => response.data)
        .catch((error) => {
          console.error(
            `Error fetching movies for genre ${genre.genre}:`,
            error
          );
          return [];
        });
    });

    
    Promise.all(genrePromises)
      .then((results) => {
        const moviesByGenreObject = {};
        results.forEach((movies, index) => {
          moviesByGenreObject[genres[index].genre] = movies;
        });
        setMoviesByGenre(moviesByGenreObject);
      })
      .catch((error) => {
        console.error("Error fetching movies by genre:", error);
      });
  };

  console.log({profileId})
  const handleForwardClick = () => {
    const containerWidth = containerRef.current.offsetWidth;
    const numGenres = genres.length;
    const totalWidth = containerWidth * numGenres;
    const newPosition = currentPosition + containerWidth / 6;

    setCurrentPosition(Math.min(newPosition, totalWidth - containerWidth));
  };

  const handleBackwardClick = () => {
    const containerWidth = containerRef.current.offsetWidth;
    const newPosition = currentPosition - containerWidth / 6;

    setCurrentPosition(Math.max(newPosition, 0));
  };

  const handleBodyClick = (event) => {
    // Check if the click target is inside the notification area or movie cards
    if (
      (containerRef.current && containerRef.current.contains(event.target)) ||
      event.target.closest(".card")
    ) {
      // Click is inside the notification area or on a movie card, do nothing
      return;
    }

    // Click is outside the notification area and movie cards, hide notifications
    setShowNotifications(false);
  };
  const handleGenreClick = (genreId) => {
    setSelectedGenre(genreId);
    setShowNotifications(true);
  };
  return (
    <div>
      {/* Display notifications only if showNotifications is true */}
      {showNotifications && (
        <div className="notification">
          {/* Notification content goes here */}
        </div>
      )}

      {genres.map((genre) => (
        <div key={genre.genre}>
          <Link
            to={`/genre/${genre.id}`}
            className="genre-link"
            onClick={() => handleGenreClick(genre.id)}
            onMouseEnter={() => setHoveredGenreId(genre.id)}
            onMouseLeave={() => setHoveredGenreId(null)}
          >
         <div style={{ display: "flex", alignItems: "center" }}>
  <div>
    <h2 className="genretitle">
      {genre.genre}
    </h2>
  </div>
  {hoveredGenreId === genre.id && (
    <div style={{ marginLeft: "10px" }}>
      <p
        style={{
          color: "orangered",
          marginBottom: "3%",
          fontSize: "15px",
          fontWeight: "light",
          textDecoration: "none", // Remove underline
        }}
      >
        Explore All >
      </p>
    </div>
  )}
</div>

          </Link>

          <div className="slider-container">
            {/* <button onClick={handleBackwardClick}>&lt;</button> */}
            <div
              className="container"
              ref={containerRef}
              style={{ transform: `translateX(-${currentPosition}px)` }}
            >
              {moviesByGenre[genre.genre]?.map((movie, index) => (
                <Link to={`/movie/${movie.id}`} key={index}>
                  <div className="card">
                    <div className="img-box">
                      <img
                        src={`http://192.168.30.118:8800/${movie.image_path}`}
                        alt={movie.title}
                      />
                    </div>
                    <div className="content">
                      <h2 className="movie-title">{movie.title}</h2>
                      <p className="movie-desc">{movie.description}</p>
                      <button className="play-button">Play</button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {/* <button onClick={handleForwardClick}>&gt;</button> */}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Thumbnails;
