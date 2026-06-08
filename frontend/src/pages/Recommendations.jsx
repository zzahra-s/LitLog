import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
//import { addBook } from '../services/api';

const BASE_URL = 'http://localhost:5001';

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

// Book Detail Modal 
function BookModal({ book, onClose, onAdd, alreadyAdded }) {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(alreadyAdded);

  if (!book) return null;

  async function handleAdd() {
    setAdding(true);
    await onAdd(book);
    setAdding(false);
    setAdded(true);
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        backgroundColor: 'rgba(30,10,60,0.55)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.18s ease',
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }
        .rec-modal::-webkit-scrollbar { width: 5px; }
        .rec-modal::-webkit-scrollbar-track { background: #f3f0ff; border-radius: 10px; }
        .rec-modal::-webkit-scrollbar-thumb { background: #c4b5fd; border-radius: 10px; }
      `}</style>
      <div
        className="rec-modal"
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: 'white', borderRadius: '20px',
          width: '100%', maxWidth: '540px', maxHeight: '85vh', overflowY: 'auto',
          boxShadow: '0 24px 80px rgba(91,33,182,0.28)',
          animation: 'slideUp 0.22s ease',
        }}
      >
        {/* Header */}
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
            {book.cover
              ? <img src={book.cover} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: '36px' }}>📖</span>}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ color: 'white', margin: '0 0 6px 0', fontSize: '17px', fontWeight: '800', lineHeight: 1.3, fontFamily: "'Georgia', serif" }}>
              {book.title}
            </h2>
            <p style={{ color: '#c4b5fd', fontSize: '13px', margin: '0 0 10px 0', fontWeight: '600' }}>by {book.author}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {book.yearPublished && book.yearPublished !== 'N/A' && (
                <span style={{ backgroundColor: '#ffffff22', color: 'white', fontSize: '11px', fontWeight: '600', padding: '3px 9px', borderRadius: '20px' }}>📅 {book.yearPublished}</span>
              )}
              {book.totalPages > 0 && (
                <span style={{ backgroundColor: '#ffffff22', color: 'white', fontSize: '11px', fontWeight: '600', padding: '3px 9px', borderRadius: '20px' }}>📄 {book.totalPages} pages</span>
              )}
              {book.rating > 0 && (
                <span style={{ backgroundColor: '#ffffff22', color: '#fde68a', fontSize: '11px', fontWeight: '600', padding: '3px 9px', borderRadius: '20px' }}>⭐ {book.rating}/5</span>
              )}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.18)', border: 'none', color: 'white', borderRadius: '50%', width: '30px', height: '30px', flexShrink: 0, cursor: 'pointer', fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px 28px 28px' }}>
          {book.reason && (
            <div style={{ marginBottom: '18px', backgroundColor: '#faf5ff', borderRadius: '10px', padding: '10px 14px', border: '1px solid #ede9fe', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>✨</span>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#7c3aed' }}>{book.reason}</span>
            </div>
          )}
          <section style={{ marginBottom: '22px' }}>
            <h3 style={{ fontSize: '11px', fontWeight: '800', color: '#7c3aed', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 10px 0' }}>About this book</h3>
            <p style={{ fontSize: '13px', color: '#444', lineHeight: 1.8, margin: 0, fontFamily: "'Georgia', serif" }}>
              {book.description
                ? book.description
                : <span style={{ color: '#aaa', fontStyle: 'italic' }}>No description available.</span>}
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
            onClick={handleAdd}
            disabled={adding || added}
            style={{
              width: '100%', padding: '13px',
              background: added
                ? 'linear-gradient(135deg, #059669, #10b981)'
                : 'linear-gradient(135deg, #5b21b6, #4f46e5)',
              border: 'none', borderRadius: '12px', color: 'white',
              fontSize: '14px', fontWeight: '800',
              cursor: adding || added ? 'default' : 'pointer',
              transition: 'all 0.25s',
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

// Recommendation Card 
function RecCard({ book, onView, onAdd, added }) {
  const [hovered, setHovered] = useState(false);
  const [adding, setAdding] = useState(false);
  const [localAdded, setLocalAdded] = useState(added);

  async function handleAdd(e) {
    e.stopPropagation();
    setAdding(true);
    await onAdd(book);
    setAdding(false);
    setLocalAdded(true);
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '16px',
        display: 'flex', gap: '14px', alignItems: 'flex-start',
        boxShadow: hovered
          ? '0 8px 28px rgba(109,40,217,0.16)'
          : '0 2px 10px rgba(109,40,217,0.07)',
        border: '1px solid',
        borderColor: hovered ? '#c4b5fd' : '#ede9fe',
        transition: 'all 0.22s ease',
        cursor: 'default',
      }}
    >
      {/* Cover */}
      <div
        onClick={() => onView(book)}
        style={{
          width: '56px', height: '78px', borderRadius: '8px', overflow: 'hidden',
          flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
          backgroundColor: '#ede9fe',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          transition: 'transform 0.2s',
          transform: hovered ? 'scale(1.04)' : 'scale(1)',
        }}
      >
        {book.cover
          ? <img src={book.cover} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: '26px' }}>📖</span>}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          onClick={() => onView(book)}
          style={{
            fontSize: '14px', fontWeight: '700', color: '#3b0764',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            cursor: 'pointer', marginBottom: '3px',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#7c3aed'}
          onMouseLeave={e => e.currentTarget.style.color = '#3b0764'}
        >
          {book.title}
        </div>
        <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>by {book.author}</div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
          {book.genre && book.genre !== 'Unknown' && (
            <span style={{
              fontSize: '10px', fontWeight: '700', padding: '2px 8px',
              borderRadius: '20px', backgroundColor: '#f3f0ff', color: '#7c3aed',
              letterSpacing: '0.05em', textTransform: 'uppercase',
            }}>{book.genre}</span>
          )}
          {book.yearPublished && book.yearPublished !== 'N/A' && (
            <span style={{
              fontSize: '10px', fontWeight: '600', padding: '2px 8px',
              borderRadius: '20px', backgroundColor: '#f0fdf4', color: '#059669',
            }}>{book.yearPublished}</span>
          )}
          {book.rating > 0 && (
            <span style={{
              fontSize: '10px', fontWeight: '700', padding: '2px 8px',
              borderRadius: '20px', backgroundColor: '#fffbeb', color: '#d97706',
            }}>⭐ {book.rating}</span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => onView(book)}
            style={{
              padding: '6px 12px', fontSize: '11px', fontWeight: '700',
              backgroundColor: '#f3f0ff', color: '#7c3aed',
              border: '1.5px solid #ddd6fe', borderRadius: '8px', cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#ede9fe'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#f3f0ff'; }}
          >
            👁 Details
          </button>
          <button
            onClick={handleAdd}
            disabled={adding || localAdded}
            style={{
              padding: '6px 12px', fontSize: '11px', fontWeight: '700',
              background: localAdded
                ? 'linear-gradient(135deg, #059669, #10b981)'
                : 'linear-gradient(135deg, #5b21b6, #4f46e5)',
              color: 'white', border: 'none', borderRadius: '8px',
              cursor: adding || localAdded ? 'default' : 'pointer',
              transition: 'all 0.2s', opacity: adding ? 0.7 : 1,
            }}
          >
            {localAdded ? '✅ Added' : adding ? '...' : '+ Add'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Section 
function RecommendationSection({ reason, books, onView, onAdd, addedSet }) {
  const reasonIcons = {
    'Because you love': '💜',
    'More by': '✍️',
    'Popular picks': '🔥',
  };
  const icon = Object.entries(reasonIcons).find(([k]) => reason?.startsWith(k))?.[1] || '✨';

  return (
    <div style={{
      backgroundColor: 'white', borderRadius: '16px',
      padding: '20px 22px',
      boxShadow: '0 2px 10px rgba(109,40,217,0.08)',
      border: '1px solid #ede9fe',
    }}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <span style={{ fontSize: '18px' }}>{icon}</span>
        <span style={{ fontSize: '14px', fontWeight: '800', color: '#3b0764', letterSpacing: '0.03em' }}>{reason}</span>
        <span style={{
          backgroundColor: '#7c3aed', color: 'white',
          fontSize: '10px', fontWeight: '700',
          padding: '1px 7px', borderRadius: '20px',
        }}>{books.length}</span>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#ede9fe', marginLeft: '4px' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
        {books.map(book => (
          <RecCard
            key={book.id}
            book={book}
            onView={onView}
            onAdd={onAdd}
            added={addedSet.has(book.title?.toLowerCase())}
          />
        ))}
      </div>
    </div>
  );
}

//Main Page 
function Recommendations() {
  const navigate = useNavigate();
  const [recs, setRecs] = useState([]);
  const [basedOn, setBasedOn] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [addedTitles, setAddedTitles] = useState(new Set());
  const [existingTitles, setExistingTitles] = useState(new Set());
  const username = localStorage.getItem('username') || 'Reader';
  const userID = Number(localStorage.getItem('userID'));

  useEffect(() => {
    if (!userID || isNaN(userID)) { navigate('/'); return; }


    import('../services/api').then(({ getBooks }) => {
      getBooks(userID).then(data => {
        setExistingTitles(new Set(data.map(b => b.title?.toLowerCase())));
      });
    });

    fetch(`${BASE_URL}/recommendations/${userID}`)
      .then(r => r.json())
      .then(data => {
        setRecs(data.recommendations || []);
        setBasedOn(data.basedOn || {});
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [navigate, userID]);

  function handleLogout() {
    if (!window.confirm('Are you sure you want to log out?')) return;
    localStorage.removeItem('userID');
    localStorage.removeItem('username');
    navigate('/');
  }

  async function handleAdd(book) {
    const title = book.title?.trim();
    if (!title) return;
    const lower = title.toLowerCase();
    if (existingTitles.has(lower) || addedTitles.has(lower)) return;
    try {
      await import('../services/api').then(({ addBook }) =>
        addBook({
          userID,
          title: book.title,
          author: book.author || 'Unknown',
          genre: book.genre || 'Unknown',
          totalPages: Number(book.totalPages) || 0,
          yearPublished: Number(book.yearPublished) || null,
          status: 'Want to Read',
          rating: null,
          notes: null,
        })
      );
      setAddedTitles(prev => new Set([...prev, lower]));
      setExistingTitles(prev => new Set([...prev, lower]));
    } catch (err) {
      alert('Failed to add book: ' + err.message);
    }
  }

  // Group recs by reason
  const grouped = recs.reduce((acc, book) => {
    const key = book.reason || 'Recommended for You';
    if (!acc[key]) acc[key] = [];
    acc[key].push(book);
    return acc;
  }, {});

  const allAdded = new Set([...existingTitles, ...addedTitles]);

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
              if (item === 'RECOMMENDATIONS') navigate('/recommendations');
            }}
            style={{
              backgroundColor: item === 'RECOMMENDATIONS' ? 'rgba(255,255,255,0.18)' : 'transparent',
              border: 'none', color: 'white', textAlign: 'left',
              padding: '10px 14px', cursor: 'pointer', fontWeight: '600',
              fontSize: '12px', letterSpacing: '0.08em', borderRadius: '8px',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = item === 'RECOMMENDATIONS' ? 'rgba(255,255,255,0.18)' : 'transparent'}
          >
            {item}
          </button>
        ))}
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>

        {selectedBook && (
          <BookModal
            book={selectedBook}
            onClose={() => setSelectedBook(null)}
            onAdd={handleAdd}
            alreadyAdded={allAdded.has(selectedBook.title?.toLowerCase())}
          />
        )}

        {/* TOP BAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#3b0764', margin: 0, letterSpacing: '0.05em' }}>
              RECOMMENDATIONS
            </h2>
            {!loading && (basedOn.topGenre || basedOn.topAuthor) && (
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#a78bfa', fontStyle: 'italic' }}>
                Based on your taste in {[basedOn.topGenre, basedOn.topAuthor && `works by ${basedOn.topAuthor}`].filter(Boolean).join(' & ')}
              </p>
            )}
          </div>
          <ProfileMenu username={username} onLogout={handleLogout} />
        </div>

        {/* Taste chips */}
        {!loading && (basedOn.topGenre || basedOn.topAuthor) && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
            {basedOn.topGenre && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                backgroundColor: '#7c3aed', color: 'white',
                fontSize: '11px', fontWeight: '700', padding: '5px 12px',
                borderRadius: '20px', letterSpacing: '0.04em',
              }}>
                🏷️ Top Genre: {basedOn.topGenre}
              </span>
            )}
            {basedOn.topAuthor && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                backgroundColor: '#4f46e5', color: 'white',
                fontSize: '11px', fontWeight: '700', padding: '5px 12px',
                borderRadius: '20px', letterSpacing: '0.04em',
              }}>
                ✍️ Fav Author: {basedOn.topAuthor}
              </span>
            )}
          </div>
        )}

        {/* States */}
        {loading && (
          <div style={{ textAlign: 'center', marginTop: '80px', color: '#a78bfa' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'spin 1.5s linear infinite' }}>✨</div>
            <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
            <p style={{ fontSize: '14px', fontWeight: '600' }}>Finding books you'll love...</p>
          </div>
        )}

        {!loading && error && (
          <div style={{ textAlign: 'center', marginTop: '80px', color: '#dc2626' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚠️</div>
            <p style={{ fontSize: '14px' }}>Could not load recommendations. Please try again.</p>
          </div>
        )}

        {!loading && !error && recs.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '80px', color: '#888' }}>
            <div style={{ fontSize: '60px', marginBottom: '16px' }}>📚</div>
            <p style={{ fontSize: '16px' }}>
              Add some books to your library first so we can recommend more!{' '}
              <span style={{ color: '#7c3aed', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/library')}>
                Go to Library
              </span>
            </p>
          </div>
        )}

        {!loading && !error && recs.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {Object.entries(grouped).map(([reason, books]) => (
              <RecommendationSection
                key={reason}
                reason={reason}
                books={books}
                onView={setSelectedBook}
                onAdd={handleAdd}
                addedSet={allAdded}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Recommendations;
