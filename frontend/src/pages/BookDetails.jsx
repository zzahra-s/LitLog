import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { updateBook, addBook, getBooks } from '../services/api';

function ProfileMenu({ username, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const initials = username ? username.slice(0, 2).toUpperCase() : '?';

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        title={username}
        style={{
          width: '38px', height: '38px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
          border: '2px solid rgba(255,255,255,0.4)',
          color: 'white', fontWeight: '800', fontSize: '13px',
          cursor: 'pointer', display: 'flex', alignItems: 'center',
          justifyContent: 'center', letterSpacing: '0.04em',
          boxShadow: '0 2px 8px rgba(109,40,217,0.35)',
          transition: 'box-shadow 0.2s, transform 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.07)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        {initials}
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '46px', right: 0,
          backgroundColor: 'white', borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(91,33,182,0.18)',
          minWidth: '180px', overflow: 'hidden', zIndex: 1000,
          animation: 'dropIn 0.15s ease',
        }}>
          <style>{`@keyframes dropIn { from { opacity:0; transform:translateY(-6px) } to { opacity:1; transform:translateY(0) } }`}</style>
          <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid #f3f0ff' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#3b0764' }}>{username}</div>
            <div style={{ fontSize: '11px', color: '#a78bfa', marginTop: '2px' }}>Logged in</div>
          </div>
          <button
            onClick={onLogout}
            style={{
              width: '100%', textAlign: 'left', padding: '11px 16px',
              border: 'none', backgroundColor: 'transparent', cursor: 'pointer',
              fontSize: '13px', fontWeight: '600', color: '#dc2626',
              display: 'flex', alignItems: 'center', gap: '8px',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fff5f5'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <span>🚪</span> Log Out
          </button>
        </div>
      )}
    </div>
  );
}

//Field wrapper for consistent spacing 
function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <label style={{
        display: 'block', fontSize: '10px', fontWeight: '800',
        color: '#a78bfa', marginBottom: '6px',
        letterSpacing: '0.1em', textTransform: 'uppercase',
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputBase = {
  width: '100%', padding: '10px 12px', borderRadius: '10px',
  border: '1.5px solid #ddd6fe', fontSize: '13px', boxSizing: 'border-box',
  backgroundColor: '#faf5ff', color: '#3b0764', outline: 'none',
  fontFamily: "'Georgia', serif", transition: 'border-color 0.15s',
};

function BookDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isNew = id === 'new';
  const bookFromState = location.state?.book;

  const username = localStorage.getItem('username') || 'Reader';

  const [form, setForm] = useState({
    title:        bookFromState?.title        || '',
    author:       bookFromState?.author       || '',
    genre:        bookFromState?.genre        || '',
    totalPages:   bookFromState?.totalPages   || '',
    yearPublished:bookFromState?.yearPublished|| '',
    status:       bookFromState?.status       || 'Want to Read',
    rating:       bookFromState?.rating       || '',
    notes:        bookFromState?.notes        || '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  function handleLogout() {
    if (!window.confirm('Are you sure you want to log out?')) return;
    localStorage.removeItem('token');
    localStorage.removeItem('userID');
    localStorage.removeItem('username');
    navigate('/');
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  }

  async function handleSave() {
    if (!form.title.trim()) { setError('Title is required.'); return; }
    setSaving(true);
    setError('');
    const userID = Number(localStorage.getItem('userID'));
    try {
      if (isNew) {
        const existingBooks = await getBooks(userID);
        const duplicate = existingBooks.find(
          b =>
            b.title.trim().toLowerCase()  === form.title.trim().toLowerCase() &&
            b.author.trim().toLowerCase() === form.author.trim().toLowerCase()
        );
        if (duplicate) {
          setError(`"${form.title}" by ${form.author} is already in your library.`);
          setSaving(false);
          return;
        }
      }

      const bookData = {
        title:         form.title,
        author:        form.author,
        genre:         form.genre,
        totalPages:    Number(form.totalPages)    || 0,
        yearPublished: Number(form.yearPublished) || null,
        status:        form.status,
        rating:        form.rating ? Number(form.rating) : null,
        notes:         form.notes || null,
      };

      if (isNew) {
        await addBook({ ...bookData, userID });
      } else {
        await updateBook(id, bookData);
      }
      navigate('/library');
    } catch (err) {
      setError(err.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  }

  const sidebarItems = ['DASHBOARD', 'LIBRARY', 'BOOKSHELVES', 'PROGRESS', 'RECOMMENDATIONS'];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Georgia', serif", backgroundColor: '#f4f1fb' }}>

      {/* SIDEBAR */}
      <div style={{
        width: '210px', backgroundColor: '#5b21b6', padding: '28px 18px',
        display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0,
        boxShadow: '4px 0 20px rgba(91,33,182,0.18)',
      }}>
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ color: 'white', fontSize: '26px', fontWeight: '800', letterSpacing: '-0.5px', margin: 0 }}>LitLog</h2>
          <p style={{ color: '#c4b5fd', fontSize: '11px', margin: '4px 0 0 0' }}>Hello, {username} 👋</p>
        </div>
        {sidebarItems.map(item => (
          <button
            key={item}
            onClick={() => {
              if (item === 'DASHBOARD')       navigate('/dashboard');
              if (item === 'LIBRARY')         navigate('/library');
              if (item === 'BOOKSHELVES')     navigate('/bookshelves');
              if (item === 'PROGRESS')        navigate('/progress');
              if (item === 'RECOMMENDATIONS') navigate('/recommendations');
            }}
            style={{
              backgroundColor: 'transparent',
              border: 'none', color: 'white', textAlign: 'left',
              padding: '10px 14px', cursor: 'pointer', fontWeight: '600',
              fontSize: '12px', letterSpacing: '0.08em', borderRadius: '8px',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {item}
          </button>
        ))}
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>

        {/* TOP BAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#3b0764', margin: 0, letterSpacing: '0.05em' }}>
              {isNew ? 'ADD BOOK' : 'EDIT BOOK'}
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#a78bfa', fontStyle: 'italic' }}>
              {isNew ? 'Fill in the details to add a book to your library' : 'Update the details for this book'}
            </p>
          </div>
          <ProfileMenu username={username} onLogout={handleLogout} />
        </div>

        {/* FORM CARD */}
        <div style={{
          backgroundColor: 'white', borderRadius: '16px',
          padding: '28px 32px', maxWidth: '600px',
          boxShadow: '0 2px 10px rgba(109,40,217,0.08)',
          border: '1px solid #ede9fe',
        }}>

          {/* Book icon header strip */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            marginBottom: '24px', paddingBottom: '20px',
            borderBottom: '1px solid #f3f0ff',
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #5b21b6, #4f46e5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '22px', boxShadow: '0 4px 12px rgba(91,33,182,0.25)',
            }}>
              📖
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '800', color: '#3b0764' }}>
                {isNew ? 'New Book' : (form.title || 'Edit Book')}
              </div>
              <div style={{ fontSize: '11px', color: '#a78bfa', marginTop: '2px' }}>
                {isNew ? 'Adding to your library' : (form.author ? `by ${form.author}` : 'Update book details')}
              </div>
            </div>
          </div>

          {/* Title */}
          <Field label="Title *">
            <input
              style={inputBase} name="title"
              value={form.title} onChange={handleChange}
              placeholder="Book title"
              onFocus={e => e.target.style.borderColor = '#7c3aed'}
              onBlur={e => e.target.style.borderColor = '#ddd6fe'}
            />
          </Field>

          {/* Author */}
          <Field label="Author">
            <input
              style={inputBase} name="author"
              value={form.author} onChange={handleChange}
              placeholder="Author name"
              onFocus={e => e.target.style.borderColor = '#7c3aed'}
              onBlur={e => e.target.style.borderColor = '#ddd6fe'}
            />
          </Field>

          {/* Genre */}
          <Field label="Genre">
            <input
              style={inputBase} name="genre"
              value={form.genre} onChange={handleChange}
              placeholder="e.g. Fiction, Mystery, Sci-Fi..."
              onFocus={e => e.target.style.borderColor = '#7c3aed'}
              onBlur={e => e.target.style.borderColor = '#ddd6fe'}
            />
          </Field>

          {/* Pages + Year row */}
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <Field label="Total Pages">
                <input
                  style={inputBase} name="totalPages" type="number" min="0"
                  value={form.totalPages} onChange={handleChange}
                  placeholder="e.g. 320"
                  onFocus={e => e.target.style.borderColor = '#7c3aed'}
                  onBlur={e => e.target.style.borderColor = '#ddd6fe'}
                />
              </Field>
            </div>
            <div style={{ flex: 1 }}>
              <Field label="Year Published">
                <input
                  style={inputBase} name="yearPublished" type="number" min="0"
                  value={form.yearPublished} onChange={handleChange}
                  placeholder="e.g. 2001"
                  onFocus={e => e.target.style.borderColor = '#7c3aed'}
                  onBlur={e => e.target.style.borderColor = '#ddd6fe'}
                />
              </Field>
            </div>
          </div>

          {/* Status + Rating row */}
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <Field label="Shelf / Status">
                <select
                  style={inputBase} name="status"
                  value={form.status} onChange={handleChange}
                  onFocus={e => e.target.style.borderColor = '#7c3aed'}
                  onBlur={e => e.target.style.borderColor = '#ddd6fe'}
                >
                  <option>Want to Read</option>
                  <option>Currently Reading</option>
                  <option>Finished</option>
                  <option>Did Not Finish</option>
                </select>
              </Field>
            </div>
            <div style={{ flex: 1 }}>
              <Field label="Rating (1–5)">
                <select
                  style={inputBase} name="rating"
                  value={form.rating} onChange={handleChange}
                  onFocus={e => e.target.style.borderColor = '#7c3aed'}
                  onBlur={e => e.target.style.borderColor = '#ddd6fe'}
                >
                  <option value="">No rating</option>
                  {[1, 2, 3, 4, 5].map(r => (
                    <option key={r} value={r}>{r} ★</option>
                  ))}
                </select>
              </Field>
            </div>
          </div>

          {/* Notes */}
          <Field label="Notes">
            <textarea
              style={{ ...inputBase, height: '90px', resize: 'vertical' }}
              name="notes"
              value={form.notes} onChange={handleChange}
              placeholder="Any personal notes about this book..."
              onFocus={e => e.target.style.borderColor = '#7c3aed'}
              onBlur={e => e.target.style.borderColor = '#ddd6fe'}
            />
          </Field>

          {/* Error message */}
          {error && (
            <div style={{
              backgroundColor: '#fff5f5', border: '1px solid #fca5a5',
              borderRadius: '10px', padding: '10px 14px',
              marginBottom: '18px', color: '#dc2626',
              fontSize: '13px', fontWeight: '600',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '4px' }}>
            <button
              onClick={() => navigate('/library')}
              style={{
                padding: '10px 22px', borderRadius: '10px',
                border: '1.5px solid #ddd6fe',
                backgroundColor: 'white', color: '#7c3aed',
                fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f3f0ff'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'white'; }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '10px 28px', borderRadius: '10px',
                background: saving
                  ? '#e5e7eb'
                  : 'linear-gradient(135deg, #5b21b6, #4f46e5)',
                border: 'none', color: saving ? '#9ca3af' : 'white',
                fontSize: '13px', fontWeight: '800', cursor: saving ? 'default' : 'pointer',
                boxShadow: saving ? 'none' : '0 2px 8px rgba(91,33,182,0.28)',
                transition: 'all 0.2s',
                letterSpacing: '0.03em',
              }}
              onMouseEnter={e => { if (!saving) e.currentTarget.style.opacity = '0.88'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
            >
              {saving ? 'Saving...' : isNew ? '+ Add Book' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookDetails;
