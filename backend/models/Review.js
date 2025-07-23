const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    movieId: { // TMDB movie ID
        type: Number,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 10
    },
    comment: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    // --- ADD THESE TWO FIELDS ---
    title: { // Movie title (for display on reviews page)
        type: String,
        required: true // Still make title required as it's essential for display
    },
    poster_path: { // Movie poster path (for display on reviews page)
        type: String,
        // Not required, as some movies might not have a poster
    }
    // --- END ADDITIONS ---
}, { timestamps: true });

reviewSchema.index({ userId: 1, movieId: 1 }, { unique: true }); // One review per user per movie

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
