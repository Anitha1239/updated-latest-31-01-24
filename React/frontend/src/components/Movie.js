import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate,Link } from 'react-router-dom';
import './Movie.css';
import { AuthContext } from '../context/authContext';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import RealmLogo from "./RealmLogo";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const Movie = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profileId,currentUser } = useContext(AuthContext);

  const [movieData, setMovieData] = useState({
    backgroundImage: '',
    title: 'Title:',
    description: 'Description:',
    imagePath: '',
    videoPath: '',
  });
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [addingToWatchlist, setAddingToWatchlist] = useState(false);
  const [addedMessage, setAddedMessage] = useState('');



  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        const response = await axios.get(`http://192.168.30.118:8800/getMovieDetails/${id}`, {
          withCredentials: true,
        });
        const data = response.data;

        if (data && data.length > 0) {
          const movie = data[0];
          setMovieData({
            backgroundImage: `http://192.168.30.118:8800/${movie.image_path}`,
            title: `Title: ${movie.title}`,
            description: `Description: ${movie.description}`,
            imagePath: `http://192.168.30.118:8800/${movie.image_path}`,
            videoPath: movie.video_path,
          });
        } else {
          console.error('Empty or invalid data received from the API.');
        }
      } catch (error) {
        console.error('Error fetching movie data:', error);
      }
    };

    fetchMovieData();
  }, [id]);

  useEffect(() => {
    const checkWatchlist = async () => {
      try {
        const response = await axios.get(`http://192.168.30.118:8800/isInWatchlist/${profileId}/${id}`, {
          withCredentials: true,
        });
        setIsInWatchlist(response.data.isInWatchlist);
      } catch (error) {
        console.error('Error checking watchlist:', error);
      }
    };

    checkWatchlist();
  }, [id, profileId]);

  const handlePlayButtonClick = () => {
    // navigate(`/video/${encodeURIComponent(movieData.videoPath)}`);
    navigate('/plans');
  };

  const handleToggleWatchlist = async () => {
    try {
      if (!isInWatchlist && !addingToWatchlist) {
        setAddingToWatchlist(true);
        await axios.post(`http://192.168.30.118:8800/addToWatchlist/${profileId}`, {
          movieId: id,
          title: movieData.title.split(': ')[1],
        }, {
          withCredentials: true,
        });
        setIsInWatchlist(true);
        setAddingToWatchlist(false);
        setAddedMessage('Added to watchlist');
        setTimeout(() => {
          setAddedMessage('');
        }, 3000);
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error.response);
      setAddingToWatchlist(false);
    }
  };
 

  return (
    <div className="movie-container">
        <Link className="logo" to="/home"><RealmLogo /></Link>
      <div className='movie-gradient-overlay'>
        <div className="movie-background-image" style={{ backgroundImage: `url(${movieData.backgroundImage})` }}>
          <div className="movie-info-container">
            <h1 className="movie-title">{movieData.title}</h1>
            <p className="movie-description">{movieData.description}</p>
          </div>
          <div className="movie-image-container">
            <img className="movie-image" src={movieData.imagePath} alt={movieData.title} />
          </div>
         
   

          <button className="movie-play-button" onClick={handlePlayButtonClick}>
            <PlayCircleOutlineIcon />
          </button>
          <button className="movie-watchlist-button" onClick={handleToggleWatchlist}>
            {addingToWatchlist ? (
              <span>Adding...</span>
            ) : (
              <AddCircleOutlineIcon />
            )}
          </button>
          {addedMessage && <p className="added-message">{addedMessage}</p>}
        </div>
      </div>
    </div>
  );
};

export default Movie;
