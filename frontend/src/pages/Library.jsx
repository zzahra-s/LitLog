import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBooks, deleteBook, addBook } from '../services/api';
import { searchExternalBooks } from '../services/externalapi';

const BASE_URL = 'http://localhost:5001';

// ── Profile Dropdown ──────────────────────────────────────────────────────────
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

// ── Book Summary Modal ────────────────────────────────────────────────────────
function BookSummaryModal({ book, onClose, onAdd }) {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  if (!book) return null;

  async function handleAdd() {
    setAdding(true);
    await onAdd(book);
    setAdding(false);
    setAdded(true);
  }

  const stars = book.rating > 0
    ? '★'.repeat(Math.round(book.rating)) + '☆'.repeat(5 - Math.round(book.rating))
    : null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        backgroundColor: 'rgba(30, 10, 60, 0.55)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.18s ease',
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: translateY(0) } }
        .summary-modal::-webkit-scrollbar { width: 5px; }
        .summary-modal::-webkit-scrollbar-track { background: #f3f0ff; border-radius: 10px; }
        .summary-modal::-webkit-scrollbar-thumb { background: #c4b5fd; border-radius: 10px; }
      `}</style>
      <div
        className="summary-modal"
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: 'white', borderRadius: '20px',
          width: '100%', maxWidth: '560px', maxHeight: '85vh', overflowY: 'auto',
          boxShadow: '0 24px 80px rgba(91, 33, 182, 0.28)',
          animation: 'slideUp 0.22s ease',
        }}
      >
        <div style={{
          background: 'linear-gradient(135deg, #5b21b6 0%, #4f46e5 100%)',
          borderRadius: '20px 20px 0 0',
          padding: '24px 28px 20px',
          display: 'flex', gap: '20px', alignItems: 'flex-start',
        }}>
          <div style={{
            width: '80px', height: '110px', borderRadius: '10px', overflow: 'hidden',
            flexShrink: 0, boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
            backgroundColor: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {book.cover && book.cover.startsWith('http')
              ? <img src={book.cover} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: '36px' }}>📖</span>}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ color: 'white', margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800', lineHeight: 1.3, fontFamily: "'Georgia', serif" }}>
              {book.title}
            </h2>
            <p style={{ color: '#c4b5fd', fontSize: '13px', margin: '0 0 10px 0', fontWeight: '600' }}>by {book.author}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
              {book.yearPublished && book.yearPublished !== 'N/A' && (
                <span style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#ffffff22', color: 'white', fontSize: '11px', fontWeight: '600', padding: '3px 9px', borderRadius: '20px' }}>📅 {book.yearPublished}</span>
              )}
              {book.totalPages > 0 && (
                <span style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#ffffff22', color: 'white', fontSize: '11px', fontWeight: '600', padding: '3px 9px', borderRadius: '20px' }}>📄 {book.totalPages} pages</span>
              )}
              {stars && (
                <span style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#ffffff22', color: '#fde68a', fontSize: '11px', fontWeight: '600', padding: '3px 9px', borderRadius: '20px' }}>
                  {stars} <span style={{ color: 'white', marginLeft: '4px' }}>({book.rating}/5)</span>
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.18)', border: 'none', color: 'white', borderRadius: '50%', width: '30px', height: '30px', flexShrink: 0, cursor: 'pointer', fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>
        <div style={{ padding: '24px 28px 28px' }}>
          <section style={{ marginBottom: '22px' }}>
            <h3 style={{ fontSize: '11px', fontWeight: '800', color: '#7c3aed', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 10px 0' }}>About this book</h3>
            <p style={{ fontSize: '13px', color: '#444', lineHeight: 1.8, margin: 0, fontFamily: "'Georgia', serif" }}>
              {book.description ? book.description : <span style={{ color: '#aaa', fontStyle: 'italic' }}>No description available.</span>}
            </p>
          </section>
          <section style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '11px', fontWeight: '800', color: '#7c3aed', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 10px 0' }}>Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { label: 'Genre', value: book.genre !== 'Unknown' ? book.genre : '—' },
                { label: 'Pages', value: book.totalPages > 0 ? book.totalPages : '—' },
                { label: 'Published', value: book.yearPublished !== 'N/A' ? book.yearPublished : '—' },
                { label: 'Community Rating', value: book.rating > 0 ? `${book.rating} / 5` : '—' },
              ].map(({ label, value }) => (
                <div key={label} style={{ backgroundColor: '#faf5ff', borderRadius: '10px', padding: '10px 14px', border: '1px solid #ede9fe' }}>
                  <div style={{ fontSize: '10px', fontWeight: '700', color: '#a78bfa', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '3px' }}>{label}</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#3b0764' }}>{value}</div>
                </div>
              ))}
            </div>
          </section>
          <button
            onClick={handleAdd} disabled={adding || added}
            style={{
              width: '100%', padding: '13px',
              background: added ? 'linear-gradient(135deg, #059669, #10b981)' : 'linear-gradient(135deg, #5b21b6, #4f46e5)',
              border: 'none', borderRadius: '12px', color: 'white', fontSize: '14px', fontWeight: '800',
              cursor: adding || added ? 'default' : 'pointer', transition: 'all 0.25s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
            onMouseEnter={e => { if (!adding && !added) e.currentTarget.style.opacity = '0.88'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >
            {added ? '✅ Added to Library!' : adding ? 'Adding...' : '+ Add to Library'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Library Component ────────────────────────────────────────────────────
function Library() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterGenre, setFilterGenre] = useState('');
  const [filterShelf, setFilterShelf] = useState('');
  const [filterRating, setFilterRating] = useState('');
  const [openDropdown, setOpenDropdown] = useState(null);
  const [externalResults, setExternalResults] = useState([]);
  const [externalQuery, setExternalQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const username = localStorage.getItem('username') || 'Reader';

  useEffect(() => {
    const userID = Number(localStorage.getItem('userID'));
    if (!userID || isNaN(userID)) { navigate('/'); return; }
    getBooks(userID).then(data => {
      setBooks(data.map(b => ({ ...b, title: b.title || 'Untitled', author: b.author || 'Unknown' })));
    });
  }, [navigate]);

  useEffect(() => {
    function handleClick() { setOpenDropdown(null); }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  function handleLogout() {
    if (!window.confirm('Are you sure you want to log out?')) return;
    localStorage.removeItem('userID');
    localStorage.removeItem('username');
    navigate('/');
  }

  const genreOptions = [...new Set(books.map(b => b.genre).filter(Boolean))].sort();
  const activeFilterCount = [filterGenre, filterShelf, filterRating].filter(Boolean).length;

  const filteredBooks = books.filter(book => {
    const matchesSearch =
      (book.title?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (book.author?.toLowerCase() || '').includes(search.toLowerCase());
    const matchesGenre = !filterGenre || (book.genre?.toLowerCase() === filterGenre.toLowerCase());
    const matchesShelf = !filterShelf || book.status === filterShelf;
    const matchesRating = !filterRating || Number(book.rating) >= Number(filterRating);
    return matchesSearch && matchesGenre && matchesShelf && matchesRating;
  });

  async function handleDelete(id) {
    if (window.confirm('Are you sure you want to delete this book?')) {
      await deleteBook(id);
      setBooks(books.filter(b => b.id !== id));
    }
  }

  async function handleMoveShelf(id, newStatus) {
    try {
      await fetch(`${BASE_URL}/books/${id}/shelf`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      setBooks(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
    } catch (err) {
      alert('Failed to update shelf: ' + err.message);
    }
    setOpenDropdown(null);
  }

  async function handleViewSummary(book) {
    if (book.id && !book.description) {
      try {
        const res = await fetch(`https://www.googleapis.com/books/v1/volumes/${book.id}`);
        const data = await res.json();
        setSelectedBook({ ...book, description: data.volumeInfo?.description || null });
        return;
      } catch { /* fall through */ }
    }
    setSelectedBook(book);
  }

  async function handleExternalSearch(e) {
    const query = e.target.value;
    setExternalQuery(query);
    if (query.length > 2) {
      const results = await searchExternalBooks(query);
      setExternalResults(results);
    } else {
      setExternalResults([]);
    }
  }

  async function handleAddExternalBook(book) {
    const userID = Number(localStorage.getItem('userID'));
    if (!userID || isNaN(userID)) { alert('User not logged in'); return; }
    const title = book.title?.trim();
    if (!title) { alert('Cannot add a book without a title'); return; }
    const alreadyExists = books.some(
      b => b.title.trim().toLowerCase() === title.toLowerCase() &&
           (b.author || '').trim().toLowerCase() === (book.author || '').trim().toLowerCase()
    );
    if (alreadyExists) { alert(`"${title}" is already in your library.`); return; }
    try {
      await addBook({ ...book, userID, totalPages: Number(book.totalPages) || 0, yearPublished: Number(book.yearPublished) || null, genre: book.genre || 'Unknown' });
      getBooks(userID).then(data => {
        setBooks(data.map(b => ({ ...b, title: b.title || 'Untitled', author: b.author || 'Unknown' })));
      });
    } catch (err) {
      alert('Failed to add book: ' + err.message);
    }
  }

  const statusColor = {
    'Currently Reading': '#7c3aed',
    'Finished': '#059669',
    'Want to Read': '#4f46e5',
    'Did Not Finish': '#dc2626',
  };

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
              if (item === 'DASHBOARD') navigate('/dashboard');
              if (item === 'LIBRARY') navigate('/library');
              if (item === 'BOOKSHELVES') navigate('/bookshelves');
              if (item === 'PROGRESS') navigate('/progress');
            }}
            style={{
              backgroundColor: item === 'LIBRARY' ? 'rgba(255,255,255,0.18)' : 'transparent',
              border: 'none', color: 'white', textAlign: 'left',
              padding: '10px 14px', cursor: 'pointer', fontWeight: '600',
              fontSize: '12px', letterSpacing: '0.08em', borderRadius: '8px',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = item === 'LIBRARY' ? 'rgba(255,255,255,0.18)' : 'transparent'}
          >
            {item}
          </button>
        ))}
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>

        {selectedBook && (
          <BookSummaryModal
            book={selectedBook}
            onClose={() => setSelectedBook(null)}
            onAdd={async (book) => { await handleAddExternalBook(book); }}
          />
        )}

        {/* TOP BAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#3b0764', margin: 0, letterSpacing: '0.05em' }}>
            LIBRARY
          </h2>
          <ProfileMenu username={username} onLogout={handleLogout} />
        </div>

        {/* SEARCH + FILTER BAR */}
        <div style={{
          backgroundColor: 'white', borderRadius: '16px',
          padding: '16px 20px', marginBottom: '20px',
          boxShadow: '0 2px 10px rgba(109,40,217,0.08)',
          border: '1px solid #ede9fe',
        }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: '180px', backgroundColor: '#faf5ff', borderRadius: '10px', border: '1.5px solid #ddd6fe', overflow: 'hidden' }}>
              <span style={{ padding: '0 10px', color: '#a78bfa', fontSize: '14px' }}>🔍</span>
              <input
                type="text"
                placeholder="Search your library..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ flex: 1, padding: '9px 10px 9px 0', border: 'none', outline: 'none', fontSize: '13px', backgroundColor: 'transparent', color: '#3b0764', fontFamily: "'Georgia', serif" }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: '180px', backgroundColor: '#faf5ff', borderRadius: '10px', border: '1.5px solid #ddd6fe', overflow: 'hidden' }}>
              <span style={{ padding: '0 10px', color: '#a78bfa', fontSize: '14px' }}>🌐</span>
              <input
                type="text"
                placeholder="Search books online..."
                value={externalQuery}
                onChange={handleExternalSearch}
                style={{ flex: 1, padding: '9px 10px 9px 0', border: 'none', outline: 'none', fontSize: '13px', backgroundColor: 'transparent', color: '#3b0764', fontFamily: "'Georgia', serif" }}
              />
            </div>
            <button
              onClick={() => setShowFilters(f => !f)}
              style={{
                padding: '9px 16px', borderRadius: '10px', border: '1.5px solid',
                borderColor: showFilters ? '#7c3aed' : '#ddd6fe',
                backgroundColor: showFilters ? '#7c3aed' : 'white',
                color: showFilters ? 'white' : '#7c3aed',
                fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s',
              }}
            >
              ⚙ Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </button>
            <button
              onClick={() => navigate('/bookdetails/new')}
              style={{
                padding: '9px 18px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #5b21b6, #4f46e5)',
                border: 'none', color: 'white',
                fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                letterSpacing: '0.04em', boxShadow: '0 2px 8px rgba(91,33,182,0.25)',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              + Add Book
            </button>
          </div>

          {showFilters && (
            <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #f3f0ff', display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#a78bfa', marginBottom: '6px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Genre</label>
                <select value={filterGenre} onChange={e => setFilterGenre(e.target.value)} style={{ padding: '7px 12px', borderRadius: '8px', border: '1.5px solid #ddd6fe', fontSize: '12px', backgroundColor: 'white', cursor: 'pointer', color: '#3b0764', outline: 'none', fontFamily: "'Georgia', serif" }}>
                  <option value="">All Genres</option>
                  {genreOptions.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#a78bfa', marginBottom: '6px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Shelf</label>
                <select value={filterShelf} onChange={e => setFilterShelf(e.target.value)} style={{ padding: '7px 12px', borderRadius: '8px', border: '1.5px solid #ddd6fe', fontSize: '12px', backgroundColor: 'white', cursor: 'pointer', color: '#3b0764', outline: 'none', fontFamily: "'Georgia', serif" }}>
                  <option value="">All Shelves</option>
                  {['Want to Read', 'Currently Reading', 'Finished', 'Did Not Finish'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#a78bfa', marginBottom: '6px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Min Rating</label>
                <div style={{ display: 'flex', gap: '5px' }}>
                  {['', 1, 2, 3, 4, 5].map(r => (
                    <button key={r} onClick={() => setFilterRating(r)} style={{ padding: '6px 10px', borderRadius: '7px', border: '1.5px solid', borderColor: filterRating === r ? '#7c3aed' : '#ddd6fe', backgroundColor: filterRating === r ? '#7c3aed' : 'white', color: filterRating === r ? 'white' : '#7c3aed', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>
                      {r === '' ? 'Any' : `${r}★`}
                    </button>
                  ))}
                </div>
              </div>
              {activeFilterCount > 0 && (
                <button onClick={() => { setFilterGenre(''); setFilterShelf(''); setFilterRating(''); }} style={{ padding: '7px 14px', backgroundColor: 'white', border: '1.5px solid #fca5a5', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', color: '#dc2626', fontWeight: '700' }}>
                  ✕ Clear
                </button>
              )}
            </div>
          )}
        </div>

        {/* BOOK TABLE — overflow: visible so dropdown isn't clipped */}
        <div style={{
          backgroundColor: 'white', borderRadius: '16px',
          boxShadow: '0 2px 10px rgba(109,40,217,0.08)',
          border: '1px solid #ede9fe', overflow: 'visible', // ← FIXED
          marginBottom: externalResults.length > 0 ? '24px' : 0,
        }}>
          {/* Header row gets its own borderRadius to restore the top-corner clip */}
          <div style={{
            display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.4fr 0.8fr 1fr',
            padding: '12px 20px', backgroundColor: '#faf5ff',
            borderBottom: '1px solid #ede9fe',
            borderRadius: '16px 16px 0 0', // ← FIXED
          }}>
            {['Title', 'Author', 'Shelf', 'Rating', 'Actions'].map(h => (
              <div key={h} style={{ fontSize: '10px', fontWeight: '800', color: '#a78bfa', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{h}</div>
            ))}
          </div>

          {filteredBooks.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#bbb', fontSize: '13px' }}>
              {books.length === 0 ? <><div style={{ fontSize: '40px', marginBottom: '10px' }}>📚</div>No books yet. Add some above!</> : 'No books match your filters.'}
            </div>
          ) : filteredBooks.map((book, i) => (
            <div
              key={book.id}
              style={{
                display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.4fr 0.8fr 1fr',
                padding: '14px 20px', alignItems: 'center',
                borderBottom: i < filteredBooks.length - 1 ? '1px solid #f3f0ff' : 'none',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#faf5ff'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div style={{ paddingRight: '12px' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#3b0764', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{book.title}</div>
              </div>
              <div style={{ fontSize: '12px', color: '#666', paddingRight: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{book.author}</div>
              <div>
                <span style={{ fontSize: '10px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', backgroundColor: `${statusColor[book.status] || '#888'}18`, color: statusColor[book.status] || '#888', letterSpacing: '0.04em' }}>
                  {book.status}
                </span>
              </div>
              <div style={{ fontSize: '13px', color: book.rating ? '#f59e0b' : '#ccc', fontWeight: '700' }}>
                {book.rating ? '★'.repeat(book.rating) : '—'}
              </div>
              <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => setOpenDropdown(openDropdown === book.id ? null : book.id)}
                  style={{ padding: '6px 12px', borderRadius: '8px', border: '1.5px solid #ddd6fe', backgroundColor: 'white', color: '#7c3aed', fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f3f0ff'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'white'; }}
                >
                  Options ▾
                </button>
                {openDropdown === book.id && (
                  <div style={{ position: 'absolute', top: '36px', right: 0, backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 8px 32px rgba(91,33,182,0.18)', border: '1px solid #ede9fe', zIndex: 500, minWidth: '180px', overflow: 'hidden', animation: 'dropIn 0.15s ease' }}>
                    <div onClick={() => navigate(`/bookdetails/${book.id}`, { state: { book } })} style={{ padding: '10px 16px', fontSize: '13px', cursor: 'pointer', color: '#3b0764', fontWeight: '600', borderBottom: '1px solid #f3f0ff' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#faf5ff'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>✏️ Edit Details</div>
                    <div onClick={() => handleDelete(book.id)} style={{ padding: '10px 16px', fontSize: '13px', cursor: 'pointer', color: '#dc2626', fontWeight: '600', borderBottom: '1px solid #f3f0ff' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fff5f5'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>🗑 Delete</div>
                    <div style={{ padding: '8px 16px 4px', fontSize: '10px', fontWeight: '800', color: '#a78bfa', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Move to shelf</div>
                    {['Currently Reading', 'Want to Read', 'Finished', 'Did Not Finish'].map(shelf => (
                      <div key={shelf} onClick={() => handleMoveShelf(book.id, shelf)} style={{ padding: '8px 16px', fontSize: '12px', cursor: 'pointer', color: statusColor[shelf] || '#555', fontWeight: '600', opacity: book.status === shelf ? 0.4 : 1 }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#faf5ff'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                        {shelf}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* EXTERNAL SEARCH RESULTS */}
        {externalResults.length > 0 && (
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px 22px', boxShadow: '0 2px 10px rgba(109,40,217,0.08)', border: '1px solid #ede9fe' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#7c3aed', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>
              🌐 Online Search Results
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
              {externalResults.map(book => (
                <div key={book.id} style={{ backgroundColor: '#faf5ff', padding: '12px', borderRadius: '14px', width: '148px', border: '1px solid #ede9fe', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 8px rgba(109,40,217,0.06)', transition: 'box-shadow 0.2s, transform 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(109,40,217,0.16)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(109,40,217,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={{ height: '180px', overflow: 'hidden', borderRadius: '8px', backgroundColor: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                    {book.cover && book.cover.startsWith('http')
                      ? <img src={book.cover} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontSize: '40px' }}>📖</span>
                    }
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#3b0764', lineHeight: 1.3, marginBottom: '3px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{book.title}</div>
                  <div style={{ fontSize: '11px', color: '#7c3aed', fontWeight: '600', marginBottom: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{book.author}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: 'auto' }}>
                    <button onClick={() => handleViewSummary(book)} style={{ padding: '6px', fontSize: '11px', width: '100%', backgroundColor: 'white', border: '1.5px solid #ddd6fe', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', color: '#7c3aed' }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#ede9fe'; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'white'; }}>
                      👁 View Summary
                    </button>
                    <button onClick={() => handleAddExternalBook(book)} style={{ padding: '6px', fontSize: '11px', width: '100%', background: 'linear-gradient(135deg, #5b21b6, #4f46e5)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', color: 'white' }} onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }} onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}>
                      + Add to Library
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Library;
