import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, loginUser } from '../services/api';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

 async function handleSubmit(e) {
  e.preventDefault();
  setError('');

  const trimmedUsername = username.trim();
  const trimmedEmail = email.trim();

  if (!trimmedUsername) {
    setError('Username is required.');
    return;
  }

  if (trimmedUsername.length < 3 || trimmedUsername.length > 50) {
    setError('Username must be between 3 and 20 characters.');
    return;
  }

  if (!trimmedEmail) {
    setError('Email is required.');
    return;
  }

  if (trimmedEmail.length > 100) {
    setError('Email cannot exceed 100 characters.');
    return;
  }

  if (!password) {
    setError('Password is required.');
    return;
  }

  if (password.length < 8 || password.length>255) {
    setError('Password must be at least 8 characters.');
    return;
  }

  setLoading(true);

  try {
    const data = await registerUser(
      trimmedUsername,
      trimmedEmail,
      password
    );

    if (data.message === 'User registered successfully') {
      const loginData = await loginUser(trimmedEmail, password);

      localStorage.setItem('token', loginData.token);
      localStorage.setItem('userID', loginData.user.userID);
      localStorage.setItem('username', loginData.user.username);

      navigate('/dashboard');
    } else {
      setError(data.message || 'Registration failed. Try again.');
    }

  } catch (err) {
    setError(err.message || 'Cannot connect to server.');
  } finally {
    setLoading(false);
  }
}

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#6200ea',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', position: 'relative'
    }}>
      <div style={{ fontSize: '60px', marginBottom: '10px' }}>📚</div>
      <h1 style={{ color: 'white', fontSize: '42px', marginBottom: '30px' }}>LitLog</h1>

      <div style={{ backgroundColor: '#7c4dff', padding: '30px', borderRadius: '10px', width: '300px' }}>
        <h3 style={{ color: 'white', marginBottom: '20px', textAlign: 'center' }}>Create Account</h3>

        {/* Inline error banner — replaces alert() */}
        {error && (
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.4)',
            borderRadius: '6px', padding: '10px 12px',
            marginBottom: '14px', color: 'white',
            fontSize: '13px', fontWeight: '600',
          }}>
            ⚠️ {error}
          </div>
        )}

        <input
          type="text"
          value={username}
          onChange={e => { setUsername(e.target.value); setError(''); }}
          placeholder="Enter Username"
          style={{ display: 'block', width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '5px', border: 'none', boxSizing: 'border-box' }}
        />
        <input
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); setError(''); }}
          placeholder="Enter Email"
          style={{ display: 'block', width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '5px', border: 'none', boxSizing: 'border-box' }}
        />
        <input
          type="password"
          value={password}
          onChange={e => { setPassword(e.target.value); setError(''); }}
          placeholder="Enter Password (min 8 chars)"
          style={{ display: 'block', width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '5px', border: 'none', boxSizing: 'border-box' }}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', padding: '10px',
            backgroundColor: loading ? '#ccc' : 'white',
            border: 'none', borderRadius: '5px',
            cursor: loading ? 'default' : 'pointer',
            fontWeight: 'bold', fontSize: '14px',
          }}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </div>

      <p style={{ color: 'white', marginTop: '20px' }}>
        Already have an account?{' '}
        <span
          onClick={() => navigate('/')}
          style={{ textDecoration: 'underline', cursor: 'pointer', fontWeight: 'bold' }}>
          Login here
        </span>
      </p>
    </div>
  );
}

export default Register;