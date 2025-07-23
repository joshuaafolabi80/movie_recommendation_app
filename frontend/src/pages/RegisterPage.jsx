import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function RegisterPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false); // Track success state
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/auth/register`,
                { username, email, password }
            );
            localStorage.setItem('userInfo', JSON.stringify(response.data));
            setIsSuccess(true); // Set success to true
            setMessage('Registration successful! Redirecting...');
            
            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (error) {
            setIsSuccess(false); // Set success to false
            setMessage(error.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
            <div className="card shadow-lg p-4" style={{ maxWidth: '400px', width: '100%' }}>
                <div className="card-body">
                    <h2 className="card-title text-center mb-4 text-primary">Register</h2>
                    
                    {/* Notification Box (conditionally rendered) */}
                    {message && (
                        <div 
                            className={`alert ${isSuccess ? 'alert-success' : 'alert-danger'} rounded-pill`}
                            style={{
                                borderRadius: '50px', // Curved edges
                                backgroundColor: isSuccess ? '#28a745' : '#dc3545', // Green/Red
                                color: 'white',
                                textAlign: 'center',
                                padding: '10px',
                                marginBottom: '20px',
                                border: 'none'
                            }}
                        >
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} autoComplete="off">
                        <div className="mb-3">
                            <label htmlFor="usernameInput" className="form-label">Username</label>
                            <input
                                type="text"
                                className="form-control"
                                id="usernameInput"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="emailInput" className="form-label">Email address</label>
                            <input
                                type="email"
                                className="form-control"
                                id="emailInput"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="passwordInput" className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-control"
                                id="passwordInput"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary w-100 mt-3">
                            Register
                        </button>
                    </form>
                    
                    <p className="text-center mt-3">
                        Already have an account? <Link to="/login">Login here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;