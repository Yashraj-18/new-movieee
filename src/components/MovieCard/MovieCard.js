import React, { forwardRef } from 'react';
import MovieLabels from '../MovieLabels/MovieLabels';
import './MovieCard.css';

const fallbackImages = [
  '/fallback1.jpg',
  '/fallback2.jpg',
  '/fallback3.jpg'
];

const MovieCard = forwardRef(({ movie, onLike, isLiked }, ref) => {
  // Debug logging
  console.log('MovieCard received movie:', movie);

  // Helper to get a valid poster image
  const getPosterSrc = () => {
    if (
      !movie.poster_path ||
      movie.poster_path === 'N/A' ||
      movie.poster_path === '' ||
      !movie.poster_path.startsWith('http')
    ) {
      // Pick a random fallback image
      const randomIndex = Math.floor(Math.random() * fallbackImages.length);
      return fallbackImages[randomIndex];
    }
    return movie.poster_path;
  };

  return (
    <div className="movie-card" ref={ref}>
      <div className="movie-card__poster">
        <img
          src={getPosterSrc()}
          alt={movie.title}
          onError={(e) => {
            e.target.onerror = null;
            // Pick a random fallback image on error
            const randomIndex = Math.floor(Math.random() * fallbackImages.length);
            e.target.src = fallbackImages[randomIndex];
          }}
        />
        <MovieLabels movie={{
          Title: movie.title,
          Runtime: movie.Runtime,
          imdbRating: movie.imdbRating,
          imdbVotes: movie.imdbVotes
        }} />
        <div className="movie-card__overlay">
          <div className="movie-card__info">
            <h3 className="movie-card__title">{movie.title}</h3>
            <p className="movie-card__year">{movie.release_date}</p>
            <div className="movie-card__rating">
              <i className="fas fa-star"></i>
              <span>{movie.vote_average.toFixed(1)}</span>
            </div>
            <p className="movie-card__genre">{movie.genre}</p>
          </div>
          <button
            className={`movie-card__like ${isLiked ? 'active' : ''}`}
            onClick={onLike}
          >
            <i className={`fas fa-heart ${isLiked ? 'fas' : 'far'}`}></i>
          </button>
        </div>
      </div>
    </div>
  );
});

MovieCard.displayName = 'MovieCard';

export default MovieCard; 