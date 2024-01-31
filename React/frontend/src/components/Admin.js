import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from './Admin.module.css';
import RealmLogo from './RealmLogo';

const AdminComponent = () => {
  const [movieTitles, setMovieTitles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMovieList, setShowMovieList] = useState(false);

  useEffect(() => {
    const fetchMovieTitles = async () => {
      try {
        const response = await axios.get('http://192.168.30.118:8800/movie-titles');

        if (response.data.success) {
          setMovieTitles(response.data.titles);
        } else {
          throw new Error('Failed to fetch movie titles');
        }
      } catch (error) {
        console.error('Error fetching movie titles:', error.message);
      }
    };

    fetchMovieTitles();
  }, []);

  // Filter movie titles based on the search term
  const filteredMovieTitles = movieTitles.filter(title =>
    title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <RealmLogo />

      <div className={styles.container}>
        <h2 className={styles.title}>Admin Panel</h2>

        {/* Display movie titles */}
        <div className={styles.buttonsContainer}>
          <Link to="/upload">
            <button className={styles.button}>Upload Movie</button>
          </Link>
          <button
            className={styles.button}
            onClick={() => setShowMovieList(!showMovieList)}
          >
            Movies List
          </button>
          <Link to="/logout">
            <button className={styles.button}>Logout</button>
          </Link>
        </div>
      </div>
      
      {showMovieList && (
        <div className={styles.movieTitlesContainer}>
        

          {/* Add a search input field */}
          <input
            type="text"
            placeholder="Search for a movie..."
            value={searchTerm}
            
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <ul className={styles.movieTitlesList}>
            {filteredMovieTitles.map((title, index) => (
              <li key={index}>{title}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdminComponent;
