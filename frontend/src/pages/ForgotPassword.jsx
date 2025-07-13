import React, { useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';
import './ForgotPassword.css';  

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSendCode = async () => {
    try {
      await API.post('/auth/forgot-password', { email });
      setMessage('Reset code sent! Check your email.');
     
      setTimeout(() => navigate('/reset-password'), 2000);
    } catch (err) {
      setMessage('Error sending reset code. Try again.');
    }
  };

  return (
    <div className="forgot-reset-container">
      <div className="forgot-reset-box">
        <h2>Forgot Password</h2>
        <input
          type="email"
          placeholder="Enter your registered email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button onClick={handleSendCode} disabled={!email}>
          Send Reset Code
        </button>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
}

export default ForgotPassword;