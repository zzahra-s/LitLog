import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBooks } from '../services/api';

const BASE_URL = 'http://localhost:5001';

async function fetchProgress(bookID) {
  try {
    const res = await fetch(`${BASE_URL}/progress/${bookID}`);
    if (!res.ok) return 0;
    const data = await res.json();
    return data.PagesRead || 0;
  } catch { return 0; }
}

async function fetchGoals(userID) {
  try {
    const res = await fetch(`${BASE_URL}/goals/${userID}`);
    if (!res.ok) return [];
    return await res.json();
  } catch { return []; }
}

async function fetchCover(title, author) {
  try {
    const q = encodeURIComponent(`${title} ${author || ''}`);
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1`);
    const data = await res.json();
    const thumb = data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;
    return thumb || null;
  } catch { return null; }
}

function PieChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#aaa', fontSize: '13px' }}>
        No genre data
      </div>
    );
  }

  const COLORS = ['#7c3aed', '#a78bfa', '#4f46e5', '#818cf8', '#c4b5fd', '#6366f1', '#ddd6fe'];
  const total = data.reduce((s, d) => s + d.count, 0);

  let cumulativeAngle = -Math.PI / 2;
  const slices = data.map((d, i) => {
    const angle = (d.count / total) * 2 * Math.PI;
    const startAngle = cumulativeAngle;
    cumulativeAngle += angle;
    const endAngle = cumulativeAngle;

    const x1 = 70 + 60 * Math.cos(startAngle);
    const y1 = 70 + 60 * Math.sin(startAngle);
    const x2 = 70 + 60 * Math.cos(endAngle);
    const y2 = 70 + 60 * Math.sin(endAngle);
    const largeArc = angle > Math.PI ? 1 : 0;

    const path = `M 70 70 L ${x1} ${y1} A 60 60 0 ${largeArc} 1 ${x2} ${y2} Z`;

    return { path, color: COLORS[i % COLORS.length], label: d.genre, count: d.count };
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} stroke="white" strokeWidth="2" />
        ))}
        <circle cx="70" cy="70" r="28" fill="white" />
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {slices.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#444' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: s.color, flexShrink: 0 }} />
            <span style={{ fontWeight: '600' }}>{s.label}</span>
            <span style={{ color: '#888' }}>({Math.round((s.count / total) * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

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

function Dashboard() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [coverMap, setCoverMap] = useState({});
  const [goals, setGoals] = useState([]);
  const [quickRecs, setQuickRecs] = useState([]);
  const username = localStorage.getItem('username') || 'Reader';

  useEffect(() => {
    const userID = Number(localStorage.getItem('userID'));
    if (!userID || isNaN(userID)) { navigate('/'); return; }

    fetch(`${BASE_URL}/recommendations/${userID}`)
      .then(r => r.json())
      .then(data => setQuickRecs((data.recommendations || []).slice(0, 3)))
      .catch(() => {});

    getBooks(userID).then(async data => {
      setBooks(data);

      const progEntries = await Promise.all(
        data.map(async b => [b.id, await fetchProgress(b.id)])
      );
      setProgressMap(Object.fromEntries(progEntries));

      const coverEntries = await Promise.all(
        data.map(async b => [b.id, await fetchCover(b.title, b.author)])
      );
      setCoverMap(Object.fromEntries(coverEntries));
    });

    fetchGoals(userID).then(setGoals);
  }, [navigate]);

  function handleLogout() {
    if (!window.confirm('Are you sure you want to log out?')) return;
    localStorage.removeItem('token');
    localStorage.removeItem('userID');
    localStorage.removeItem('username');
    navigate('/');
  }

  const finishedBooks = books.filter(b => b.status === 'Finished');
  const totalPages = books.reduce((sum, b) => sum + (b.totalPages || 0), 0);

  const ratings = books.map(b => b.rating).filter(r => r != null && r > 0);
  const avgRating = ratings.length
    ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
    : 'N/A';

  const authorCount = {};
  books.forEach(b => { if (b.author) authorCount[b.author] = (authorCount[b.author] || 0) + 1; });
  const topAuthor = Object.entries(authorCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  const genreCount = {};
  books.forEach(b => { if (b.genre && b.genre !== 'Unknown') genreCount[b.genre] = (genreCount[b.genre] || 0) + 1; });
  const genreData = Object.entries(genreCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([genre, count]) => ({ genre, count }));

  const currentYear = new Date().getFullYear();
  // FIX: DB stores 'yearly' (lowercase) — was incorrectly matching 'Yearly'
  const yearlyGoal = goals.find(g =>
    g.GoalType?.toLowerCase() === 'yearly' && g.Year === currentYear
  );
  const goalTarget = yearlyGoal?.TargetBooks || 0;
  const goalProgress = goalTarget > 0 ? Math.min(100, Math.round((finishedBooks.length / goalTarget) * 100)) : 0;

  const sidebarItems = ['DASHBOARD', 'LIBRARY', 'BOOKSHELVES', 'PROGRESS', 'RECOMMENDATIONS'];

  const statCards = [
    { label: 'Pages Read', value: totalPages.toLocaleString(), icon: '📄' },
    { label: 'Books Read', value: finishedBooks.length, icon: '✅' },
    { label: 'Average Rating', value: avgRating !== 'N/A' ? `${avgRating} ★` : 'N/A', icon: '⭐' },
    { label: 'Favorite Author', value: topAuthor, icon: '✍️' },
    { label: 'Total Books', value: books.length, icon: '📚' },
    { label: 'Genres Tracked', value: Object.keys(genreCount).length, icon: '🏷️' },
  ];

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
              backgroundColor: item === 'DASHBOARD' ? 'rgba(255,255,255,0.18)' : 'transparent',
              border: 'none', color: 'white', textAlign: 'left',
              padding: '10px 14px', cursor: 'pointer', fontWeight: '600',
              fontSize: '12px', letterSpacing: '0.08em', borderRadius: '8px',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = item === 'DASHBOARD' ? 'rgba(255,255,255,0.18)' : 'transparent'}
          >
            {item}
          </button>
        ))}
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>

        {/* TOP BAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#3b0764', margin: 0, letterSpacing: '0.05em' }}>
            MY BOOKS
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
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>

            {/* LEFT: BOOK CARDS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: '0 0 380px' }}>
              {books.slice(0, 5).map((book) => {
                const pagesRead = progressMap[book.id] || 0;
                const pct = book.totalPages > 0 ? Math.min(100, Math.round((pagesRead / book.totalPages) * 100)) : 0;
                const cover = coverMap[book.id];

                return (
                  <div key={book.id} style={{
                    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                    borderRadius: '14px', padding: '14px 16px',
                    display: 'flex', alignItems: 'center', gap: '14px',
                    boxShadow: '0 4px 16px rgba(109,40,217,0.22)',
                    position: 'relative', overflow: 'hidden',
                  }}>
                    <div style={{ position: 'absolute', right: '-20px', top: '-20px', width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)' }} />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ color: 'white', fontSize: '15px', fontWeight: '700', margin: '0 0 3px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {book.title}
                      </h3>
                      <p style={{ color: '#c4b5fd', fontSize: '12px', margin: '0 0 10px 0' }}>{book.author}</p>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '5px', backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: '10px', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', width: `${pct}%`,
                            background: 'linear-gradient(90deg, #34d399, #06b6d4)',
                            borderRadius: '10px', transition: 'width 0.6s ease',
                          }} />
                        </div>
                        <span style={{ color: 'white', fontSize: '11px', fontWeight: '700', minWidth: '32px' }}>{pct}%</span>
                      </div>

                      <span style={{
                        display: 'inline-block', marginTop: '8px',
                        backgroundColor: 'rgba(255,255,255,0.18)', color: 'white',
                        fontSize: '10px', fontWeight: '600', padding: '2px 8px',
                        borderRadius: '20px', letterSpacing: '0.04em',
                      }}>
                        {book.status}
                      </span>
                    </div>

                    <div style={{
                      width: '64px', height: '88px', borderRadius: '8px', overflow: 'hidden',
                      flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      backgroundColor: 'rgba(255,255,255,0.15)',
                    }}>
                      {cover
                        ? <img src={cover} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontSize: '32px' }}>📖</span>
                      }
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RIGHT: STATS + GOAL + PIE */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {statCards.map(s => (
                  <div key={s.label} style={{
                    backgroundColor: 'white', borderRadius: '12px', padding: '14px 16px',
                    boxShadow: '0 2px 10px rgba(109,40,217,0.08)',
                    borderLeft: '3px solid #7c3aed',
                    display: 'flex', alignItems: 'center', gap: '12px',
                  }}>
                    <span style={{ fontSize: '22px' }}>{s.icon}</span>
                    <div>
                      <div style={{ fontSize: '11px', color: '#888', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s.label}</div>
                      <div style={{ fontSize: '16px', fontWeight: '800', color: '#3b0764', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '130px' }}>{s.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '14px' }}>

                <div style={{
                  flex: 1, backgroundColor: 'white', borderRadius: '14px',
                  padding: '18px 20px', boxShadow: '0 2px 10px rgba(109,40,217,0.08)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  minHeight: '170px',
                }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
                    MY GOAL PROGRESS
                  </div>
                  {goalTarget > 0 ? (
                    <>
                      <div style={{ fontSize: '44px', fontWeight: '900', color: '#3b0764', lineHeight: 1 }}>
                        {goalProgress}%
                      </div>
                      <div style={{ fontSize: '12px', color: '#888', margin: '8px 0 12px' }}>
                        {finishedBooks.length} / {goalTarget} books · {currentYear}
                      </div>
                      <div style={{ width: '100%', height: '8px', backgroundColor: '#ede9fe', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', width: `${goalProgress}%`,
                          background: 'linear-gradient(90deg, #7c3aed, #34d399)',
                          borderRadius: '10px', transition: 'width 0.8s ease',
                        }} />
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎯</div>
                      <p style={{ color: '#aaa', fontSize: '13px', margin: 0 }}>No goal set for {currentYear}</p>
                    </div>
                  )}
                </div>

                <div style={{
                  flex: 1, backgroundColor: 'white', borderRadius: '14px',
                  padding: '18px 20px', boxShadow: '0 2px 10px rgba(109,40,217,0.08)',
                  minHeight: '170px',
                }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
                    GENRE DISTRIBUTION
                  </div>
                  <PieChart data={genreData} />
                </div>

              </div>
            </div>
          </div>
        )}

        {/* RECOMMENDATIONS PREVIEW STRIP */}
        {books.length > 0 && quickRecs.length > 0 && (
          <div style={{
            marginTop: '20px',
            backgroundColor: 'white', borderRadius: '16px',
            padding: '18px 22px',
            boxShadow: '0 2px 10px rgba(109,40,217,0.08)',
            border: '1px solid #ede9fe',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>✨</span>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#3b0764', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Recommended for You
                </span>
              </div>
              <button
                onClick={() => navigate('/recommendations')}
                style={{
                  padding: '6px 14px', fontSize: '11px', fontWeight: '700',
                  background: 'linear-gradient(135deg, #5b21b6, #4f46e5)',
                  color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer',
                  letterSpacing: '0.04em',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                See All →
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px' }}>
              {quickRecs.map(book => (
                <div
                  key={book.id}
                  onClick={() => navigate('/recommendations')}
                  style={{
                    display: 'flex', gap: '12px', alignItems: 'center',
                    padding: '10px 12px', borderRadius: '12px',
                    border: '1px solid #ede9fe', cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    backgroundColor: '#faf5ff',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = '#f3f0ff';
                    e.currentTarget.style.borderColor = '#c4b5fd';
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(109,40,217,0.12)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = '#faf5ff';
                    e.currentTarget.style.borderColor = '#ede9fe';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    width: '40px', height: '56px', borderRadius: '6px', overflow: 'hidden',
                    flexShrink: 0, backgroundColor: '#ede9fe',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                  }}>
                    {book.cover
                      ? <img src={book.cover} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontSize: '20px' }}>📖</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#3b0764', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {book.title}
                    </div>
                    <div style={{ fontSize: '11px', color: '#888', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      by {book.author}
                    </div>
                    {book.reason && (
                      <div style={{ fontSize: '10px', color: '#a78bfa', fontWeight: '600', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {book.reason}
                      </div>
                    )}
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

export default Dashboard;
