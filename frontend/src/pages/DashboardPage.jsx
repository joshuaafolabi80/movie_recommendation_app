import React from 'react';
import MovieSearch from '../components/MovieSearch.jsx';
import RecommendationsList from '../components/RecommendationsList.jsx'; // Import the new RecommendationsList component

function DashboardPage() {
  return (
    <div className="container my-5"> {/* Changed mt-4 to my-5 for more vertical spacing */}
      <h1 className="text-center mb-4 text-primary">Your Movie Dashboard</h1>
      <p className="text-center lead text-muted">Discover new movies, search for your favorites, and get personalized recommendations!</p>
      
      {/* Movie Search Component */}
      <MovieSearch />

      {/* Separator for visual distinction */}
      <hr className="my-5" /> 

      {/* Recommendations List Component */}
      {/* This component will fetch and display recommendations based on user's favorites */}
      <RecommendationsList /> 
    </div>
  );
}

export default DashboardPage;
