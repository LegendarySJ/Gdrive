// Login.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';

function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('http://localhost:5000/login', {  // Or your backend URL
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token);
                localStorage.setItem('accounts', JSON.stringify(data.accounts));
                onLogin(data.token, data.accounts); // Call the parent function to handle login state

                // Request account access and set the MetaMask account
                if (typeof window.ethereum !== 'undefined') {
                    await window.ethereum.request({ method: 'eth_requestAccounts' });
                    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                    
                    // Handle account information
                    accounts.forEach((account) => {
                        console.log(`Account Address: ${account}`);
                        // Store account address if needed
                    });

                } else {
                    alert("MetaMask is not installed. Please install it to use this feature.");
                }

                navigate('/'); // Redirect to the main page or another protected route
            } else {
                const errorData = await response.json();
                setError(errorData.errors?.[0]?.msg || errorData.error || "Login failed."); // Handle validation errors too
            }
        } catch (error) {
            console.error("Login error:", error);
            setError("A network error occurred.");
        }
    };

    return (
        <div className="login-container">
            <div className="login-form">
                <h2>Login</h2>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username:</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit">Login</button>
                </form>
                <p className="signup-link">
                    Don't have an account? <Link to="/signup">Sign Up here</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;
