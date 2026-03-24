import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';

function Login() {
  const [email, setEmail] = useState('');     
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const data = await loginUser(email, password);
      if (data.message === 'Login successful') {  
        // FIXED: save correct values from response
        localStorage.setItem('userID', data.user.userID);      
        localStorage.setItem('username', data.user.username);
        navigate('/dashboard');
      } else {
        alert(data.message || 'Wrong email or password!');
      }
    } catch (error) {
      console.error(error);
      alert('Cannot connect to server!');
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#6200ea', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

      <div style={{ fontSize: '60px', marginBottom: '10px' }}>📚</div>
      <h1 style={{ color: 'white', fontSize: '42px', marginBottom: '30px' }}>LitLog</h1>

      <div style={{ backgroundColor: '#7c4dff', padding: '30px', borderRadius: '10px', width: '300px' }}>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Enter Email"
          style={{ display: 'block', width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '5px', border: 'none', boxSizing: 'border-box' }}
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Enter Password"
          style={{ display: 'block', width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '5px', border: 'none', boxSizing: 'border-box' }}
        />
        <div style={{ textAlign: 'right' }}>
          <button
            onClick={handleSubmit}
            style={{ padding: '8px 20px', backgroundColor: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Login
          </button>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: '20px', right: '10px', textAlign: 'right' }}>
        <button
          onClick={() => navigate('/register')}
          style={{ padding: '10px 25px', backgroundColor: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '20px' }}>
          GET STARTED
        </button>
        <p style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>
          Track Your Reading. Discover Your Next Favorite Book.
        </p>
      </div>

    </div>
  );
}

export default Login;