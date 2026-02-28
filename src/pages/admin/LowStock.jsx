import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchLowStockProducts } from '../../redux/slices/adminSlice.js';
import Spinner from '../../components/Spinner/Spinner.jsx';
import './AdminCommon.css';
import './LowStock.css';

const AdminLowStock = () => {
  const dispatch = useDispatch();
  const { lowStockProducts, lowStockLoading } = useSelector((s) => s.admin);

  useEffect(() => {
    dispatch(fetchLowStockProducts());
  }, [dispatch]);

  return (
    <div className="admin-page als-page">
      {/* Header */}
      <div className="als-header">
        <Link to="/admin/dashboard" className="als-back-btn">
          <span className="material-icons">arrow_back</span>
          Back to Dashboard
        </Link>
        <div className="als-title-row">
          <span className="material-icons als-title-icon">inventory</span>
          <div>
            <h1 className="als-title">Low Stock Products</h1>
            <p className="als-subtitle">Products with 5 or fewer units remaining</p>
          </div>
        </div>
      </div>

      {/* Content */}
      {lowStockLoading ? (
        <div className="als-loading"><Spinner /></div>
      ) : lowStockProducts.length === 0 ? (
        <div className="als-empty">
          <span className="material-icons als-empty-icon">check_circle</span>
          <p className="als-empty-title">All Stocked Up!</p>
          <p className="als-empty-sub">No products are running low on stock right now.</p>
        </div>
      ) : (
        <div className="als-card">
          <div className="als-count-row">
            <span className="als-count-badge">
              <span className="material-icons">warning</span>
              {lowStockProducts.length} item{lowStockProducts.length !== 1 ? 's' : ''} low on stock
            </span>
          </div>
          <div className="als-table-wrap">
            <table className="als-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Brand</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map((p) => (
                  <tr key={p._id} className={p.stock === 1 ? 'als-row--critical' : p.stock <= 3 ? 'als-row--warn' : ''}>
                    <td>
                      <div className="als-product-cell">
                        {p.images?.[0] && (
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="als-product-img"
                          />
                        )}
                        <span className="als-product-name">{p.name}</span>
                      </div>
                    </td>
                    <td>{p.brand || '—'}</td>
                    <td>{p.category?.name || '—'}</td>
                    <td>₹{(p.price || 0).toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`als-stock-badge ${
                        p.stock === 1 ? 'als-stock-badge--critical' :
                        p.stock <= 3 ? 'als-stock-badge--warn' :
                        'als-stock-badge--low'
                      }`}>
                        <span className="material-icons">inventory_2</span>
                        {p.stock} left
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLowStock;
