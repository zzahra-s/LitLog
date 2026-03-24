import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { addBook, updateBook, getBookById } from '../services/api';

const SHELVES = ['Want to Read', 'Currently Reading', 'Finished', 'Did Not Finish'];

const SHELF_COLORS = {
  'Want to Read':       { bg: '#e8f4fd', color: '#1565c0', dot: '#1976d2' },
  'Currently Reading':  { bg: '#fff8e1', color: '#f57f17', dot: '#ffa000' },
  'Finished':           { bg: '#e8f5e9', color: '#2e7d32', dot: '#43a047' },
  'Did Not Finish':     { bg: '#fce4ec', color: '#c62828', dot: '#e53935' },
};

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: 'flex', gap: '6px' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          onClick={() => onChange(star === value ? '' : star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          style={{
            fontSize: '28px',
            cursor: 'pointer',
            color: star <= (hovered || value) ? '#f59e0b' : '#d1d5db',
            transition: 'color 0.15s, transform 0.15s',
            transform: star <= (hovered || value) ? 'scale(1.2)' : 'scale(1)',
            display: 'inline-block',
            userSelect: 'none',
          }}
        >
          ★
        </span>
      ))}
      {value ? (
        <span style={{ fontSize: '13px', color: '#9ca3af', alignSelf: 'center', marginLeft: '4px' }}>
          {value}/5
        </span>
      ) : null}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{
        display: 'block',
        fontSize: '11px',
        fontWeight: '700',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: '#6b7280',
        marginBottom: '7px',
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  border: '1.5px solid #e5e7eb',
  borderRadius: '10px',
  fontSize: '14px',
  color: '#111827',
  backgroundColor: '#fafafa',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s, background 0.2s',
};

function BookDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isNew = id === 'new';

  const bookData = location.state?.bookData || {};

  const [title, setTitle]   = useState(bookData.title || '');
  const [author, setAuthor] = useState(bookData.author || '');
  const [genre, setGenre]   = useState(bookData.genre || '');
  const [pages, setPages]   = useState(bookData.pages || bookData.totalPages || '');
  const [year, setYear]     = useState(bookData.year || bookData.yearPublished || '');
  const [shelf, setShelf]   = useState(bookData.shelf || bookData.status || 'Want to Read');
  const [rating, setRating] = useState('');
  const [notes, setNotes]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError]   = useState('');
  const [focused, setFocused]   = useState('');

  useEffect(() => {
    if (!isNew) {
      setFetching(true);
      getBookById(id)
        .then(data => {
          // SQL returns PascalCase columns — map them explicitly
          setTitle(data.Title || data.title || '');
          setAuthor(data.Author || data.author || '');
          setGenre(data.Genre || data.genre || '');
          setPages(data.TotalPages ?? data.totalPages ?? '');
          setYear(data.YearPublished ?? data.yearPublished ?? '');
          setShelf(data.Status || data.status || 'Want to Read');
          setRating(data.Rating ?? data.rating ?? '');
          setNotes(data.Notes || data.notes || '');
        })
        .catch(() => setError('Failed to load book details.'))
        .finally(() => setFetching(false));
    }
  }, [id, isNew]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim() || !author.trim()) {
      setError('Title and Author are required.');
      return;
    }
    const userID = Number(localStorage.getItem('userID'));
    const bookPayload = {
      title,
      author,
      genre,
      totalPages: pages && !isNaN(pages) ? Number(pages) : null,
      yearPublished: year && !isNaN(year) ? Number(year) : null,
      status: shelf,
      rating: rating && !isNaN(rating) ? Number(rating) : null,
      notes,
      userID,
    };
    setLoading(true);
    try {
      if (isNew) {
        await addBook(bookPayload);
      } else {
        await updateBook(id, bookPayload);
      }
      navigate('/library');
    } catch (err) {
      setError('Failed to save book. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const shelfStyle = SHELF_COLORS[shelf] || SHELF_COLORS['Want to Read'];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Segoe UI', system-ui, sans-serif", backgroundColor: '#f3f4f6' }}>

      {/* SIDEBAR */}
      <div style={{
        width: '220px', backgroundColor: '#6200ea', padding: '30px 20px',
        display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0,
      }}>
        <h2 style={{ color: 'white', marginBottom: '30px', fontSize: '22px', letterSpacing: '-0.5px' }}>📚 LitLog</h2>
        {['DASHBOARD', 'LIBRARY'].map(item => (
          <button
            key={item}
            onClick={() => navigate(item === 'DASHBOARD' ? '/dashboard' : '/library')}
            style={{
              backgroundColor: 'transparent', border: 'none', color: 'rgba(255,255,255,0.75)',
              textAlign: 'left', padding: '10px 12px', cursor: 'pointer',
              fontWeight: '600', fontSize: '13px', borderRadius: '8px',
              letterSpacing: '0.05em',
            }}
          >
            {item}
          </button>
        ))}
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <button
            onClick={() => navigate('/library')}
            style={{
              background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer',
              fontSize: '13px', padding: 0, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '5px',
            }}
          >
            ← Back to Library
          </button>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#111827', margin: 0, letterSpacing: '-0.5px' }}>
            {isNew ? 'Add New Book' : 'Edit Book'}
          </h1>
          {!isNew && title && (
            <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>
              Editing <strong style={{ color: '#374151' }}>{title}</strong>
            </p>
          )}
        </div>

        {fetching ? (
          <div style={{ color: '#6b7280', fontSize: '15px' }}>Loading book details…</div>
        ) : (
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

            {/* FORM CARD */}
            <div style={{
              backgroundColor: 'white', borderRadius: '16px', padding: '32px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)',
              flex: '1', minWidth: '340px', maxWidth: '560px',
            }}>
              {error && (
                <div style={{
                  backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca',
                  padding: '12px 16px', borderRadius: '10px', marginBottom: '24px', fontSize: '13px',
                }}>
                  ⚠ {error}
                </div>
              )}

              <Field label="Book Title *">
                <input
                  type="text" value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. The Great Gatsby"
                  onFocus={() => setFocused('title')} onBlur={() => setFocused('')}
                  style={{ ...inputStyle, borderColor: focused === 'title' ? '#6200ea' : '#e5e7eb', backgroundColor: focused === 'title' ? '#fff' : '#fafafa' }}
                />
              </Field>

              <Field label="Author *">
                <input
                  type="text" value={author} onChange={e => setAuthor(e.target.value)}
                  placeholder="e.g. F. Scott Fitzgerald"
                  onFocus={() => setFocused('author')} onBlur={() => setFocused('')}
                  style={{ ...inputStyle, borderColor: focused === 'author' ? '#6200ea' : '#e5e7eb', backgroundColor: focused === 'author' ? '#fff' : '#fafafa' }}
                />
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Field label="Genre">
                  <input
                    type="text" value={genre} onChange={e => setGenre(e.target.value)}
                    placeholder="e.g. Fiction"
                    onFocus={() => setFocused('genre')} onBlur={() => setFocused('')}
                    style={{ ...inputStyle, borderColor: focused === 'genre' ? '#6200ea' : '#e5e7eb', backgroundColor: focused === 'genre' ? '#fff' : '#fafafa' }}
                  />
                </Field>

                <Field label="Publication Year">
                  <input
                    type="number" value={year} onChange={e => setYear(e.target.value)}
                    placeholder="e.g. 2023"
                    onFocus={() => setFocused('year')} onBlur={() => setFocused('')}
                    style={{ ...inputStyle, borderColor: focused === 'year' ? '#6200ea' : '#e5e7eb', backgroundColor: focused === 'year' ? '#fff' : '#fafafa' }}
                  />
                </Field>
              </div>

              <Field label="Total Pages">
                <input
                  type="number" value={pages} onChange={e => setPages(e.target.value)}
                  placeholder="e.g. 320"
                  onFocus={() => setFocused('pages')} onBlur={() => setFocused('')}
                  style={{ ...inputStyle, borderColor: focused === 'pages' ? '#6200ea' : '#e5e7eb', backgroundColor: focused === 'pages' ? '#fff' : '#fafafa' }}
                />
              </Field>

              <Field label="Reading Shelf">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {SHELVES.map(s => {
                    const c = SHELF_COLORS[s];
                    const selected = shelf === s;
                    return (
                      <button
                        key={s}
                        onClick={() => setShelf(s)}
                        style={{
                          padding: '7px 14px', borderRadius: '20px', cursor: 'pointer',
                          fontSize: '13px', fontWeight: '600', border: '2px solid',
                          borderColor: selected ? c.dot : '#e5e7eb',
                          backgroundColor: selected ? c.bg : 'white',
                          color: selected ? c.color : '#6b7280',
                          transition: 'all 0.15s',
                        }}
                      >
                        <span style={{
                          marginRight: '5px', fontSize: '8px', verticalAlign: 'middle',
                          display: 'inline-block', width: '8px', height: '8px',
                          borderRadius: '50%', backgroundColor: selected ? c.dot : '#d1d5db',
                        }} />
                        {s}
                      </button>
                    );
                  })}
                </div>
              </Field>

              <Field label="Your Rating">
                <StarRating value={Number(rating)} onChange={setRating} />
              </Field>

              <Field label="Personal Notes">
                <textarea
                  value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Write your thoughts, favourite quotes, or reminders…"
                  rows="4"
                  onFocus={() => setFocused('notes')} onBlur={() => setFocused('')}
                  style={{
                    ...inputStyle, resize: 'vertical', lineHeight: '1.6',
                    borderColor: focused === 'notes' ? '#6200ea' : '#e5e7eb',
                    backgroundColor: focused === 'notes' ? '#fff' : '#fafafa',
                  }}
                />
              </Field>

              {/* ACTION BUTTONS */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  onClick={handleSave} disabled={loading}
                  style={{
                    flex: 1, padding: '12px', backgroundColor: loading ? '#a78bfa' : '#6200ea',
                    color: 'white', border: 'none', borderRadius: '10px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: '700', fontSize: '14px', letterSpacing: '0.03em',
                    transition: 'background 0.2s',
                  }}
                >
                  {loading ? 'Saving…' : isNew ? '+ Add Book' : '✓ Save Changes'}
                </button>
                <button
                  onClick={() => navigate('/library')}
                  style={{
                    padding: '12px 20px', backgroundColor: 'white', color: '#374151',
                    border: '1.5px solid #e5e7eb', borderRadius: '10px', cursor: 'pointer',
                    fontWeight: '600', fontSize: '14px',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* LIVE PREVIEW CARD */}
            <div style={{
              backgroundColor: 'white', borderRadius: '16px', padding: '28px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)',
              width: '220px', flexShrink: 0,
            }}>
              <p style={{
                fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em',
                textTransform: 'uppercase', color: '#9ca3af', marginBottom: '16px', marginTop: 0,
              }}>
                Preview
              </p>

              {/* Book cover visual */}
              <div style={{
                height: '180px', borderRadius: '8px', marginBottom: '16px',
                background: 'linear-gradient(135deg, #7c3aed, #6200ea)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '4px 4px 12px rgba(98,0,234,0.25)',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  background: 'linear-gradient(to right, rgba(0,0,0,0.15) 0%, transparent 20%)',
                }} />
                <span style={{ fontSize: '48px' }}>📖</span>
              </div>

              <p style={{ fontWeight: '700', fontSize: '14px', color: '#111827', margin: '0 0 4px 0', lineHeight: '1.3' }}>
                {title || <span style={{ color: '#d1d5db' }}>Book Title</span>}
              </p>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 12px 0' }}>
                {author || <span style={{ color: '#e5e7eb' }}>Author Name</span>}
              </p>

              {genre && (
                <span style={{
                  display: 'inline-block', padding: '3px 10px', borderRadius: '12px',
                  backgroundColor: '#f3f4f6', color: '#374151', fontSize: '11px',
                  fontWeight: '600', marginBottom: '10px',
                }}>
                  {genre}
                </span>
              )}

              <div style={{
                marginTop: '8px', padding: '10px', borderRadius: '10px',
                backgroundColor: shelfStyle.bg,
              }}>
                <p style={{ fontSize: '11px', fontWeight: '700', color: shelfStyle.color, margin: 0 }}>
                  {shelf}
                </p>
              </div>

              {rating ? (
                <div style={{ marginTop: '10px', fontSize: '16px', color: '#f59e0b', letterSpacing: '2px' }}>
                  {'★'.repeat(Number(rating))}
                  <span style={{ color: '#d1d5db' }}>{'★'.repeat(5 - Number(rating))}</span>
                </div>
              ) : null}

              {(pages || year) && (
                <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {pages && <span style={{ fontSize: '11px', color: '#9ca3af' }}>{pages} pages</span>}
                  {pages && year && <span style={{ color: '#d1d5db' }}>·</span>}
                  {year && <span style={{ fontSize: '11px', color: '#9ca3af' }}>{year}</span>}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default BookDetails;