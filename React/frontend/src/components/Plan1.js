import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Plan1.module.css';


const Plan1 = () => {
  return (
    <div className={styles.container}>
      <h1>Plan 1</h1>
      <div className={styles.cardsContainer}>
        {/* Plan 1 Card */}
        <div className={styles.planCard}>
          {/* Plan 1 content */}
          <h2>RECOMMENDED</h2>
          <p>4K · Dolby 5.1 · Telugu + Tamil Movies & Web series · 1 Year</p>
          <div className={styles.planDetails}>
            <p className={styles.price}>INR 899 / year </p>
            <br />
            <Link to={{ pathname: "/pay/899", state: { planAmount: 899 } }} className={styles.subscribeButton}>
              Proceed to Payment
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plan1;
