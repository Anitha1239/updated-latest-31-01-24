import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";
import "./ChildThumbnails.css";

const ChildThumbnails = () => {
  const [genres, setGenres] = useState([]);
  const [childMoviesByGenre, setChildMoviesByGenre] = useState({});
  const [currentPosition, setCurrentPosition] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch genres
        const genresResponse = await axios.get("http://localhost:8800/genres");
        setGenres(genresResponse.data);

        // Fetch child-friendly movies
        const childMoviesResponse = await axios.get("http://localhost:8800/getChildFriendlyMovies");
        const childMovies = childMoviesResponse.data;

        // Group child movies by genre
        const moviesByGenreObject = {};
        genresResponse.data.forEach((genre) => {
          moviesByGenreObject[genre.genre] = childMovies.filter(movie => movie.genre_id === genre.id);
        });

        setChildMoviesByGenre(moviesByGenreObject);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

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

  return (
    <div>
      {genres.map((genre) => (
        <div key={genre.genre}>
         
          <h2 className="genretitle">{genre.genre}</h2>

          <div className="slider-container">
            <button onClick={handleBackwardClick}>&lt;</button>
            <div
              className="container"
              ref={containerRef}
              style={{ transform: `translateX(-${currentPosition}px)` }}
            >
              {childMoviesByGenre[genre.genre]?.map((movie, index) => (
                <NavLink to={`/movie/${movie.id}`} key={index}>
                  <div className="card">
                    <div className="img-box">
                      <img
                        src={`http://localhost:8800/${movie.image_path}`}
                        alt={movie.title}
                      />
                    </div>
                    <div className="content">
                      <h2>{movie.title}</h2>
                      <p>{movie.description}</p>
                    
                      <button className="play-button">Play</button>
                    </div>
                  </div>
                </NavLink>
              ))}
            </div>
            <button onClick={handleForwardClick}>&gt;</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChildThumbnails;
