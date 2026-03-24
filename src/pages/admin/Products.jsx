import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAdminProducts,
  fetchAdminCategories,
  deleteAdminProduct,
  createAdminProduct,
  updateAdminProduct,
  createAdminCategory,
  generateProductDescription,
} from '../../redux/slices/adminSlice.js';
import { useToast } from '../../components/Toast/ToastProvider.jsx';
import Spinner from '../../components/Spinner/Spinner.jsx';
import './AdminCommon.css';
import './AdminProducts.css';

const toSlug = (str) => str.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

const EMPTY_FORM = {
  name: '', description: '', price: '', brand: '', stock: '',
  category: '',
  specs: [{ key: '', value: '' }],
  variants: [],
};

const EMPTY_CAT = { name: '', slug: '', description: '' };

const AdminProducts = () => {
  const dispatch = useDispatch();
  const { products, productsLoading, categories } = useSelector((s) => s.admin);
  const { addToast } = useToast();

  const [search, setSearch]       = useState('');
  const [modal, setModal]         = useState(false); // 'add' | 'edit' | false
  const [catModal, setCatModal]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [catForm, setCatForm]     = useState(EMPTY_CAT);
  const [imageFiles, setImageFiles] = useState([]);
  const [saving, setSaving]       = useState(false);
  const [savingCat, setSavingCat] = useState(false);
  const [generating, setGenerating] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    dispatch(fetchAdminProducts());
    dispatch(fetchAdminCategories());
  }, [dispatch]);

  const filtered = (products || []).filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.brand?.toLowerCase().includes(search.toLowerCase())
  );

  /* ── Product modal helpers ── */
  const openAdd = () => { setForm(EMPTY_FORM); setEditTarget(null); setImageFiles([]); setModal('add'); };
  const openEdit = (p) => {
    // Convert specifications Map → [{key, value}] array for the form
    let specs = [{ key: '', value: '' }];
    if (p.specifications && typeof p.specifications === 'object') {
      const entries = Object.entries(p.specifications);
      if (entries.length > 0) specs = entries.map(([key, value]) => ({ key, value }));
    }
    setForm({
      name: p.name,
      description: p.description || '',
      price: p.price,
      brand: p.brand || '',
      stock: p.stock,
      category: p.category?._id || p.category || '',
      specs,
      variants: p.variants?.length ? p.variants.map((v) => ({ watt: v.watt || '', voltage: v.voltage || '', brand: v.brand || '' })) : [],
    });
    setEditTarget(p);
    setImageFiles([]);
    setModal('edit');
  };
  const closeModal = () => { setModal(false); setForm(EMPTY_FORM); setEditTarget(null); };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  /* ── Spec helpers ── */
  const addSpec    = () => setForm((f) => ({ ...f, specs: [...f.specs, { key: '', value: '' }] }));
  const removeSpec = (i) => setForm((f) => ({ ...f, specs: f.specs.filter((_, idx) => idx !== i) }));
  const updateSpec = (i, field, val) =>
    setForm((f) => ({ ...f, specs: f.specs.map((s, idx) => idx === i ? { ...s, [field]: val } : s) }));

  /* ── Variant helpers ── */
  const addVariant    = () => setForm((f) => ({ ...f, variants: [...f.variants, { watt: '', voltage: '', brand: '' }] }));
  const removeVariant = (i) => setForm((f) => ({ ...f, variants: f.variants.filter((_, idx) => idx !== i) }));
  const updateVariant = (i, field, val) =>
    setForm((f) => ({ ...f, variants: f.variants.map((v, idx) => idx === i ? { ...v, [field]: val } : v) }));

  /* ── AI description generator ── */
  const handleGenerate = async () => {
    if (!form.name) { addToast('Enter a product name first', 'error'); return; }
    setGenerating(true);
    try {
      const specsObj = {};
      form.specs.forEach(({ key, value }) => { if (key.trim()) specsObj[key.trim()] = value.trim(); });
      const catName = (categories || []).find((c) => c._id === form.category)?.name || '';
      const description = await dispatch(generateProductDescription({
        name: form.name, brand: form.brand, category: catName,
        specs: specsObj, price: form.price, stock: form.stock,
      })).unwrap();
      // Strip markdown bold markers for plain textarea
      setForm((f) => ({ ...f, description: description.replace(/\*\*(.*?)\*\*/g, '$1') }));
      addToast('Description generated!', 'success');
    } catch (err) {
      addToast(err?.message || 'Generation failed', 'error');
    } finally {
      setGenerating(false);
    }
  };

  /* ── Product submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name',        form.name);
      fd.append('description', form.description);
      fd.append('price',       form.price);
      fd.append('brand',       form.brand);
      fd.append('stock',       form.stock);
      fd.append('category',   form.category);

      // Specifications: [{key,value}] → JSON object
      const specsObj = {};
      form.specs.forEach(({ key, value }) => { if (key.trim()) specsObj[key.trim()] = value.trim(); });
      fd.append('specifications', JSON.stringify(specsObj));

      // Variants: only include rows with at least one field filled
      const validVariants = form.variants.filter((v) => v.watt || v.voltage || v.brand);
      fd.append('variants', JSON.stringify(validVariants));

      // Images (multiple)
      imageFiles.forEach((file) => fd.append('images', file));

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

  /* ── Category modal ── */
  const openCatModal  = () => { setCatForm(EMPTY_CAT); setCatModal(true); };
  const closeCatModal = () => setCatModal(false);

  const handleCatNameChange = (e) => {
    const name = e.target.value;
    setCatForm((f) => ({ ...f, name, slug: toSlug(name) }));
  };

  const handleCatSubmit = async (e) => {
    e.preventDefault();
    setSavingCat(true);
    try {
      await dispatch(createAdminCategory(catForm)).unwrap();
      addToast('Category created', 'success');
      dispatch(fetchAdminCategories());
      closeCatModal();
    } catch (err) {
      addToast(typeof err === 'string' ? err : (err?.message || 'Failed to create category'), 'error');
    } finally {
      setSavingCat(false);
    }
  };

  /* ── Stock badge ── */
  const stockBadge = (stock) => {
    if (stock === 0)   return <span className="adp-badge adp-badge--out">Out</span>;
    if (stock < 10)    return <span className="adp-badge adp-badge--low">{stock} left</span>;
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
        <div className="adp-header-actions">
          <button className="adp-add-btn adp-add-btn--sec" onClick={openCatModal}>+ New Category</button>
          <button className="adp-add-btn" onClick={openAdd}>+ Add Product</button>
        </div>
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
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
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
                      <img src={p.images[0]?.url || p.images[0]} alt={p.name} className="adp-thumb" />
                    ) : <div className="adp-thumb adp-thumb--empty"><span className="material-icons" style={{fontSize:'1.2rem',color:'#9ca3af'}}>photo_camera</span></div>}
                  </td>
                  <td className="adp-name">{p.name}</td>
                  <td className="adp-muted">{p.brand}</td>
                  <td className="adp-muted">{p.category?.name || '—'}</td>
                  <td>₹{Number(p.price).toLocaleString('en-IN')}</td>
                  <td>{stockBadge(p.stock)}</td>
                  <td className="adp-actions-cell">
                    <button className="adp-icon-btn adp-icon-btn--edit" onClick={() => openEdit(p)} title="Edit">
                      <span className="material-icons">edit</span>
                    </button>
                    <button className="adp-icon-btn adp-icon-btn--del" onClick={() => handleDelete(p._id)} title="Delete">
                      <span className="material-icons">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Product Modal ── */}
      {modal && (
        <div className="adp-overlay" onClick={closeModal}>
          <div className="adp-modal adp-modal--lg" onClick={(e) => e.stopPropagation()}>
            <div className="adp-modal-header">
              <h2>{modal === 'add' ? 'Add Product' : 'Edit Product'}</h2>
              <button className="adp-modal-close" onClick={closeModal}>✕</button>
            </div>
            <form className="adp-form" onSubmit={handleSubmit}>

              {/* ── Basic Information ── */}
              <p className="adp-section-title">Basic Information</p>
              <label className="adp-label">Product Name *
                <input name="name" value={form.name} onChange={handleChange} required className="adp-input" placeholder="e.g. LED Bulb 9W" />
              </label>
              <div className="adp-desc-header">
                <span className="adp-label" style={{ flex: 1 }}>Description *</span>
                <button
                  type="button"
                  className="adp-ai-btn"
                  onClick={handleGenerate}
                  disabled={generating}
                  title="Auto-generate description from product details"
                >
                  {generating ? <><span className="material-icons" style={{fontSize:'0.9em'}}>hourglass_empty</span> Generating…</> : <><span className="material-icons" style={{fontSize:'0.9em'}}>auto_awesome</span> AI Generate</>}
                </button>
              </div>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} required className="adp-input adp-textarea" placeholder="Describe the product, or click AI Generate above…" />

              {/* ── Pricing & Inventory ── */}
              <p className="adp-section-title">Pricing & Inventory</p>
              <div className="adp-row">
                <label className="adp-label">Price (₹) *
                  <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} required className="adp-input" placeholder="0.00" />
                </label>
                <label className="adp-label">Stock Quantity *
                  <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} required className="adp-input" placeholder="0" />
                </label>
              </div>
              {/* ── Classification ── */}
              <p className="adp-section-title">Classification</p>
              <div className="adp-row">
                <label className="adp-label">Brand *
                  <input name="brand" value={form.brand} onChange={handleChange} required className="adp-input" placeholder="e.g. Philips" />
                </label>
                <label className="adp-label">Category *
                  <select name="category" value={form.category} onChange={handleChange} required className="adp-input">
                    <option value="">— Select category —</option>
                    {(categories || []).map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </label>
              </div>
              {/* ── Specifications ── */}
              <div className="adp-section-header">
                <p className="adp-section-title">Specifications</p>
                <button type="button" className="adp-btn-inline" onClick={addSpec}>+ Add Row</button>
              </div>
              <p className="adp-hint">Add technical details like Wattage, Voltage, Material, etc.</p>
              {form.specs.map((s, i) => (
                <div key={i} className="adp-kv-row">
                  <input
                    className="adp-input adp-kv-key"
                    placeholder="Key (e.g. Wattage)"
                    value={s.key}
                    onChange={(e) => updateSpec(i, 'key', e.target.value)}
                  />
                  <input
                    className="adp-input adp-kv-val"
                    placeholder="Value (e.g. 9W)"
                    value={s.value}
                    onChange={(e) => updateSpec(i, 'value', e.target.value)}
                  />
                  {form.specs.length > 1 && (
                    <button type="button" className="adp-btn-rm" onClick={() => removeSpec(i)}>✕</button>
                  )}
                </div>
              ))}

              {/* ── Variants ── */}
              <div className="adp-section-header">
                <p className="adp-section-title">Variants</p>
                <button type="button" className="adp-btn-inline" onClick={addVariant}>+ Add Variant</button>
              </div>
              <p className="adp-hint">Add watt/voltage variants if this product comes in multiple configurations.</p>
              {form.variants.length === 0 && (
                <p className="adp-empty-hint">No variants — click "+ Add Variant" to add one.</p>
              )}
              {form.variants.map((v, i) => (
                <div key={i} className="adp-variant-row">
                  <input className="adp-input" placeholder="Watt (e.g. 9W)"    value={v.watt}    onChange={(e) => updateVariant(i, 'watt', e.target.value)} />
                  <input className="adp-input" placeholder="Voltage (e.g. 220V)" value={v.voltage} onChange={(e) => updateVariant(i, 'voltage', e.target.value)} />
                  <input className="adp-input" placeholder="Brand"              value={v.brand}   onChange={(e) => updateVariant(i, 'brand', e.target.value)} />
                  <button type="button" className="adp-btn-rm" onClick={() => removeVariant(i)}>✕</button>
                </div>
              ))}

              {/* ── Images ── */}
              <p className="adp-section-title">Product Images</p>
              <label className="adp-label">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  ref={fileRef}
                  onChange={(e) => setImageFiles(Array.from(e.target.files))}
                  className="adp-input"
                />
                {imageFiles.length > 0 && (
                  <span className="adp-hint">{imageFiles.length} file{imageFiles.length > 1 ? 's' : ''} selected</span>
                )}
                {modal === 'edit' && imageFiles.length === 0 && (
                  <span className="adp-hint">Leave empty to keep existing images</span>
                )}
              </label>

              <div className="adp-modal-actions">
                <button type="button" className="adp-btn adp-btn--cancel" onClick={closeModal}>Cancel</button>
                <button type="submit" className="adp-btn adp-btn--save" disabled={saving}>{saving ? 'Saving…' : 'Save Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── New Category Modal ── */}
      {catModal && (
        <div className="adp-overlay" onClick={closeCatModal}>
          <div className="adp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="adp-modal-header">
              <h2>New Category</h2>
              <button className="adp-modal-close" onClick={closeCatModal}>✕</button>
            </div>
            <form className="adp-form" onSubmit={handleCatSubmit}>
              <label className="adp-label">Category Name *
                <input value={catForm.name} onChange={handleCatNameChange} required className="adp-input" placeholder="e.g. LED Lights" />
              </label>
              <label className="adp-label">Slug *
                <input value={catForm.slug} onChange={(e) => setCatForm((f) => ({ ...f, slug: e.target.value }))} required className="adp-input" placeholder="e.g. led-lights" />
                <span className="adp-hint">Auto-generated from name. Must be unique.</span>
              </label>
              <label className="adp-label">Description
                <textarea value={catForm.description} onChange={(e) => setCatForm((f) => ({ ...f, description: e.target.value }))} rows={2} className="adp-input adp-textarea" placeholder="Short description…" />
              </label>
              <div className="adp-modal-actions">
                <button type="button" className="adp-btn adp-btn--cancel" onClick={closeCatModal}>Cancel</button>
                <button type="submit" className="adp-btn adp-btn--save" disabled={savingCat}>{savingCat ? 'Creating…' : 'Create Category'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
