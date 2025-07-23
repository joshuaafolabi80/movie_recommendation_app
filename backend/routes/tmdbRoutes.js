const express = require('express');
const router = express.Router();
const axios = require('axios'); // npm install axios in backend
const authMiddleware = require('../middleware/authMiddleware'); // Create this next

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;

// Middleware to protect routes (ensure user is logged in)
// This will be created in the next step
router.use(authMiddleware);

// Search movies
router.get('/search', async (req, res) => {
    const { query, page = 1 } = req.query;
    if (!query) {
        return res.status(400).json({ message: 'Query parameter is required' });
    }
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
            params: {
                api_key: API_KEY,
                query,
                page
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('TMDB Search Error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ message: 'Failed to search movies from TMDB' });
    }
});

// Get movie details by ID
router.get('/movie/:id', async (req, res) => {
    const movieId = req.params.id;
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
            params: {
                api_key: API_KEY,
                append_to_response: 'credits,videos,genres' // Get more data like cast, trailers, genres
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('TMDB Movie Details Error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ message: 'Failed to fetch movie details from TMDB' });
    }
});

// Get popular/trending movies (for homepage)
router.get('/trending', async (req, res) => {
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/trending/movie/week`, {
            params: {
                api_key: API_KEY
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('TMDB Trending Error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ message: 'Failed to fetch trending movies from TMDB' });
    }
});

// Get genres (for filtering)
router.get('/genres', async (req, res) => {
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/genre/movie/list`, {
            params: {
                api_key: API_KEY
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('TMDB Genres Error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ message: 'Failed to fetch genres from TMDB' });
    }
});

module.exports = router;