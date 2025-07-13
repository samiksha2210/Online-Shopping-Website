import React, { useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleAdminLogin = async () => {
    try {
      await API.post('/auth/login', { email, password, admin: true });
      localStorage.setItem('admin', email);
      navigate('/admin-dashboard');
    } catch (err) {
      alert('Invalid admin credentials');
    }
  };

  return (
  <div className="admin-login-container">
    <div className="admin-login-box">
      <h2>Admin Login</h2>
      <input
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button onClick={handleAdminLogin}>Login</button>
    </div>
  </div>
);

}

export default AdminLogin;
