import React, { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { updateBook, addBook, getBooks} from '../services/api';

function BookDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isNew = id === 'new';
  const bookFromState = location.state?.book;

  const username = localStorage.getItem('username') || 'Reader';
  const sidebarItems = ['DASHBOARD', 'LIBRARY', 'BOOKSHELVES', 'PROGRESS', 'RECOMMENDATIONS'];

  const [form, setForm] = useState({
    title:bookFromState?.title ||'',
    author:bookFromState?.author|| '',
    genre:bookFromState?.genre || '',
    totalPages:bookFromState?.totalPages|| '',
    yearPublished: bookFromState?.yearPublished|| '',
    status:bookFromState?.status|| 'Want to Read',
    rating:bookFromState?.rating|| '',
    notes:bookFromState?.notes|| '',
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

  const pageStyle = {
    display: 'flex', minHeight: '100vh', fontFamily: "'Georgia', serif", backgroundColor: '#f4f1fb',
  };
  const mainStyle = {
    flex: 1, padding: '40px', overflowY: 'auto',
  };
  const cardStyle = {
    backgroundColor: 'white', borderRadius: '12px',
    padding: '30px', maxWidth: '560px', boxShadow: '0 2px 10px rgba(109,40,217,0.08)',
    border: '1px solid #ede9fe',
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
    padding: '11px 28px', backgroundColor: '#6d28d9', color: 'white',
    border: 'none', borderRadius: '8px', cursor: 'pointer',
    fontWeight: 'bold', fontSize: '14px',
  };
  const cancelButtonStyle = {
    padding: '11px 28px', backgroundColor: 'white', color: '#7c3aed',
    border: '1px solid #7c3aed', borderRadius: '8px', cursor: 'pointer',
    fontWeight: 'bold', fontSize: '14px', marginRight: '10px',
  };

  return (
    <div style={pageStyle}>

      {/* SIDEBAR — matches BookShelves exactly */}
      <div style={{
        width: '210px', backgroundColor: '#5b21b6', padding: '28px 18px',
        display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0,
        boxShadow: '4px 0 20px rgba(91,33,182,0.18)',
      }}>
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ color: 'white', fontSize: '26px', fontWeight: '800', letterSpacing: '-0.5px', margin: 0 }}>LitLog</h2>
          <p style={{ color: '#c4b5fd', fontSize: '11px', margin: '4px 0 0 0' }}>Hello, {username} 👋</p>
        </div>
        {sidebarItems.map(item => {
          const isActive = item === 'BOOK DETAILS';
          return (
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
                backgroundColor: isActive ? 'rgba(255,255,255,0.18)' : 'transparent',
                border: 'none', color: 'white', textAlign: 'left',
                padding: '10px 14px', cursor: 'pointer', fontWeight: '600',
                fontSize: '12px', letterSpacing: '0.08em', borderRadius: '8px',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = isActive ? 'rgba(255,255,255,0.18)' : 'transparent'}
            >
              {item}
            </button>
          );
        })}
      </div>

      {/* MAIN */}
      <div style={mainStyle}>
        <h2 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: '800', color: '#3b0764', letterSpacing: '0.05em' }}>
          {isNew ? 'ADD BOOK' : 'EDIT BOOK'}
        </h2>

        <div style={cardStyle}>
          <label style={labelStyle}>Title *</label>
          <input
            style={inputStyle} name="title"
            value={form.title} onChange={handleChange}
            placeholder="Book title"
          />
          <label style={labelStyle}>Author</label>
          <input
            style={inputStyle} name="author"
            value={form.author} onChange={handleChange}
            placeholder="Author name"
          />
          <label style={labelStyle}>Genre</label>
          <input
            style={inputStyle} name="genre"
            value={form.genre} onChange={handleChange}
            placeholder="e.g. Fiction, Mystery..."
          />
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
          <label style={labelStyle}>Notes</label>
          <textarea
            style={textareaStyle} name="notes"
            value={form.notes} onChange={handleChange}
            placeholder="Any personal notes about this book..."
          />
          {error && (
            <p style={{ color: 'red', fontSize: '13px', marginBottom: '14px' }}>{error}</p>
          )}
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