import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBooks } from '../services/api';

const BASE_URL = 'http://localhost:5001';

async function fetchCover(title, author) {
  try {
    const q = encodeURIComponent(`${title} ${author || ''}`);
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1`);
    const data = await res.json();
    const thumb = data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;
    return thumb || null;
  } catch { return null; }
}

// ── Profile Dropdown (same as Dashboard) ─────────────────────────────────────
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
          minWidth: '180px', overflow: 'hidden',
          zIndex: 1000,
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
              width: '100%', textAlign: 'left',
              padding: '11px 16px', border: 'none',
              backgroundColor: 'transparent', cursor: 'pointer',
              fontSize: '13px', fontWeight: '600',
              color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px',
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

// ── Book Card ─────────────────────────────────────────────────────────────────
function BookCard({ book, cover, onGoTo }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered
          ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)'
          : 'white',
        borderRadius: '12px',
        padding: '12px 14px',
        display: 'flex', alignItems: 'center', gap: '12px',
        boxShadow: hovered
          ? '0 6px 20px rgba(109,40,217,0.28)'
          : '0 2px 10px rgba(109,40,217,0.08)',
        border: '1px solid',
        borderColor: hovered ? 'transparent' : '#ede9fe',
        transition: 'all 0.22s ease',
        cursor: 'default',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Cover thumbnail */}
      <div style={{
        width: '44px', height: '60px', borderRadius: '6px', overflow: 'hidden',
        flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
        backgroundColor: hovered ? 'rgba(255,255,255,0.15)' : '#ede9fe',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {cover
          ? <img src={cover} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: '22px' }}>📖</span>
        }
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '13px', fontWeight: '700',
          color: hovered ? 'white' : '#3b0764',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          transition: 'color 0.2s',
        }}>
          {book.title}
        </div>
        <div style={{
          fontSize: '11px', marginTop: '2px',
          color: hovered ? '#c4b5fd' : '#888',
          transition: 'color 0.2s',
        }}>
          by {book.author}
        </div>
        {book.genre && book.genre !== 'Unknown' && (
          <span style={{
            display: 'inline-block', marginTop: '5px',
            backgroundColor: hovered ? 'rgba(255,255,255,0.18)' : '#f3f0ff',
            color: hovered ? 'white' : '#7c3aed',
            fontSize: '9px', fontWeight: '700', padding: '2px 7px',
            borderRadius: '20px', letterSpacing: '0.05em', textTransform: 'uppercase',
            transition: 'all 0.2s',
          }}>
            {book.genre}
          </span>
        )}
      </div>

      {/* Go To button */}
      <button
        onClick={() => onGoTo(book)}
        style={{
          flexShrink: 0, padding: '5px 10px',
          backgroundColor: hovered ? 'rgba(255,255,255,0.22)' : '#ede9fe',
          border: 'none', borderRadius: '6px', cursor: 'pointer',
          fontSize: '10px', fontWeight: '700',
          color: hovered ? 'white' : '#7c3aed',
          letterSpacing: '0.04em', transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = hovered ? 'rgba(255,255,255,0.35)' : '#ddd6fe'; }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = hovered ? 'rgba(255,255,255,0.22)' : '#ede9fe'; }}
      >
        GO TO LIBRARY ›
      </button>
    </div>
  );
}

// ── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({ icon, label, count, color }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      marginBottom: '12px',
    }}>
      <span style={{ fontSize: '16px' }}>{icon}</span>
      <span style={{
        fontSize: '13px', fontWeight: '800', color,
        letterSpacing: '0.08em', textTransform: 'uppercase',
      }}>{label}</span>
      <span style={{
        backgroundColor: color, color: 'white',
        fontSize: '10px', fontWeight: '700',
        padding: '1px 7px', borderRadius: '20px',
        marginLeft: '2px',
      }}>{count}</span>
      <div style={{ flex: 1, height: '1px', backgroundColor: `${color}30`, marginLeft: '4px' }} />
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
function BookShelves() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [coverMap, setCoverMap] = useState({});
  const username = localStorage.getItem('username') || 'Reader';

  useEffect(() => {
    const userID = Number(localStorage.getItem('userID'));
    if (!userID || isNaN(userID)) { navigate('/'); return; }

    import('../services/api').then(({ getBooks }) => {
      getBooks(userID).then(async data => {
        setBooks(data);
        const coverEntries = await Promise.all(
          data.map(async b => [b.id, await fetchCover(b.title, b.author)])
        );
        setCoverMap(Object.fromEntries(coverEntries));
      });
    });
  }, [navigate]);

  function handleLogout() {
    if (!window.confirm('Are you sure you want to log out?')) return;
    localStorage.removeItem('userID');
    localStorage.removeItem('username');
    navigate('/');
  }

  function handleGoTo(book) {
    navigate(`/library?book=${book.id}`);
  }

  const currentlyReading = books.filter(b => b.status === 'Currently Reading');
  const wantToRead = books.filter(b => b.status === 'Want to Read');
  const finished = books.filter(b => b.status === 'Finished');

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
              backgroundColor: item === 'BOOKSHELVES' ? 'rgba(255,255,255,0.18)' : 'transparent',
              border: 'none', color: 'white', textAlign: 'left',
              padding: '10px 14px', cursor: 'pointer', fontWeight: '600',
              fontSize: '12px', letterSpacing: '0.08em', borderRadius: '8px',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = item === 'BOOKSHELVES' ? 'rgba(255,255,255,0.18)' : 'transparent'}
          >
            {item}
          </button>
        ))}
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>

        {/* TOP BAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#3b0764', margin: 0, letterSpacing: '0.05em' }}>
            BOOK SHELVES
          </h2>
          <ProfileMenu username={username} onLogout={handleLogout} />
        </div>

        {books.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '80px', color: '#888' }}>
            <div style={{ fontSize: '60px', marginBottom: '16px' }}>📚</div>
            <p style={{ fontSize: '16px' }}>No books yet.{' '}
              <span style={{ color: '#7c3aed', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/library')}>
                Add some!
              </span>
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

            {/* ── Currently Reading ── */}
            <div style={{
              backgroundColor: 'white', borderRadius: '16px',
              padding: '20px 22px',
              boxShadow: '0 2px 10px rgba(109,40,217,0.08)',
              border: '1px solid #ede9fe',
            }}>
              <SectionHeader icon="📖" label="Currently Reading" count={currentlyReading.length} color="#7c3aed" />
              {currentlyReading.length === 0 ? (
                <p style={{ color: '#bbb', fontSize: '13px', margin: 0 }}>No books currently being read.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '10px' }}>
                  {currentlyReading.map(b => (
                    <BookCard key={b.id} book={b} cover={coverMap[b.id]} onGoTo={handleGoTo} />
                  ))}
                </div>
              )}
            </div>

            {/* ── Want to Read ── */}
            <div style={{
              backgroundColor: 'white', borderRadius: '16px',
              padding: '20px 22px',
              boxShadow: '0 2px 10px rgba(109,40,217,0.08)',
              border: '1px solid #ede9fe',
            }}>
              <SectionHeader icon="🔖" label="Want to Read" count={wantToRead.length} color="#4f46e5" />
              {wantToRead.length === 0 ? (
                <p style={{ color: '#bbb', fontSize: '13px', margin: 0 }}>Your reading wishlist is empty.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '10px' }}>
                  {wantToRead.map(b => (
                    <BookCard key={b.id} book={b} cover={coverMap[b.id]} onGoTo={handleGoTo} />
                  ))}
                </div>
              )}
            </div>

            {/* ── Finished ── */}
            <div style={{
              backgroundColor: 'white', borderRadius: '16px',
              padding: '20px 22px',
              boxShadow: '0 2px 10px rgba(109,40,217,0.08)',
              border: '1px solid #ede9fe',
            }}>
              <SectionHeader icon="✅" label="Finished" count={finished.length} color="#059669" />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {finished.length === 0 ? (
                  <p style={{ color: '#bbb', fontSize: '13px', margin: 0 }}>No finished books yet. Keep reading! 💪</p>
                ) : (
                  finished.map(b => (
                    <BookCard key={b.id} book={b} cover={coverMap[b.id]} onGoTo={handleGoTo} />
                  ))
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default BookShelves;