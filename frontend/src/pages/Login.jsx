import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';

function Login() {

    // State Variables
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // Handle Login Submission
    async function handleSubmit(e) {

        e.preventDefault();
        setError('');

        const trimmedEmail = email.trim();

        // Client-side Validation
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

        // Send Login Request

        setLoading(true);

        try {

            const data = await loginUser(trimmedEmail, password);

            if (data.message === 'Login successful') {

                localStorage.setItem('token', data.token);
                localStorage.setItem('userID', data.user.userID);
                localStorage.setItem('username', data.user.username);

                navigate('/dashboard');

            } else {

                setError(data.message || 'Wrong email or password.');
            }

        } catch (err) {

            setError(err.message || 'Cannot connect to server.');

        } finally {

            setLoading(false);
        }
    }

    // Component UI
    return (

        <div
            style={{
                minHeight: '100vh',
                backgroundColor: '#6200ea',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >

            {/* App Logo */}
            <div style={{ fontSize: '60px', marginBottom: '10px' }}>
                📚
            </div>

            {/* App Title */}
            <h1
                style={{
                    color: 'white',
                    fontSize: '42px',
                    marginBottom: '30px'
                }}
            >
                LitLog
            </h1>

            {/* Login Card */}
            <div
                style={{
                    backgroundColor: '#7c4dff',
                    padding: '30px',
                    borderRadius: '10px',
                    width: '300px'
                }}
            >

                {/* Error Message */}
                {error && (

                    <div
                        style={{
                            backgroundColor: 'rgba(255,255,255,0.15)',
                            border: '1px solid rgba(255,255,255,0.4)',
                            borderRadius: '6px',
                            padding: '10px 12px',
                            marginBottom: '14px',
                            color: 'white',
                            fontSize: '13px',
                            fontWeight: '600'
                        }}
                    >
                        ⚠️ {error}
                    </div>
                )}

                {/* Email Input */}
                <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                    }}
                    placeholder="Enter Email"
                    style={{
                        display: 'block',
                        width: '100%',
                        padding: '10px',
                        marginBottom: '15px',
                        borderRadius: '5px',
                        border: 'none',
                        boxSizing: 'border-box'
                    }}
                />

                {/* Password Input */}
                <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        setError('');
                    }}
                    placeholder="Enter Password"
                    style={{
                        display: 'block',
                        width: '100%',
                        padding: '10px',
                        marginBottom: '15px',
                        borderRadius: '5px',
                        border: 'none',
                        boxSizing: 'border-box'
                    }}
                />

                {/* Login Button */}
                <div style={{ textAlign: 'right' }}>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        style={{
                            padding: '8px 20px',
                            backgroundColor: loading ? '#ccc' : 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: loading ? 'default' : 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>

                </div>

            </div>

            {/* Bottom Section */}
            <div
                style={{
                    position: 'absolute',
                    bottom: '20px',
                    right: '10px',
                    textAlign: 'right'
                }}
            >

                {/* Register Button */}
                <button
                    onClick={() => navigate('/register')}
                    style={{
                        padding: '10px 25px',
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        marginBottom: '20px'
                    }}
                >
                    GET STARTED
                </button>

                {/* App Description */}
                <p
                    style={{
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '16px'
                    }}
                >
                    Track Your Reading. Discover Your Next Favorite Book.
                </p>

            </div>

        </div>
    );
}

export default Login;
