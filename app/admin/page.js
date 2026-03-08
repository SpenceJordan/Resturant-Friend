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
  const [activeTab, setActiveTab] = useState('items');
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
    const sections = JSON.parse(localStorage.getItem('wfd_custom_sections') || '[]');
    const items = JSON.parse(localStorage.getItem('wfd_custom_items') || '[]');
    const overrides = JSON.parse(localStorage.getItem('wfd_item_overrides') || '{}');
    setCustomSections(sections);
    setCustomItems(items);
    setItemOverrides(overrides);

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
              date: o.date || o.created_at?.split('T')[0],
              time: o.time || o.created_at?.split('T')[1]?.slice(0, 5),
              day: o.day || '',
              customerInfo: o.customer_info || o.customerInfo || {},
              paymentMethod: o.payment_method || o.paymentMethod || '',
              total: o.total,
              items: (o.order_items || []).map((i) => ({ name: i.name, price: i.price })),
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
  const startEdit = (sectionTitle, item) => {
    const key = `${sectionTitle}:${item.name}`;
    const ov = itemOverrides[key];
    setEditingKey(key);
    setEditDraft({ name: ov?.name ?? item.name, price: ov?.price ?? item.price, description: ov?.description ?? item.description, bio: ov?.bio ?? item.bio ?? '', extraImages: ov?.extraImages ?? item.extraImages ?? [] });
  };

  const saveEdit = (sectionTitle, originalName) => {
    const key = `${sectionTitle}:${originalName}`;
    const price = parseFloat(editDraft.price);
    if (!editDraft.name.trim() || isNaN(price) || price <= 0) {
      showToast('Name and valid price are required!', 'error');
      return;
    }
    const updated = { ...itemOverrides, [key]: { name: editDraft.name.trim(), price, description: editDraft.description.trim(), bio: editDraft.bio?.trim() || null, extraImages: editDraft.extraImages || [] } };
    setItemOverrides(updated);
    localStorage.setItem('wfd_item_overrides', JSON.stringify(updated));
    setEditingKey(null);
    showToast('Item updated!');
  };

  const resetOverride = (sectionTitle, originalName) => {
    const key = `${sectionTitle}:${originalName}`;
    const updated = { ...itemOverrides };
    delete updated[key];
    setItemOverrides(updated);
    localStorage.setItem('wfd_item_overrides', JSON.stringify(updated));
    showToast('Reset to default!');
  };

  // ── Orders helpers ──
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
      await supabase.from('order_items').delete().neq('id', 0);
      await supabase.from('orders').delete().neq('id', 0);
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
            className={`admin-tab${activeTab === 'manage' ? ' active' : ''}`}
            onClick={() => setActiveTab('manage')}
          >
            All Entries ({customItems.length})
          </button>
          <button
            className={`admin-tab${activeTab === 'edit' ? ' active' : ''}`}
            onClick={() => setActiveTab('edit')}
          >
            Edit Menu
          </button>
          <button
            className={`admin-tab${activeTab === 'receipts' ? ' active' : ''}`}
            onClick={() => setActiveTab('receipts')}
          >
            Receipts ({orders.length})
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

        {/* ── EDIT MENU TAB ── */}
        {activeTab === 'edit' && (
          <div className="admin-card">
            <h2 className="admin-card-title">Edit Main Dishes</h2>
            {DEFAULT_MENU.map((section) => (
              <div key={section.title} style={{ marginBottom: '36px' }}>
                <div className="list-heading">{section.title}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {section.items.map((item) => {
                    const key = `${section.title}:${item.name}`;
                    const ov = itemOverrides[key];
                    const isEditing = editingKey === key;
                    const displayName = ov?.name ?? item.name;
                    const displayPrice = ov?.price ?? item.price;
                    const displayDesc = ov?.description ?? item.description;
                    return (
                      <div key={item.name} className="section-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '12px' }}>
                        {!isEditing ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                            <div>
                              <span className="sname">{displayName}</span>
                              {ov && <span className="badge badge-custom" style={{ marginLeft: '8px' }}>Edited</span>}
                              <div style={{ fontSize: '0.85rem', color: '#888', marginTop: '3px' }}>
                                ${displayPrice % 1 === 0 ? displayPrice : displayPrice.toFixed(2)} — {displayDesc}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              {ov && (
                                <button className="del-btn" style={{ borderColor: '#aaa', color: '#aaa' }} onClick={() => resetOverride(section.title, item.name)}>
                                  Reset
                                </button>
                              )}
                              <button className="section-add-btn" style={{ padding: '6px 18px', fontSize: '0.9rem' }} onClick={() => startEdit(section.title, item)}>
                                Edit
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
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
                              <label className="admin-label">Bio</label>
                              <textarea className="admin-input" rows={3} value={editDraft.bio || ''} onChange={(e) => setEditDraft((p) => ({ ...p, bio: e.target.value }))} placeholder="Profile bio..." style={{ resize: 'vertical', lineHeight: '1.6' }} />
                            </div>
                            <div className="admin-form-group" style={{ marginBottom: '12px' }}>
                              <label className="admin-label">Gallery</label>
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
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <button className="admin-submit" style={{ margin: 0, flex: 1, padding: '10px' }} onClick={() => saveEdit(section.title, item.name)}>
                                Save
                              </button>
                              <button className="del-btn" style={{ flex: 1 }} onClick={() => setEditingKey(null)}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
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
                                {order.customerInfo?.notes && <div style={{ fontStyle: 'italic', marginTop: '6px' }}>"{order.customerInfo.notes}"</div>}
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

      {/* Toast */}
      <div className={`admin-toast${toast.show ? ' show' : ''} ${toast.type}`}>
        {toast.type === 'success' ? '✓' : '✕'} {toast.message}
      </div>
      </div>
      )}
    </>
  );
}
