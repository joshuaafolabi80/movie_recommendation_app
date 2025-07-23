const mongoose = require('mongoose');

const favoriteMovieSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    movieId: { // TMDB movie ID
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    poster_path: { // Store essential movie details to avoid re-fetching from TMDB
        type: String
    },
    // Add other details if needed for display like release_date, vote_average
}, { timestamps: true });

favoriteMovieSchema.index({ userId: 1, movieId: 1 }, { unique: true }); // Ensure unique favorite per user per movie

const FavoriteMovie = mongoose.model('FavoriteMovie', favoriteMovieSchema);
module.exports = FavoriteMovie;