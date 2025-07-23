import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function UserFavoritesPage() {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const token = userInfo ? userInfo.token : null;

    useEffect(() => {
        const fetchFavorites = async () => {
            setLoading(true);
            setError(null);
            if (!token) {
                setError('You need to be logged in to view favorites.');
                setLoading(false);
                return;
            }
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/favorites`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setFavorites(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch favorites.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchFavorites();
    }, [token]);

    const handleRemoveFavorite = async (movieId) => {
        if (!token || !window.confirm('Are you sure you want to remove this from favorites?')) {
            return;
        }
        try {
            await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/users/favorites/${movieId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFavorites(favorites.filter(fav => fav.movieId !== movieId)); // Update UI
            alert('Movie removed from favorites!');
        } catch (err) {
            console.error("Failed to remove favorite:", err);
            alert(err.response?.data?.message || 'Failed to remove from favorites.');
        }
    };

    if (loading) return <div className="container text-center my-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div><p className="mt-2 text-muted">Loading favorites...</p></div>;
    if (error) return <div className="container my-5"><div className="alert alert-danger text-center" role="alert">Error: {error}</div></div>;

    return (
        <div className="container my-5">
            <h2 className="text-center mb-4 text-primary">Your Favorite Movies</h2>
            {favorites.length === 0 ? (
                <div className="alert alert-info text-center">
                    You haven't added any movies to your favorites yet. Start by searching for movies on the <Link to="/dashboard">Dashboard</Link>!
                </div>
            ) : (
                <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                    {favorites.map(movie => (
                        <div key={movie.movieId} className="col">
                            <div className="card h-100 shadow-sm border-0 rounded-lg overflow-hidden">
                                <Link to={`/movie/${movie.movieId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
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
                                        <p className="card-text text-muted small">
                                            Release: {movie.release_date || 'N/A'}
                                        </p>
                                    </div>
                                </Link>
                                <div className="card-footer bg-transparent border-top-0">
                                    <button
                                        className="btn btn-sm btn-outline-danger w-100"
                                        onClick={() => handleRemoveFavorite(movie.movieId)}
                                    >
                                        <i className="bi bi-heartbreak me-1"></i> Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default UserFavoritesPage;
