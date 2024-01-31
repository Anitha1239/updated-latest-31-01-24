// PinPage.js

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams,Link } from 'react-router-dom';
import styles from './PinPage.module.css'; // Import the module CSS file
import { AuthContext } from '../context/authContext.js';
import RealmLogo from './RealmLogo';

const PinPage = () => {
  const navigate = useNavigate();
  const { profileId } = useParams();
  const [pinInputs, setPinInputs] = useState(['', '', '', '']);
  const [profileDetails, setProfileDetails] = useState(null);
  const { currentProfile } = useContext(AuthContext);

  useEffect(() => {
    const fetchProfileDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8800/profiles/${profileId}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile details');
        }

        const data = await response.json();
        if (data.success) {
          setProfileDetails(data.profile);
        } else {
          throw new Error('Failed to fetch profile details');
        }
      } catch (error) {
        console.error('Error in fetchProfileDetails:', error.message);
      }
    };

    fetchProfileDetails();
  }, [profileId]);

  const handlePinInputChange = (index, value) => {
    const newPinInputs = [...pinInputs];
    newPinInputs[index] = value;

    if (index < 3 && value !== '') {
      // Move focus to the next input box
      document.getElementById(`pin-input-${index + 1}`).focus();
    }

    setPinInputs(newPinInputs);
  };

  const handlePinValidation = async (isChildProfile) => {
    const enteredPin = pinInputs.join('');
    if (profileDetails && enteredPin === profileDetails.pin) {
      console.log('Correct PIN entered');
      await currentProfile(profileId);
      const redirectTo = isChildProfile ? '/ChildHome' : '/home';
      navigate(redirectTo);
    } else {
      console.log('Incorrect PIN or no PIN found');
    }
  };

  
  

  return (
    <div>
     <Link to="/profiles"><RealmLogo /></Link> 

      <div className={styles['pin-page-container']}>
        <h2 className={styles.h2}>Enter PIN for {profileDetails && profileDetails.name}</h2>
        <div className={styles['pin-input-container']}>
          {pinInputs.map((value, index) => (
            <input
              key={index}
              id={`pin-input-${index}`}
              type="text"
              maxLength="1"
              value={value}
              onChange={(e) => handlePinInputChange(index, e.target.value)}
              className={styles['pin-input']}
            />
          ))}
        </div>
        <button onClick={handlePinValidation} className={styles['pin-button']}>
          Submit
        </button>
      </div>
    </div>
  );
};

export default PinPage;