import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import HomePage from './pages/HomePage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import MovieDetailPage from './pages/MovieDetailPage.jsx';
// --- NEW IMPORTS FOR USER PAGES ---
import UserFavoritesPage from './pages/UserFavoritesPage.jsx';
import UserWatchlistsPage from './pages/UserWatchlistsPage.jsx';
import UserReviewsPage from './pages/UserReviewsPage.jsx';
// --- END NEW IMPORTS ---

// Simple auth check (can be expanded with Context API later)
const isAuthenticated = () => {
  return localStorage.getItem('userInfo') ? true : false;
};

const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};


function App() {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100"> 
        {/* Fixed Header (Navbar) */}
        <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm p-3 rounded fixed-top">
          <div className="container-fluid">
            {/* Brand/Logo on the left */}
            <Link className="navbar-brand text-primary fw-bold" to="/">MovieApp</Link>

            {/* Toggler for responsive navigation on small screens */}
            <button 
              className="navbar-toggler" 
              type="button" 
              data-bs-toggle="collapse" 
              data-bs-target="#navbarNav" 
              aria-controls="navbarNav" 
              aria-expanded="false" 
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            {/* Navigation links, aligned to the right */}
            <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
              <ul className="navbar-nav">
                <li className="nav-item me-2 mb-2"> 
                  <Link className="btn btn-outline-secondary" to="/">Home</Link>
                </li>

                {!isAuthenticated() && (
                  <>
                    <li className="nav-item me-2 mb-2">
                      <Link className="btn btn-outline-secondary" to="/register">Register</Link>
                    </li>
                    <li className="nav-item me-2 mb-2">
                      <Link className="btn btn-outline-secondary" to="/login">Login</Link>
                    </li>
                  </>
                )}

                {isAuthenticated() && (
                  <>
                    <li className="nav-item me-2 mb-2">
                      <Link className="btn btn-outline-secondary" to="/dashboard">Dashboard</Link>
                    </li>
                    {/* --- NEW NAVIGATION LINKS --- */}
                    <li className="nav-item me-2 mb-2">
                        <Link className="btn btn-outline-secondary" to="/favorites">Favorites</Link>
                    </li>
                    <li className="nav-item me-2 mb-2">
                        <Link className="btn btn-outline-secondary" to="/watchlists">Watchlists</Link>
                    </li>
                    <li className="nav-item me-2 mb-2">
                        <Link className="btn btn-outline-secondary" to="/reviews">Reviews</Link>
                    </li>
                    {/* --- END NEW NAVIGATION LINKS --- */}
                    <li className="nav-item"> 
                      <button 
                        onClick={() => {
                          localStorage.removeItem('userInfo');
                          window.location.reload();
                        }}
                        className="btn btn-danger" 
                      >
                        Logout
                      </button>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <div className="container pt-5 mt-3 flex-grow-1"> 
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/movie/:id" element={
                <ProtectedRoute>
                    <MovieDetailPage />
                </ProtectedRoute>
            } />
            {/* --- NEW ROUTES FOR USER PAGES --- */}
            <Route path="/favorites" element={
                <ProtectedRoute>
                    <UserFavoritesPage />
                </ProtectedRoute>
            } />
            <Route path="/watchlists" element={
                <ProtectedRoute>
                    <UserWatchlistsPage />
                </ProtectedRoute>
            } />
            <Route path="/reviews" element={
                <ProtectedRoute>
                    <UserReviewsPage />
                </ProtectedRoute>
            } />
            {/* --- END NEW ROUTES --- */}
            <Route path="*" element={<div className="text-center mt-5"><h2>404 Not Found</h2><p>The page you are looking for does not exist.</p></div>} />
          </Routes>
        </div>

        {/* Footer */}
        <footer className="bg-dark text-white text-center py-3 mt-auto">
          <div className="container">
            <p className="mb-0">&copy;2025 | Gbenga Joshua Afolabi | 3MTT Capstone Project</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
