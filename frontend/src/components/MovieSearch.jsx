import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function MovieSearch() {
    const [query, setQuery] = useState('');
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const token = userInfo ? userInfo.token : null;

    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query) {
            setError('Please enter a search query.');
            return;
        }
        setLoading(true);
        setError(null); // Clear previous errors
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/tmdb/search?query=${query}`, config);
            setMovies(response.data.results);
            if (response.data.results.length === 0) {
                setError('No movies found for your search. Try a different query.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch movies. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchTrending = async () => {
            setLoading(true);
            setError(null); // Clear previous errors
            try {
                if (token) {
                    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/tmdb/trending`, config);
                    setMovies(response.data.results);
                } else {
                    setMovies([]);
                    setError('Please log in to see trending movies.');
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch trending movies.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTrending();
    }, [token]); // Re-run when token changes (e.g., after login/logout)


    return (
        <div className="container mt-5"> {/* Main container with margin-top */}
            <h3 className="mb-4 text-center text-secondary">Movie Search & Discovery</h3>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="mb-5"> {/* Margin bottom for spacing */}
                <div className="input-group"> {/* Bootstrap input group for input and button */}
                    <input
                        type="text"
                        className="form-control form-control-lg rounded-start" // Large input, rounded left
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by title..."
                        aria-label="Movie search input"
                    />
                    <button type="submit" className="btn btn-primary btn-lg rounded-end"> {/* Large primary button, rounded right */}
                        Search
                    </button>
                </div>
            </form>

            {/* Loading, Error, and No Movies Found Messages */}
            {loading && (
                <div className="text-center my-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Fetching movies...</p>
                </div>
            )}

            {error && (
                <div className="alert alert-danger text-center" role="alert">
                    {error}
                </div>
            )}

            {!loading && !error && movies.length === 0 && (
                <div className="alert alert-info text-center" role="alert">
                    No movies found. Try searching or log in to see trending.
                </div>
            )}

            {/* Movie Grid Display */}
            {movies.length > 0 && (
                <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4"> {/* Responsive grid */}
                    {movies.map(movie => (
                        <div key={movie.id} className="col"> {/* Each movie is a column in the grid */}
                            <Link to={`/movie/${movie.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div className="card h-100 shadow-sm border-0 rounded-lg overflow-hidden transition-transform"> {/* Card styling */}
                                    {movie.poster_path ? (
                                        <img
                                            src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`} // Larger image size for better quality
                                            alt={movie.title}
                                            className="card-img-top img-fluid" // Bootstrap image class
                                            style={{ objectFit: 'cover', height: '350px' }} // Ensure consistent height
                                        />
                                    ) : (
                                        <div className="d-flex align-items-center justify-content-center bg-light text-muted" style={{ height: '350px' }}>
                                            No Image Available
                                        </div>
                                    )}
                                    <div className="card-body d-flex flex-column"> {/* Flex column for content alignment */}
                                        <h5 className="card-title text-truncate mb-1">{movie.title}</h5> {/* Truncate long titles */}
                                        <p className="card-text text-muted small mb-1">
                                            Release: {movie.release_date || 'N/A'}
                                        </p>
                                        <p className="card-text text-warning fw-bold mt-auto"> {/* Push rating to bottom */}
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

export default MovieSearch;
