// Updated WatchlistDisplay component
import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/authContext';
import styles from './Watchlist.module.css'; // Import your CSS file
import Nav from './Nav';

const WatchlistDisplay = () => {
  const { profileId } = useContext(AuthContext);
  const [watchlist, setWatchlist] = useState([]);

  useEffect(() => {
    if (profileId) {
      const fetchWatchlist = async () => {
        try {
          const response = await axios.get(`http://localhost:8800/watchlist/${profileId}`, {
            withCredentials: true,
          });

          if (response.data.success) {
            console.log('Watchlist Data:', response.data.watchlist); // Log the watchlist data
            setWatchlist(response.data.watchlist);
          } else {
            console.error('Failed to fetch watchlist:', response.data.message);
          }
        } catch (error) {
          console.error('Error:', error);
        }
      };

      fetchWatchlist();
    }
  }, [profileId]);

  const removeFromWatchlist = async (movieId) => {
    try {
      const response = await axios.delete(`http://localhost:8800/removeFromWatchlist/${profileId}/${movieId}`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setWatchlist(watchlist.filter((video) => video.movieId !== movieId));
        console.log('Removed from watchlist:', movieId);
      } else {
        console.error('Failed to remove from watchlist:', response.data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <Nav />

      <div className={styles.videocontainer}>
        <h2 className={styles.videoheader}>Watchlist Videos</h2>
        <div className={styles.videolist}>
          {watchlist.map((video) => (
            <div className={styles.videoitem} key={video.movieId}>
              <h3 className={styles.videotitle}>{video.uploadTitle}</h3>
              <div className={styles.videothumbnailcontainer}>
                <img className={styles.videothumbnail} src={`http://localhost:8800/${video.image_path}`} alt="Video Thumbnail" />
              </div>
              <button onClick={() => removeFromWatchlist(video.movieId)} className={styles.removeButton}>
                Remove 
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WatchlistDisplay;
