'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

const defaultMenuSections = [
  {
    title: 'Sushi & Sashimi',
    items: [
      { name: 'Kristen', price: 450, description: 'Bold and unforgettable, perfect for special occasions', gradientStart: '#C84444', gradientEnd: '#8B3030', initials: 'KR' },
      { name: 'Emma', price: 450, description: 'Sweet yet sophisticated, always a crowd favorite', gradientStart: '#E85D75', gradientEnd: '#C13584', initials: 'EM', objectPosition: '40% 20%' },
      { name: 'Anike', price: 450, description: 'Unique flavor profile with an adventurous spirit', gradientStart: '#667EEA', gradientEnd: '#764BA2', initials: 'AN' },
    ],
  },
  {
    title: 'Ramen & Noodles',
    items: [
      { name: 'Shanessa', price: 450, description: 'Warm and comforting, brings everyone together', gradientStart: '#FF6B6B', gradientEnd: '#C92A2A', initials: 'SH' },
      { name: 'Kuane', price: 425, description: 'Budget-friendly option without compromising on quality', gradientStart: '#51CF66', gradientEnd: '#2B8A3E', initials: 'KU' },
      { name: 'Zahara', price: 450, description: 'Vibrant and full of energy, never disappoints', gradientStart: '#FFA94D', gradientEnd: '#FD7E14', initials: 'ZA' },
    ],
  },
  {
    title: 'Donburi & Rice Dishes',
    items: [
      { name: 'Amelia', price: 450, description: 'Classic comfort with a modern twist', gradientStart: '#74C0FC', gradientEnd: '#4C6EF5', initials: 'AM', objectPosition: '50% 10%' },
      { name: 'Rianna', price: 450, description: 'Rich and satisfying, perfect for any mood', gradientStart: '#FF8787', gradientEnd: '#F03E3E', initials: 'RI' },
      { name: 'Gabby', price: 450, description: 'Elegant and refined, a true delicacy', gradientStart: '#A78BFA', gradientEnd: '#7C3AED', initials: 'GA' },
    ],
  },
  {
    title: 'Tempura & Appetizers',
    items: [
      { name: 'Dimetri', price: 400, description: 'Light and crispy, the perfect starter', gradientStart: '#63E6BE', gradientEnd: '#20C997', initials: 'DI' },
      { name: 'Justin', price: 400, description: 'Golden and delightful, always a hit', gradientStart: '#FFD43B', gradientEnd: '#FAB005', initials: 'JU' },
      { name: 'Kimani', price: 400, description: 'Spicy kick with incredible depth', gradientStart: '#FF922B', gradientEnd: '#FD7E14', initials: 'KI' },
    ],
  },
  {
    title: 'Soups & Sides',
    items: [
      { name: 'Nathan', price: 400, description: 'Smooth and soothing, the ultimate comfort', gradientStart: '#74B9FF', gradientEnd: '#0984E3', initials: 'NA' },
      { name: 'Scott', price: 400, description: 'Subtle flavors that grow on you', gradientStart: '#A29BFE', gradientEnd: '#6C5CE7', initials: 'SC' },
      { name: 'Davian', price: 399.99, description: 'Surprisingly complex, worth savoring', gradientStart: '#FD79A8', gradientEnd: '#E84393', initials: 'DA' },
    ],
  },
  {
    title: 'Desserts & Drinks',
    items: [
      { name: 'Jordan', price: 600, description: 'Premium indulgence, worth every penny', gradientStart: '#FDCB6E', gradientEnd: '#E17055', initials: 'JO', objectPosition: '20% 5%' },
      { name: 'Vanityi', price: 500, description: 'Sweet with a hint of mystery', gradientStart: '#FF7675', gradientEnd: '#D63031', initials: 'VA' },
      { name: 'Amanda', price: 500, description: 'Perfectly balanced, sophisticated finish', gradientStart: '#A29BFE', gradientEnd: '#6C5CE7', initials: 'AM2' },
    ],
  },
];

// Merge default sections with custom ones stored in localStorage
function buildMenuSections() {
  if (typeof window === 'undefined') return defaultMenuSections;
  try {
    const customSections = JSON.parse(localStorage.getItem('wfd_custom_sections') || '[]');
    const customItems = JSON.parse(localStorage.getItem('wfd_custom_items') || '[]');

    const overrides = JSON.parse(localStorage.getItem('wfd_item_overrides') || '{}');

    // Deep-clone defaults and apply any admin edits
    const merged = defaultMenuSections.map((s) => ({
      ...s,
      items: s.items.map((item) => {
        const key = `${s.title}:${item.name}`;
        return overrides[key] ? { ...item, ...overrides[key] } : item;
      }),
    }));

    // Add any new custom sections
    customSections.forEach((title) => {
      if (!merged.find((s) => s.title === title)) {
        merged.push({ title, items: [] });
      }
    });

    // Distribute custom items into their sections
    customItems.forEach((item) => {
      const section = merged.find((s) => s.title === item.section);
      if (section) {
        section.items.push({
          name: item.name,
          price: item.price,
          description: item.description,
          gradientStart: item.gradientStart,
          gradientEnd: item.gradientEnd,
          initials: item.initials,
          imageData: item.imageData || null,
        });
      }
    });

    return merged.filter((s) => s.items.length > 0);
  } catch {
    return defaultMenuSections;
  }
}

function formatPrice(price) {
  return price % 1 === 0 ? price : price.toFixed(2);
}

export default function RestaurantPage() {
  const [menuSections, setMenuSections] = useState(defaultMenuSections);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [toast, setToast] = useState({ show: false, message: '' });
  const [justAdded, setJustAdded] = useState(new Set());
  const [receiptData, setReceiptData] = useState(null);
  const [imgErrors, setImgErrors] = useState(new Set());

  const toastTimerRef = useRef(null);

  // Load custom items/sections from localStorage on mount
  useEffect(() => {
    setMenuSections(buildMenuSections());
  }, []);

  const showToast = (message) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, message });
    toastTimerRef.current = setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 3000);
  };

  const addToCart = (name, price) => {
    setCart((prev) => [...prev, { name, price }]);
    showToast(`${name} added to cart!`);
    setJustAdded((prev) => new Set([...prev, name]));
    setTimeout(() => {
      setJustAdded((prev) => {
        const next = new Set(prev);
        next.delete(name);
        return next;
      });
    }, 1000);
  };

  const removeFromCart = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  const checkout = () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    setCartOpen(false);
    setCustomerModalOpen(true);
  };

  const submitCustomerInfo = (e) => {
    e.preventDefault();
    const form = e.target;
    const info = {
      name: form.customerName.value,
      email: form.customerEmail.value,
      phone: form.customerPhone.value,
      address: form.customerAddress.value,
      city: form.customerCity.value,
      postal: form.customerPostal.value,
      notes: form.customerNotes.value,
    };
    setCustomerInfo(info);
    setCustomerModalOpen(false);
    setSelectedPayment(null);
    setPaymentModalOpen(true);
  };

  const confirmPayment = async () => {
    if (!selectedPayment) return;
    const now = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const order = {
      id: Date.now().toString(),
      day: days[now.getDay()],
      date: `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`,
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      items: [...cart],
      total: cartTotal,
      customerInfo: { ...customerInfo },
      paymentMethod: selectedPayment,
    };

    if (supabase) {
      try {
        const { data: savedOrder, error: orderError } = await supabase
          .from('orders')
          .insert({
            customer_name: customerInfo.name,
            customer_email: customerInfo.email,
            customer_phone: customerInfo.phone,
            customer_address: customerInfo.address,
            customer_city: customerInfo.city,
            customer_postal: customerInfo.postal,
            customer_notes: customerInfo.notes || null,
            total: cartTotal,
            payment_method: selectedPayment,
          })
          .select('id, created_at')
          .single();
        if (orderError) throw orderError;
        const orderItems = cart.map((item) => ({
          order_id: savedOrder.id,
          item_name: item.name,
          price: item.price,
        }));
        const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
        if (itemsError) throw itemsError;
        showToast('Order saved successfully!');
      } catch (err) {
        console.error('Supabase error:', err);
        showToast('Order not saved to cloud: ' + (err?.message || String(err)));
      }
    }

    try {
      const existing = JSON.parse(localStorage.getItem('wfd_orders') || '[]');
      localStorage.setItem('wfd_orders', JSON.stringify([order, ...existing]));
    } catch {}
    setReceiptData(order);
    setPaymentModalOpen(false);
    setCart([]);
    setCartOpen(false);
    setReceiptOpen(true);
  };

  const closeReceipt = () => {
    setReceiptOpen(false);
    setReceiptData(null);
  };

  const filteredSections = menuSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPrice =
          priceFilter === 'all' ||
          (priceFilter === '500' && item.price >= 500) ||
          item.price === parseInt(priceFilter);
        return matchesSearch && matchesPrice;
      }),
    }))
    .filter((section) => section.items.length > 0);

  const clearFilters = () => {
    setSearchTerm('');
    setPriceFilter('all');
  };

  return (
    <>
      {/* Header */}
      <div className="header" style={{ position: 'relative' }}>
        <Link
          href="/admin"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            fontSize: '0.8rem',
            fontFamily: "'Crimson Text', serif",
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--dark)',
            textDecoration: 'none',
            opacity: 0.35,
            padding: '6px 12px',
            border: '1px solid currentColor',
            borderRadius: '4px',
            transition: 'opacity 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.35')}
        >
          ⚙ Admin
        </Link>
        <div className="logo-container">
          <div className="sushi-bowl"></div>
          <div>
            <h1>
              WHO&#39;S FOR
              <br />
              DINNER?
            </h1>
            <div className="subtitle">Chef&#39;s Special Selection.</div>
          </div>
        </div>
        <p className="disclaimer">
          All sales are final. No refunds, returns, or exchanges will be issued for any reason. Items
          are sold as-is and as-described at the time of purchase. Availability, pricing, and
          specifications are subject to change without prior notice. The seller makes no guarantees
          beyond those expressly stated.
        </p>
      </div>

      {/* Main Content */}
      <div className="container">
        {/* Filter Bar */}
        <div className="filter-bar">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search Dishes by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <span className="filter-label">Price:</span>
            {['all', '400', '425', '450', '500'].map((p) => (
              <button
                key={p}
                className={`filter-btn${priceFilter === p ? ' active' : ''}`}
                onClick={() => setPriceFilter(p)}
              >
                {p === 'all' ? 'All' : p === '500' ? '$500+' : `$${p}`}
              </button>
            ))}
          </div>
          {/* Category Jump Dropdown */}
          <div style={{ position: 'relative' }}>
            <select
              className="search-input"
              style={{ paddingLeft: '16px', cursor: 'pointer', minWidth: '180px' }}
              defaultValue=""
              onChange={(e) => {
                const id = e.target.value;
                if (!id) return;
                const el = document.getElementById(id);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                e.target.value = '';
              }}
            >
              <option value="" disabled>Jump to Category...</option>
              {menuSections.map((s) => (
                <option key={s.title} value={`section-${s.title.replace(/\s+/g, '-')}`}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          <button className="clear-filters" onClick={clearFilters}>
            Clear All
          </button>
        </div>

        {/* Menu Sections */}
        {filteredSections.map((section) => (
          <div key={section.title} id={`section-${section.title.replace(/\s+/g, '-')}`} className="menu-section">
            <div className="section-header">
              <h2>{section.title}</h2>
              <div className="section-divider"></div>
            </div>
            <div className="items-grid">
              {section.items.map((item) => (
                <div key={item.name} className="menu-item">
                  <div className="item-image">
                    {item.imageData ? (
                      <img
                        src={item.imageData}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                      />
                    ) : !imgErrors.has(item.name) ? (
                      <img
                        src={`/images/${item.name.toLowerCase()}.jpg`}
                        alt={item.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: '50%',
                          ...(item.objectPosition ? { objectPosition: item.objectPosition } : {}),
                        }}
                        onError={() => setImgErrors((prev) => new Set([...prev, item.name]))}
                      />
                    ) : (
                      <div
                        className="placeholder-img"
                        style={{
                          '--gradient-start': item.gradientStart,
                          '--gradient-end': item.gradientEnd,
                        }}
                      >
                        {item.initials}
                      </div>
                    )}
                  </div>
                  <div className="item-name">{item.name}</div>
                  <div className="item-description">{item.description}</div>
                  <div className="item-price">${formatPrice(item.price)}</div>
                  <button
                    className="add-btn"
                    onClick={() => addToCart(item.name, item.price)}
                    style={
                      justAdded.has(item.name)
                        ? { background: 'var(--gold)', color: 'var(--dark)' }
                        : {}
                    }
                  >
                    <span>{justAdded.has(item.name) ? 'Added! ✓' : 'Add to Cart'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Overlay */}
      <div className={`overlay${cartOpen ? ' active' : ''}`} onClick={() => setCartOpen(false)}></div>

      {/* Cart Float Button */}
      <div className="cart-float" onClick={() => setCartOpen(true)}>
        🛒
        <div className="cart-count">{cart.length}</div>
      </div>

      {/* Cart Panel */}
      <div className={`cart-panel${cartOpen ? ' open' : ''}`}>
        <div className="cart-header">
          <h3>Your Order</h3>
          <button className="close-cart" onClick={() => setCartOpen(false)}>
            ×
          </button>
        </div>
        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-cart-icon">🍽️</div>
              <p>Your cart is empty</p>
            </div>
          ) : (
            cart.map((item, index) => (
              <div key={index} className="cart-item">
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">${formatPrice(item.price)}</div>
                </div>
                <button className="remove-btn" onClick={() => removeFromCart(index)}>
                  ×
                </button>
              </div>
            ))
          )}
        </div>
        <div className="cart-footer">
          <div className="cart-total">
            <span>Total:</span>
            <span>${formatPrice(cartTotal)}</span>
          </div>
          <button className="checkout-btn" onClick={checkout}>
            Place Order
          </button>
          <p className="legal-note">
            By completing a purchase, the buyer acknowledges responsibility for their selection and
            agrees that dissatisfaction, change of mind, or regret does not constitute grounds for
            reversal of the transaction. Please review all options carefully before purchasing.
            Applicable taxes may apply where required by law.
          </p>
        </div>
      </div>

      {/* Customer Info Modal */}
      {customerModalOpen && (
        <div className="customer-modal active">
          <div className="customer-content">
            <button className="customer-close" onClick={() => setCustomerModalOpen(false)}>
              ×
            </button>
            <h2 className="customer-title">Customer Information</h2>
            <p className="customer-subtitle">Please fill in your details to complete your order</p>

            <div className="order-summary">
              <div className="order-summary-title">Order Summary</div>
              {cart.map((item, i) => (
                <div key={i} className="order-summary-item">
                  <span>{item.name}</span>
                  <span>${formatPrice(item.price)}</span>
                </div>
              ))}
              <div className="order-summary-item">
                <span>Total</span>
                <span>${formatPrice(cartTotal)}</span>
              </div>
            </div>

            <form onSubmit={submitCustomerInfo}>
              <div className="form-group">
                <label className="form-label">
                  Full Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  name="customerName"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Email Address <span className="required">*</span>
                </label>
                <input
                  type="email"
                  className="form-input"
                  name="customerEmail"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Phone Number <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  className="form-input"
                  name="customerPhone"
                  placeholder="+1 (123) 456-7890"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Street Address <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  name="customerAddress"
                  placeholder="123 Main Street"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    City <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    name="customerCity"
                    placeholder="City"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Postal Code <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    name="customerPostal"
                    placeholder="12345"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Special Instructions (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  name="customerNotes"
                  placeholder="Any special requests or delivery instructions"
                />
              </div>
              <button type="submit" className="customer-submit">
                Continue to Payment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {paymentModalOpen && (
        <div className="payment-modal active">
          <div className="payment-content">
            <button className="payment-close" onClick={() => setPaymentModalOpen(false)}>
              ×
            </button>
            <h2 className="payment-title">Select Payment Method</h2>
            <p className="payment-subtitle">How would you like to pay?</p>
            <div className="payment-total">Total: ${formatPrice(cartTotal)}</div>
            <div className="payment-methods">
              <div
                className={`payment-option${selectedPayment === 'card' ? ' selected' : ''}`}
                onClick={() => setSelectedPayment('card')}
              >
                <div className="payment-icon">💳</div>
                <div className="payment-label">Card</div>
              </div>
              <div
                className={`payment-option${selectedPayment === 'cash' ? ' selected' : ''}`}
                onClick={() => setSelectedPayment('cash')}
              >
                <div className="payment-icon">💵</div>
                <div className="payment-label">Cash</div>
              </div>
            </div>
            <button
              className={`payment-confirm${selectedPayment ? ' active' : ''}`}
              onClick={confirmPayment}
            >
              Confirm Payment
            </button>
          </div>
        </div>
      )}

      {/* Receipt */}
      {receiptOpen && receiptData && (
        <div className="receipt-overlay active">
          <div className="receipt">
            <button className="receipt-close" onClick={closeReceipt}>
              ×
            </button>
            <div className="receipt-title">RECEIPT</div>
            <div className="receipt-date-row">
              <div>
                <strong>Day:</strong> {receiptData.day}
              </div>
              <div>
                <strong>Date:</strong> {receiptData.date}
              </div>
            </div>

            <div
              style={{
                marginBottom: '20px',
                padding: '15px',
                background: 'rgba(255,255,255,0.05)',
                border: '2px solid rgba(255,255,255,0.2)',
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: '10px', fontSize: '1.1rem' }}>
                Customer Information
              </div>
              <div style={{ fontSize: '0.95rem', lineHeight: 1.8 }}>
                <div>
                  <strong>Name:</strong> {receiptData.customerInfo.name}
                </div>
                <div>
                  <strong>Email:</strong> {receiptData.customerInfo.email}
                </div>
                <div>
                  <strong>Phone:</strong> {receiptData.customerInfo.phone}
                </div>
                <div>
                  <strong>Address:</strong> {receiptData.customerInfo.address},{' '}
                  {receiptData.customerInfo.city}, {receiptData.customerInfo.postal}
                </div>
                {receiptData.customerInfo.notes && (
                  <div>
                    <strong>Notes:</strong> {receiptData.customerInfo.notes}
                  </div>
                )}
              </div>
            </div>

            <table className="receipt-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Name of Dish</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {receiptData.items.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}.</td>
                    <td>{item.name}</td>
                    <td>${formatPrice(item.price)}</td>
                  </tr>
                ))}
                {Array.from(
                  { length: Math.max(0, 7 - receiptData.items.length) },
                  (_, i) => (
                    <tr key={`empty-${i}`} className="empty-row">
                      <td>{receiptData.items.length + i + 1}.</td>
                      <td></td>
                      <td></td>
                    </tr>
                  )
                )}
                <tr>
                  <td>
                    {Math.min(
                      receiptData.items.length + Math.max(0, 7 - receiptData.items.length) + 1,
                      8
                    )}
                    .
                  </td>
                  <td>Payment Method</td>
                  <td>{receiptData.paymentMethod === 'card' ? '💳 Card' : '💵 Cash'}</td>
                </tr>
                <tr className="total-row">
                  <td>9.</td>
                  <td>Total</td>
                  <td>${formatPrice(receiptData.total)}</td>
                </tr>
              </tbody>
            </table>

            <div className="receipt-contact">
              +123-456-7890 | @Who&#39;sforDinner? | 123 Jordan&#39;s House, St, Any City
            </div>
            <div className="receipt-buttons">
              <button className="receipt-btn primary" onClick={() => window.print()}>
                Print Receipt
              </button>
              <button className="receipt-btn" onClick={closeReceipt}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <div className={`toast${toast.show ? ' show' : ''}`}>
        <div className="toast-icon">✓</div>
        <div className="toast-message">{toast.message}</div>
      </div>
    </>
  );
}
