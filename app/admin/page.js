'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

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

const DEFAULT_MENU = [
  { title: 'Sushi & Sashimi', items: [
    { name: 'Kristen', price: 450, description: 'Bold and unforgettable, perfect for special occasions' },
    { name: 'Emma', price: 450, description: 'Sweet yet sophisticated, always a crowd favorite' },
    { name: 'Anike', price: 450, description: 'Unique flavor profile with an adventurous spirit' },
  ]},
  { title: 'Ramen & Noodles', items: [
    { name: 'Shanessa', price: 450, description: 'Warm and comforting, brings everyone together' },
    { name: 'Kuane', price: 425, description: 'Budget-friendly option without compromising on quality' },
    { name: 'Zahara', price: 450, description: 'Vibrant and full of energy, never disappoints' },
  ]},
  { title: 'Donburi & Rice Dishes', items: [
    { name: 'Amelia', price: 450, description: 'Classic comfort with a modern twist' },
    { name: 'Rianna', price: 450, description: 'Rich and satisfying, perfect for any mood' },
    { name: 'Gabby', price: 450, description: 'Elegant and refined, a true delicacy' },
  ]},
  { title: 'Tempura & Appetizers', items: [
    { name: 'Dimetri', price: 400, description: 'Light and crispy, the perfect starter' },
    { name: 'Justin', price: 400, description: 'Golden and delightful, always a hit' },
    { name: 'Kimani', price: 400, description: 'Spicy kick with incredible depth' },
  ]},
  { title: 'Soups & Sides', items: [
    { name: 'Nathan', price: 400, description: 'Smooth and soothing, the ultimate comfort' },
    { name: 'Scott', price: 400, description: 'Subtle flavors that grow on you' },
    { name: 'Davian', price: 399.99, description: 'Surprisingly complex, worth savoring' },
  ]},
  { title: 'Desserts & Drinks', items: [
    { name: 'Jordan', price: 600, description: 'Premium indulgence, worth every penny' },
    { name: 'Vanityi', price: 500, description: 'Sweet with a hint of mystery' },
    { name: 'Amanda', price: 500, description: 'Perfectly balanced, sophisticated finish' },
  ]},
];

function compressImage(dataUrl, maxDim = 900, quality = 0.82) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let w = img.width, h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) { h = Math.round(h * maxDim / w); w = maxDim; }
        else { w = Math.round(w * maxDim / h); h = maxDim; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = dataUrl;
  });
}

const EMPTY_ITEM = {
  name: '',
  price: '',
  description: '',
  bio: '',
  section: DEFAULT_SECTIONS[0],
  imageData: null,
  extraImages: [],
  gradientStart: '#C84444',
  gradientEnd: '#8B3030',
};

const ADMIN_USER = 'JordanSpence';
const ADMIN_PASS = 'AdminJor';

function EditForm({ editDraft, setEditDraft, editGalleryInputRef, handleEditGalleryUpload, onSave, onCancel }) {
  const posMatch = (editDraft.imagePosition || '').match(/(\d+)%\s*$/);
  const posY = posMatch ? parseInt(posMatch[1]) : 30;
  return (
    <div style={{ marginTop: '12px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', marginBottom: '10px' }}>
        <div className="admin-form-group" style={{ marginBottom: 0 }}>
          <label className="admin-label">Name</label>
          <input className="admin-input" value={editDraft.name} onChange={(e) => setEditDraft((p) => ({ ...p, name: e.target.value }))} />
        </div>
        <div className="admin-form-group" style={{ marginBottom: 0, minWidth: '110px' }}>
          <label className="admin-label">Price ($)</label>
          <input className="admin-input" type="number" min="0" step="0.01" value={editDraft.price} onChange={(e) => setEditDraft((p) => ({ ...p, price: e.target.value }))} />
        </div>
      </div>
      <div className="admin-form-group" style={{ marginBottom: '10px' }}>
        <label className="admin-label">Description</label>
        <input className="admin-input" value={editDraft.description} onChange={(e) => setEditDraft((p) => ({ ...p, description: e.target.value }))} />
      </div>
      <div className="admin-form-group" style={{ marginBottom: '10px' }}>
        <label className="admin-label">Profile Photo</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {editDraft.imageData && (
            <div style={{ position: 'relative', width: '60px', height: '60px', flexShrink: 0 }}>
              <img src={editDraft.imageData} alt="" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '50%', border: '2px solid var(--cream)' }} />
              <button type="button" onClick={() => setEditDraft((p) => ({ ...p, imageData: null }))} style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'var(--red)', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', cursor: 'pointer', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>
          )}
          <label style={{ cursor: 'pointer', background: 'var(--cream)', border: '1.5px solid #ddd', borderRadius: '6px', padding: '7px 16px', fontSize: '0.88rem', fontFamily: "'Crimson Text', serif", color: '#555' }}>
            {editDraft.imageData ? 'Change Photo' : '+ Upload Photo'}
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = async (ev) => {
                const compressed = await compressImage(ev.target.result);
                setEditDraft((p) => ({ ...p, imageData: compressed }));
              };
              reader.readAsDataURL(file);
              e.target.value = '';
            }} />
          </label>
        </div>
      </div>
      {editDraft.imageData && (
        <div className="admin-form-group" style={{ marginBottom: '10px' }}>
          <label className="admin-label">Crop Position (vertical)</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '54px', height: '72px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, border: '2px solid var(--cream)' }}>
              <img src={editDraft.imageData} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: `center ${posY}%` }} />
            </div>
            <div style={{ flex: 1 }}>
              <input
                type="range" min="0" max="100" value={posY}
                onChange={(e) => setEditDraft((p) => ({ ...p, imagePosition: `center ${e.target.value}%` }))}
                style={{ width: '100%', accentColor: 'var(--red)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#999', marginTop: '2px' }}>
                <span>Top</span><span>Center</span><span>Bottom</span>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="admin-form-group" style={{ marginBottom: '10px' }}>
        <label className="admin-label">Bio</label>
        <textarea className="admin-input" rows={3} value={editDraft.bio || ''} onChange={(e) => setEditDraft((p) => ({ ...p, bio: e.target.value }))} placeholder="Profile bio..." style={{ resize: 'vertical', lineHeight: '1.6' }} />
      </div>
      <div className="admin-form-group" style={{ marginBottom: '12px' }}>
        <label className="admin-label">Gallery Photos</label>
        {(editDraft.extraImages || []).length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px,1fr))', gap: '6px', marginBottom: '8px' }}>
            {editDraft.extraImages.map((img, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <img src={img} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '4px' }} />
                <button type="button" onClick={() => setEditDraft((p) => ({ ...p, extraImages: p.extraImages.filter((_, idx) => idx !== i) }))} style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(200,68,68,0.85)', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', cursor: 'pointer', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
              </div>
            ))}
          </div>
        )}
        <button type="button" className="random-btn" onClick={() => editGalleryInputRef.current?.click()}>+ Add Photos</button>
        <input ref={editGalleryInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleEditGalleryUpload} />
      </div>
      <div className="admin-form-group" style={{ marginBottom: '12px' }}>
        <label className="admin-label">Rating Override</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.88rem', color: '#555' }}>
            <input
              type="checkbox"
              checked={editDraft.ratingOverrideEnabled || false}
              onChange={(e) => setEditDraft((p) => ({ ...p, ratingOverrideEnabled: e.target.checked }))}
              style={{ accentColor: 'var(--red)', width: '14px', height: '14px' }}
            />
            Override stars
          </label>
          {editDraft.ratingOverrideEnabled && (
            <input
              className="admin-input"
              type="number" min="1" max="5" step="0.1"
              placeholder="e.g. 4.8"
              value={editDraft.ratingOverride || ''}
              onChange={(e) => setEditDraft((p) => ({ ...p, ratingOverride: e.target.value }))}
              style={{ width: '90px', marginBottom: 0 }}
            />
          )}
          {editDraft.ratingOverrideEnabled && <span style={{ fontSize: '0.75rem', color: '#999' }}>Uncheck to use real reviews</span>}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button className="admin-submit" style={{ margin: 0, flex: 1, padding: '10px' }} onClick={onSave}>Save</button>
        <button className="del-btn" style={{ flex: 1 }} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const [orders, setOrders] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [itemOverrides, setItemOverrides] = useState({});
  const [editingKey, setEditingKey] = useState(null);
  const [editDraft, setEditDraft] = useState({});

  const [customSections, setCustomSections] = useState([]);
  const [customItems, setCustomItems] = useState([]);
  const [sectionOrder, setSectionOrder] = useState([...DEFAULT_SECTIONS]);
  const [sectionRenames, setSectionRenames] = useState({});
  const [editingSectionKey, setEditingSectionKey] = useState(null);
  const [sectionNameDraft, setSectionNameDraft] = useState('');
  const [activeTab, setActiveTab] = useState('items');
  const [reviews, setReviews] = useState([]);
  const [newSection, setNewSection] = useState('');
  const [newItem, setNewItem] = useState(EMPTY_ITEM);
  const [preview, setPreview] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const editGalleryInputRef = useRef(null);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    if (sessionStorage.getItem('wfd_admin_auth') === '1') setLoggedIn(true);
  }, []);

  useEffect(() => {
    if (!loggedIn) return;
    const overrides = JSON.parse(localStorage.getItem('wfd_item_overrides') || '{}');
    setItemOverrides(overrides);

    const loadMenuData = async () => {
      if (supabase) {
        const [sectionsRes, itemsRes, settingsRes] = await Promise.all([
          supabase.from('menu_sections').select('title').order('created_at'),
          supabase.from('menu_items').select('*').order('created_at'),
          supabase.from('settings').select('key,value').in('key', ['section_order', 'section_renames', 'item_overrides']),
        ]);
        const customSecs = sectionsRes.error ? [] : sectionsRes.data.map((s) => s.title);
        setCustomSections(customSecs);
        if (!itemsRes.error) {
          setCustomItems(itemsRes.data.map((i) => ({
            id: i.id, name: i.name, price: i.price, description: i.description, bio: i.bio,
            section: i.section, imageData: i.image_data, imagePosition: i.image_position || '',
            extraImages: i.extra_images || [],
            gradientStart: i.gradient_start, gradientEnd: i.gradient_end, initials: i.initials,
            soldOut: i.sold_out || false,
            ratingOverride: i.rating_override ?? null,
            ratingOverrideEnabled: i.rating_override_enabled || false,
          })));
        }
        if (!settingsRes.error && settingsRes.data) {
          const orderRow = settingsRes.data.find((r) => r.key === 'section_order');
          const renamesRow = settingsRes.data.find((r) => r.key === 'section_renames');
          if (orderRow?.value) {
            // Merge: ensure all customSecs are included
            const saved = orderRow.value;
            const merged = [...saved, ...customSecs.filter((s) => !saved.includes(s))];
            setSectionOrder(merged);
          } else {
            setSectionOrder([...DEFAULT_SECTIONS, ...customSecs]);
          }
          if (renamesRow?.value) setSectionRenames(renamesRow.value);
          const overridesRow = settingsRes.data.find((r) => r.key === 'item_overrides');
          if (overridesRow?.value) {
            setItemOverrides(overridesRow.value);
            localStorage.setItem('wfd_item_overrides', JSON.stringify(overridesRow.value));
          }
        } else {
          setSectionOrder([...DEFAULT_SECTIONS, ...customSecs]);
        }
        return;
      }
      // Fallback: localStorage
      const sections = JSON.parse(localStorage.getItem('wfd_custom_sections') || '[]');
      const items = JSON.parse(localStorage.getItem('wfd_custom_items') || '[]');
      const savedOrder = JSON.parse(localStorage.getItem('wfd_section_order') || 'null');
      const savedRenames = JSON.parse(localStorage.getItem('wfd_section_renames') || '{}');
      setCustomSections(sections);
      setCustomItems(items);
      setSectionRenames(savedRenames);
      if (savedOrder) {
        setSectionOrder([...savedOrder, ...sections.filter((s) => !savedOrder.includes(s))]);
      } else {
        setSectionOrder([...DEFAULT_SECTIONS, ...sections]);
      }
    };
    loadMenuData();

    // Load orders: Supabase first, fallback to localStorage
    const loadOrders = async () => {
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .order('created_at', { ascending: false });
          if (!error && data) {
            // Normalize Supabase rows to match the localStorage shape
            const normalized = data.map((o) => ({
              id: o.id,
              date: o.created_at?.split('T')[0] || '',
              time: o.created_at?.split('T')[1]?.slice(0, 5) || '',
              day: '',
              customerInfo: {
                name: o.customer_name || '',
                email: o.customer_email || '',
                phone: o.customer_phone || '',
                address: o.customer_address || '',
                city: o.customer_city || '',
                postal: o.customer_postal || '',
                notes: o.customer_notes || '',
              },
              paymentMethod: o.payment_method || '',
              total: o.total,
              items: (o.order_items || []).map((i) => ({ name: i.item_name, price: i.price })),
            }));
            setOrders(normalized);
            return;
          }
        } catch (err) {
          console.error('Supabase fetch error:', err);
        }
      }
      // Fallback: localStorage
      const savedOrders = JSON.parse(localStorage.getItem('wfd_orders') || '[]');
      setOrders(savedOrders);
    };
    loadOrders();

    const loadReviews = async () => {
      if (supabase) {
        const { data, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
        if (!error && data) setReviews(data);
      }
    };
    loadReviews();
  }, [loggedIn]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginUser === ADMIN_USER && loginPass === ADMIN_PASS) {
      sessionStorage.setItem('wfd_admin_auth', '1');
      setLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Incorrect username or password.');
      setLoginPass('');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('wfd_admin_auth');
    setLoggedIn(false);
    setLoginUser('');
    setLoginPass('');
  };

  // ── Edit Menu helpers ──
  const startEdit = (sectionTitle, item, isCustom = false) => {
    const key = isCustom ? `custom:${item.id}` : `${sectionTitle}:${item.name}`;
    const ov = isCustom ? null : itemOverrides[key];
    setEditingKey(key);
    setEditDraft({
      name: ov?.name ?? item.name,
      price: ov?.price ?? item.price,
      description: ov?.description ?? item.description,
      bio: ov?.bio ?? item.bio ?? '',
      extraImages: ov?.extraImages ?? item.extraImages ?? [],
      imageData: ov?.imageData ?? item.imageData ?? null,
      imagePosition: ov?.imagePosition ?? item.imagePosition ?? '',
      ratingOverride: ov?.ratingOverride ?? item.ratingOverride ?? '',
      ratingOverrideEnabled: ov?.ratingOverrideEnabled ?? item.ratingOverrideEnabled ?? false,
    });
  };

  const saveEdit = async (sectionTitle, originalName) => {
    const key = `${sectionTitle}:${originalName}`;
    const price = parseFloat(editDraft.price);
    if (!editDraft.name.trim() || isNaN(price) || price <= 0) {
      showToast('Name and valid price are required!', 'error');
      return;
    }
    const updated = { ...itemOverrides, [key]: { name: editDraft.name.trim(), price, description: editDraft.description.trim(), bio: editDraft.bio?.trim() || null, extraImages: editDraft.extraImages || [], imageData: editDraft.imageData || null, imagePosition: editDraft.imagePosition || '', ratingOverride: editDraft.ratingOverride ? parseFloat(editDraft.ratingOverride) : null, ratingOverrideEnabled: editDraft.ratingOverrideEnabled || false } };
    setItemOverrides(updated);
    localStorage.setItem('wfd_item_overrides', JSON.stringify(updated));
    saveOverridesToSupabase(updated);
    if (supabase) {
      if (editDraft.imageData) {
        const { error: imgErr } = await supabase.from('settings').upsert({ key: `img_${originalName}`, value: editDraft.imageData });
        if (imgErr) {
          console.error('Image save error:', imgErr.message);
          showToast('Photo save failed: ' + imgErr.message, 'error');
          return;
        }
      } else {
        await supabase.from('settings').delete().eq('key', `img_${originalName}`);
      }
    }
    setEditingKey(null);
    showToast('Item updated!');
  };

  const saveCustomItemEdit = async (itemId) => {
    const price = parseFloat(editDraft.price);
    if (!editDraft.name.trim() || isNaN(price) || price <= 0) {
      showToast('Name and valid price are required!', 'error');
      return;
    }
    const updated = customItems.map((i) =>
      i.id === itemId
        ? { ...i, name: editDraft.name.trim(), price, description: editDraft.description.trim(), bio: editDraft.bio?.trim() || null, extraImages: editDraft.extraImages || [], imageData: editDraft.imageData ?? i.imageData, imagePosition: editDraft.imagePosition ?? i.imagePosition, ratingOverride: editDraft.ratingOverride ? parseFloat(editDraft.ratingOverride) : null, ratingOverrideEnabled: editDraft.ratingOverrideEnabled || false }
        : i
    );
    setCustomItems(updated);
    if (supabase) {
      await supabase.from('menu_items').update({
        name: editDraft.name.trim(),
        price,
        description: editDraft.description.trim(),
        bio: editDraft.bio?.trim() || null,
        extra_images: editDraft.extraImages || [],
        image_data: editDraft.imageData ?? updated.find(i => i.id === itemId)?.imageData,
        image_position: editDraft.imagePosition || null,
        rating_override: editDraft.ratingOverride ? parseFloat(editDraft.ratingOverride) : null,
        rating_override_enabled: editDraft.ratingOverrideEnabled || false,
      }).eq('id', itemId);
    } else {
      localStorage.setItem('wfd_custom_items', JSON.stringify(updated));
    }
    setEditingKey(null);
    showToast('Item updated!');
  };

  const saveOverridesToSupabase = async (overrides) => {
    if (!supabase) return;
    // Strip base64 image data — too large for a settings row, kept in localStorage only
    const stripped = Object.fromEntries(
      Object.entries(overrides).map(([k, v]) => {
        const { imageData, extraImages, ...rest } = v;
        return [k, rest];
      })
    );
    const { error } = await supabase.from('settings').upsert({ key: 'item_overrides', value: stripped });
    if (error) console.error('saveOverridesToSupabase error:', error.message);
  };

  const resetOverride = (sectionTitle, originalName) => {
    const key = `${sectionTitle}:${originalName}`;
    const updated = { ...itemOverrides };
    delete updated[key];
    setItemOverrides(updated);
    localStorage.setItem('wfd_item_overrides', JSON.stringify(updated));
    saveOverridesToSupabase(updated);
    if (supabase) supabase.from('settings').delete().eq('key', `img_${originalName}`);
    showToast('Reset to default!');
  };

  const toggleSoldOut = async (sectionTitle, item, isCustom) => {
    const newVal = !item.soldOut;
    if (isCustom) {
      const updated = customItems.map((i) => i.id === item.id ? { ...i, soldOut: newVal } : i);
      setCustomItems(updated);
      if (supabase) {
        await supabase.from('menu_items').update({ sold_out: newVal }).eq('id', item.id);
      } else {
        localStorage.setItem('wfd_custom_items', JSON.stringify(updated));
      }
    } else {
      const key = `${sectionTitle}:${item.name}`;
      const ov = itemOverrides[key] || {};
      const updated = { ...itemOverrides, [key]: { ...ov, soldOut: newVal } };
      setItemOverrides(updated);
      localStorage.setItem('wfd_item_overrides', JSON.stringify(updated));
      saveOverridesToSupabase(updated);
    }
    showToast(newVal ? 'Marked as sold out!' : 'Back in stock!');
  };

  // ── Section config helpers ──
  const saveSectionConfig = async (order, renames) => {
    if (supabase) {
      await Promise.all([
        supabase.from('settings').upsert({ key: 'section_order', value: order }),
        supabase.from('settings').upsert({ key: 'section_renames', value: renames }),
      ]);
    } else {
      localStorage.setItem('wfd_section_order', JSON.stringify(order));
      localStorage.setItem('wfd_section_renames', JSON.stringify(renames));
    }
  };

  const moveSectionUp = (title) => {
    const idx = sectionOrder.indexOf(title);
    if (idx <= 0) return;
    const updated = [...sectionOrder];
    [updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]];
    setSectionOrder(updated);
    saveSectionConfig(updated, sectionRenames);
  };

  const moveSectionDown = (title) => {
    const idx = sectionOrder.indexOf(title);
    if (idx < 0 || idx >= sectionOrder.length - 1) return;
    const updated = [...sectionOrder];
    [updated[idx + 1], updated[idx]] = [updated[idx], updated[idx + 1]];
    setSectionOrder(updated);
    saveSectionConfig(updated, sectionRenames);
  };

  const startRenameSection = (title) => {
    setEditingSectionKey(title);
    setSectionNameDraft(sectionRenames[title] ?? title);
  };

  const saveRenameSection = async (originalTitle) => {
    const newName = sectionNameDraft.trim();
    if (!newName) return;
    const updatedRenames = { ...sectionRenames, [originalTitle]: newName };
    setSectionRenames(updatedRenames);
    setEditingSectionKey(null);
    // If it's a custom section, also update title in Supabase + update all items
    if (customSections.includes(originalTitle)) {
      const updatedSections = customSections.map((s) => s === originalTitle ? newName : s);
      const updatedOrder = sectionOrder.map((s) => s === originalTitle ? newName : s);
      const updatedItems = customItems.map((i) => i.section === originalTitle ? { ...i, section: newName } : i);
      // Also remove old rename key, use new name as the key
      const fixedRenames = { ...updatedRenames };
      delete fixedRenames[originalTitle];
      setCustomSections(updatedSections);
      setSectionOrder(updatedOrder);
      setCustomItems(updatedItems);
      setSectionRenames(fixedRenames);
      if (supabase) {
        await Promise.all([
          supabase.from('menu_sections').update({ title: newName }).eq('title', originalTitle),
          supabase.from('menu_items').update({ section: newName }).eq('section', originalTitle),
          supabase.from('settings').upsert({ key: 'section_order', value: updatedOrder }),
          supabase.from('settings').upsert({ key: 'section_renames', value: fixedRenames }),
        ]);
      } else {
        localStorage.setItem('wfd_custom_sections', JSON.stringify(updatedSections));
        localStorage.setItem('wfd_section_order', JSON.stringify(updatedOrder));
        localStorage.setItem('wfd_section_renames', JSON.stringify(fixedRenames));
      }
    } else {
      // Default section — just save display name override
      saveSectionConfig(sectionOrder, updatedRenames);
    }
    showToast('Section renamed!');
  };

  // ── Orders helpers ──
  const deleteReview = async (id) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    if (supabase) await supabase.from('reviews').delete().eq('id', id);
    showToast('Review deleted.');
  };

  const deleteOrder = async (id) => {
    const updated = orders.filter((o) => o.id !== id);
    setOrders(updated);
    if (expandedOrder === id) setExpandedOrder(null);
    if (supabase) {
      await supabase.from('order_items').delete().eq('order_id', id);
      await supabase.from('orders').delete().eq('id', id);
    } else {
      localStorage.setItem('wfd_orders', JSON.stringify(updated));
    }
    showToast('Receipt deleted!');
  };

  const clearAllOrders = async () => {
    setOrders([]);
    setExpandedOrder(null);
    if (supabase) {
      await supabase.from('order_items').delete().gte('created_at', '2000-01-01');
      await supabase.from('orders').delete().gte('created_at', '2000-01-01');
    } else {
      localStorage.setItem('wfd_orders', JSON.stringify([]));
    }
    showToast('All receipts cleared!');
  };

  const allSections = [...DEFAULT_SECTIONS, ...customSections];

  const showToast = (message, type = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, message, type });
    toastTimerRef.current = setTimeout(
      () => setToast({ show: false, message: '', type: 'success' }),
      3000
    );
  };

  const addSection = async () => {
    const trimmed = newSection.trim();
    if (!trimmed) return;
    if (sectionOrder.map((s) => s.toLowerCase()).includes(trimmed.toLowerCase())) {
      showToast('Section already exists!', 'error');
      return;
    }
    const updatedSections = [...customSections, trimmed];
    const updatedOrder = [...sectionOrder, trimmed];
    setCustomSections(updatedSections);
    setSectionOrder(updatedOrder);
    setNewSection('');
    if (supabase) {
      await supabase.from('menu_sections').insert({ title: trimmed });
      await supabase.from('settings').upsert({ key: 'section_order', value: updatedOrder });
    } else {
      localStorage.setItem('wfd_custom_sections', JSON.stringify(updatedSections));
      localStorage.setItem('wfd_section_order', JSON.stringify(updatedOrder));
    }
    showToast(`"${trimmed}" section added!`);
  };

  const deleteSection = async (section) => {
    const updatedSections = customSections.filter((s) => s !== section);
    const updatedOrder = sectionOrder.filter((s) => s !== section);
    setCustomSections(updatedSections);
    setSectionOrder(updatedOrder);
    if (supabase) {
      await supabase.from('menu_sections').delete().eq('title', section);
      await supabase.from('settings').upsert({ key: 'section_order', value: updatedOrder });
    } else {
      localStorage.setItem('wfd_custom_sections', JSON.stringify(updatedSections));
      localStorage.setItem('wfd_section_order', JSON.stringify(updatedOrder));
    }
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
    reader.onload = async (ev) => {
      const compressed = await compressImage(ev.target.result);
      setNewItem((prev) => ({ ...prev, imageData: compressed }));
      setPreview(compressed);
    };
    reader.readAsDataURL(file);
  };

  const randomGradient = () => {
    const preset = GRADIENT_PRESETS[Math.floor(Math.random() * GRADIENT_PRESETS.length)];
    setNewItem((prev) => ({ ...prev, gradientStart: preset.start, gradientEnd: preset.end }));
  };

  const readFilesAsBase64 = (files) =>
    Promise.all(
      Array.from(files).map(
        (file) =>
          new Promise((resolve) => {
            if (file.size > 5 * 1024 * 1024) { resolve(null); return; }
            const reader = new FileReader();
            reader.onload = (ev) => resolve(ev.target.result);
            reader.readAsDataURL(file);
          })
      )
    ).then((results) => results.filter(Boolean));

  const handleGalleryUpload = async (e) => {
    const images = await readFilesAsBase64(e.target.files);
    if (!images.length) return;
    setNewItem((prev) => ({ ...prev, extraImages: [...prev.extraImages, ...images] }));
    e.target.value = '';
  };

  const handleEditGalleryUpload = async (e) => {
    const images = await readFilesAsBase64(e.target.files);
    if (!images.length) return;
    setEditDraft((prev) => ({ ...prev, extraImages: [...(prev.extraImages || []), ...images] }));
    e.target.value = '';
  };

  const addItem = async () => {
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
      bio: newItem.bio.trim() || null,
      section: newItem.section,
      imageData: newItem.imageData || null,
      extraImages: newItem.extraImages || [],
      gradientStart: newItem.gradientStart,
      gradientEnd: newItem.gradientEnd,
      initials,
    };
    const updated = [...customItems, item];
    setCustomItems(updated);
    if (supabase) {
      await supabase.from('menu_items').insert({
        id: item.id,
        name: item.name,
        price: item.price,
        description: item.description,
        bio: item.bio,
        section: item.section,
        image_data: item.imageData,
        extra_images: item.extraImages,
        gradient_start: item.gradientStart,
        gradient_end: item.gradientEnd,
        initials: item.initials,
      });
    } else {
      localStorage.setItem('wfd_custom_items', JSON.stringify(updated));
    }
    const keptSection = newItem.section;
    setNewItem({ ...EMPTY_ITEM, section: keptSection });
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    showToast(`${item.name} added to the menu!`);
  };

  const deleteItem = async (id) => {
    const updated = customItems.filter((item) => item.id !== id);
    setCustomItems(updated);
    if (supabase) {
      await supabase.from('menu_items').delete().eq('id', id);
    } else {
      localStorage.setItem('wfd_custom_items', JSON.stringify(updated));
    }
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
          grid-template-columns: 300px 1fr;
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
        /* Login screen */
        .login-screen {
          min-height: 100vh;
          background: var(--cream);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .login-box {
          background: white;
          padding: 50px 45px;
          max-width: 420px;
          width: 100%;
          border-radius: 12px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.1);
          text-align: center;
        }
        .login-icon {
          font-size: 3rem;
          margin-bottom: 16px;
        }
        .login-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.4rem;
          font-weight: 300;
          color: var(--dark);
          margin-bottom: 6px;
        }
        .login-title span { color: var(--red); }
        .login-subtitle {
          font-size: 0.95rem;
          color: #999;
          margin-bottom: 36px;
        }
        .login-field {
          margin-bottom: 18px;
          text-align: left;
          position: relative;
        }
        .login-label {
          display: block;
          font-family: 'Crimson Text', serif;
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--dark);
          margin-bottom: 8px;
        }
        .login-input {
          width: 100%;
          padding: 13px 16px;
          border: 2px solid var(--cream);
          border-radius: 6px;
          font-family: 'Crimson Text', serif;
          font-size: 1rem;
          transition: border-color 0.3s ease;
          background: white;
        }
        .login-input:focus { outline: none; border-color: var(--red); }
        .login-input.error-field { border-color: var(--red); }
        .pass-wrapper { position: relative; }
        .pass-toggle {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #aaa;
          font-size: 1rem;
          padding: 0;
          line-height: 1;
        }
        .pass-toggle:hover { color: var(--dark); }
        .login-error {
          background: rgba(200,68,68,0.08);
          border: 1px solid rgba(200,68,68,0.3);
          color: var(--red);
          border-radius: 6px;
          padding: 10px 14px;
          font-size: 0.9rem;
          margin-bottom: 18px;
          text-align: left;
        }
        .login-btn {
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
          border-radius: 6px;
          margin-top: 6px;
          transition: all 0.3s ease;
        }
        .login-btn:hover { background: var(--dark); transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.15); }
        .logout-btn {
          padding: 10px 22px;
          background: none;
          border: 2px solid rgba(200,68,68,0.4);
          color: var(--red);
          font-family: 'Crimson Text', serif;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.3s ease;
        }
        .logout-btn:hover { background: var(--red); color: white; border-color: var(--red); }
        @media (max-width: 700px) {
          .admin-form-grid { grid-template-columns: 1fr; }
          .admin-card { padding: 25px 18px; }
          .admin-tab { padding: 10px 14px; font-size: 0.85rem; }
          .gradient-row { flex-wrap: wrap; }
          .login-box { padding: 35px 20px; }
          .receipt-detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Login Screen */}
      {!loggedIn && (
        <div className="login-screen">
          <div className="login-box">
            <div className="login-icon">🔐</div>
            <h1 className="login-title">Admin <span>Login</span></h1>
            <p className="login-subtitle">Enter your credentials to continue</p>
            <form onSubmit={handleLogin}>
              <div className="login-field">
                <label className="login-label">Username</label>
                <input
                  type="text"
                  className={`login-input${loginError ? ' error-field' : ''}`}
                  value={loginUser}
                  onChange={(e) => { setLoginUser(e.target.value); setLoginError(''); }}
                  placeholder="Username"
                  autoComplete="username"
                />
              </div>
              <div className="login-field">
                <label className="login-label">Password</label>
                <div className="pass-wrapper">
                  <input
                    type={showPass ? 'text' : 'password'}
                    className={`login-input${loginError ? ' error-field' : ''}`}
                    value={loginPass}
                    onChange={(e) => { setLoginPass(e.target.value); setLoginError(''); }}
                    placeholder="Password"
                    autoComplete="current-password"
                  />
                  <button type="button" className="pass-toggle" onClick={() => setShowPass((p) => !p)}>
                    {showPass ? '🙈' : '👁'}
                  </button>
                </div>
              </div>
              {loginError && <div className="login-error">⚠ {loginError}</div>}
              <button type="submit" className="login-btn">Sign In</button>
            </form>
          </div>
        </div>
      )}

      {/* Admin Panel (only shown when logged in) */}
      {loggedIn && (
      <div className="admin-wrapper">
        {/* Header */}
        <div className="admin-top-bar">
          <h1 className="admin-title">Admin <span>Panel</span></h1>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{
              fontSize: '11px', fontWeight: 600, padding: '5px 10px', borderRadius: 6,
              color: '#fff', background: supabase ? '#2b8a3e' : '#c92a2a',
            }}
              title={supabase ? 'Orders save to Supabase' : 'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel'}
            >
              {supabase ? '● Supabase connected' : '● Supabase not connected'}
            </div>
            <Link href="/" className="back-link">&#8592; Back to Menu</Link>
            <button className="logout-btn" onClick={handleLogout}>Sign Out</button>
          </div>
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
            className={`admin-tab${activeTab === 'allitems' ? ' active' : ''}`}
            onClick={() => setActiveTab('allitems')}
          >
            All Items
          </button>
          <button
            className={`admin-tab${activeTab === 'receipts' ? ' active' : ''}`}
            onClick={() => setActiveTab('receipts')}
          >
            Receipts ({orders.length})
          </button>
          <button
            className={`admin-tab${activeTab === 'reviews' ? ' active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews ({reviews.length})
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
                  <label className="admin-label">Avatar Color</label>
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
                  <label className="admin-label">Description <span style={{fontWeight:400,color:'#aaa'}}>(short tagline)</span></label>
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

                <div className="admin-form-group">
                  <label className="admin-label">Bio <span style={{fontWeight:400,color:'#aaa'}}>(shown on profile)</span></label>
                  <textarea
                    className="admin-input"
                    rows={4}
                    placeholder="Write a longer bio that appears when someone clicks View Profile..."
                    value={newItem.bio}
                    onChange={(e) => setNewItem((prev) => ({ ...prev, bio: e.target.value }))}
                    style={{ resize: 'vertical', lineHeight: '1.6' }}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">Gallery Photos</label>
                  {newItem.extraImages.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px,1fr))', gap: '8px', marginBottom: '10px' }}>
                      {newItem.extraImages.map((img, i) => (
                        <div key={i} style={{ position: 'relative' }}>
                          <img src={img} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '4px' }} />
                          <button
                            type="button"
                            onClick={() => setNewItem((prev) => ({ ...prev, extraImages: prev.extraImages.filter((_, idx) => idx !== i) }))}
                            style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(200,68,68,0.85)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '0.7rem', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >×</button>
                        </div>
                      ))}
                    </div>
                  )}
                  <button type="button" className="random-btn" style={{ width: '100%' }} onClick={() => galleryInputRef.current?.click()}>
                    + Add Photos
                  </button>
                  <input ref={galleryInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleGalleryUpload} />
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
                placeholder="New section name — e.g. Chef's Specials"
                value={newSection}
                onChange={(e) => setNewSection(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addSection()}
              />
              <button className="section-add-btn" onClick={addSection}>+ Add Section</button>
            </div>

            <div className="list-heading">All Sections — drag to reorder or use arrows</div>
            <div className="section-list">
              {sectionOrder.map((s, idx) => {
                const isDefault = DEFAULT_SECTIONS.includes(s);
                const displayName = sectionRenames[s] ?? s;
                const isEditing = editingSectionKey === s;
                return (
                  <div key={s} className="section-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {/* Up / Down arrows */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <button onClick={() => moveSectionUp(s)} disabled={idx === 0} style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'default' : 'pointer', color: idx === 0 ? '#ccc' : 'var(--red)', fontSize: '0.75rem', padding: '0 4px', lineHeight: 1 }}>▲</button>
                          <button onClick={() => moveSectionDown(s)} disabled={idx === sectionOrder.length - 1} style={{ background: 'none', border: 'none', cursor: idx === sectionOrder.length - 1 ? 'default' : 'pointer', color: idx === sectionOrder.length - 1 ? '#ccc' : 'var(--red)', fontSize: '0.75rem', padding: '0 4px', lineHeight: 1 }}>▼</button>
                        </div>
                        <span className="sname">{displayName}</span>
                        {sectionRenames[s] && <span style={{ fontSize: '0.72rem', color: '#aaa' }}>({s})</span>}
                        <span className={`badge ${isDefault ? 'badge-default' : 'badge-custom'}`}>{isDefault ? 'Default' : 'Custom'}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="section-add-btn" style={{ padding: '5px 14px', fontSize: '0.85rem' }} onClick={() => isEditing ? setEditingSectionKey(null) : startRenameSection(s)}>
                          {isEditing ? 'Cancel' : 'Rename'}
                        </button>
                        {!isDefault && (
                          <button className="del-btn" onClick={() => deleteSection(s)}>Remove</button>
                        )}
                      </div>
                    </div>
                    {isEditing && (
                      <div style={{ display: 'flex', gap: '10px', marginTop: '10px', paddingLeft: '36px' }}>
                        <input
                          className="admin-input"
                          style={{ flex: 1, marginBottom: 0 }}
                          value={sectionNameDraft}
                          onChange={(e) => setSectionNameDraft(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && saveRenameSection(s)}
                          autoFocus
                        />
                        <button className="admin-submit" style={{ margin: 0, padding: '8px 20px' }} onClick={() => saveRenameSection(s)}>Save</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ALL ITEMS TAB (default + custom, unified edit) ── */}
        {activeTab === 'allitems' && (
          <div className="admin-card">
            <h2 className="admin-card-title">All Items</h2>
            {(() => {
              // Build a unified list: all section titles, each with default + custom items
              const sectionTitles = [
                ...DEFAULT_MENU.map((s) => s.title),
                ...customSections.filter((t) => !DEFAULT_MENU.find((s) => s.title === t)),
              ];

              return sectionTitles.map((sectionTitle) => {
                const defaultSection = DEFAULT_MENU.find((s) => s.title === sectionTitle);
                const defaultItems = defaultSection ? defaultSection.items : [];
                const sectionCustomItems = customItems.filter((i) => i.section === sectionTitle);
                if (defaultItems.length === 0 && sectionCustomItems.length === 0) return null;

                return (
                  <div key={sectionTitle} style={{ marginBottom: '36px' }}>
                    <div className="list-heading">{sectionTitle}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

                      {/* Default items */}
                      {defaultItems.map((item) => {
                        const key = `${sectionTitle}:${item.name}`;
                        const ov = itemOverrides[key];
                        const isEditing = editingKey === key;
                        const displayName = ov?.name ?? item.name;
                        const displayPrice = ov?.price ?? item.price;
                        const displayDesc = ov?.description ?? item.description;
                        return (
                          <div key={item.name} className="section-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                              <div>
                                <span className="sname">{displayName}</span>
                                {ov && <span className="badge badge-custom" style={{ marginLeft: '8px' }}>Edited</span>}
                                <div style={{ fontSize: '0.85rem', color: '#888', marginTop: '3px' }}>
                                  ${displayPrice % 1 === 0 ? displayPrice : displayPrice.toFixed(2)} — {displayDesc}
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                {ov && <button className="del-btn" style={{ borderColor: '#aaa', color: '#aaa' }} onClick={() => resetOverride(sectionTitle, item.name)}>Reset</button>}
                                <button
                                  className="section-add-btn"
                                  style={{ padding: '6px 14px', fontSize: '0.85rem', background: (ov?.soldOut) ? '#c84444' : undefined, color: (ov?.soldOut) ? 'white' : undefined, borderColor: (ov?.soldOut) ? '#c84444' : undefined }}
                                  onClick={() => toggleSoldOut(sectionTitle, { ...item, soldOut: ov?.soldOut ?? false }, false)}
                                >
                                  {(ov?.soldOut) ? 'Sold Out ✓' : 'Sold Out'}
                                </button>
                                <button className="section-add-btn" style={{ padding: '6px 18px', fontSize: '0.9rem' }} onClick={() => isEditing ? setEditingKey(null) : startEdit(sectionTitle, item, false)}>
                                  {isEditing ? 'Close' : 'Edit'}
                                </button>
                              </div>
                            </div>
                            {isEditing && <EditForm editDraft={editDraft} setEditDraft={setEditDraft} editGalleryInputRef={editGalleryInputRef} handleEditGalleryUpload={handleEditGalleryUpload} onSave={() => saveEdit(sectionTitle, item.name)} onCancel={() => setEditingKey(null)} />}
                          </div>
                        );
                      })}

                      {/* Custom items */}
                      {sectionCustomItems.map((item) => {
                        const key = `custom:${item.id}`;
                        const isEditing = editingKey === key;
                        return (
                          <div key={item.id} className="section-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div className="item-avatar" style={{ width: '40px', height: '40px', flexShrink: 0 }}>
                                  {item.imageData ? <img src={item.imageData} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : <div className="item-avatar-placeholder" style={{ background: `linear-gradient(135deg, ${item.gradientStart}, ${item.gradientEnd})`, width: '100%', height: '100%', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: 'white', fontWeight: 700 }}>{item.initials}</div>}
                                </div>
                                <div>
                                  <span className="sname">{item.name}</span>
                                  <span className="badge badge-custom" style={{ marginLeft: '8px' }}>Custom</span>
                                  <div style={{ fontSize: '0.85rem', color: '#888', marginTop: '3px' }}>
                                    ${formatPrice(item.price)} — {item.description}
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <button className="del-btn" onClick={() => deleteItem(item.id)}>Remove</button>
                                <button
                                  className="section-add-btn"
                                  style={{ padding: '6px 14px', fontSize: '0.85rem', background: item.soldOut ? '#c84444' : undefined, color: item.soldOut ? 'white' : undefined, borderColor: item.soldOut ? '#c84444' : undefined }}
                                  onClick={() => toggleSoldOut(sectionTitle, item, true)}
                                >
                                  {item.soldOut ? 'Sold Out ✓' : 'Sold Out'}
                                </button>
                                <button className="section-add-btn" style={{ padding: '6px 18px', fontSize: '0.9rem' }} onClick={() => isEditing ? setEditingKey(null) : startEdit(sectionTitle, item, true)}>
                                  {isEditing ? 'Close' : 'Edit'}
                                </button>
                              </div>
                            </div>
                            {isEditing && <EditForm editDraft={editDraft} setEditDraft={setEditDraft} editGalleryInputRef={editGalleryInputRef} handleEditGalleryUpload={handleEditGalleryUpload} onSave={() => saveCustomItemEdit(item.id)} onCancel={() => setEditingKey(null)} />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        )}

        {/* ── RECEIPTS TAB ── */}
        {activeTab === 'receipts' && (
          <div className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '30px' }}>
              <h2 className="admin-card-title" style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>
                Orders ({orders.length})
              </h2>
              {orders.length > 0 && (
                <button className="del-btn" onClick={clearAllOrders} style={{ padding: '8px 20px' }}>
                  Clear All
                </button>
              )}
            </div>

            {orders.length === 0 ? (
              <div className="empty-state">No orders yet — receipts will appear here when customers check out!</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {orders.map((order) => {
                  const isOpen = expandedOrder === order.id;
                  return (
                    <div key={order.id} style={{ border: '2px solid var(--cream)', borderRadius: '8px', overflow: 'hidden' }}>
                      {/* Summary row */}
                      <div
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', cursor: 'pointer', background: isOpen ? 'var(--cream)' : 'white', gap: '12px', flexWrap: 'wrap' }}
                        onClick={() => setExpandedOrder(isOpen ? null : order.id)}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <div style={{ fontWeight: 700, fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem' }}>
                            {order.customerInfo?.name || 'Unknown'}
                            <span className="badge badge-custom" style={{ marginLeft: '10px', background: order.paymentMethod === 'cash' ? '#51CF66' : '#4C6EF5' }}>
                              {order.paymentMethod === 'cash' ? 'Cash' : 'Card'}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#888' }}>
                            {order.day} {order.date} at {order.time} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontWeight: 700, color: 'var(--red)', fontSize: '1.15rem' }}>
                            ${order.total % 1 === 0 ? order.total : order.total.toFixed(2)}
                          </span>
                          <span style={{ color: '#aaa', fontSize: '0.85rem' }}>{isOpen ? '▲' : '▼'}</span>
                        </div>
                      </div>

                      {/* Expanded details */}
                      {isOpen && (
                        <div style={{ padding: '18px', borderTop: '2px solid var(--cream)', background: 'white' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '18px' }}>
                            <div>
                              <div className="admin-label" style={{ marginBottom: '8px' }}>Customer Info</div>
                              <div style={{ fontSize: '0.9rem', lineHeight: '1.7', color: '#555' }}>
                                <div><strong>{order.customerInfo?.name}</strong></div>
                                {order.customerInfo?.email && <div>{order.customerInfo.email}</div>}
                                {order.customerInfo?.phone && <div>{order.customerInfo.phone}</div>}
                                {order.customerInfo?.address && <div>{order.customerInfo.address}</div>}
                                {order.customerInfo?.city && <div>{order.customerInfo.city} {order.customerInfo.postal}</div>}
                                {order.customerInfo?.notes && (
                                  <div style={{ marginTop: '10px', padding: '8px 12px', background: '#fffbf0', border: '1px solid #f0d080', borderRadius: '6px', borderLeft: '3px solid #D4AF37' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', color: '#a07800', marginBottom: '3px' }}>NOTE</div>
                                    <div style={{ fontStyle: 'italic', color: '#555' }}>{order.customerInfo.notes}</div>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div>
                              <div className="admin-label" style={{ marginBottom: '8px' }}>Items Ordered</div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {order.items.map((item, i) => (
                                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', padding: '4px 0', borderBottom: '1px solid var(--cream)' }}>
                                    <span>{item.name}</span>
                                    <span style={{ color: 'var(--red)', fontWeight: 600 }}>${item.price % 1 === 0 ? item.price : item.price.toFixed(2)}</span>
                                  </div>
                                ))}
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginTop: '8px', fontSize: '1rem' }}>
                                  <span>Total</span>
                                  <span style={{ color: 'var(--red)' }}>${order.total % 1 === 0 ? order.total : order.total.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <button className="del-btn" onClick={() => deleteOrder(order.id)}>
                            Delete Receipt
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── REVIEWS TAB ── */}
        {activeTab === 'reviews' && (
          <div className="admin-card">
            <h2 className="admin-card-title">Reviews ({reviews.length})</h2>
            {reviews.length === 0 ? (
              <p style={{ fontFamily: "'Crimson Text', serif", fontStyle: 'italic', color: '#aaa' }}>No reviews yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {reviews.map((r) => (
                  <div key={r.id} style={{ background: '#faf8f4', border: '1px solid #e8e2d8', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: '1rem' }}>{r.reviewer_name}</span>
                        <span style={{ background: 'var(--red)', color: 'white', borderRadius: '12px', padding: '1px 10px', fontSize: '0.78rem', fontFamily: "'Crimson Text', serif" }}>{r.item_name}</span>
                        <span style={{ color: '#f0a500', fontSize: '0.9rem', letterSpacing: '2px' }}>{'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}</span>
                      </div>
                      {r.review_text && <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '0.92rem', color: '#555', fontStyle: 'italic' }}>&ldquo;{r.review_text}&rdquo;</div>}
                      <div style={{ fontSize: '0.75rem', color: '#bbb', marginTop: '4px', fontFamily: "'Crimson Text', serif" }}>
                        {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <button className="del-btn" style={{ flexShrink: 0 }} onClick={() => deleteReview(r.id)}>Delete</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      {/* Toast */}
      <div className={`admin-toast${toast.show ? ' show' : ''} ${toast.type}`}>
        {toast.type === 'success' ? '✓' : '✕'} {toast.message}
      </div>
      </div>
      )}
    </>
  );
}
