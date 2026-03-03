import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getMyProjects, createProject, deleteProject,
  addItemToProject, removeItemFromProject, toggleShare, addProjectToCart
} from '../../services/projectService.js';
import Spinner from '../../components/Spinner/Spinner.jsx';
import { useToast } from '../../components/Toast/ToastProvider.jsx';
import './Projects.css';

const PROJECT_TYPES = ['Home Wiring', 'Office Wiring', 'Industrial', 'Solar Installation', 'Network Setup', 'Lighting', 'Security System', 'Other'];
const STATUS_COLORS = { planning: '#6366f1', 'in-progress': '#f59e0b', ordered: '#3b82f6', completed: '#22c55e' };

export default function Projects() {
  const toast = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeProject, setActiveProject] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', projectType: 'Home Wiring', siteAddress: '' });
  const [creating, setCreating] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const fetchProjects = async () => {
    try {
      const data = await getMyProjects();
      setProjects(data);
    } catch { toast.error('Failed to load projects'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setCreating(true);
    try {
      const data = await createProject(form);
      setProjects(prev => [data, ...prev]);
      setShowCreate(false);
      setForm({ name: '', description: '', projectType: 'Home Wiring', siteAddress: '' });
      toast.success('Project created!');
    } catch { toast.error('Failed to create project'); }
    finally { setCreating(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await deleteProject(id);
      setProjects(prev => prev.filter(p => p._id !== id));
      if (activeProject?._id === id) setActiveProject(null);
      toast.success('Project deleted');
    } catch { toast.error('Failed to delete project'); }
  };

  const handleRemoveItem = async (projectId, itemId) => {
    try {
      const updated = await removeItemFromProject(projectId, itemId);
      setProjects(prev => prev.map(p => p._id === projectId ? updated : p));
      if (activeProject?._id === projectId) setActiveProject(updated);
    } catch { toast.error('Failed to remove item'); }
  };

  const handleToggleShare = async (projectId) => {
    try {
      const updated = await toggleShare(projectId);
      setProjects(prev => prev.map(p => p._id === projectId ? updated : p));
      if (activeProject?._id === projectId) setActiveProject(updated);
      toast.success(updated.isShared ? 'Share link generated!' : 'Sharing disabled');
    } catch { toast.error('Failed to toggle sharing'); }
  };

  const handleAddToCart = async (projectId) => {
    setAddingToCart(true);
    try {
      await addProjectToCart(projectId);
      toast.success('All items added to cart!');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to add to cart');
    } finally { setAddingToCart(false); }
  };

  if (loading) return <Spinner />;

  return (
    <div className="projects-page">
      <div className="projects-header">
        <div>
          <h1>My Projects</h1>
          <p>Plan your electrical projects with Bill of Materials</p>
        </div>
        <button className="create-project-btn" onClick={() => setShowCreate(true)}>
          <span className="material-symbols-outlined">add</span> New Project
        </button>
      </div>

      {showCreate && (
        <div className="project-modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="project-modal" onClick={e => e.stopPropagation()}>
            <h2>Create New Project</h2>
            <form onSubmit={handleCreate} className="project-form">
              <label>Project Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="e.g., Home Renovation Wiring" required />
              <label>Project Type</label>
              <select value={form.projectType} onChange={e => setForm(f => ({...f, projectType: e.target.value}))}>
                {PROJECT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
              <label>Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="Brief description of the project..." rows={3} />
              <label>Site Address</label>
              <input value={form.siteAddress} onChange={e => setForm(f => ({...f, siteAddress: e.target.value}))} placeholder="Project location" />
              <div className="project-form-actions">
                <button type="button" onClick={() => setShowCreate(false)} className="cancel-btn">Cancel</button>
                <button type="submit" className="submit-btn" disabled={creating}>{creating ? 'Creating…' : 'Create Project'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="projects-empty">
          <span className="material-symbols-outlined">engineering</span>
          <h2>No Projects Yet</h2>
          <p>Create a project to plan your electrical work and build a parts list</p>
          <button className="create-project-btn" onClick={() => setShowCreate(true)}>Create Your First Project</button>
        </div>
      ) : (
        <div className="projects-layout">
          <div className="projects-list">
            {projects.map(p => (
              <div key={p._id} className={`project-card ${activeProject?._id === p._id ? 'active' : ''}`} onClick={() => setActiveProject(p)}>
                <div className="project-card-header">
                  <div>
                    <div className="project-card-name">{p.name}</div>
                    <div className="project-card-type">{p.projectType}</div>
                  </div>
                  <span className="project-card-status" style={{ background: STATUS_COLORS[p.status] + '22', color: STATUS_COLORS[p.status] }}>
                    {p.status}
                  </span>
                </div>
                <div className="project-card-meta">
                  <span>{p.items?.length || 0} items</span>
                  <span>₹{(p.totalEstimate || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>

          {activeProject && (
            <div className="project-detail">
              <div className="project-detail-header">
                <div>
                  <h2>{activeProject.name}</h2>
                  <p>{activeProject.description || 'No description'}</p>
                  {activeProject.siteAddress && <p className="site-addr">📍 {activeProject.siteAddress}</p>}
                </div>
                <div className="project-detail-actions">
                  <button className="share-btn" onClick={() => handleToggleShare(activeProject._id)}>
                    {activeProject.isShared ? '🔗 Shared' : '🔗 Share'}
                  </button>
                  {activeProject.isShared && (
                    <button className="copy-link-btn" onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/projects/share/${activeProject.shareToken}`);
                      toast.success('Link copied!');
                    }}>Copy Link</button>
                  )}
                  <button className="add-cart-btn" onClick={() => handleAddToCart(activeProject._id)} disabled={addingToCart}>
                    {addingToCart ? 'Adding…' : '🛒 Add All to Cart'}
                  </button>
                  <button className="delete-project-btn" onClick={() => handleDelete(activeProject._id)}>🗑 Delete</button>
                </div>
              </div>

              <div className="project-total-bar">
                <span>Total Estimate</span>
                <span className="project-total-amount">₹{(activeProject.totalEstimate || 0).toLocaleString('en-IN')}</span>
              </div>

              {activeProject.items?.length === 0 ? (
                <div className="project-items-empty">
                  <p>No items yet. Browse products and add them to this project.</p>
                  <Link to="/products" className="browse-btn">Browse Products</Link>
                </div>
              ) : (
                <div className="project-items-list">
                  {activeProject.items.map((item, i) => (
                    <div key={i} className="project-item-card">
                      <img src={item.product?.images?.[0]} alt={item.product?.name} className="project-item-img" />
                      <div className="project-item-info">
                        <div className="project-item-name">{item.product?.name || 'Product'}</div>
                        <div className="project-item-meta">
                          Qty: {item.quantity} &times; ₹{item.priceAtAdd?.toLocaleString('en-IN')} = <strong>₹{(item.quantity * item.priceAtAdd).toLocaleString('en-IN')}</strong>
                        </div>
                        {item.notes && <div className="project-item-notes">{item.notes}</div>}
                      </div>
                      <button className="project-item-remove" onClick={() => handleRemoveItem(activeProject._id, item._id)}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
