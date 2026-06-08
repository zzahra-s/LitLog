import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBooks, logProgress, getProgress, getGoals, setGoal, updateGoal } from '../services/api';

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

// ── Progress Ring ─────────────────────────────────────────────────────────────
function ProgressRing({ pct, size = 80, stroke = 8, color = '#7c3aed' }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#ede9fe" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  );
}

// ── Book Progress Card ────────────────────────────────────────────────────────
function BookProgressCard({ book, pagesRead, onLogPages }) {
  const [inputVal, setInputVal] = useState('');
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState(false);

  const total = book.totalPages || 0;
  const pct = total > 0 ? Math.min(100, Math.round((pagesRead / total) * 100)) : 0;
  const remaining = total > 0 ? Math.max(0, total - pagesRead) : null;

  async function handleLog() {
    const val = Number(inputVal);
    if (!val || val < 0) return;
    if (total > 0 && val > total) { alert(`This book only has ${total} pages.`); return; }
    setSaving(true);
    await onLogPages(book.id, val);
    setInputVal('');
    setSaving(false);
    setFlash(true);
    setTimeout(() => setFlash(false), 1200);
  }

  const statusColor = {
    'Currently Reading': '#7c3aed',
    'Finished': '#059669',
    'Want to Read': '#4f46e5',
    'Did Not Finish': '#dc2626',
  }[book.status] || '#888';

  return (
    <div style={{
      backgroundColor: 'white', borderRadius: '16px',
      padding: '18px 20px',
      boxShadow: flash
        ? '0 0 0 2px #7c3aed, 0 4px 20px rgba(124,58,237,0.2)'
        : '0 2px 10px rgba(109,40,217,0.08)',
      border: '1px solid #ede9fe',
      transition: 'box-shadow 0.3s',
      display: 'flex', gap: '16px', alignItems: 'center',
    }}>
      {/* Ring */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <ProgressRing pct={pct} color={pct === 100 ? '#059669' : '#7c3aed'} />
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', fontWeight: '800', color: pct === 100 ? '#059669' : '#3b0764',
        }}>
          {pct}%
        </div>
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '14px', fontWeight: '700', color: '#3b0764', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {book.title}
        </div>
        <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>by {book.author}</div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
          <span style={{
            fontSize: '10px', fontWeight: '700', padding: '2px 8px',
            borderRadius: '20px', backgroundColor: `${statusColor}18`, color: statusColor,
            letterSpacing: '0.05em',
          }}>
            {book.status}
          </span>
          {total > 0 && (
            <span style={{ fontSize: '11px', color: '#aaa' }}>
              {pagesRead} / {total} pages
              {remaining !== null && pct < 100 && ` · ${remaining} left`}
            </span>
          )}
        </div>

        {/* Progress bar */}
        {total > 0 && (
          <div style={{ marginTop: '8px', height: '4px', backgroundColor: '#ede9fe', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${pct}%`,
              background: pct === 100
                ? 'linear-gradient(90deg, #059669, #10b981)'
                : 'linear-gradient(90deg, #7c3aed, #818cf8)',
              borderRadius: '10px', transition: 'width 0.5s ease',
            }} />
          </div>
        )}
      </div>

      {/* Log input */}
      {book.status !== 'Finished' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0, alignItems: 'flex-end' }}>
          <div style={{ fontSize: '10px', fontWeight: '700', color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Update pages
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <input
              type="number"
              min="0"
              max={total || undefined}
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleLog(); }}
              placeholder="e.g. 120"
              style={{
                width: '80px', padding: '7px 10px',
                border: '1.5px solid #ddd6fe', borderRadius: '8px',
                fontSize: '13px', color: '#3b0764', outline: 'none',
                fontFamily: 'inherit',
              }}
            />
            <button
              onClick={handleLog}
              disabled={saving || !inputVal}
              style={{
                padding: '7px 12px',
                background: saving || !inputVal
                  ? '#e5e7eb'
                  : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                border: 'none', borderRadius: '8px',
                color: saving || !inputVal ? '#9ca3af' : 'white',
                fontSize: '12px', fontWeight: '700',
                cursor: saving || !inputVal ? 'default' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {saving ? '...' : 'Save'}
            </button>
          </div>
        </div>
      )}
      {book.status === 'Finished' && (
        <div style={{ fontSize: '22px', flexShrink: 0 }}>✅</div>
      )}
    </div>
  );
}

// ── Goal Panel ────────────────────────────────────────────────────────────────
function GoalPanel({ userID, finishedCount }) {
  const currentYear = new Date().getFullYear();
  const [goal, setGoalState] = useState(null);
  const [targetInput, setTargetInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    getGoals(userID).then(goals => {
      const yearly = goals.find(g => g.GoalType === 'Yearly' && g.Year === currentYear);
      setGoalState(yearly || null);
    });
  }, [userID]);

  const pct = goal ? Math.min(100, Math.round((finishedCount / goal.TargetBooks) * 100)) : 0;

  async function handleSave() {
    const target = Number(targetInput);
    if (!target || target < 1) return;
    setSaving(true);
    try {
      if (goal) {
        await updateGoal(goal.GoalID, target);
        setGoalState({ ...goal, TargetBooks: target });
      } else {
        await setGoal(userID, 'Yearly', target, currentYear);
        const goals = await getGoals(userID);
        const yearly = goals.find(g => g.GoalType === 'Yearly' && g.Year === currentYear);
        setGoalState(yearly || null);
      }
      setTargetInput('');
      setEditMode(false);
    } catch (err) {
      alert('Failed to save goal: ' + err.message);
    }
    setSaving(false);
  }

  return (
    <div style={{
      backgroundColor: 'white', borderRadius: '16px',
      padding: '20px 22px',
      boxShadow: '0 2px 10px rgba(109,40,217,0.08)',
      border: '1px solid #ede9fe',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: '800', color: '#7c3aed', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            🎯 {currentYear} Reading Goal
          </div>
          {goal && (
            <div style={{ fontSize: '12px', color: '#888', marginTop: '3px' }}>
              {finishedCount} of {goal.TargetBooks} books finished
            </div>
          )}
        </div>
        <button
          onClick={() => { setEditMode(e => !e); setTargetInput(goal?.TargetBooks || ''); }}
          style={{
            padding: '6px 12px', fontSize: '11px', fontWeight: '700',
            backgroundColor: '#f3f0ff', color: '#7c3aed',
            border: '1px solid #ddd6fe', borderRadius: '8px', cursor: 'pointer',
          }}
        >
          {goal ? 'Edit Goal' : 'Set Goal'}
        </button>
      </div>

      {editMode && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', alignItems: 'center' }}>
          <input
            type="number" min="1"
            value={targetInput}
            onChange={e => setTargetInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}
            placeholder="e.g. 24"
            style={{
              flex: 1, padding: '8px 12px',
              border: '1.5px solid #ddd6fe', borderRadius: '8px',
              fontSize: '13px', outline: 'none', fontFamily: 'inherit', color: '#3b0764',
            }}
          />
          <button
            onClick={handleSave} disabled={saving}
            style={{
              padding: '8px 16px', fontWeight: '700', fontSize: '13px',
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer',
            }}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={() => setEditMode(false)}
            style={{ padding: '8px 12px', fontSize: '13px', border: '1px solid #ddd6fe', borderRadius: '8px', cursor: 'pointer', backgroundColor: 'white', color: '#888' }}
          >
            Cancel
          </button>
        </div>
      )}

      {goal ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <div style={{ fontSize: '36px', fontWeight: '900', color: '#3b0764', lineHeight: 1 }}>{pct}%</div>
            <div style={{ flex: 1 }}>
              <div style={{ height: '10px', backgroundColor: '#ede9fe', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${pct}%`,
                  background: pct >= 100
                    ? 'linear-gradient(90deg, #059669, #10b981)'
                    : 'linear-gradient(90deg, #7c3aed, #34d399)',
                  borderRadius: '10px', transition: 'width 0.8s ease',
                }} />
              </div>
              {pct >= 100 && (
                <div style={{ fontSize: '12px', color: '#059669', fontWeight: '700', marginTop: '6px' }}>
                  🎉 Goal reached! You read {finishedCount} books this year.
                </div>
              )}
              {pct < 100 && (
                <div style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>
                  {goal.TargetBooks - finishedCount} more book{goal.TargetBooks - finishedCount !== 1 ? 's' : ''} to go
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '16px 0', color: '#bbb', fontSize: '13px' }}>
          No goal set for {currentYear}. Click "Set Goal" to get started!
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
function ProgressTracker() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('Currently Reading');
  const username = localStorage.getItem('username') || 'Reader';
  const userID = Number(localStorage.getItem('userID'));

  useEffect(() => {
    if (!userID || isNaN(userID)) { navigate('/'); return; }

    getBooks(userID).then(async data => {
      setBooks(data);
      const entries = await Promise.all(
        data.map(async b => [b.id, await getProgress(b.id)])
      );
      setProgressMap(Object.fromEntries(entries));
      setLoading(false);
    });
  }, [navigate]);

  function handleLogout() {
    if (!window.confirm('Are you sure you want to log out?')) return;
    localStorage.removeItem('userID');
    localStorage.removeItem('username');
    navigate('/');
  }

  async function handleLogPages(bookID, pagesRead) {
    try {
      await logProgress(bookID, pagesRead);
      setProgressMap(prev => ({ ...prev, [bookID]: pagesRead }));

      // Auto-mark as Finished if pages match total
      const book = books.find(b => b.id === bookID);
      if (book && book.totalPages > 0 && pagesRead >= book.totalPages) {
        await fetch(`http://localhost:5001/books/${bookID}/shelf`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Finished' }),
        });
        setBooks(prev => prev.map(b => b.id === bookID ? { ...b, status: 'Finished' } : b));
      }
    } catch (err) {
      alert('Failed to save progress: ' + err.message);
    }
  }

  const finishedCount = books.filter(b => b.status === 'Finished').length;

  const statuses = ['Currently Reading', 'Want to Read', 'Finished', 'Did Not Finish'];
  const filteredBooks = filterStatus === 'All'
    ? books
    : books.filter(b => b.status === filterStatus);

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
              backgroundColor: item === 'PROGRESS' ? 'rgba(255,255,255,0.18)' : 'transparent',
              border: 'none', color: 'white', textAlign: 'left',
              padding: '10px 14px', cursor: 'pointer', fontWeight: '600',
              fontSize: '12px', letterSpacing: '0.08em', borderRadius: '8px',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = item === 'PROGRESS' ? 'rgba(255,255,255,0.18)' : 'transparent'}
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
            PROGRESS TRACKER
          </h2>
          <ProfileMenu username={username} onLogout={handleLogout} />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '80px', color: '#aaa', fontSize: '14px' }}>Loading your books...</div>
        ) : books.length === 0 ? (
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

            {/* LEFT: book list */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Filter tabs */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['Currently Reading', 'Want to Read', 'Finished', 'Did Not Finish', 'All'].map(s => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    style={{
                      padding: '6px 14px', borderRadius: '20px', border: '1.5px solid',
                      borderColor: filterStatus === s ? '#7c3aed' : '#ddd6fe',
                      backgroundColor: filterStatus === s ? '#7c3aed' : 'white',
                      color: filterStatus === s ? 'white' : '#7c3aed',
                      fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {s}
                    <span style={{
                      marginLeft: '5px', fontSize: '10px',
                      backgroundColor: filterStatus === s ? 'rgba(255,255,255,0.25)' : '#ede9fe',
                      color: filterStatus === s ? 'white' : '#7c3aed',
                      padding: '1px 6px', borderRadius: '10px',
                    }}>
                      {s === 'All' ? books.length : books.filter(b => b.status === s).length}
                    </span>
                  </button>
                ))}
              </div>

              {/* Book cards */}
              {filteredBooks.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: '#bbb', fontSize: '13px', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #ede9fe' }}>
                  No books with status "{filterStatus}".
                </div>
              ) : (
                filteredBooks.map(book => (
                  <BookProgressCard
                    key={book.id}
                    book={book}
                    pagesRead={progressMap[book.id] || 0}
                    onLogPages={handleLogPages}
                  />
                ))
              )}
            </div>

            {/* RIGHT: goal + summary stats */}
            <div style={{ flexShrink: 0, width: '280px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Goal panel */}
              <GoalPanel userID={userID} finishedCount={finishedCount} />

              {/* Quick stats */}
              <div style={{
                backgroundColor: 'white', borderRadius: '16px',
                padding: '20px 22px',
                boxShadow: '0 2px 10px rgba(109,40,217,0.08)',
                border: '1px solid #ede9fe',
              }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#7c3aed', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '14px' }}>
                  📊 Quick Stats
                </div>
                {[
                  { label: 'Currently Reading', value: books.filter(b => b.status === 'Currently Reading').length, icon: '📖' },
                  { label: 'Finished', value: finishedCount, icon: '✅' },
                  { label: 'Want to Read', value: books.filter(b => b.status === 'Want to Read').length, icon: '🔖' },
                  {
                    label: 'Total Pages Tracked',
                    value: Object.values(progressMap).reduce((a, b) => a + b, 0).toLocaleString(),
                    icon: '📄',
                  },
                ].map(({ label, value, icon }) => (
                  <div key={label} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 0', borderBottom: '1px solid #f3f0ff',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#555' }}>
                      <span>{icon}</span>{label}
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#3b0764' }}>{value}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProgressTracker;