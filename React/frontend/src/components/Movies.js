import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import Nav from "./Nav";

import "./Nav.css";

import styles from "./MoviesPage.module.css"; // Import the MoviesPage.css file for styles
import { FaSearch, FaMicrophone, FaTimes } from "react-icons/fa";

const MoviesPage = () => {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);

  const imageSrc =
    "https://images.yourstory.com/cs/2/96eabe90392211eb93f18319e8c07a74/Image5mxv-1689948556123.jpg?w=1152&fm=auto&ar=2:1&mode=crop&crop=faces";
  const videoSrc = "Videos/U-Turn.mp4";

  useEffect(() => {
    fetch("http://localhost:8800/getMovieDetailsSearch")
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Failed to fetch movie details");
        }
      })
      .then((data) => {
        setMovies(data);
        setFilteredMovies(data); // Initially, set filteredMovies to all movies
      })
      .catch((error) => {
        console.error("Error fetching movie details:", error);
        // Handle error state or log the error message
      });
  }, []);

  return (
    <div className={styles.movies2}>
      <header>
        <Nav />
      </header>
  

  
      <div className={styles.movies2Container}>
        {/* Display filtered movies with proper order and hover effect */}
        
          <div className={styles.movies2Grid}>
            {filteredMovies.map((movie, index) => (
             <NavLink to={`/movie/${movie.id}`} key={index} className={styles.movies2card}>
                <div className={styles.movies2imgbox}>
                  <img
                    src={`http://localhost:8800/${movie.image_path}`}
                    alt={movie.title}
                  />
                </div>
                <div className={styles.movies2content}>
                  <h2>{movie.title}</h2>
                </div>
              </NavLink>
            ))}
          </div>
        
      </div>
    </div>
  );
};

export default MoviesPage;