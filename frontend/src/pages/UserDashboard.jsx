import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import OrderSummary from './OrderSummary';
import './UserDashboard.css';

function UserDashboard() {
  const [allProducts, setAllProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [quantities, setQuantities] = useState({});
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const email = localStorage.getItem('user');
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/user/products')
      .then(res => {
        setAllProducts(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        setAllProducts([]);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleQuantityChange = (id, qty) => {
    setQuantities(prev => ({ ...prev, [id]: qty }));
  };

  const addToCart = (id) => {
    const quantity = parseInt(quantities[id] || 1);
    API.post('/user/cart', { email, product_id: id, quantity }).then(() => {
      alert('Added to cart!');
      setQuantities(prev => ({ ...prev, [id]: 1 }));
    });
  };

  const loadCart = () => {
    API.get(`/user/cart/${email}`).then(res => {
      setCart(res.data);
      setShowCart(true);
    });
  };

  const confirmOrder = () => {
    API.post('/user/place-order', { email })
      .then(res => {
        alert(`Order placed successfully! Order ID: ${res.data.order_id}`);
        const orderSummaryData = {
          order_id: res.data.order_id,
          date: new Date().toLocaleString(),
          items: cart.map(item => {
            const product = allProducts.find(p => p.ID === item.product_id);
            return {
              name: product?.name || 'Unknown Product',
              quantity: item.quantity,
              price: (product?.price || 0) * item.quantity,
              image: product?.image || null,
            };
          }),
          total_price: cart.reduce((acc, item) => {
            const product = allProducts.find(p => p.ID === item.product_id);
            return acc + (product ? product.price * item.quantity : 0);
          }, 0)
        };
        setOrderDetails(orderSummaryData);
        setCart([]);
        setShowCart(false);
      })
      .catch(err => {
        alert(err.response?.data?.error || 'Order failed');
      });
  };

  const removeFromCart = (product_id) => {
    API.post('/user/cart/remove', { email, product_id }).then(() => loadCart());
  };

  const getProductById = (productId) => {
    return allProducts.find(p => p.ID === parseInt(productId));
  };

  const filteredProducts = Array.isArray(allProducts)
    ? allProducts.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const backToDashboard = () => setOrderDetails(null);

  const fallbackImage = 'https://via.placeholder.com/180?text=No+Image';

  if (orderDetails) {
    return <OrderSummary orderDetails={orderDetails} onBack={backToDashboard} />;
  }

  return (
    <div className="user-dashboard-container">
      <div className="user-dashboard-header">
        <h2>Welcome To Hexcart!</h2>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      <div className="search-actions">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={loadCart}>View Cart</button>
        <button onClick={() => navigate('/user/orders')}>View Previous Orders</button>
      </div>

      {!showCart && (
        <div className="products-grid">
          {filteredProducts.length === 0 ? (
            <p>No products found.</p>
          ) : (
            filteredProducts.map(p => (
              <div className="product-card" key={p.ID}>
                <img
                  className="product-image"
                  src={p.image ? `http://localhost:5000/static/images/${p.image}` : fallbackImage}
                  alt={p.name}
                />
                <div className="product-name">{p.name}</div>
                <div className="product-price-stock">₹{p.price} | Stock: {p.stock}</div>
                <div className="product-qty-add">
                  <input
                    type="number"
                    min="1"
                    max={p.stock}
                    value={quantities[p.ID] || 1}
                    onChange={(e) => handleQuantityChange(p.ID, e.target.value)}
                  />
                  <button onClick={() => addToCart(p.ID)}>Add to Cart</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showCart && (
        <div className="cart-container">
          <h3>Your Cart</h3>
          {cart.length === 0 ? (
            <center>
            <p>Cart is empty</p>
            </center>
          ) : (
            <ul className="cart-list">
              {cart.map((item, i) => {
                const product = getProductById(item.product_id);
                return (
                  <li key={i} className="cart-item">
                    <img
                      src={product?.image ? `http://localhost:5000/static/images/${product.image}` : fallbackImage}
                      alt={product?.name || 'Unknown Product'}
                    />
                    <span className="cart-item-info">
                      {product?.name || 'Unknown Product'} — Quantity: {item.quantity}
                    </span>
                    <button onClick={() => removeFromCart(item.product_id)}>Remove</button>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="cart-buttons">
            <button onClick={confirmOrder}>Confirm Order</button>
            <button onClick={() => setShowCart(false)}>Back to Dashboard</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDashboard;
