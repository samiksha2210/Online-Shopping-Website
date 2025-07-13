import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const emojis = ['🛒', '🎁', '📱', '❤️', '⭐', '📦', '🏷️', '💳', '📞', '💙'];

const MIN_DISTANCE = 8; 

function getDistance(pos1, pos2) {
  const dx = pos1.left - pos2.left;
  const dy = pos1.top - pos2.top;
  return Math.sqrt(dx * dx + dy * dy);
}

function generatePositions(count) {
  const positions = [];

  while (positions.length < count) {
    const candidate = {
      left: Math.random() * 90 + 5, 
      top: Math.random() * 90 + 5,
    };

   
    const tooClose = positions.some(
      (pos) => getDistance(pos, candidate) < MIN_DISTANCE
    );

    if (!tooClose) {
      positions.push(candidate);
    }
  }
  return positions;
}

const LandingPage = () => {
  const emojiCount = 30;

 
  const [emojiPositions, setEmojiPositions] = useState([]);

  useEffect(() => {
    const positions = generatePositions(emojiCount);
    setEmojiPositions(positions);
  }, []);

  return (
    <div className="landing-container">
      {emojiPositions.map((pos, index) => {
        const emoji = emojis[index % emojis.length];
        const size = 2.5 + Math.random() * 1.5; 
        const opacity = 0.9 + Math.random() * 0.1;

        return (
          <span
            key={index}
            className="emoji"
            style={{
              left: `${pos.left}%`,
              top: `${pos.top}%`,
              fontSize: `${size}rem`,
              opacity: opacity,
              animationDelay: `${Math.random() * 5}s`,
            }}
          >
            {emoji}
          </span>
        );
      })}

      <div className="landing-box">
        <h1 className="landing-title">
          🎉 Welcome to <strong>Hexcart</strong>!
        </h1>
        <p className="landing-subtitle">🛍️ Your one-stop shop for all your needs!</p>

        <div className="landing-links">
          <Link to="/signup">Sign Up</Link>
          <Link to="/login">User Login</Link>
          <Link to="/admin-login">Admin Login</Link>
        </div>

        <p className="landing-about">
          <strong>About Us</strong>
          <br />
          We offer the best products at great prices.
        </p>
        <p className="landing-contact">
          <strong>Contact</strong>
          <br />
          dhiksha2205@gmail.com or samiikkssha@gmail.com
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
