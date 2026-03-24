import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();

  const [books] = useState([
    { id: 1, title: 'Harry Potter', author: 'J.K. Rowling', progress: 90, cover: '📚' },
    { id: 2, title: 'Diary of a Wimpy Kid', author: 'Jeff Kinney', progress: 20, cover: '📖' },
    { id: 3, title: 'Dune', author: 'Frank Herbert', progress: 15, cover: '📕' },
  ]);

  const pageStyle = {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: 'Arial',
  };

  const sidebarStyle = {
    width: '220px',
    backgroundColor: '#6200ea',
    padding: '30px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  };

  const sidebarHeadingStyle = {
    color: 'white',
    marginBottom: '30px',
  };

  const sidebarButtonStyle = {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'white',
    textAlign: 'left',
    padding: '10px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px',
  };

  const mainContentStyle = {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: '30px',
  };

  const mainHeadingStyle = {
    marginBottom: '20px',
  };

  const columnsWrapperStyle = {
    display: 'flex',
    gap: '20px',
  };

  const bookColumnStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    flex: 1,
  };

  const bookCardStyle = {
    backgroundColor: '#b39ddb',
    padding: '15px',
    borderRadius: '10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '400px',
  };

  const progressBarBgStyle = {
    backgroundColor: '#ddd',
    borderRadius: '5px',
    height: '8px',
    width: '80%',
    marginBottom: '6px',
  };

  const progressBarFillStyle = (progress) => ({
    backgroundColor: '#00bcd4',
    height: '8px',
    borderRadius: '5px',
    width: `${progress}%`,
  });

  const coverStyle = {
    fontSize: '50px',
    marginLeft: '10px',
  };

  const playButtonStyle = {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    marginLeft: '10px',
  };

  const statsColumnStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    width: '220px',
  };

  const statBoxStyle = {
    backgroundColor: '#ddd',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '13px',
    textAlign: 'center',
  };

  const goalCardStyle = {
    backgroundColor: '#b39ddb',
    padding: '15px',
    borderRadius: '10px',
    textAlign: 'center',
  };

  const goalPercentStyle = {
    fontSize: '36px',
    fontWeight: 'bold',
    marginBottom: '10px',
  };

  const goalBarBgStyle = {
    backgroundColor: '#ddd',
    borderRadius: '5px',
    height: '8px',
  };

  const goalBarFillStyle = {
    backgroundColor: '#00bcd4',
    height: '8px',
    borderRadius: '5px',
    width: '90%',
  };

  const genreCardStyle = {
    backgroundColor: '#b39ddb',
    padding: '15px',
    borderRadius: '10px',
    textAlign: 'center',
  };

  const genreIconStyle = {
    fontSize: '60px',
  };

  const genreLabelStyle = {
    fontSize: '12px',
    color: '#555',
  };

  return (
    <div style={pageStyle}>

      {/* SIDEBAR */}
      <div style={sidebarStyle}>
        <h2 style={sidebarHeadingStyle}>LitLog</h2>
        {['DASHBOARD', 'LIBRARY', 'BOOKSHELVES', 'BOOK DETAILS', 'RECOMMENDATIONS'].map(item => (
          <button
            key={item}
            onClick={() => {
              if (item === 'LIBRARY' || item === 'BOOKSHELVES') navigate('/library');
            }}
            style={sidebarButtonStyle}>
            {item}
          </button>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div style={mainContentStyle}>
        <h2 style={mainHeadingStyle}>MY BOOKS</h2>

        <div style={columnsWrapperStyle}>

          {/* BOOK CARDS */}
          <div style={bookColumnStyle}>
            {books.map(book => (
              <div key={book.id} style={bookCardStyle}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ marginBottom: '10px' }}>{book.title}</h3>
                  <div style={progressBarBgStyle}>
                    <div style={progressBarFillStyle(book.progress)}></div>
                  </div>
                  <p style={{ fontSize: '12px' }}>{book.progress}%</p>
                </div>
                <div style={coverStyle}>{book.cover}</div>
                <button style={playButtonStyle}>▶</button>
              </div>
            ))}
          </div>

          {/* STATS */}
          <div style={statsColumnStyle}>
            {[
              'Pages Read: 1000',
              'Books Read: 6',
              'Most Read Author: Rowling',
              'Average Rating: 4.8 Stars',
              'Favorite Genre: Comedy',
              'Average Days Read/Week: 5',
            ].map(stat => (
              <div key={stat} style={statBoxStyle}>{stat}</div>
            ))}

            {/* GOAL PROGRESS */}
            <div style={goalCardStyle}>
              <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>MY GOAL PROGRESS</p>
              <p style={goalPercentStyle}>90%</p>
              <div style={goalBarBgStyle}>
                <div style={goalBarFillStyle}></div>
              </div>
            </div>

            {/* GENRE DISTRIBUTION */}
            <div style={genreCardStyle}>
              <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>GENRE DISTRIBUTION</p>
              <div style={genreIconStyle}>🥧</div>
              <p style={genreLabelStyle}>Fantasy · Sci-Fi · Self Help</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;