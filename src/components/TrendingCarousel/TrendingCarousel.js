import React, { useState, useEffect, useCallback } from 'react';
import { API_KEY, BASE_URL } from '../../config';
import './TrendingCarousel.css';

const TrendingCarousel = () => {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTrendingMovies = async () => {
    try {
      setLoading(true);
      // OMDB API search for popular movies
      const response = await fetch(
        `${BASE_URL}/?apikey=${API_KEY}&type=movie&s=2024&y=2024`
      );
      const data = await response.json();

      if (data.Response === 'False') {
        throw new Error(data.Error || 'Failed to fetch trending movies');
      }

      // Get top 5 movies with their details
      const topMovies = await Promise.all(
        data.Search.slice(0, 5).map(async (movie) => {
          const detailResponse = await fetch(`${BASE_URL}/?apikey=${API_KEY}&i=${movie.imdbID}`);
          const detailData = await detailResponse.json();
          return {
            ...movie,
            ...detailData,
            id: movie.imdbID,
            title: movie.Title,
            backdrop_path: detailData.Poster,
            overview: detailData.Plot || 'No description available',
            vote_average: parseFloat(detailData.imdbRating) || 0,
            release_date: detailData.Year
          };
        })
      );

      setTrendingMovies(topMovies);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching trending movies:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingMovies();
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === trendingMovies.length - 1 ? 0 : prevIndex + 1
    );
  }, [trendingMovies.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? trendingMovies.length - 1 : prevIndex - 1
    );
  }, [trendingMovies.length]);

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  if (loading) {
    return (
      <div className="trending-carousel__loading">
        <i className="fas fa-spinner fa-spin"></i>
        <span>Loading trending movies...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="trending-carousel__error">
        <i className="fas fa-exclamation-circle"></i>
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="trending-carousel">
      <div className="trending-carousel__container">
        {trendingMovies.map((movie, index) => (
          <div
            key={movie.id}
            className={`trending-carousel__slide ${
              index === currentIndex ? 'active' : ''
            }`}
            style={{
              backgroundImage: `url(${movie.backdrop_path !== 'N/A' ? movie.backdrop_path : 'https://via.placeholder.com/1920x1080?text=No+Image'})`,
            }}
          >
            <div className="trending-carousel__content">
              <h2 className="trending-carousel__title">{movie.title}</h2>
              <p className="trending-carousel__overview">{movie.overview}</p>
              <div className="trending-carousel__info">
                <span className="trending-carousel__rating">
                  <i className="fas fa-star"></i>
                  {movie.vote_average.toFixed(1)}
                </span>
                <span className="trending-carousel__year">
                  {movie.release_date}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        className="trending-carousel__button trending-carousel__button--prev"
        onClick={prevSlide}
      >
        <i className="fas fa-chevron-left"></i>
      </button>
      <button
        className="trending-carousel__button trending-carousel__button--next"
        onClick={nextSlide}
      >
        <i className="fas fa-chevron-right"></i>
      </button>

      <div className="trending-carousel__indicators">
        {trendingMovies.map((_, index) => (
          <button
            key={index}
            className={`trending-carousel__indicator ${
              index === currentIndex ? 'active' : ''
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default TrendingCarousel; 