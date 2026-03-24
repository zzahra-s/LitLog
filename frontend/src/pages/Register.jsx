import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const data = await registerUser(username, email, password);
      if (data.message === 'User registered successfully') {
        navigate('/dashboard');
      } else {
        alert(data.message || 'Registration failed. Try again!');
      }
    } catch (error) {
      alert('Cannot connect to server!');
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#6200ea', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>

      <div style={{ fontSize: '60px', marginBottom: '10px' }}>📚</div>
      <h1 style={{ color: 'white', fontSize: '42px', marginBottom: '30px' }}>LitLog</h1>

      <div style={{ backgroundColor: '#7c4dff', padding: '30px', borderRadius: '10px', width: '300px' }}>

        <h3 style={{ color: 'white', marginBottom: '20px', textAlign: 'center' }}>Create Account</h3>

        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Enter Full Name"
          style={{ display: 'block', width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '5px', border: 'none', boxSizing: 'border-box' }}
        />

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

        <button
          onClick={handleSubmit}
          style={{ width: '100%', padding: '10px', backgroundColor: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          Register
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