const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    movies: [{
        movieId: { type: Number, required: true },
        title: { type: String, required: true },
        poster_path: { type: String },
        addedAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

watchlistSchema.index({ userId: 1, name: 1 }, { unique: true }); // Ensure unique watchlist name per user

const Watchlist = mongoose.model('Watchlist', watchlistSchema);
module.exports = Watchlist;