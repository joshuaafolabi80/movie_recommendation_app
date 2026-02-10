
# 🎬 Movie Recommendation App

## Project Overview
This is a full-featured movie recommendation platform built as a capstone project. It allows users to discover, search, and save their favorite movies, create custom watchlists, rate and review films, and receive personalized movie recommendations. The application is a full-stack solution, combining a modern React frontend with a robust Express.js backend and a MongoDB database, integrated with the external TMDB API.

-----

## Table of Contents
- [Project Goal & Learning Objectives](#project-goal--learning-objectives)
- [Core Features](#core-features)
- [Technical Stack & Requirements](#technical-stack--requirements)
- [Project Structure](#project-structure)
- [Development Journey & Key Phases](#development-journey--key-phases)
  - [Phase 1-3: Foundation & Core API](#phase-1-3-foundation--core-api)
  - [Phase 4: User Features & Persistence](#phase-4-user-features--persistence)
  - [Phase 5: Recommendation Engine](#phase-5-recommendation-engine)
- [How to Run Locally](#how-to-run-locally)
- [Live Application](#live-application)
- [API Testing with Postman](#api-testing-with-postman)
- [Future Enhancements (Stretch Goals)](#future-enhancements-stretch-goals)
- [Acknowledgements](#acknowledgements)

-----

## Project Goal & Learning Objectives
This capstone project aimed to solidify full-stack development skills, focusing on:

* Connecting Frontend and Backend Systems: Seamless communication between React and Express
* Implementing Authentication Flows: Secure user registration, login, and session management
* Deploying Fullstack Applications: Making the application accessible online
* Working with External APIs: Integrating data from the TMDB API

**Technical Skills Covered:**
* Fullstack Integration: Making API requests from React, handling authentication & user sessions, managing state in a full-stack app
* Authentication & Deployment: Implementing JWT authentication, deploying frontend (Netlify/Vercel), deploying backend (Render/Heroku), setting up CI/CD

-----

## Core Features
The application provides the following functionalities:

### User Authentication
* User registration and login with secure password handling
* JWT token-based authentication for protected routes

### Movie Discovery
* Search movies by title, genre, or year
* Filter by rating, release date, and popularity
* View detailed movie information (overview, cast, trailers, genres, rating, runtime)
* Get personalized recommendations based on user preferences

### User Features
* Save favorite movies
* Create custom watchlists and add/remove movies from them
* Rate and review movies
* User profile management (implicit through authentication)

-----

## Technical Stack & Requirements

### Frontend
* React.js (with Vite for fast development)
* Axios for API requests
* React Router DOM for navigation
* Bootstrap for responsive UI components and styling

### Backend
* Node.js
* Express.js for RESTful API
* Mongoose for MongoDB ODM
* JWT for token-based authentication
* Axios for external API requests (TMDB)
* dotenv for environment variable management

### Database
* MongoDB (hosted on MongoDB Atlas for production)

### External API
* The Movie Database (TMDB) API for movie data

## Project Structure
The project is organized into two main directories:

* `backend/`: Contains the Node.js/Express.js server, MongoDB models, routes, and middleware
* `frontend/`: Contains the React.js application, components, pages, and API integration
* `./`: The root directory contains a package.json for managing both sub-projects and global development dependencies like concurrently

-----

## Development Journey & Key Phases

### Phase 1-3: Foundation & Core API
* **Initial Setup**: Project scaffolding for both React (Vite) and Express.js
* **Database Connection**: Established connection to MongoDB (initially local, then Atlas)
* **User Authentication**: Implemented user registration, login, and JWT token generation/verification
* **TMDB API Integration**: Created backend routes to proxy requests to the TMDB API for movie search, trending movies, and detailed movie information

### Phase 4: User Features & Persistence
* **Feature Implementation**:
  - Favorite Movies: Users can add/remove movies from their favorites list
  - Custom Watchlists: Users can create named watchlists and add/remove movies to specific lists
  - Movie Reviews: Users can rate and write comments for movies
* **Data Models**: Defined Mongoose schemas for FavoriteMovie, Watchlist, and Review to store user-specific data
* **API Endpoints**: Developed RESTful API endpoints for full CRUD operations on these features
* **Frontend Integration**: Integrated these features into the MovieDetailPage and created dedicated pages for displaying user data
* **Authentication Protection**: Ensured all user-specific routes were protected by the JWT authentication middleware

### Phase 5: Recommendation Engine
* **Content-Based Filtering**: Implemented algorithm suggesting movies based on genres/keywords of favorited movies
* **Recommendation Utility**: Created functions to fetch movie data, extract features, and calculate similarity
* **API Endpoint**: Added GET /api/users/recommendations endpoint to serve recommendations
* **Frontend Display**: Created component to fetch and display recommendations in the Dashboard

-----

## Acknowledgements
* The Movie Database (TMDB) for their comprehensive API
* React, Node.js, Express, MongoDB communities
* Github
```
