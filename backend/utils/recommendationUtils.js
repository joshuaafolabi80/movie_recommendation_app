    const axios = require('axios');

    // TMDB API key from environment variables
    const TMDB_API_KEY = process.env.TMDB_API_KEY;
    const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

    /**
     * Fetches detailed information for a single movie from TMDB.
     * This is crucial to get genres and keywords.
     * @param {number} movieId - The TMDB movie ID.
     * @returns {object|null} Movie details including genres, or null if not found.
     */
    async function getMovieDetailsFromTMDB(movieId) {
        try {
            const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
                params: {
                    api_key: TMDB_API_KEY,
                    append_to_response: 'keywords' // Also fetch keywords for richer recommendations
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching movie details for ID ${movieId}:`, error.message);
            return null;
        }
    }

    /**
     * Extracts relevant features (genres and keywords) from a movie object.
     * @param {object} movie - Movie object from TMDB.
     * @returns {string[]} Array of feature names (e.g., ['Action', 'Thriller', 'fight', 'club']).
     */
    function getMovieFeatures(movie) {
        const features = [];
        if (movie.genres) {
            features.push(...movie.genres.map(g => g.name));
        }
        if (movie.keywords && movie.keywords.keywords) { // TMDB keywords are nested
            features.push(...movie.keywords.keywords.map(k => k.name));
        }
        // Convert to lowercase and remove duplicates for cleaner comparison
        return [...new Set(features.map(f => f.toLowerCase()))];
    }

    /**
     * Calculates similarity between two movies based on shared features.
     * Using Jaccard index for simplicity: (Intersection Size) / (Union Size)
     * @param {string[]} features1 - Features of movie 1.
     * @param {string[]} features2 - Features of movie 2.
     * @returns {number} Similarity score between 0 and 1.
     */
    function calculateSimilarity(features1, features2) {
        if (features1.length === 0 || features2.length === 0) {
            return 0;
        }
        const set1 = new Set(features1);
        const set2 = new Set(features2);

        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);

        return intersection.size / union.size;
    }

    /**
     * Generates content-based movie recommendations.
     * @param {object[]} userFavoriteMovies - Array of user's favorited movie objects (from your DB).
     * @param {object[]} poolOfCandidateMovies - Array of movies to recommend from (e.g., trending/popular).
     * @returns {object[]} Array of recommended movie objects.
     */
    async function generateContentBasedRecommendations(userFavoriteMovies, poolOfCandidateMovies) {
        const recommendations = [];
        const processedFavoriteMovieIds = new Set(); // To avoid duplicate processing
        const recommendedMovieIds = new Set(userFavoriteMovies.map(fav => fav.movieId)); // To exclude already favorited movies

        // 1. Build a combined feature profile for the user based on their favorites
        let userFeatureProfile = [];
        for (const favMovie of userFavoriteMovies) {
            // Fetch full details for each favorite to get genres/keywords
            if (!processedFavoriteMovieIds.has(favMovie.movieId)) {
                const detailedFavMovie = await getMovieDetailsFromTMDB(favMovie.movieId);
                if (detailedFavMovie) {
                    userFeatureProfile.push(...getMovieFeatures(detailedFavMovie));
                    processedFavoriteMovieIds.add(favMovie.movieId);
                }
            }
        }
        // Remove duplicates from user's overall feature profile
        userFeatureProfile = [...new Set(userFeatureProfile)];

        // 2. Calculate similarity for each candidate movie against the user's profile
        const movieScores = [];
        for (const candidateMovie of poolOfCandidateMovies) {
            // Skip movies the user has already favorited
            if (recommendedMovieIds.has(candidateMovie.id)) {
                continue;
            }

            // Fetch full details for candidate movie to get its features
            const detailedCandidateMovie = await getMovieDetailsFromTMDB(candidateMovie.id);
            if (detailedCandidateMovie) {
                const candidateFeatures = getMovieFeatures(detailedCandidateMovie);
                const similarity = calculateSimilarity(userFeatureProfile, candidateFeatures);
                if (similarity > 0) { // Only consider movies with some similarity
                    movieScores.push({ movie: detailedCandidateMovie, similarity });
                }
            }
        }

        // 3. Sort by similarity and return top N recommendations
        movieScores.sort((a, b) => b.similarity - a.similarity);

        // Limit to top 10 recommendations and ensure no duplicates
        const finalRecommendations = [];
        const addedTmdbIds = new Set();
        for (const score of movieScores) {
            if (!addedTmdbIds.has(score.movie.id) && finalRecommendations.length < 10) { // Limit to 10 recommendations
                finalRecommendations.push(score.movie);
                addedTmdbIds.add(score.movie.id);
            }
        }

        return finalRecommendations;
    }

    module.exports = {
        generateContentBasedRecommendations,
        getMovieDetailsFromTMDB, // Export for potential external use/testing
        getMovieFeatures,
        calculateSimilarity
    };
    