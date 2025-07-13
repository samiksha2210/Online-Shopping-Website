import React, { useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';
import './Signup.css';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await API.post('/auth/signup', { email, password });
      alert('Signup successful!');
      navigate('/login');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        alert(err.response.data.error);
      } else {
        alert('Signup failed: ' + err.message);
      }
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2>User Signup</h2>
        <form onSubmit={handleSignup} className="signup-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={!email || !password}>
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
