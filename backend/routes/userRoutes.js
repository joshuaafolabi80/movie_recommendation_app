const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const FavoriteMovie = require('../models/FavoriteMovie');
const Watchlist = require('../models/Watchlist');
const Review = require('../models/Review');

// --- NEW IMPORTS AND CONSTANTS FOR RECOMMENDATIONS ---
const axios = require('axios'); // Needed for TMDB API calls in recommendations
const { generateContentBasedRecommendations } = require('../utils/recommendationUtils');

const TMDB_API_KEY = process.env.TMDB_API_KEY; // Ensure this is set in your .env file
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
// --- END NEW IMPORTS AND CONSTANTS ---


router.use(protect); // This will now correctly use the imported 'protect' function

// --- Favorite Movies ---
router.post('/favorites', async (req, res) => {
    const { movieId, title, poster_path, release_date } = req.body;
    try {
        const favorite = await FavoriteMovie.create({ userId: req.user._id, movieId, title, poster_path, release_date });
        res.status(201).json(favorite);
    } catch (error) {
        if (error.code === 11000) { // Duplicate key error
            return res.status(400).json({ message: 'Movie already in favorites' });
        }
        console.error(error);
        res.status(500).json({ message: 'Server error adding favorite' });
    }
});

router.delete('/favorites/:movieId', async (req, res) => {
    try {
        const result = await FavoriteMovie.deleteOne({ userId: req.user._id, movieId: parseInt(req.params.movieId) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Favorite movie not found' });
        }
        res.status(200).json({ message: 'Movie removed from favorites' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error removing favorite' });
    }
});

router.get('/favorites', async (req, res) => {
    const { movieId } = req.query;
    try {
        if (movieId) {
            const favorite = await FavoriteMovie.findOne({ userId: req.user._id, movieId: parseInt(movieId) });
            return res.status(200).json({ isFavorited: !!favorite });
        } else {
            const favorites = await FavoriteMovie.find({ userId: req.user._id });
            res.json(favorites);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching favorites' });
    }
});

// --- Watchlists ---
router.post('/watchlists', async (req, res) => {
    const { name } = req.body;
    try {
        const watchlist = await Watchlist.create({ userId: req.user._id, name, movies: [] });
        res.status(201).json(watchlist);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Watchlist with this name already exists' });
        }
        console.error(error);
        res.status(500).json({ message: 'Server error creating watchlist' });
    }
});

router.get('/watchlists', async (req, res) => {
    try {
        const watchlists = await Watchlist.find({ userId: req.user._id });
        res.json(watchlists);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching watchlists' });
    }
});

router.put('/watchlists/:watchlistId/add', async (req, res) => {
    const { movieId, title, poster_path, release_date } = req.body;
    try {
        const watchlist = await Watchlist.findOneAndUpdate(
            { _id: req.params.watchlistId, userId: req.user._id, "movies.movieId": { $ne: movieId } },
            { $push: { movies: { movieId, title, poster_path, release_date } } },
            { new: true }
        );
        if (!watchlist) {
            const existingWatchlist = await Watchlist.findOne({ _id: req.params.watchlistId, userId: req.user._id });
            if (existingWatchlist && existingWatchlist.movies.some(m => m.movieId === movieId)) {
                return res.status(400).json({ message: 'Movie already in this watchlist.' });
            }
            return res.status(404).json({ message: 'Watchlist not found.' });
        }
        res.json(watchlist);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error adding movie to watchlist' });
    }
});

router.put('/watchlists/:watchlistId/remove', async (req, res) => {
    const { movieId } = req.body;
    try {
        const watchlist = await Watchlist.findOneAndUpdate(
            { _id: req.params.watchlistId, userId: req.user._id },
            { $pull: { movies: { movieId: parseInt(movieId) } } },
            { new: true }
        );
        if (!watchlist) {
            return res.status(404).json({ message: 'Watchlist not found' });
        }
        const movieRemoved = watchlist.movies.some(movie => movie.movieId === parseInt(movieId));
        if (movieRemoved) {
             return res.status(404).json({ message: 'Movie not found in this watchlist.' });
        }
        res.json(watchlist);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error removing movie from watchlist' });
    }
});

router.delete('/watchlists/:watchlistId', async (req, res) => {
    try {
        const result = await Watchlist.deleteOne({ _id: req.params.watchlistId, userId: req.user._id });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Watchlist not found' });
        }
        res.status(200).json({ message: 'Watchlist deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error deleting watchlist' });
    }
});


// --- Reviews ---
router.post('/reviews', async (req, res) => {
    const { movieId, rating, comment, title, poster_path } = req.body;
    try {
        const review = await Review.create({ userId: req.user._id, movieId, rating, comment, title, poster_path });
        res.status(201).json(review);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'You have already reviewed this movie' });
        }
        console.error(error);
        res.status(500).json({ message: 'Server error adding review' });
    }
});

router.get('/reviews', async (req, res) => {
    const { movieId } = req.query;
    try {
        if (movieId) {
            const review = await Review.findOne({ userId: req.user._id, movieId: parseInt(movieId) });
            return res.status(200).json(review || null);
        } else {
            const reviews = await Review.find({ userId: req.user._id });
            res.status(200).json(reviews);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching review' });
    }
});

router.put('/reviews/:movieId', async (req, res) => {
    const { rating, comment } = req.body;
    try {
        const review = await Review.findOneAndUpdate(
            { userId: req.user._id, movieId: parseInt(req.params.movieId) },
            { rating, comment, updatedAt: Date.now() },
            { new: true }
        );
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        res.json(review);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating review' });
    }
});

router.delete('/reviews/:movieId', async (req, res) => {
    try {
        const result = await Review.deleteOne({ userId: req.user._id, movieId: parseInt(req.params.movieId) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Review not found' });
        }
        res.status(200).json({ message: 'Review deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error deleting review' });
    }
});

// --- Recommendations Route ---
// @desc    Get content-based movie recommendations for the logged-in user
// @route   GET /api/users/recommendations
// @access  Private
router.get('/recommendations', async (req, res) => {
    try {
        // 1. Get user's favorite movies from your database
        const userFavorites = await FavoriteMovie.find({ userId: req.user._id });

        if (userFavorites.length === 0) {
            // If no favorites, recommend popular/trending movies instead
            const trendingResponse = await axios.get(`${TMDB_BASE_URL}/trending/movie/week`, {
                params: { api_key: TMDB_API_KEY }
            });
            return res.status(200).json({
                message: "Favorite some movies to get personalized recommendations!",
                recommendations: trendingResponse.data.results.slice(0, 10) // Return top 10 trending
            });
        }

        // 2. Fetch a pool of popular movies from TMDB to recommend from
        // We can use TMDB's 'popular' endpoint as a general pool
        const popularMoviesResponse = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
            params: { api_key: TMDB_API_KEY, page: 1 } // Fetch first page of popular movies
        });
        const poolOfMovies = popularMoviesResponse.data.results;

        // 3. Generate recommendations using the utility function
        const recommendations = await generateContentBasedRecommendations(userFavorites, poolOfMovies);

        res.status(200).json({
            message: "Here are your personalized recommendations!",
            recommendations: recommendations
        });

    } catch (error) {
        console.error('Error generating recommendations:', error);
        res.status(500).json({ message: 'Server error generating recommendations.' });
    }
});

module.exports = router;
