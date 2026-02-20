import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAdminProducts,
  fetchAdminCategories,
  deleteAdminProduct,
  createAdminProduct,
  updateAdminProduct,
} from '../../redux/slices/adminSlice.js';
import { useToast } from '../../components/Toast/ToastProvider.jsx';
import Spinner from '../../components/Spinner/Spinner.jsx';
import './AdminCommon.css';
import './AdminProducts.css';

const EMPTY_FORM = { name: '', description: '', price: '', brand: '', stock: '', category: '', featured: false };

const AdminProducts = () => {
  const dispatch = useDispatch();
  const { products, productsLoading, categories } = useSelector((s) => s.admin);
  const { addToast } = useToast();

  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false); // 'add' | 'edit' | false
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    dispatch(fetchAdminProducts());
    dispatch(fetchAdminCategories());
  }, [dispatch]);

  const filtered = (products || []).filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.brand?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm(EMPTY_FORM); setEditTarget(null); setImageFile(null); setModal('add'); };
  const openEdit = (p) => {
    setForm({ name: p.name, description: p.description || '', price: p.price, brand: p.brand || '', stock: p.stock, category: p.category?._id || p.category || '', featured: !!p.featured || !!p.isFeatured });
    setEditTarget(p);
    setImageFile(null);
    setModal('edit');
  };
  const closeModal = () => { setModal(false); setForm(EMPTY_FORM); setEditTarget(null); };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (typeof v === 'boolean') fd.append(k, v ? 'true' : 'false');
        else fd.append(k, v);
      });
      if (imageFile) fd.append('images', imageFile);
      if (modal === 'add') {
        await dispatch(createAdminProduct(fd)).unwrap();
        addToast('Product created successfully', 'success');
      } else {
        await dispatch(updateAdminProduct({ id: editTarget._id, data: fd })).unwrap();
        addToast('Product updated successfully', 'success');
      }
      closeModal();
      dispatch(fetchAdminProducts());
    } catch (err) {
      addToast(typeof err === 'string' ? err : (err?.message || 'Failed to save product'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await dispatch(deleteAdminProduct(id));
    dispatch(fetchAdminProducts());
  };

  const stockBadge = (stock) => {
    if (stock === 0) return <span className="adp-badge adp-badge--out">Out</span>;
    if (stock < 10) return <span className="adp-badge adp-badge--low">{stock} left</span>;
    return <span className="adp-badge adp-badge--ok">{stock}</span>;
  };

  return (
    <div className="adp">
      {/* Header */}
      <div className="adp-header">
        <div>
          <h1 className="adp-title">Products</h1>
          <p className="adp-subtitle">{filtered.length} product{filtered.length !== 1 ? 's' : ''} found</p>
        </div>
        <button className="adp-add-btn" onClick={openAdd}>+ Add Product</button>
      </div>

      {/* Search */}
      <input
        className="adp-search"
        placeholder="Search by name or brand…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Table */}
      {productsLoading ? (
        <Spinner />
      ) : (
        <div className="adp-table-wrap">
          <table className="adp-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Brand</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="adp-empty">No products found</td></tr>
              ) : filtered.map((p) => (
                <tr key={p._id}>
                  <td>
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.name} className="adp-thumb" />
                    ) : <div className="adp-thumb adp-thumb--empty">📷</div>}
                  </td>
                  <td className="adp-name">{p.name}</td>
                  <td className="adp-muted">{p.brand}</td>
                  <td>₹{Number(p.price).toLocaleString('en-IN')}</td>
                  <td>{stockBadge(p.stock)}</td>
                  <td>{p.isFeatured ? <span className="adp-badge adp-badge--feat">Yes</span> : <span className="adp-badge adp-badge--no">No</span>}</td>
                  <td>
                    <button className="adp-btn adp-btn--edit" onClick={() => openEdit(p)}>Edit</button>
                    <button className="adp-btn adp-btn--del" onClick={() => handleDelete(p._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="adp-overlay" onClick={closeModal}>
          <div className="adp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="adp-modal-header">
              <h2>{modal === 'add' ? 'Add Product' : 'Edit Product'}</h2>
              <button className="adp-modal-close" onClick={closeModal}>✕</button>
            </div>
            <form className="adp-form" onSubmit={handleSubmit}>
              <label className="adp-label">Name *
                <input name="name" value={form.name} onChange={handleChange} required className="adp-input" />
              </label>
              <label className="adp-label">Description
                <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="adp-input adp-textarea" />
              </label>
              <label className="adp-label">Category *
                <select name="category" value={form.category} onChange={handleChange} required className="adp-input">
                  <option value="">— Select category —</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </label>
              <div className="adp-row">
                <label className="adp-label">Price (₹) *
                  <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} required className="adp-input" />
                </label>
                <label className="adp-label">Brand *
                  <input name="brand" value={form.brand} onChange={handleChange} required className="adp-input" />
                </label>
              </div>
              <div className="adp-row">
                <label className="adp-label">Stock *
                  <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} required className="adp-input" />
                </label>
                <label className="adp-label adp-label--check">
                  <input name="featured" type="checkbox" checked={form.featured} onChange={handleChange} /> Featured product
                </label>
              </div>
              <label className="adp-label">Image
                <input type="file" accept="image/*" ref={fileRef} onChange={(e) => setImageFile(e.target.files[0])} className="adp-input" />
                {imageFile && <span className="adp-muted">{imageFile.name}</span>}
              </label>
              <div className="adp-modal-actions">
                <button type="button" className="adp-btn adp-btn--cancel" onClick={closeModal}>Cancel</button>
                <button type="submit" className="adp-btn adp-btn--save" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
