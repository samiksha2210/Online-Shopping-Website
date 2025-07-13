import React from 'react';
import './OrderSummary.css';

function OrderSummary({ orderDetails, onBack }) {
  if (!orderDetails) return null;

  return (
    <div className="order-summary-container">
      <h2>Order Summary</h2>
      <p className="order-info"><strong>Order ID:</strong> {orderDetails.order_id}</p>
      <p className="order-info"><strong>Date:</strong> {orderDetails.date}</p>

      <h3>Items:</h3>
      <ul className="items-list">
        {orderDetails.items.map((item, index) => (
          <li key={index}>
            <span>{item.name}</span>
            <span>Quantity: {item.quantity}</span>
            <span>Price: ₹{item.price}</span>
          </li>
        ))}
      </ul>

      <h3 className="total-price">Total Price: ₹{orderDetails.total_price}</h3>

      <button className="back-button" onClick={onBack}>Back to Dashboard</button>
    </div>
  );
}

export default OrderSummary;
