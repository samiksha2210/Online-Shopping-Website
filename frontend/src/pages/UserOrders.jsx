import React, { useEffect, useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';
import './UserOrders.css';

function UserOrders() {
  const [orders, setOrders] = useState([]);
  const email = localStorage.getItem('user');
  const navigate = useNavigate();

  useEffect(() => {
    API.get(`/user/orders/${email}`)
      .then(res => setOrders(res.data))
      .catch(() => alert('Failed to fetch orders.'));
  }, [email]);

  return (
    <div className="user-orders-container">
      <h2>Previous Orders</h2>
      {orders.length === 0 ? (
        <p>No previous orders found.</p>
      ) : (
        <ul className="orders-list">
          {orders.map((order, i) => (
            <li key={i} className="order-card">
              <div className="order-detail">
                <strong>Order ID:</strong> <span>{order.order_id}</span>
              </div>
              <div className="order-detail">
                <strong>Total:</strong> <span>₹{order.amount}</span>
              </div>
              <div className="order-detail">
                <strong>Date:</strong> <span>{order.date}</span>
              </div>
              <hr className="order-separator" />
            </li>
          ))}
        </ul>
      )}
      <button className="back-button" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
    </div>
  );
}

export default UserOrders;

