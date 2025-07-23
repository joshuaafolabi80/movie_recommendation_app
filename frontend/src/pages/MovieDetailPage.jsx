import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function MovieDetailPage() {
    const { id } = useParams(); // Get movie ID from URL
    const navigate = useNavigate(); // Initialize useNavigate hook
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // User-specific states
    const [isFavorited, setIsFavorited] = useState(false);
    const [userWatchlists, setUserWatchlists] = useState([]);
    const [newWatchlistName, setNewWatchlistName] = useState('');
    const [selectedWatchlist, setSelectedWatchlist] = useState(''); // Stores _id of selected watchlist
    const [userRating, setUserRating] = useState(0);
    const [userComment, setUserComment] = useState('');
    const [existingReview, setExistingReview] = useState(null); // To store existing review object

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const token = userInfo ? userInfo.token : null;

    // Axios config for authenticated requests
    const authConfig = {
        headers: { Authorization: `Bearer ${token}` }
    };

    // --- Data Fetching Logic (useEffect) ---
    useEffect(() => {
        const fetchMovieAndUserData = async () => {
            setLoading(true);
            setError(null);
            if (!token) {
                setError('You need to be logged in to view movie details and features.');
                setLoading(false);
                return;
            }

            try {
                // 1. Fetch Movie Details
                const movieResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/tmdb/movie/${id}`, authConfig);
                setMovie(movieResponse.data);

                // 2. Fetch Favorite Status
                const favResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/favorites?movieId=${id}`, authConfig);
                setIsFavorited(favResponse.data.isFavorited);

                // 3. Fetch User Watchlists
                const watchlistsResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/watchlists`, authConfig);
                setUserWatchlists(watchlistsResponse.data);
                if (watchlistsResponse.data.length > 0) {
                    setSelectedWatchlist(watchlistsResponse.data[0]._id); // Select first watchlist by default
                }

                // 4. Fetch Existing Review
                const reviewResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/reviews?movieId=${id}`, authConfig);
                if (reviewResponse.data) {
                    setExistingReview(reviewResponse.data);
                    setUserRating(reviewResponse.data.rating);
                    setUserComment(reviewResponse.data.comment);
                } else {
                    setExistingReview(null);
                    setUserRating(0);
                    setUserComment('');
                }

            } catch (err) {
                console.error("Failed to fetch movie or user data:", err);
                setError(err.response?.data?.message || 'Failed to load movie details or user data.');
            } finally {
                setLoading(false);
            }
        };

        if (id && token) {
            fetchMovieAndUserData();
        }
    }, [id, token]); // Dependencies: re-run if movie ID or token changes

    // --- Event Handlers ---

    const handleGoBack = () => {
        navigate('/dashboard'); // Go back to the dashboard where MovieSearch is
    };

    const handleToggleFavorite = async () => {
        if (!token || !movie) {
            setError('Please log in and ensure movie data is loaded to manage favorites.');
            return;
        }
        try {
            if (isFavorited) {
                await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/users/favorites/${movie.id}`, authConfig);
                setIsFavorited(false);
                alert('Removed from favorites!');
            } else {
                await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/users/favorites`, {
                    movieId: movie.id,
                    title: movie.title,
                    poster_path: movie.poster_path,
                    release_date: movie.release_date
                }, authConfig);
                setIsFavorited(true);
                alert('Added to favorites!');
            }
        } catch (err) {
            console.error("Failed to toggle favorite:", err);
            setError(err.response?.data?.message || 'Failed to update favorites.');
        }
    };

    const handleCreateWatchlist = async () => {
        if (!token || !newWatchlistName.trim()) {
            alert('Watchlist name cannot be empty and you must be logged in.');
            return;
        }
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/users/watchlists`, { name: newWatchlistName }, authConfig);
            setUserWatchlists([...userWatchlists, response.data]);
            setNewWatchlistName('');
            setSelectedWatchlist(response.data._id); // Select the newly created watchlist
            alert('Watchlist created!');
        } catch (err) {
            console.error("Failed to create watchlist:", err);
            alert(err.response?.data?.message || 'Failed to create watchlist.');
        }
    };

    const handleAddMovieToWatchlist = async () => {
        if (!token || !selectedWatchlist || !movie) {
            alert('Please select a watchlist, ensure movie data is loaded, and you are logged in.');
            return;
        }
        try {
            await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/users/watchlists/${selectedWatchlist}/add`, {
                movieId: movie.id,
                title: movie.title,
                poster_path: movie.poster_path,
                release_date: movie.release_date
            }, authConfig);
            alert('Movie added to watchlist!');
            // Optional: You might want to refresh the specific watchlist's movies here if displayed
        } catch (err) {
            console.error("Failed to add movie to watchlist:", err);
            alert(err.response?.data?.message || 'Failed to add movie to watchlist.');
        }
    };

    const handleSubmitReview = async () => {
        if (!token || !movie || userRating === 0 || !userComment.trim()) {
            alert('Please provide a rating (1-10), a comment, and ensure movie data is loaded. You must be logged in.');
            return;
        }
        try {
            if (existingReview) {
                // Update existing review
                await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/users/reviews/${movie.id}`, {
                    rating: userRating,
                    comment: userComment
                }, authConfig);
                alert('Review updated successfully!');
            } else {
                // Create new review
                const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/users/reviews`, {
                    movieId: movie.id,
                    rating: userRating,
                    comment: userComment,
                    title: movie.title,
                    poster_path: movie.poster_path // Include poster for display in reviews list
                }, authConfig);
                setExistingReview(response.data); // Update existing review state with new review
                alert('Review submitted successfully!');
            }
        } catch (err) {
            console.error("Failed to submit review:", err);
            alert(err.response?.data?.message || 'Failed to submit review.');
        }
    };

    const handleDeleteReview = async () => {
        if (!token || !movie || !existingReview) {
            alert('No review to delete or you are not logged in.');
            return;
        }
        if (!window.confirm('Are you sure you want to delete your review?')) {
            return;
        }
        try {
            await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/users/reviews/${movie.id}`, authConfig);
            setExistingReview(null); // Clear existing review state
            setUserRating(0); // Reset inputs
            setUserComment('');
            alert('Review deleted successfully!');
        } catch (err) {
            console.error("Failed to delete review:", err);
            alert(err.response?.data?.message || 'Failed to delete review.');
        }
    };

    // --- Render Logic ---
    if (loading) {
        return (
            <div className="container text-center my-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted">Loading movie details and user data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container my-5">
                <div className="alert alert-danger text-center" role="alert">
                    Error: {error}
                </div>
                <div className="text-center mt-3">
                    <button onClick={handleGoBack} className="btn btn-secondary">
                        <i className="bi bi-arrow-left me-2"></i> Back to Search
                    </button>
                </div>
            </div>
        );
    }

    if (!movie) {
        return (
            <div className="container my-5">
                <div className="alert alert-info text-center" role="alert">
                    No movie found or details could not be loaded.
                </div>
                <div className="text-center mt-3">
                    <button onClick={handleGoBack} className="btn btn-secondary">
                        <i className="bi bi-arrow-left me-2"></i> Back to Search
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container my-5">
            {/* Back Button at the top */}
            <div className="mb-4">
                <button onClick={handleGoBack} className="btn btn-secondary">
                    <i className="bi bi-arrow-left me-2"></i> Back to Search
                </button>
            </div>

            <div className="row">
                {/* Movie Poster Column */}
                <div className="col-md-4 mb-4">
                    {movie.poster_path ? (
                        <img
                            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                            alt={movie.title}
                            className="img-fluid rounded shadow-lg"
                        />
                    ) : (
                        <div className="d-flex align-items-center justify-content-center bg-light text-muted border rounded" style={{ height: '500px' }}>
                            No Image Available
                        </div>
                    )}
                </div>

                {/* Movie Details Column */}
                <div className="col-md-8 mb-4">
                    <h1 className="display-4 mb-3 text-primary">{movie.title} <span className="text-muted fw-light">({movie.release_date ? movie.release_date.substring(0, 4) : 'N/A'})</span></h1>
                    
                    {movie.tagline && <p className="lead text-muted fst-italic mb-3">"{movie.tagline}"</p>}
                    
                    <p className="mb-2"><strong>Overview:</strong></p>
                    <p className="text-justify mb-4">{movie.overview}</p>

                    <div className="row g-3 mb-4">
                        <div className="col-md-6">
                            <p className="mb-0">
                                <strong className="me-2">Rating:</strong>
                                <span className="badge bg-warning text-dark fs-6">
                                    {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'} <i className="bi bi-star-fill"></i>
                                </span>
                                <span className="ms-2 text-muted small">({movie.vote_count} votes)</span>
                            </p>
                        </div>
                        <div className="col-md-6">
                            <p className="mb-0">
                                <strong className="me-2">Runtime:</strong>
                                <span className="text-muted">{movie.runtime ? `${movie.runtime} minutes` : 'N/A'}</span>
                            </p>
                        </div>
                        <div className="col-12">
                            <p className="mb-0">
                                <strong className="me-2">Genres:</strong>
                                {movie.genres && movie.genres.length > 0 ? (
                                    movie.genres.map(g => (
                                        <span key={g.id} className="badge bg-secondary me-1">
                                            {g.name}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-muted">N/A</span>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Favorites Button */}
                    <div className="d-grid gap-2 d-md-block mt-4">
                        <button
                            onClick={handleToggleFavorite}
                            className={`btn ${isFavorited ? 'btn-danger' : 'btn-outline-danger'} me-md-2 mb-2 mb-md-0`}
                        >
                            <i className={`bi ${isFavorited ? 'bi-heart-fill' : 'bi-heart'}`}></i> {isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Watchlist Section */}
            <div className="mt-5 p-3 border rounded bg-light shadow-sm">
                <h4 className="mb-3 text-secondary">Manage Watchlists</h4>
                <p className="text-muted small">Add this movie to an existing watchlist or create a new one.</p>
                {/* Create New Watchlist */}
                <div className="input-group mb-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="New watchlist name"
                        value={newWatchlistName}
                        onChange={(e) => setNewWatchlistName(e.target.value)}
                    />
                    <button className="btn btn-outline-primary" onClick={handleCreateWatchlist}>
                        Create Watchlist
                    </button>
                </div>

                {/* Add to Existing Watchlist */}
                {userWatchlists.length > 0 && (
                    <div className="d-flex align-items-center mb-3">
                        <select
                            className="form-select me-2"
                            value={selectedWatchlist}
                            onChange={(e) => setSelectedWatchlist(e.target.value)}
                        >
                            <option value="">Select a Watchlist</option>
                            {userWatchlists.map(list => (
                                <option key={list._id} value={list._id}>{list.name}</option>
                            ))}
                        </select>
                        <button className="btn btn-success" onClick={handleAddMovieToWatchlist}>
                            Add to Selected Watchlist
                        </button>
                    </div>
                )}
                {userWatchlists.length === 0 && <p className="text-muted small">No watchlists found. Create one above!</p>}
            </div>

            {/* Rating/Review Section */}
            <div className="mt-5 p-3 border rounded bg-light shadow-sm">
                <h4 className="mb-3 text-secondary">{existingReview ? 'Update Your Review' : 'Add Your Review'}</h4>
                <div className="mb-3">
                    <label htmlFor="ratingInput" className="form-label">Rating (1-10):</label>
                    <input
                        type="number"
                        id="ratingInput"
                        className="form-control"
                        min="1"
                        max="10"
                        value={userRating}
                        onChange={(e) => setUserRating(Number(e.target.value))}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="commentTextarea" className="form-label">Comment:</label>
                    <textarea
                        id="commentTextarea"
                        className="form-control"
                        rows="3"
                        value={userComment}
                        onChange={(e) => setUserComment(e.target.value)}
                        placeholder="Write your review here..."
                    ></textarea>
                </div>
                <button className="btn btn-primary me-2" onClick={handleSubmitReview}>
                    {existingReview ? 'Update Review' : 'Submit Review'}
                </button>
                {existingReview && (
                    <button className="btn btn-danger" onClick={handleDeleteReview}>
                        Delete Review
                    </button>
                )}
            </div>

            {/* Cast Section */}
            {movie.credits && movie.credits.cast && movie.credits.cast.length > 0 && (
                <div className="mt-5">
                    <h3 className="mb-3 text-secondary">Top Cast</h3>
                    <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-6 g-3">
                        {movie.credits.cast.slice(0, 6).map(person => (
                            <div key={person.id} className="col">
                                <div className="card h-100 text-center shadow-sm">
                                    {person.profile_path ? (
                                        <img
                                            src={`https://image.tmdb.org/t/p/w200${person.profile_path}`}
                                            alt={person.name}
                                            className="card-img-top rounded-circle mx-auto mt-3"
                                            style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div className="d-flex align-items-center justify-content-center bg-light text-muted rounded-circle mx-auto mt-3" style={{ width: '80px', height: '80px', border: '1px dashed #ccc' }}>
                                            N/A
                                        </div>
                                    )}
                                    <div className="card-body p-2">
                                        <h6 className="card-title mb-0 text-truncate">{person.name}</h6>
                                        <p className="card-text text-muted small text-truncate">{person.character}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Trailers Section */}
            {movie.videos && movie.videos.results && movie.videos.results.length > 0 && (
                <div className="mt-5">
                    <h3 className="mb-3 text-secondary">Trailers & Videos</h3>
                    <div className="row row-cols-1 row-cols-md-2 g-4">
                        {movie.videos.results.filter(video => video.type === 'Trailer' && video.site === 'YouTube').slice(0, 2).map(trailer => (
                            <div key={trailer.id} className="col">
                                <div className="card shadow-sm h-100">
                                    <div className="card-body">
                                        <h5 className="card-title mb-3">{trailer.name}</h5>
                                        <div className="ratio ratio-16x9">
                                            <iframe
                                                src={`https://www.youtube.com/embed/${trailer.key}`}
                                                title={trailer.name}
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                className="rounded"
                                            ></iframe>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default MovieDetailPage;
