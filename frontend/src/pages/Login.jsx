import React, { useState } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
function Login() {
  const [email, setEmail] = useState('');//email starts empty, and when the user types something, we update it with setEmail ftn
  //useState('') → initial value is an empty string ''.     
  const [password, setPassword] = useState('');
  //password → current value of the password field,setPassword → function to change password.
  const navigate = useNavigate();//variable that now stores the navigation function from useNavigate.

  async function handleSubmit(e){//(e) → parameter, stands for event (what triggered the function, here a button click).
    e.preventDefault();//prevents the default browser behavior (like refreshing the page when you submit a form).
    try {
      const data = await loginUser(email, password);//store res in 'data',
//loginUser(email, password) → calls our backend API with email and password to check if the user can log in
      if (data.message === 'Login successful') {//if backend sends this msg back  
        localStorage.setItem('userID', data.user.userID);
//localStorage → browser storage that keeps data even after refresh.
//setItem(key, value) → saves a value under a key.
//we save userID and username from the backend response so we can remember the logged-in user.     
        localStorage.setItem('username', data.user.username);

        navigate('/dashboard');//Moves the user to the /dashboard page after successful login.
      } else {
        alert(data.message || 'Wrong email or password!');
      }
    } catch (error) {
      console.error(error);
      alert('Cannot connect to server!');
    }
  }

  return (
    //screen
    <div style={{ minHeight: '100vh', backgroundColor: '#6200ea', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
     {/* emoji*/}
      <div style={{ fontSize: '60px', marginBottom: '10px' }}>📚</div>
       {/* heading*/}
      <h1 style={{ color: 'white', fontSize: '42px', marginBottom: '30px' }}>LitLog</h1>
 {/*login form Purple background, some padding, rounded corners, fixed width.*/}
      <div style={{ backgroundColor: '#7c4dff', padding: '30px', borderRadius: '10px', width: '300px' }}>
        {/*email */}
        <input 
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Enter Email"
          style={{ display: 'block', width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '5px', border: 'none', boxSizing: 'border-box' }}
        />
        {/*password */}
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Enter Password"
          style={{ display: 'block', width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '5px', border: 'none', boxSizing: 'border-box' }}
        />
        {/*Button container aligned right,when clicked call handlesubmit*/}
        <div style={{ textAlign: 'right' }}>
          <button
            onClick={handleSubmit}
            style={{ padding: '8px 20px', backgroundColor: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Login
          </button>
        </div>
      </div>
 {/*footer */}
      <div style={{ position: 'absolute', bottom: '20px', right: '10px', textAlign: 'right' }}>
       {/*Button to go to registration page.*/}
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
