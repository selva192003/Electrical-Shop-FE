import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { fetchWishlist, removeFromWishlist, clearWishlist } from '../../redux/slices/wishlistSlice.js';
import {
  getMyProjects, createProject, deleteProject,
  removeItemFromProject, toggleShare, addProjectToCart, updateProject,
} from '../../services/projectService.js';
import { useToast } from '../../components/Toast/ToastProvider.jsx';
import Spinner from '../../components/Spinner/Spinner.jsx';
import './Wishlist.css';

// Must match the backend Project model enum exactly
const PROJECT_TYPES = ['Residential', 'Commercial', 'Industrial', 'Infrastructure', 'Other'];
const PROJECT_TYPE_LABELS = {
  Residential:    'Residential',
  Commercial:     'Commercial',
  Industrial:     'Industrial',
  Infrastructure: 'Infrastructure',
  Other:          'Other',
};
const STATUS_COLORS = {
  planning:    { bg: '#eef2ff', text: '#4f46e5' },
  'in-progress': { bg: '#fef9c3', text: '#b45309' },
  ordered:     { bg: '#dbeafe', text: '#1d4ed8' },
  completed:   { bg: '#dcfce7', text: '#15803d' },
};
const STATUS_OPTIONS = ['planning', 'in-progress', 'ordered', 'completed'];

const Wishlist = () => {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const toast      = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab  = searchParams.get('tab') === 'projects' ? 'projects' : 'wishlist';

  // ── Wishlist state ────────────────────────────────────────────────────────
  const { items: wishItems, loading: wishLoading } = useSelector((s) => s.wishlist);

  useEffect(() => { dispatch(fetchWishlist()); }, [dispatch]);

  const handleRemoveWish = async (productId) => {
    try {
      await dispatch(removeFromWishlist(productId)).unwrap();
      dispatch(fetchWishlist());
      toast.info('Removed from wishlist');
    } catch { toast.error('Failed to remove'); }
  };

  const handleClearWish = async () => {
    try {
      await dispatch(clearWishlist()).unwrap();
      toast.info('Wishlist cleared');
    } catch { toast.error('Failed to clear'); }
  };

  // ── Projects state ────────────────────────────────────────────────────────
  const [projects, setProjects]         = useState([]);
  const [projLoading, setProjLoading]   = useState(false);
  const [activeProject, setActiveProject] = useState(null);

  // Create form
  const [showCreate, setShowCreate]     = useState(false);
  const [creating, setCreating]         = useState(false);
  const [form, setForm] = useState({ name: '', description: '', projectType: 'Residential', siteAddress: '' });

  // Status edit
  const [editingStatus, setEditingStatus] = useState(false);

  // Cart
  const [addingToCart, setAddingToCart] = useState(false);

  // Share copy tooltip
  const [copied, setCopied] = useState(false);

  const fetchProjects = async () => {
    setProjLoading(true);
    try {
      const data = await getMyProjects();
      setProjects(data);
    } catch { toast.error('Failed to load projects'); }
    finally { setProjLoading(false); }
  };

  useEffect(() => {
    if (activeTab === 'projects') fetchProjects();
  }, [activeTab]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setCreating(true);
    try {
      const data = await createProject(form);
      setProjects((prev) => [data, ...prev]);
      setActiveProject(data);
      setShowCreate(false);
      setForm({ name: '', description: '', projectType: 'Residential', siteAddress: '' });
      toast.success('Project created!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create project');
    } finally { setCreating(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p._id !== id));
      if (activeProject?._id === id) setActiveProject(null);
      toast.success('Project deleted');
    } catch { toast.error('Failed to delete project'); }
  };

  const handleRemoveItem = async (projectId, itemId) => {
    try {
      const updated = await removeItemFromProject(projectId, itemId);
      setProjects((prev) => prev.map((p) => (p._id === projectId ? updated : p)));
      if (activeProject?._id === projectId) setActiveProject(updated);
    } catch { toast.error('Failed to remove item'); }
  };

  const handleToggleShare = async (projectId) => {
    try {
      const res = await toggleShare(projectId);
      // toggleShare returns { message, shareLink, shareToken } or { message, shareLink: null }
      const updated = await getMyProjects();
      setProjects(updated);
      const proj = updated.find((p) => p._id === projectId);
      if (proj) setActiveProject(proj);
      toast.success(proj?.isShared ? 'Share link enabled' : 'Sharing disabled');
    } catch { toast.error('Failed to toggle sharing'); }
  };

  const handleCopyLink = (token) => {
    const link = `${window.location.origin}/projects/${activeProject._id}?token=${token}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleStatusChange = async (projectId, newStatus) => {
    try {
      const updated = await updateProject(projectId, { status: newStatus });
      setProjects((prev) => prev.map((p) => (p._id === projectId ? updated : p)));
      setActiveProject(updated);
      setEditingStatus(false);
      toast.success('Status updated');
    } catch { toast.error('Failed to update status'); }
  };

  const handleAddToCart = async (projectId) => {
    setAddingToCart(true);
    try {
      const res = await addProjectToCart(projectId);
      toast.success(res.message || 'All items added to cart!');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to add to cart');
    } finally { setAddingToCart(false); }
  };

  const setTab = (tab) => setSearchParams({ tab });

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="wl-page">
      {/* ── Tab Bar ── */}
      <div className="wl-tabs">
        <button
          className={`wl-tab ${activeTab === 'wishlist' ? 'active' : ''}`}
          onClick={() => setTab('wishlist')}
        >
          <span className="material-icons wl-tab-icon">favorite_border</span>
          Wishlist
          {wishItems.length > 0 && <span className="wl-badge">{wishItems.length}</span>}
        </button>
        <button
          className={`wl-tab ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setTab('projects')}
        >
          <span className="material-icons wl-tab-icon">folder_open</span>
          My Projects
          {projects.length > 0 && <span className="wl-badge">{projects.length}</span>}
        </button>
      </div>

      {/* ══ WISHLIST TAB ══════════════════════════════════════════════════════ */}
      {activeTab === 'wishlist' && (
        <div className="wl-panel">
          <div className="wl-panel-header">
            <h2>Saved Items</h2>
            {wishItems.length > 0 && (
              <button className="wl-clear-btn" onClick={handleClearWish}>Clear All</button>
            )}
          </div>

          {wishLoading ? <Spinner /> : wishItems.length === 0 ? (
            <div className="wl-empty">
              <span className="material-icons wl-empty-icon">favorite_border</span>
              <h3>No saved items yet</h3>
              <p>Browse products and tap the heart icon to save them here.</p>
              <Link to="/products" className="wl-browse-btn">Browse Products</Link>
            </div>
          ) : (
            <div className="wl-grid">
              {wishItems.map((product) => (
                <div key={product._id} className="wl-card">
                  <Link to={`/products/${product._id}`} className="wl-card-img-wrap">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]?.url || product.images[0]}
                        alt={product.name}
                        className="wl-card-img"
                      />
                    ) : (
                      <div className="wl-card-no-img">No Image</div>
                    )}
                  </Link>
                  <div className="wl-card-body">
                    <Link to={`/products/${product._id}`} className="wl-card-name">
                      {product.name}
                    </Link>
                    <p className="wl-card-price">₹{product.price?.toLocaleString('en-IN')}</p>
                    <div className="wl-card-actions">
                      <Link to={`/products/${product._id}`} className="wl-btn primary">View</Link>
                      <button className="wl-btn danger" onClick={() => handleRemoveWish(product._id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══ PROJECTS TAB ══════════════════════════════════════════════════════ */}
      {activeTab === 'projects' && (
        <div className="wl-panel">
          <div className="wl-panel-header">
            <div>
              <h2>My Projects</h2>
              <p className="wl-panel-sub">Plan electrical work — build a Bill of Materials, then order in one click</p>
            </div>
            <button className="wl-new-proj-btn" onClick={() => setShowCreate(true)}>
              + New Project
            </button>
          </div>

          {/* Create Modal */}
          {showCreate && (
            <div className="wl-modal-overlay" onClick={() => setShowCreate(false)}>
              <div className="wl-modal" onClick={(e) => e.stopPropagation()}>
                <div className="wl-modal-header">
                  <h3>Create New Project</h3>
                  <button className="wl-modal-close" onClick={() => setShowCreate(false)}>✕</button>
                </div>
                <form onSubmit={handleCreate} className="wl-proj-form">
                  <div className="wl-form-field">
                    <label>Project Name <span>*</span></label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="e.g., Home Renovation Wiring"
                      required
                    />
                  </div>
                  <div className="wl-form-field">
                    <label>Project Type</label>
                    <select
                      value={form.projectType}
                      onChange={(e) => setForm((f) => ({ ...f, projectType: e.target.value }))}
                    >
                      {PROJECT_TYPES.map((t) => (
                        <option key={t} value={t}>{PROJECT_TYPE_LABELS[t]}</option>
                      ))}
                    </select>
                  </div>
                  <div className="wl-form-field">
                    <label>Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                      placeholder="Brief description of the project…"
                      rows={3}
                    />
                  </div>
                  <div className="wl-form-field">
                    <label>Site Address</label>
                    <input
                      value={form.siteAddress}
                      onChange={(e) => setForm((f) => ({ ...f, siteAddress: e.target.value }))}
                      placeholder="Project location / site address"
                    />
                  </div>
                  <div className="wl-form-actions">
                    <button type="button" className="wl-btn ghost" onClick={() => setShowCreate(false)}>Cancel</button>
                    <button type="submit" className="wl-btn primary" disabled={creating}>
                      {creating ? 'Creating…' : 'Create Project'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {projLoading ? <Spinner /> : projects.length === 0 ? (
            <div className="wl-empty">
              <span className="material-icons wl-empty-icon">engineering</span>
              <h3>No projects yet</h3>
              <p>Create a project to plan your electrical work and manage your parts list.</p>
              <button className="wl-browse-btn" onClick={() => setShowCreate(true)}>Create First Project</button>
            </div>
          ) : (
            <div className="proj-layout">
              {/* Project list sidebar */}
              <div className="proj-list">
                {projects.map((p) => (
                  <div
                    key={p._id}
                    className={`proj-list-card ${activeProject?._id === p._id ? 'active' : ''}`}
                    onClick={() => { setActiveProject(p); setEditingStatus(false); }}
                  >
                    <div className="proj-list-top">
                      <span className="proj-list-name">{p.name}</span>
                      <span
                        className="proj-list-status"
                        style={{ background: STATUS_COLORS[p.status]?.bg, color: STATUS_COLORS[p.status]?.text }}
                      >
                        {p.status}
                      </span>
                    </div>
                    <div className="proj-list-meta">
                      <span>{PROJECT_TYPE_LABELS[p.projectType] || p.projectType}</span>
                      <span>{p.items?.length || 0} items · ₹{(p.totalEstimate || 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Project detail panel */}
              {activeProject ? (
                <div className="proj-detail">
                  {/* Header */}
                  <div className="proj-detail-top">
                    <div className="proj-detail-info">
                      <h3>{activeProject.name}</h3>
                      {activeProject.description && <p className="proj-detail-desc">{activeProject.description}</p>}
                      {activeProject.siteAddress && (
                        <p className="proj-detail-addr">
                          <span className="material-icons" style={{fontSize:'16px',verticalAlign:'middle',marginRight:'4px'}}>location_on</span>
                          {activeProject.siteAddress}
                        </p>
                      )}

                      {/* Status pill — click to change */}
                      <div className="proj-status-row">
                        <span className="proj-status-label">Status:</span>
                        {editingStatus ? (
                          <div className="proj-status-select">
                            {STATUS_OPTIONS.map((s) => (
                              <button
                                key={s}
                                className={`proj-status-opt ${activeProject.status === s ? 'active' : ''}`}
                                style={activeProject.status === s
                                  ? { background: STATUS_COLORS[s]?.bg, color: STATUS_COLORS[s]?.text, borderColor: STATUS_COLORS[s]?.text }
                                  : undefined}
                                onClick={() => handleStatusChange(activeProject._id, s)}
                              >
                                {s}
                              </button>
                            ))}
                            <button className="proj-status-cancel" onClick={() => setEditingStatus(false)}>✕</button>
                          </div>
                        ) : (
                          <button
                            className="proj-status-pill"
                            style={{ background: STATUS_COLORS[activeProject.status]?.bg, color: STATUS_COLORS[activeProject.status]?.text }}
                            onClick={() => setEditingStatus(true)}
                            title="Click to change status"
                          >
                            {activeProject.status} ✎
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="proj-detail-actions">
                      <button
                        className={`proj-share-btn ${activeProject.isShared ? 'shared' : ''}`}
                        onClick={() => handleToggleShare(activeProject._id)}
                        title={activeProject.isShared ? 'Disable sharing' : 'Generate share link'}
                      >
                        <span className="material-icons" style={{fontSize:'16px',verticalAlign:'middle',marginRight:'4px'}}>link</span>
                        {activeProject.isShared ? 'Shared' : 'Share'}
                      </button>
                      {activeProject.isShared && activeProject.shareToken && (
                        <button className="proj-copy-btn" onClick={() => handleCopyLink(activeProject.shareToken)}>
                          {copied ? 'Copied' : 'Copy Link'}
                        </button>
                      )}
                      <button
                        className="proj-cart-btn"
                        onClick={() => handleAddToCart(activeProject._id)}
                        disabled={addingToCart || !activeProject.items?.length}
                      >
                        {addingToCart ? 'Adding…' : `Add All to Cart`}
                      </button>
                      <button className="proj-delete-btn" onClick={() => handleDelete(activeProject._id)}>
                        <span className="material-icons" style={{fontSize:'18px',verticalAlign:'middle'}}>delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Total estimate bar */}
                  <div className="proj-estimate-bar">
                    <span>Total Estimate</span>
                    <span className="proj-estimate-amount">
                      ₹{(activeProject.totalEstimate || 0).toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Items list */}
                  {!activeProject.items?.length ? (
                    <div className="proj-items-empty">
                      <p>No items in this project yet.</p>
                      <p>Use the <strong>Calculator</strong> to auto-generate a shopping list, or browse products and add them here.</p>
                      <div className="proj-items-empty-actions">
                        <Link to="/calculator" className="wl-btn primary">Open Calculator</Link>
                        <Link to="/products" className="wl-btn ghost">Browse Products</Link>
                      </div>
                    </div>
                  ) : (
                    <div className="proj-items">
                      {activeProject.items.map((item) => (
                        <div key={item._id} className="proj-item">
                          <div className="proj-item-img-wrap">
                            {item.product?.images?.[0]?.url
                              ? <img src={item.product.images[0].url} alt={item.productName} className="proj-item-img" />
                              : <div className="proj-item-no-img"><span className="material-icons">image_not_supported</span></div>
                            }
                          </div>
                          <div className="proj-item-info">
                            <div className="proj-item-name">
                              {item.product?._id
                                ? <Link to={`/products/${item.product._id}`}>{item.productName || item.product.name}</Link>
                                : <span>{item.productName}</span>
                              }
                            </div>
                            {item.notes && <div className="proj-item-note">{item.notes}</div>}
                            <div className="proj-item-meta">
                              Qty: <strong>{item.quantity}</strong>
                              &nbsp;×&nbsp;₹{item.price?.toLocaleString('en-IN')}
                              &nbsp;=&nbsp;
                              <strong className="proj-item-total">
                                ₹{(item.quantity * item.price).toLocaleString('en-IN')}
                              </strong>
                            </div>
                          </div>
                          <button
                            className="proj-item-remove"
                            onClick={() => handleRemoveItem(activeProject._id, item._id)}
                            title="Remove from project"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="proj-detail proj-detail-placeholder">
                  <span>Select a project to view details</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Wishlist;

