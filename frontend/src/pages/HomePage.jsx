import React from 'react';

function HomePage() {
  return (
    <div className="container mt-4"> {/* Added Bootstrap container and margin-top */}
      <h1 className="text-center">Welcome to the Movie Recommendation App!</h1>
      <p className="text-center lead">Discover, search, and save your favorite movies.</p>
      <div className="d-flex justify-content-center mt-3">
        <img 
          src="https://placehold.co/400x200/ADD8E6/000000?text=Movie+App+Home" 
          alt="Movie App Placeholder" 
          className="img-fluid rounded" 
        />
      </div>
      <p className="text-center mt-3">Please register or log in to explore the features.</p>
    </div>
  );
}

export default HomePage;
