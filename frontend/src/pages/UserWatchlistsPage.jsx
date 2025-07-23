import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function UserWatchlistsPage() {
    const [watchlists, setWatchlists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const token = userInfo ? userInfo.token : null;

    const fetchWatchlists = async () => {
        setLoading(true);
        setError(null);
        if (!token) {
            setError('You need to be logged in to view watchlists.');
            setLoading(false);
            return;
        }
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/watchlists`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWatchlists(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch watchlists.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWatchlists();
    }, [token]);

    const handleDeleteWatchlist = async (watchlistId) => {
        if (!token || !window.confirm('Are you sure you want to delete this watchlist?')) {
            return;
        }
        try {
            await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/users/watchlists/${watchlistId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWatchlists(watchlists.filter(list => list._id !== watchlistId));
            alert('Watchlist deleted!');
        } catch (err) {
            console.error("Failed to delete watchlist:", err);
            alert(err.response?.data?.message || 'Failed to delete watchlist.');
        }
    };

    const handleRemoveMovieFromWatchlist = async (watchlistId, movieId, movieTitle) => {
        if (!token || !window.confirm(`Remove "${movieTitle}" from this watchlist?`)) {
            return;
        }
        try {
            await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/users/watchlists/${watchlistId}/remove`, { movieId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Update the specific watchlist in state
            setWatchlists(watchlists.map(list =>
                list._id === watchlistId
                    ? { ...list, movies: list.movies.filter(movie => movie.movieId !== movieId) }
                    : list
            ));
            alert('Movie removed from watchlist!');
        } catch (err) {
            console.error("Failed to remove movie from watchlist:", err);
            alert(err.response?.data?.message || 'Failed to remove movie.');
        }
    };


    if (loading) return <div className="container text-center my-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div><p className="mt-2 text-muted">Loading watchlists...</p></div>;
    if (error) return <div className="container my-5"><div className="alert alert-danger text-center" role="alert">Error: {error}</div></div>;

    return (
        <div className="container my-5">
            <h2 className="text-center mb-4 text-primary">Your Watchlists</h2>
            {watchlists.length === 0 ? (
                <div className="alert alert-info text-center">
                    You haven't created any watchlists yet. Go to a <Link to="/movie/550">movie detail page</Link> to create one!
                </div>
            ) : (
                <div className="row g-4">
                    {watchlists.map(watchlist => (
                        <div key={watchlist._id} className="col-12 col-md-6 col-lg-4"> {/* Responsive column for each watchlist card */}
                            <div className="card h-100 shadow-sm border-0 rounded-lg">
                                <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                                    <h5 className="card-title mb-0">{watchlist.name} ({watchlist.movies.length})</h5>
                                    <button
                                        className="btn btn-sm btn-outline-light"
                                        onClick={() => handleDeleteWatchlist(watchlist._id)}
                                    >
                                        Delete Watchlist
                                    </button>
                                </div>
                                <div className="card-body">
                                    {watchlist.movies.length === 0 ? (
                                        <p className="text-muted">No movies in this watchlist yet.</p>
                                    ) : (
                                        <div className="row row-cols-2 g-2"> {/* Grid for movies within watchlist */}
                                            {watchlist.movies.map(movie => (
                                                <div key={movie.movieId} className="col">
                                                    <div className="card h-100 shadow-sm">
                                                        <Link to={`/movie/${movie.movieId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                            {movie.poster_path ? (
                                                                <img
                                                                    src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                                                                    alt={movie.title}
                                                                    className="card-img-top img-fluid"
                                                                    style={{ objectFit: 'cover', height: '150px' }}
                                                                />
                                                            ) : (
                                                                <div className="d-flex align-items-center justify-content-center bg-light text-muted" style={{ height: '150px' }}>
                                                                    No Image
                                                                </div>
                                                            )}
                                                            <div className="card-body p-2">
                                                                <h6 className="card-title text-truncate small">{movie.title}</h6>
                                                            </div>
                                                        </Link>
                                                        <div className="card-footer bg-transparent border-top-0 p-1">
                                                            <button
                                                                className="btn btn-sm btn-outline-danger w-100"
                                                                onClick={() => handleRemoveMovieFromWatchlist(watchlist._id, movie.movieId, movie.title)}
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default UserWatchlistsPage;
