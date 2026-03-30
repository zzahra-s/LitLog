import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
//registerUser and loginUser → functions we wrote in another file (api.js) to talk to the server.
import { registerUser, loginUser } from '../services/api';

function Register() {
  const [username, setUsername] = useState('');
//const → declares a variable that won’t be reassigned.
//[username, setUsername] → two things returned by useState:
//username → current value of this state (starts empty '').
//setUsername → function to change the username value.
//useState('') → initialize state as an empty string.

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
//async → means the function can wait for server responses (doesn’t block the app while waiting).
//function handleSubmit → function that runs when the user clicks Register.
//(e) → e is the event object (info about what triggered this function).
  async function handleSubmit(e) {
    e.preventDefault();
//Stops the default behavior of a form submission (like page refresh).
//We want to handle submission with JavaScript instead of letting the browser refresh.

    try {
      const data = await registerUser(username, email, password);
  //await → pause the code until registerUser finishes and returns something.
  //registerUser(username, email, password) → calls backend thru api to create new user.
      if (data.message === 'User registered successfully') {
        const loginData = await loginUser(email, password);
//if reg worked login khudi
//await loginUser(email, password) → calls backend to check credentials.
//loginData → stores the login response from the server.
        localStorage.setItem('userID', loginData.user.userID);
        localStorage.setItem('username', loginData.user.username);
        navigate('/dashboard');
      } else {
        alert(data.message || 'Registration failed. Try again!');
      }
    } catch (error) {
      alert('Cannot connect to server!');
    }
  }
  return (
    //screen
    <div style={{ minHeight: '100vh', backgroundColor: '#6200ea', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
 {/* emoji and heading*/}
      <div style={{ fontSize: '60px', marginBottom: '10px' }}>📚</div>
      <h1 style={{ color: 'white', fontSize: '42px', marginBottom: '30px' }}>LitLog</h1>
 {/* rounded reg form box*/}
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
