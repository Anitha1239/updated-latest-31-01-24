import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Plan2.module.css';

const Plan2 = () => {
  const proceedToPayment = (planName) => {
    // Redirect to the payment page or perform payment processing here
    alert('Proceeding to payment for ' + planName);
    // You can use window.location.href to redirect to a payment page.
  };

  return (
    <div className={styles.container}>
      <h1>Plan 2</h1>
      <div className={styles.cardsContainer}>
        {/* Plan 2 Card */}
        <div className={styles.planCard}>
          {/* Plan 2 content */}
          <h2>NEW PLAN</h2>
          <p>Telugu Annual Premium Plan</p>
          <p>Full HD (1080p) · Stereo · Telugu Movies & Web series · 1 Year</p>
          <div className={styles.planDetails}>
            <p className={styles.price}>INR 699 / year</p>
            <br />
           
            <Link to="/pay/699" className={styles.subscribeButton}>
              Proceed to Payment
            </Link>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Plan2;