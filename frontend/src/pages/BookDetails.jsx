import React, { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { updateBook, addBook } from '../services/api';

function BookDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const isNew = id === 'new';

  // book data is passed via navigate state from Library.jsx
  const bookFromState = location.state?.book;

  const [form, setForm] = useState({
    title:         bookFromState?.title         || '',
    author:        bookFromState?.author        || '',
    genre:         bookFromState?.genre         || '',
    totalPages:    bookFromState?.totalPages    || '',
    yearPublished: bookFromState?.yearPublished || '',
    status:        bookFromState?.status        || 'Want to Read',
    rating:        bookFromState?.rating        || '',
    notes:         bookFromState?.notes         || '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSave() {
    if (!form.title.trim()) {
      setError('Title is required.');
      return;
    }
    setSaving(true);
    setError('');
    const userID = Number(localStorage.getItem('userID'));
    try {
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

  // --- STYLES (matching existing purple theme) ---
  const pageStyle = {
    display: 'flex', minHeight: '100vh', fontFamily: 'Arial',
  };
  const sidebarStyle = {
    width: '220px', backgroundColor: '#6200ea', padding: '30px 20px',
    display: 'flex', flexDirection: 'column', gap: '10px',
  };
  const sidebarButtonStyle = {
    backgroundColor: 'transparent', border: 'none', color: 'white',
    textAlign: 'left', padding: '10px', cursor: 'pointer',
    fontWeight: 'bold', fontSize: '14px',
  };
  const mainStyle = {
    flex: 1, backgroundColor: '#f0f0f0', padding: '40px',
  };
  const cardStyle = {
    backgroundColor: 'white', borderRadius: '12px',
    padding: '30px', maxWidth: '560px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
  };
  const labelStyle = {
    display: 'block', fontSize: '12px', fontWeight: 'bold',
    color: '#555', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em',
  };
  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: '1px solid #ccc', fontSize: '14px', boxSizing: 'border-box',
    marginBottom: '18px', backgroundColor: '#fafafa',
  };
  const selectStyle = { ...inputStyle };
  const textareaStyle = { ...inputStyle, height: '90px', resize: 'vertical' };
  const rowStyle = { display: 'flex', gap: '16px' };
  const halfStyle = { flex: 1 };
  const saveButtonStyle = {
    padding: '11px 28px', backgroundColor: '#6200ea', color: 'white',
    border: 'none', borderRadius: '8px', cursor: 'pointer',
    fontWeight: 'bold', fontSize: '14px',
  };
  const cancelButtonStyle = {
    padding: '11px 28px', backgroundColor: 'white', color: '#6200ea',
    border: '1px solid #6200ea', borderRadius: '8px', cursor: 'pointer',
    fontWeight: 'bold', fontSize: '14px', marginRight: '10px',
  };

  return (
    <div style={pageStyle}>

      {/* SIDEBAR */}
      <div style={sidebarStyle}>
        <h2 style={{ color: 'white', marginBottom: '30px' }}>LitLog</h2>
        {['DASHBOARD', 'LIBRARY', 'BOOKSHELVES', 'BOOK DETAILS', 'RECOMMENDATIONS'].map(item => (
          <button
            key={item}
            onClick={() => {
              if (item === 'DASHBOARD') navigate('/dashboard');
              if (item === 'LIBRARY') navigate('/library');
            }}
            style={sidebarButtonStyle}>
            {item}
          </button>
        ))}
      </div>

      {/* MAIN */}
      <div style={mainStyle}>
        <h2 style={{ marginBottom: '24px' }}>{isNew ? 'ADD BOOK' : 'EDIT BOOK'}</h2>

        <div style={cardStyle}>

          {/* Title */}
          <label style={labelStyle}>Title *</label>
          <input
            style={inputStyle} name="title"
            value={form.title} onChange={handleChange}
            placeholder="Book title"
          />

          {/* Author */}
          <label style={labelStyle}>Author</label>
          <input
            style={inputStyle} name="author"
            value={form.author} onChange={handleChange}
            placeholder="Author name"
          />

          {/* Genre */}
          <label style={labelStyle}>Genre</label>
          <input
            style={inputStyle} name="genre"
            value={form.genre} onChange={handleChange}
            placeholder="e.g. Fiction, Mystery..."
          />

          {/* Total Pages + Year Published side by side */}
          <div style={rowStyle}>
            <div style={halfStyle}>
              <label style={labelStyle}>Total Pages</label>
              <input
                style={inputStyle} name="totalPages" type="number" min="0"
                value={form.totalPages} onChange={handleChange}
                placeholder="e.g. 320"
              />
            </div>
            <div style={halfStyle}>
              <label style={labelStyle}>Year Published</label>
              <input
                style={inputStyle} name="yearPublished" type="number" min="0"
                value={form.yearPublished} onChange={handleChange}
                placeholder="e.g. 2001"
              />
            </div>
          </div>

          {/* Status + Rating side by side */}
          <div style={rowStyle}>
            <div style={halfStyle}>
              <label style={labelStyle}>Shelf / Status</label>
              <select style={selectStyle} name="status" value={form.status} onChange={handleChange}>
                <option>Want to Read</option>
                <option>Currently Reading</option>
                <option>Finished</option>
                <option>Did Not Finish</option>
              </select>
            </div>
            <div style={halfStyle}>
              <label style={labelStyle}>Rating (1–5)</label>
              <select style={selectStyle} name="rating" value={form.rating} onChange={handleChange}>
                <option value="">No rating</option>
                {[1, 2, 3, 4, 5].map(r => (
                  <option key={r} value={r}>{r} ★</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <label style={labelStyle}>Notes</label>
          <textarea
            style={textareaStyle} name="notes"
            value={form.notes} onChange={handleChange}
            placeholder="Any personal notes about this book..."
          />

          {/* Error */}
          {error && (
            <p style={{ color: 'red', fontSize: '13px', marginBottom: '14px' }}>{error}</p>
          )}

          {/* Buttons */}
          <div>
            <button style={cancelButtonStyle} onClick={() => navigate('/library')}>
              Cancel
            </button>
            <button style={saveButtonStyle} onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : isNew ? 'Add Book' : 'Save Changes'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default BookDetails;
