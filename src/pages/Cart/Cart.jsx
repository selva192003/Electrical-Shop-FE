import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CartItem from '../../components/CartItem/CartItem.jsx';
import Spinner from '../../components/Spinner/Spinner.jsx';
import { fetchCart, updateCartItemQty, removeCartItemAsync, selectCartTotal } from '../../redux/slices/cartSlice.js';
import { useToast } from '../../components/Toast/ToastProvider.jsx';
import './Cart.css';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { items, loading } = useSelector((state) => state.cart);
  const total = useSelector(selectCartTotal);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleQtyChange = async (item, quantity) => {
    try {
      await dispatch(updateCartItemQty({ itemId: item._id, quantity })).unwrap();
    } catch (err) {
      addToast(err || 'Could not update cart', 'error');
    }
  };

  const handleRemove = async (item) => {
    try {
      await dispatch(removeCartItemAsync(item._id)).unwrap();
      addToast('Item removed', 'info');
    } catch (err) {
      addToast(err || 'Could not remove item', 'error');
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      addToast('Your cart is empty', 'info');
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="page-container cart-page">
      <h1 className="page-title">Your Cart</h1>
      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="cart-layout">
          <div className="cart-list card">
            {items.map((item) => (
              <CartItem key={item._id} item={item} onQuantityChange={handleQtyChange} onRemove={handleRemove} />
            ))}
          </div>
          <div className="cart-summary card">
            <h2>Summary</h2>
            <p>
              Items: <strong>{items.length}</strong>
            </p>
            <p>
              Total: <strong>₹{total.toFixed(2)}</strong>
            </p>
            <button type="button" className="accent-btn cart-checkout-btn" onClick={handleCheckout}>
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
