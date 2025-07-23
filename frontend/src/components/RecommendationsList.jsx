    import React, { useState, useEffect } from 'react';
    import axios from 'axios';
    import { Link } from 'react-router-dom';

    function RecommendationsList() {
        const [recommendations, setRecommendations] = useState([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);
        const [message, setMessage] = useState(''); // To display messages like "Favorite some movies..."

        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const token = userInfo ? userInfo.token : null;

        useEffect(() => {
            const fetchRecommendations = async () => {
                setLoading(true);
                setError(null);
                setMessage('');

                if (!token) {
                    setError('Please log in to see personalized recommendations.');
                    setLoading(false);
                    return;
                }

                try {
                    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/recommendations`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setRecommendations(response.data.recommendations);
                    setMessage(response.data.message); // Set the message from the backend
                } catch (err) {
                    setError(err.response?.data?.message || 'Failed to fetch recommendations.');
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            };

            fetchRecommendations();
        }, [token]); // Re-fetch if token changes (e.g., user logs in/out)

        if (loading) {
            return (
                <div className="text-center my-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Generating recommendations...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="alert alert-danger text-center my-5" role="alert">
                    Error: {error}
                </div>
            );
        }

        return (
            <div className="mt-5">
                <h3 className="mb-3 text-secondary text-center">Your Personalized Recommendations</h3>
                {message && <p className="text-center text-info mb-4">{message}</p>} {/* Display backend message */}

                {recommendations.length === 0 && !message ? ( // Only show if no message and no recommendations
                    <div className="alert alert-info text-center">
                        No recommendations found. Try favoriting some movies!
                    </div>
                ) : (
                    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                        {recommendations.map(movie => (
                            <div key={movie.id} className="col">
                                <Link to={`/movie/${movie.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div className="card h-100 shadow-sm border-0 rounded-lg overflow-hidden">
                                        {movie.poster_path ? (
                                            <img
                                                src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                                                alt={movie.title}
                                                className="card-img-top img-fluid"
                                                style={{ objectFit: 'cover', height: '350px' }}
                                            />
                                        ) : (
                                            <div className="d-flex align-items-center justify-content-center bg-light text-muted" style={{ height: '350px' }}>
                                                No Image Available
                                            </div>
                                        )}
                                        <div className="card-body d-flex flex-column">
                                            <h5 className="card-title text-truncate mb-1">{movie.title}</h5>
                                            <p className="card-text text-muted small mb-1">
                                                Release: {movie.release_date || 'N/A'}
                                            </p>
                                            <p className="card-text text-warning fw-bold mt-auto">
                                                Rating: {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    export default RecommendationsList;
    