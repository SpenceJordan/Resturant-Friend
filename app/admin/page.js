'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const DEFAULT_SECTIONS = [
  'Sushi & Sashimi',
  'Ramen & Noodles',
  'Donburi & Rice Dishes',
  'Tempura & Appetizers',
  'Soups & Sides',
  'Desserts & Drinks',
];

const GRADIENT_PRESETS = [
  { start: '#C84444', end: '#8B3030' },
  { start: '#E85D75', end: '#C13584' },
  { start: '#667EEA', end: '#764BA2' },
  { start: '#FF6B6B', end: '#C92A2A' },
  { start: '#51CF66', end: '#2B8A3E' },
  { start: '#FFA94D', end: '#FD7E14' },
  { start: '#74C0FC', end: '#4C6EF5' },
  { start: '#A78BFA', end: '#7C3AED' },
  { start: '#63E6BE', end: '#20C997' },
  { start: '#FDCB6E', end: '#E17055' },
];

const EMPTY_ITEM = {
  name: '',
  price: '',
  description: '',
  section: DEFAULT_SECTIONS[0],
  imageData: null,
  gradientStart: '#C84444',
  gradientEnd: '#8B3030',
};

export default function AdminPage() {
  const [customSections, setCustomSections] = useState([]);
  const [customItems, setCustomItems] = useState([]);
  const [activeTab, setActiveTab] = useState('items');
  const [newSection, setNewSection] = useState('');
  const [newItem, setNewItem] = useState(EMPTY_ITEM);
  const [preview, setPreview] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const fileInputRef = useRef(null);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    const sections = JSON.parse(localStorage.getItem('wfd_custom_sections') || '[]');
    const items = JSON.parse(localStorage.getItem('wfd_custom_items') || '[]');
    setCustomSections(sections);
    setCustomItems(items);
  }, []);

  const allSections = [...DEFAULT_SECTIONS, ...customSections];

  const showToast = (message, type = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, message, type });
    toastTimerRef.current = setTimeout(
      () => setToast({ show: false, message: '', type: 'success' }),
      3000
    );
  };

  const addSection = () => {
    const trimmed = newSection.trim();
    if (!trimmed) return;
    if (allSections.map((s) => s.toLowerCase()).includes(trimmed.toLowerCase())) {
      showToast('Section already exists!', 'error');
      return;
    }
    const updated = [...customSections, trimmed];
    setCustomSections(updated);
    localStorage.setItem('wfd_custom_sections', JSON.stringify(updated));
    setNewSection('');
    showToast(`"${trimmed}" section added!`);
  };

  const deleteSection = (section) => {
    const updated = customSections.filter((s) => s !== section);
    setCustomSections(updated);
    localStorage.setItem('wfd_custom_sections', JSON.stringify(updated));
    showToast('Section removed!');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be under 5MB!', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setNewItem((prev) => ({ ...prev, imageData: ev.target.result }));
      setPreview(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const randomGradient = () => {
    const preset = GRADIENT_PRESETS[Math.floor(Math.random() * GRADIENT_PRESETS.length)];
    setNewItem((prev) => ({ ...prev, gradientStart: preset.start, gradientEnd: preset.end }));
  };

  const addItem = () => {
    if (!newItem.name.trim() || !newItem.price || !newItem.section) {
      showToast('Name, price, and category are required!', 'error');
      return;
    }
    const price = parseFloat(newItem.price);
    if (isNaN(price) || price <= 0) {
      showToast('Please enter a valid price!', 'error');
      return;
    }
    const initials = newItem.name.trim().slice(0, 2).toUpperCase();
    const item = {
      id: Date.now().toString(),
      name: newItem.name.trim(),
      price,
      description: newItem.description.trim() || 'A unique selection',
      section: newItem.section,
      imageData: newItem.imageData || null,
      gradientStart: newItem.gradientStart,
      gradientEnd: newItem.gradientEnd,
      initials,
    };
    const updated = [...customItems, item];
    setCustomItems(updated);
    localStorage.setItem('wfd_custom_items', JSON.stringify(updated));
    const keptSection = newItem.section;
    setNewItem({ ...EMPTY_ITEM, section: keptSection });
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    showToast(`${item.name} added to the menu!`);
  };

  const deleteItem = (id) => {
    const updated = customItems.filter((item) => item.id !== id);
    setCustomItems(updated);
    localStorage.setItem('wfd_custom_items', JSON.stringify(updated));
    showToast('Entry removed!');
  };

  const formatPrice = (price) => (price % 1 === 0 ? price : price.toFixed(2));

  return (
    <>
      <style>{`
        .admin-wrapper {
          min-height: 100vh;
          background: var(--cream);
          padding: 40px 20px 80px;
        }
        .admin-top-bar {
          max-width: 960px;
          margin: 0 auto 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
        }
        .admin-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 3rem;
          font-weight: 300;
          color: var(--dark);
        }
        .admin-title span { color: var(--red); }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--dark);
          text-decoration: none;
          font-family: 'Crimson Text', serif;
          font-size: 1rem;
          font-weight: 600;
          padding: 12px 24px;
          border: 2px solid var(--dark);
          transition: all 0.3s ease;
        }
        .back-link:hover { background: var(--dark); color: white; }
        .admin-tabs {
          max-width: 960px;
          margin: 0 auto 40px;
          display: flex;
          border-bottom: 3px solid var(--red);
        }
        .admin-tab {
          padding: 14px 32px;
          font-family: 'Crimson Text', serif;
          font-size: 1.05rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          background: none;
          border: none;
          color: #999;
          transition: all 0.3s ease;
        }
        .admin-tab.active { background: var(--red); color: white; }
        .admin-tab:hover:not(.active) { color: var(--red); }
        .admin-card {
          max-width: 960px;
          margin: 0 auto 40px;
          background: white;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
        }
        .admin-card-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem;
          font-weight: 600;
          margin-bottom: 30px;
          color: var(--dark);
          padding-bottom: 15px;
          border-bottom: 2px solid var(--cream);
        }
        .admin-form-grid {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 40px;
          align-items: start;
        }
        .admin-form-group { margin-bottom: 22px; }
        .admin-label {
          display: block;
          font-family: 'Crimson Text', serif;
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 8px;
          color: var(--dark);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .admin-label .req { color: var(--red); margin-left: 3px; }
        .admin-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid var(--cream);
          font-family: 'Crimson Text', serif;
          font-size: 1rem;
          background: white;
          border-radius: 4px;
          transition: border-color 0.3s ease;
        }
        .admin-input:focus { outline: none; border-color: var(--red); }
        .admin-input::placeholder { color: #ccc; }
        .admin-select {
          width: 100%;
          padding: 12px 40px 12px 16px;
          border: 2px solid var(--cream);
          font-family: 'Crimson Text', serif;
          font-size: 1rem;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          transition: border-color 0.3s ease;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23C84444' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 16px center;
        }
        .admin-select:focus { outline: none; border-color: var(--red); }
        .upload-zone {
          border: 2px dashed #ddd;
          border-radius: 8px;
          padding: 24px 16px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: #fafafa;
          margin-bottom: 20px;
        }
        .upload-zone:hover { border-color: var(--red); background: rgba(200,68,68,0.02); }
        .upload-preview {
          width: 110px;
          height: 110px;
          border-radius: 50%;
          object-fit: cover;
          margin: 0 auto 12px;
          display: block;
          border: 4px solid var(--red);
          box-shadow: 0 4px 16px rgba(200,68,68,0.25);
        }
        .upload-icon { font-size: 2.5rem; margin-bottom: 10px; }
        .upload-text { font-size: 0.875rem; color: #aaa; line-height: 1.5; }
        .upload-text strong { color: var(--red); }
        .gradient-row {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .gradient-ball {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          flex-shrink: 0;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .color-pair {
          display: flex;
          gap: 10px;
          flex: 1;
          align-items: center;
        }
        .color-swatch-group {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .color-swatch-label { font-size: 0.8rem; color: #888; }
        input[type="color"] {
          width: 38px;
          height: 38px;
          border: 2px solid var(--cream);
          border-radius: 4px;
          cursor: pointer;
          padding: 2px;
          background: white;
        }
        .random-btn {
          padding: 8px 14px;
          background: var(--cream);
          border: 2px solid var(--cream);
          border-radius: 4px;
          font-family: 'Crimson Text', serif;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }
        .random-btn:hover { border-color: var(--dark); background: var(--dark); color: white; }
        .admin-submit {
          width: 100%;
          background: var(--red);
          color: white;
          border: none;
          padding: 16px;
          font-family: 'Crimson Text', serif;
          font-size: 1.1rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s ease;
          border-radius: 4px;
          margin-top: 10px;
        }
        .admin-submit:hover { background: var(--dark); transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.15); }
        .section-add-row { display: flex; gap: 12px; margin-bottom: 35px; }
        .section-add-row .admin-input { flex: 1; }
        .section-add-btn {
          padding: 12px 28px;
          background: var(--red);
          color: white;
          border: none;
          font-family: 'Crimson Text', serif;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          border-radius: 4px;
          white-space: nowrap;
        }
        .section-add-btn:hover { background: var(--dark); }
        .list-heading {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 18px;
          color: var(--dark);
        }
        .section-list { display: flex; flex-direction: column; gap: 10px; }
        .section-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px;
          background: var(--cream);
          border-radius: 8px;
          gap: 12px;
        }
        .section-row .sname { font-weight: 600; font-size: 1.05rem; }
        .badge {
          font-size: 0.72rem;
          padding: 3px 10px;
          border-radius: 20px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .badge-default { background: rgba(0,0,0,0.08); color: #777; }
        .badge-custom { background: var(--red); color: white; }
        .del-btn {
          background: none;
          border: 2px solid var(--red);
          color: var(--red);
          padding: 6px 14px;
          border-radius: 4px;
          cursor: pointer;
          font-family: 'Crimson Text', serif;
          font-size: 0.9rem;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .del-btn:hover { background: var(--red); color: white; }
        .items-list { display: flex; flex-direction: column; gap: 14px; }
        .item-row {
          display: flex;
          gap: 18px;
          align-items: center;
          padding: 14px 18px;
          background: var(--cream);
          border-radius: 8px;
        }
        .item-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .item-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .item-avatar-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 1.2rem;
          font-family: 'Cormorant Garamond', serif;
        }
        .item-info { flex: 1; min-width: 0; }
        .item-iname {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 3px;
        }
        .item-meta { font-size: 0.88rem; color: #888; display: flex; gap: 14px; flex-wrap: wrap; }
        .item-meta .iprice { color: var(--red); font-weight: 600; }
        .item-meta .idesc { font-style: italic; color: #bbb; }
        .empty-state {
          text-align: center;
          padding: 50px 20px;
          color: #bbb;
          font-size: 1.1rem;
          font-style: italic;
        }
        .admin-toast {
          position: fixed;
          bottom: 30px;
          right: 30px;
          padding: 14px 22px;
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          gap: 10px;
          opacity: 0;
          transform: translateY(20px);
          pointer-events: none;
          transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
          z-index: 9999;
          font-weight: 600;
          font-family: 'Crimson Text', serif;
          font-size: 1rem;
        }
        .admin-toast.show { opacity: 1; transform: translateY(0); pointer-events: all; }
        .admin-toast.success { background: var(--dark); color: white; }
        .admin-toast.error { background: var(--red); color: white; }
        @media (max-width: 700px) {
          .admin-form-grid { grid-template-columns: 1fr; }
          .admin-card { padding: 25px 18px; }
          .admin-tab { padding: 12px 18px; font-size: 0.9rem; }
          .gradient-row { flex-wrap: wrap; }
        }
      `}</style>

      <div className="admin-wrapper">
        {/* Header */}
        <div className="admin-top-bar">
          <h1 className="admin-title">Admin <span>Panel</span></h1>
          <Link href="/" className="back-link">&#8592; Back to Menu</Link>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          <button
            className={`admin-tab${activeTab === 'items' ? ' active' : ''}`}
            onClick={() => setActiveTab('items')}
          >
            Add Person
          </button>
          <button
            className={`admin-tab${activeTab === 'sections' ? ' active' : ''}`}
            onClick={() => setActiveTab('sections')}
          >
            Sections
          </button>
          <button
            className={`admin-tab${activeTab === 'manage' ? ' active' : ''}`}
            onClick={() => setActiveTab('manage')}
          >
            All Entries ({customItems.length})
          </button>
        </div>

        {/* ── ADD PERSON TAB ── */}
        {activeTab === 'items' && (
          <div className="admin-card">
            <h2 className="admin-card-title">Add New Person</h2>
            <div className="admin-form-grid">

              {/* Left: photo + gradient */}
              <div>
                <div className="admin-form-group">
                  <label className="admin-label">Profile Photo</label>
                  <div className="upload-zone" onClick={() => fileInputRef.current?.click()}>
                    {preview ? (
                      <img src={preview} alt="Preview" className="upload-preview" />
                    ) : (
                      <div className="upload-icon">📷</div>
                    )}
                    <div className="upload-text">
                      <strong>Click to upload</strong><br />JPG, PNG up to 5MB
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImageUpload}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">Fallback Color (if no photo)</label>
                  <div className="gradient-row">
                    <div
                      className="gradient-ball"
                      style={{
                        background: `linear-gradient(135deg, ${newItem.gradientStart}, ${newItem.gradientEnd})`,
                      }}
                    />
                    <div className="color-pair">
                      <div className="color-swatch-group">
                        <span className="color-swatch-label">From</span>
                        <input
                          type="color"
                          value={newItem.gradientStart}
                          onChange={(e) =>
                            setNewItem((prev) => ({ ...prev, gradientStart: e.target.value }))
                          }
                        />
                      </div>
                      <div className="color-swatch-group">
                        <span className="color-swatch-label">To</span>
                        <input
                          type="color"
                          value={newItem.gradientEnd}
                          onChange={(e) =>
                            setNewItem((prev) => ({ ...prev, gradientEnd: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                    <button className="random-btn" type="button" onClick={randomGradient}>
                      🎲 Random
                    </button>
                  </div>
                </div>
              </div>

              {/* Right: form fields */}
              <div>
                <div className="admin-form-group">
                  <label className="admin-label">Name <span className="req">*</span></label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. Jordan"
                    value={newItem.name}
                    onChange={(e) => setNewItem((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">Price ($) <span className="req">*</span></label>
                  <input
                    type="number"
                    className="admin-input"
                    placeholder="e.g. 450"
                    min="0"
                    step="0.01"
                    value={newItem.price}
                    onChange={(e) => setNewItem((prev) => ({ ...prev, price: e.target.value }))}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">Category <span className="req">*</span></label>
                  <select
                    className="admin-select"
                    value={newItem.section}
                    onChange={(e) => setNewItem((prev) => ({ ...prev, section: e.target.value }))}
                  >
                    {allSections.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">Description</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. A unique flavor profile with an adventurous spirit"
                    value={newItem.description}
                    onChange={(e) =>
                      setNewItem((prev) => ({ ...prev, description: e.target.value }))
                    }
                  />
                </div>

                <button className="admin-submit" onClick={addItem}>
                  + Add to Menu
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── SECTIONS TAB ── */}
        {activeTab === 'sections' && (
          <div className="admin-card">
            <h2 className="admin-card-title">Manage Sections</h2>

            <div className="section-add-row">
              <input
                type="text"
                className="admin-input"
                placeholder="New section name  e.g. Chef's Specials"
                value={newSection}
                onChange={(e) => setNewSection(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addSection()}
              />
              <button className="section-add-btn" onClick={addSection}>
                + Add Section
              </button>
            </div>

            <div className="list-heading">All Sections</div>
            <div className="section-list">
              {DEFAULT_SECTIONS.map((s) => (
                <div key={s} className="section-row">
                  <span className="sname">{s}</span>
                  <span className="badge badge-default">Default</span>
                </div>
              ))}
              {customSections.length === 0 && (
                <div className="empty-state" style={{ padding: '20px' }}>
                  No custom sections yet — add one above!
                </div>
              )}
              {customSections.map((s) => (
                <div key={s} className="section-row">
                  <span className="sname">{s}</span>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span className="badge badge-custom">Custom</span>
                    <button className="del-btn" onClick={() => deleteSection(s)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ALL ENTRIES TAB ── */}
        {activeTab === 'manage' && (
          <div className="admin-card">
            <h2 className="admin-card-title">Custom Entries ({customItems.length})</h2>
            {customItems.length === 0 ? (
              <div className="empty-state">
                No custom entries yet — add people from the &#34;Add Person&#34; tab!
              </div>
            ) : (
              <div className="items-list">
                {customItems.map((item) => (
                  <div key={item.id} className="item-row">
                    <div className="item-avatar">
                      {item.imageData ? (
                        <img src={item.imageData} alt={item.name} />
                      ) : (
                        <div
                          className="item-avatar-placeholder"
                          style={{
                            background: `linear-gradient(135deg, ${item.gradientStart}, ${item.gradientEnd})`,
                          }}
                        >
                          {item.initials}
                        </div>
                      )}
                    </div>
                    <div className="item-info">
                      <div className="item-iname">{item.name}</div>
                      <div className="item-meta">
                        <span className="iprice">${formatPrice(item.price)}</span>
                        <span>{item.section}</span>
                        {item.description && (
                          <span className="idesc">{item.description}</span>
                        )}
                      </div>
                    </div>
                    <button className="del-btn" onClick={() => deleteItem(item.id)}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast */}
      <div className={`admin-toast${toast.show ? ' show' : ''} ${toast.type}`}>
        {toast.type === 'success' ? '✓' : '✕'} {toast.message}
      </div>
    </>
  );
}
