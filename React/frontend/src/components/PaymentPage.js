import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import styles from './Pay.module.css';

const Payment = () => {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [amount, setAmount] = useState('');
  const { currentUser } = useContext(AuthContext);
  const [showMessage, setShowMessage] = useState(false);
  const { price } = useParams();

  useEffect(() => {
    setAmount(price);

    const loadRazorpayScript = () => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;

      script.onload = () => {
        console.log('Razorpay script loaded successfully');
        setScriptLoaded(true);
      };

      script.onerror = (error) => {
        console.error('Error loading Razorpay script:', error);
      };

      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    };

    const initializeRazorpay = () => {
      if (!window.Razorpay) {
        console.error('Razorpay script not loaded');
        return;
      }

      const options = {
        key: 'rzp_test_JtZCJ9mkNvIlPA',
        amount: amount * 100,
        currency: 'INR',
        name: 'Defenders',
        description: 'Test Transaction',
        image: 'https://example.com/your_logo',
        handler: function (response) {
          setShowMessage(true);
          savePaymentDetails(response);
          window.location.href = '/plans';
        },
        prefill: {
          name: 'deferences',
          email: 'realm@gmail.com',
          contact: '7997653497',
        },
        notes: {
          address: 'Razorpay Corporate Office',
        },
        theme: {
          color: '#3399cc',
        },
      };

      try {
        const rzp = new window.Razorpay(options);

        rzp.on('payment.failed', function (response) {
          console.error('Payment failed:', response.error);
        });

        document.getElementById('rzp-button1').onclick = function (e) {
          rzp.open();
          e.preventDefault();
        };

        console.log('Razorpay initialized successfully');
      } catch (error) {
        console.error('Error initializing Razorpay:', error);
      }
    };

    const cleanup = loadRazorpayScript();

    if (scriptLoaded) {
      initializeRazorpay();
    }

    return () => {
      cleanup();
    };
  }, [scriptLoaded, amount, price]);

  const savePaymentDetails = async (response) => {
    try {
      const timestamp = Date.now();
      console.log("User ID:", currentUser.id);

      const paymentData = {
        userId: currentUser.id,
        amount: amount,
        timestamp,
        // Add other relevant payment details here
      };

      await axios.post('http://192.168.30.118:8800/savePayment', paymentData, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Payment details saved successfully');
    } catch (error) {
      console.error('Error saving payment details:', error);
    }
  };

  const displayMessage = () => {
    return showMessage && (
      <div className={styles.messageContainer}>
        Please do not refresh the page or go back.
      </div>
    );
  };

  return (
    <div className={styles.payContainer}>
     
      <h1 className={styles.payHeader}>Secure Payment</h1>
      <div className={styles.formGroup}>
        <label htmlFor="amount" className={styles.label}>
          Amount
        </label>
        <input
          type="text"
          id="amount"
          name="amount"
          placeholder="Enter Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={styles.inputField}
        />
      </div>
      <button id="rzp-button1" className={styles.payButton}>
        Pay with Razorpay
      </button>
      {displayMessage()}
    </div>
  );
};

export default Payment;
