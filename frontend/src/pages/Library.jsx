import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBooks, deleteBook, addBook } from '../services/api';
import { searchExternalBooks } from '../services/externalapi';//external api being used

function Library() {
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);//list of user books starts emoty
  const [search, setSearch] = useState('');//text typed in search bar
  const [showFilters, setShowFilters] = useState(false);//whether filter panel is visible
  const [filterGenre, setFilterGenre] = useState('');
  const [filterShelf, setFilterShelf] = useState('');
  const [filterRating, setFilterRating] = useState('');//store selected filters

  const [openDropdown, setOpenDropdown] = useState(null);//which book's dropdown is open
  const [externalResults, setExternalResults] = useState([]);//books from Google API
  const [externalQuery, setExternalQuery] = useState('');//search text for external API

  // --- STYLE OBJECTS ---
  const pageStyle = { display: 'flex', minHeight: '100vh', fontFamily: 'Arial' };
  const sidebarStyle = { width: '220px', backgroundColor: '#6200ea', padding: '30px 20px', display: 'flex', flexDirection: 'column', gap: '10px' };
  const sidebarButtonStyle = { backgroundColor: 'transparent', border: 'none', color: 'white', textAlign: 'left', padding: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' };
  const mainStyle = { flex: 1, backgroundColor: 'white', padding: '30px' };
  const topBarStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' };
  const searchStyle = { padding: '8px 14px', borderRadius: '20px', border: '1px solid #ccc', fontSize: '14px', width: '200px' };
  const addButtonStyle = { padding: '10px 20px', backgroundColor: '#6200ea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' };
  const tableContainerStyle = { backgroundColor: '#b39ddb', borderRadius: '15px', padding: '20px', overflowX: 'auto' };
  const tableStyle = { width: '100%', borderCollapse: 'collapse' };
  const thStyle = { backgroundColor: '#d1c4e9', padding: '12px 15px', textAlign: 'left', fontWeight: 'bold', fontSize: '14px', border: '1px solid #ccc' };
  const tdStyle = { padding: '15px', fontSize: '14px', border: '1px solid #ccc', backgroundColor: '#b39ddb', verticalAlign: 'middle' };
  const optionsButtonStyle = { padding: '6px 12px', backgroundColor: '#d1c4e9', border: '1px solid #ccc', borderRadius: '5px', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' };
  const dropdownStyle = { position: 'absolute', backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', zIndex: 100, minWidth: '150px' };
  const dropdownItemStyle = { padding: '10px 15px', cursor: 'pointer', fontSize: '13px', borderBottom: '1px solid #eee' };

  // --- FETCH USER BOOKS ---
  useEffect(() => {
    const userID = Number(localStorage.getItem('userID'));//get userID from browser storage and convert to number
    if (!userID || isNaN(userID)) { //if no userID or invalid
      alert('User not logged in!');//display error
      navigate('/login');//return to login page
      return;
    }

    getBooks(userID).then(data => {//fetch books from backend
      // sanitize missing title/author
      const sanitized = data.map(b => ({
//loop through books,loop through books
//fix missing data:if no title → "Untitled",if no author → "Unknown"
        ...b,
        title: b.title || 'Untitled',
        author: b.author || 'Unknown',
      }));
      setBooks(sanitized);//save books in state
    });
  }, [navigate]);

  // --- DERIVED FILTER OPTIONS ---
  const genreOptions = [...new Set(books.map(b => b.genre).filter(Boolean))].sort();
//books.map(...) → get all genres
//filter(Boolean) → remove empty ones
//.new Set(...) → remove duplicates
//[... ] → convert back to array
//.sort() → sort alphabetically
//result = list of unique genres

 const activeFilterCount = [filterGenre, filterShelf, filterRating].filter(Boolean).length;
 //count how many filters are active

  // --- FILTER LOCAL BOOKS SAFELY ---
  const filteredBooks = books.filter(book => {//go through each book
    const matchesSearch =
      (book.title?.toLowerCase() || '').includes(search.toLowerCase()) ||//convert title to lowercase,check if it contains search text
      (book.author?.toLowerCase() || '').includes(search.toLowerCase());
    const matchesGenre = !filterGenre || (book.genre?.toLowerCase() === filterGenre.toLowerCase());
    //if no filter → allow all,else → match genre

    const matchesShelf = !filterShelf || book.status === filterShelf;
    //shelf match

    const matchesRating = !filterRating || Number(book.rating) >= Number(filterRating);
    //rating match

    return matchesSearch && matchesGenre && matchesShelf && matchesRating;
    //final res,book must satisfy ALL conditions
  });

  // --- DELETE BOOK ---
  async function handleDelete(id) {
    if (window.confirm('Are you sure you want to delete this book?')) {//ask user for confirmation
      await deleteBook(id);//delete from backend
      setBooks(books.filter(book => book.id !== id));//remove from UI
    }
  }

  // --- MOVE BOOK SHELF ---
  function handleMoveShelf(id, newStatus) {
    setBooks(books.map(book =>//update only the selected book
      book.id === id ? { ...book, status: newStatus } : book
    ));
    setOpenDropdown(null);//close dropdown
  }

  // --- EXTERNAL SEARCH ---
  async function handleExternalSearch(e) {//runs when user types
    const query = e.target.value;//get typed text
    setExternalQuery(query);//get typed text

    if (query.length > 2) {//only search if more than 2 letters
      const results = await searchExternalBooks(query);//
      setExternalResults(results);//store results
    } else {
      setExternalResults([]);//clear results
    }
  }

  // --- ADD EXTERNAL BOOK ---
  async function handleAddExternalBook(book) {//add book from Google
    const userID = Number(localStorage.getItem('userID'));//get userID
    if (!userID || isNaN(userID)) {//check login
      alert('User not logged in');
      return;
    }

    const title = book.title?.trim();//get title and remove spaces
    if (!title) {//stop if no title
      alert('Cannot add a book without a title');
      return;
    }

    const sanitizedBook = {//clean the data
      ...book,
      totalPages: Number(book.totalPages) || 0,
      yearPublished: Number(book.yearPublished) || null,
      genre: book.genre || 'Unknown',
    };

    try {
      await addBook({ ...sanitizedBook, userID });//send to backend
      alert('Book added!');
      getBooks(userID).then(data => {//refresh books
        const sanitized = data.map(b => ({ ...b, title: b.title || 'Untitled', author: b.author || 'Unknown' }));
        setBooks(sanitized);
      });
    } catch (err) {
      console.error(err);
      alert('Failed to add book: ' + err.message);
    }
  }

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

      {/* MAIN CONTENT */}
      <div style={mainStyle}>

        <div style={{ marginBottom: '20px' }}>
          {/* TOP BAR */}
          <div style={topBarStyle}>
            <h1 style={{ fontSize: '28px', margin: 0 }}>LIBRARY</h1>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {/* Search bar with filter button attached */}
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: '20px', overflow: 'hidden', backgroundColor: 'white' }}>
                <input
                  type="text"
                  placeholder="Search by title or author..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ padding: '8px 14px', border: 'none', outline: 'none', fontSize: '14px', width: '220px' }}
                />
                <button
                  onClick={() => setShowFilters(f => !f)}
                  style={{
                    padding: '8px 14px', border: 'none', borderLeft: '1px solid #ccc',
                    backgroundColor: showFilters ? '#6200ea' : '#f5f5f5',
                    color: showFilters ? 'white' : '#333',
                    cursor: 'pointer', fontSize: '13px', fontWeight: 'bold',
                    display: 'flex', alignItems: 'center', gap: '5px',
                  }}>
                  🔽 Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
                </button>
              </div>
              <input
                type="text"
                placeholder="Search books online..."
                value={externalQuery}
                onChange={handleExternalSearch}
                style={searchStyle}
              />
              <button onClick={() => navigate('/bookdetails/new')} style={addButtonStyle}>
                + Add Book
              </button>
            </div>
          </div>

          {/* FILTER PANEL */}
          {showFilters && (
            <div style={{
              backgroundColor: '#f9f5ff', border: '1px solid #d1c4e9', borderRadius: '12px',
              padding: '16px 20px', marginTop: '12px',
              display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap',
            }}>
              {/* Genre filter */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#6b7280', marginBottom: '5px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Genre</label>
                <select
                  value={filterGenre}
                  onChange={e => setFilterGenre(e.target.value)}
                  style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '13px', backgroundColor: 'white', cursor: 'pointer' }}>
                  <option value="">All Genres</option>
                  {genreOptions.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              {/* Shelf filter */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#6b7280', marginBottom: '5px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Shelf</label>
                <select
                  value={filterShelf}
                  onChange={e => setFilterShelf(e.target.value)}
                  style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '13px', backgroundColor: 'white', cursor: 'pointer' }}>
                  <option value="">All Shelves</option>
                  {['Want to Read', 'Currently Reading', 'Finished', 'Did Not Finish'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Min rating filter */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#6b7280', marginBottom: '5px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Min Rating</label>
                <div style={{ display: 'flex', gap: '5px' }}>
                  {['', 1, 2, 3, 4, 5].map(r => (
                    <button
                      key={r}
                      onClick={() => setFilterRating(r)}
                      style={{
                        padding: '6px 10px', borderRadius: '7px', border: '1px solid',
                        borderColor: filterRating === r ? '#6200ea' : '#ccc',
                        backgroundColor: filterRating === r ? '#6200ea' : 'white',
                        color: filterRating === r ? 'white' : '#555',
                        cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                      }}>
                      {r === '' ? 'Any' : `${r}★`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear filters */}
              {activeFilterCount > 0 && (
                <button
                  onClick={() => { setFilterGenre(''); setFilterShelf(''); setFilterRating(''); }}
                  style={{ padding: '7px 14px', backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: '#c00', fontWeight: '600' }}>
                  ✕ Clear Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* LOCAL BOOK TABLE */}
        <div style={tableContainerStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Title</th>
                <th style={thStyle}>Author</th>
                <th style={thStyle}>Shelf</th>
                <th style={thStyle}>Rating</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ ...tdStyle, textAlign: 'center' }}>No books found.</td>
                </tr>
              ) : filteredBooks.map(book => (
                <tr key={book.id}>
                  <td style={tdStyle}>{book.title}</td>
                  <td style={tdStyle}>{book.author}</td>
                  <td style={tdStyle}>{book.status}</td>
                  <td style={tdStyle}>{book.rating}</td>
                  <td style={{ ...tdStyle, position: 'relative' }}>
                    <button
                      style={optionsButtonStyle}
                      onClick={() => setOpenDropdown(openDropdown === book.id ? null : book.id)}>
                      Options ▼
                    </button>
                    {openDropdown === book.id && (
                      <div style={dropdownStyle}>
                        {/* ✅ passes full book object as route state so BookDetails can pre-fill the form */}
                        <div style={dropdownItemStyle} onClick={() => navigate(`/bookdetails/${book.id}`, { state: { book } })}>Edit Details</div>
                        <div style={dropdownItemStyle} onClick={() => handleDelete(book.id)}>Delete</div>
                        <div style={{ padding: '8px 15px', fontSize: '12px', color: '#888' }}>Move to shelf:</div>
                        {['Currently Reading', 'Want to Read', 'Finished', 'Did Not Finish'].map(shelf => (
                          <div key={shelf} style={dropdownItemStyle} onClick={() => handleMoveShelf(book.id, shelf)}>{shelf}</div>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* EXTERNAL SEARCH RESULTS */}
        {externalResults.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h3>Search Results</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
              {externalResults.map(book => (
                <div key={book.id} style={{ backgroundColor: '#eee', padding: '10px', borderRadius: '8px', width: '150px' }}>
                  <div style={{ height: '200px', overflow: 'hidden', textAlign: 'center' }}>
                    {book.cover && book.cover.startsWith('http') ? <img src={book.cover} alt={book.title} style={{ maxHeight: '100%', maxWidth: '100%' }} /> : book.cover}
                  </div>
                  <h4 style={{ fontSize: '14px', margin: '10px 0 5px 0' }}>{book.title}</h4>
                  <p style={{ fontSize: '12px', margin: 0 }}>{book.author}</p>
                  <button
                    style={{ marginTop: '5px', padding: '5px', fontSize: '12px', width: '100%' }}
                    onClick={() => handleAddExternalBook(book)}
                  >
                    Add to Library
                  </button>
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
