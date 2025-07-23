import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function UserReviewsPage() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const token = userInfo ? userInfo.token : null;

    const fetchReviews = async () => {
        setLoading(true);
        setError(null);
        if (!token) {
            setError('You need to be logged in to view reviews.');
            setLoading(false);
            return;
        }
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/reviews`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReviews(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch reviews.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [token]);

    const handleDeleteReview = async (movieId, movieTitle) => {
        if (!token || !window.confirm(`Are you sure you want to delete your review for "${movieTitle}"?`)) {
            return;
        }
        try {
            await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/users/reviews/${movieId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReviews(reviews.filter(review => review.movieId !== movieId)); // Update UI
            alert('Review deleted successfully!');
        } catch (err) {
            console.error("Failed to delete review:", err);
            alert(err.response?.data?.message || 'Failed to delete review.');
        }
    };

    if (loading) return <div className="container text-center my-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div><p className="mt-2 text-muted">Loading reviews...</p></div>;
    if (error) return <div className="container my-5"><div className="alert alert-danger text-center" role="alert">Error: {error}</div></div>;

    return (
        <div className="container my-5">
            <h2 className="text-center mb-4 text-primary">Your Movie Reviews</h2>
            {reviews.length === 0 ? (
                <div className="alert alert-info text-center">
                    You haven't submitted any reviews yet. Go to a <Link to="/movie/550">movie detail page</Link> to add one!
                </div>
            ) : (
                <div className="row row-cols-1 row-cols-md-2 g-4"> {/* Two columns for reviews */}
                    {reviews.map(review => (
                        <div key={review._id} className="col">
                            <div className="card h-100 shadow-sm border-0 rounded-lg">
                                <div className="row g-0">
                                    <div className="col-md-4">
                                        <Link to={`/movie/${review.movieId}`}>
                                            {review.poster_path ? (
                                                <img
                                                    src={`https://image.tmdb.org/t/p/w200${review.poster_path}`}
                                                    alt={review.title}
                                                    className="img-fluid rounded-start"
                                                    style={{ objectFit: 'cover', height: '100%', minHeight: '150px' }}
                                                />
                                            ) : (
                                                <div className="d-flex align-items-center justify-content-center bg-light text-muted rounded-start" style={{ height: '100%', minHeight: '150px' }}>
                                                    No Image
                                                </div>
                                            )}
                                        </Link>
                                    </div>
                                    <div className="col-md-8">
                                        <div className="card-body d-flex flex-column h-100">
                                            <h5 className="card-title mb-1">
                                                <Link to={`/movie/${review.movieId}`} className="text-primary text-decoration-none">
                                                    {review.title}
                                                </Link>
                                            </h5>
                                            <p className="card-text mb-1">
                                                Rating: <span className="badge bg-warning text-dark">{review.rating}/10</span>
                                            </p>
                                            <p className="card-text flex-grow-1 small text-muted">{review.comment}</p>
                                            <div className="card-footer bg-transparent border-top-0 p-0 pt-2">
                                                <button
                                                    className="btn btn-sm btn-outline-danger w-100"
                                                    onClick={() => handleDeleteReview(review.movieId, review.title)}
                                                >
                                                    Delete Review
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default UserReviewsPage;
