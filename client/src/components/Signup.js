// Signup.js
import React, { useState } from 'react';
import './Signup.css';

function Signup() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [accounts, setAccounts] = useState([{ account_name: '', privateKey: '' }]); // Array of accounts
    const [error, setError] = useState('');


    const handleAddAccount = () => {
        setAccounts([...accounts, { account_name: '', privateKey: '' }]);
    };

    const handleRemoveAccount = (index) => {
        const updatedAccounts = [...accounts];
        updatedAccounts.splice(index, 1);
        setAccounts(updatedAccounts);
    };


    const handleAccountChange = (index, field, value) => {
        const updatedAccounts = [...accounts];
        updatedAccounts[index][field] = value;
        setAccounts(updatedAccounts);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
       
        try {
            const response = await fetch('http://localhost:5000/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, accounts }) // Send accounts array
            });
            if (response.ok) {
                // Redirect to login or display success message
                window.location.href = '/login'; // Example redirect
            } else {
                const errorData = await response.json();
                setError(errorData.error || "Signup failed.");
            }
        } catch (error) {
            console.error("Signup error:", error);
            setError("A network error occurred.");
        }
    };



    return (
        <div className="signup-container">
            <div className="signup-form">
                <h2>Sign Up</h2>
                {error && <p className="error-message">{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username:</label>
                        <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password:</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password:</label>
                        <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    </div>

                    <h3>Accounts</h3>
                    {accounts.map((account, index) => (
                        <div key={index} className="account-group">
                           <div className="form-group"> {/* Input fields within the map */}
                                <label htmlFor={`account_name-${index}`}>Account Name:</label>
                                <input
                                    type="text"
                                    id={`account_name-${index}`}
                                    value={account.account_name}
                                    onChange={(e) => handleAccountChange(index, 'account_name', e.target.value)}
                                    required
                                />
                             </div>
                             <div className="form-group">
                                <label htmlFor={`privateKey-${index}`}>Private Key:</label>
                                <input
                                    type="password"
                                    id={`privateKey-${index}`}
                                    value={account.privateKey}
                                    onChange={(e) => handleAccountChange(index, 'privateKey', e.target.value)}
                                    required
                                />
                            </div>
                            <button type="button" onClick={() => handleRemoveAccount(index)}>-</button>
                        </div>
                    ))}
                    <button type="button" onClick={handleAddAccount}>+</button> {/* Add account button */}


                    <button type="submit">Sign Up</button>
                </form>
            </div>
        </div>
    );
}

export default Signup;