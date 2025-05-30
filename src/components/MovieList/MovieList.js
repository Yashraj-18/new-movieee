import { useState, useEffect, useRef, useCallback } from 'react';
import { API_KEY, BASE_URL, IMAGE_BASE_URL } from '../../config';
import MovieCard from '../MovieCard/MovieCard';
import SortFilterControls from '../SortFilterControls/SortFilterControls';
import './MovieList.css';

const MovieList = ({ selectedGenre, isMyList = false }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [layout, setLayout] = useState('grid');
  const [myListMovies, setMyListMovies] = useState(() => {
    const saved = localStorage.getItem('myListMovies');
    return saved ? JSON.parse(saved) : [];
  });
  const [sortConfig, setSortConfig] = useState({ sortBy: 'title', sortOrder: 'asc' });
  const [filterConfig, setFilterConfig] = useState({ genres: [], labels: [] });
  const observer = useRef();
  const maxRetries = 3;

  // Map of genre IDs to search terms
  const genreSearchTerms = {
    28: 'action',
    35: 'comedy',
    18: 'drama',
    27: 'horror',
    10749: 'romance',
    878: 'sci-fi',
    53: 'thriller',
    99: 'documentary'
  };

  useEffect(() => {
    localStorage.setItem('myListMovies', JSON.stringify(myListMovies));
  }, [myListMovies]);

  const fetchMovies = async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      setError(null);

      if (isMyList) {
        const savedMovies = JSON.parse(localStorage.getItem('myListMovies') || '[]');
        setMovies(savedMovies);
        setLoading(false);
        setHasMore(false);
        return;
      }

      // Log API configuration
      console.log('API Configuration:', {
        BASE_URL,
        API_KEY: API_KEY ? 'API Key is set' : 'API Key is missing',
        searchTerm: selectedGenre ? genreSearchTerms[selectedGenre] : 'movie'
      });

      // OMDB API search with pagination
      const searchTerm = selectedGenre ? genreSearchTerms[selectedGenre] : 'movie';
      const url = `${BASE_URL}/?apikey=${API_KEY}&type=movie&s=${searchTerm}&page=${pageNum}`;
      
      console.log('Fetching movies from URL:', url);
      const response = await fetch(url);
      const data = await response.json();
      console.log('Search API Response:', data);

      if (data.Response === 'False') {
        throw new Error(data.Error || 'Failed to fetch movies');
      }

      if (!data.Search || !Array.isArray(data.Search)) {
        throw new Error('Invalid response format');
      }

      // Fetch additional details for each movie
      const moviesWithDetails = await Promise.all(
        data.Search.map(async (movie) => {
          const detailResponse = await fetch(`${BASE_URL}/?apikey=${API_KEY}&i=${movie.imdbID}`);
          const detailData = await detailResponse.json();
          console.log('Detail API Response for', movie.Title, ':', detailData);
          return {
            ...movie,
            ...detailData,
            id: movie.imdbID,
            title: movie.Title,
            poster_path: movie.Poster,
            release_date: movie.Year,
            vote_average: parseFloat(detailData.imdbRating) || 0,
            overview: detailData.Plot || 'No description available',
            genre: detailData.Genre || 'Unknown',
            Runtime: detailData.Runtime,
            imdbRating: detailData.imdbRating,
            imdbVotes: detailData.imdbVotes
          };
        })
      );

      console.log('Processed Movie Data:', moviesWithDetails[0]);

      setMovies(prevMovies => append ? [...prevMovies, ...moviesWithDetails] : moviesWithDetails);
      setHasMore(data.Search.length === 10); // OMDB returns 10 results per page
      setLoading(false);
      setRetryCount(0);
    } catch (err) {
      console.error('Error fetching movies:', err);
      setError(err.message);
      setLoading(false);

      if (retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000;
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchMovies(pageNum, append);
        }, delay);
      }
    }
  };

  useEffect(() => {
    setPage(1);
    setMovies([]);
    fetchMovies(1, false);
  }, [selectedGenre, isMyList]);

  const lastMovieElementRef = useCallback(node => {
    if (loading || isMyList) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
        fetchMovies(page + 1, true);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, page, isMyList]);

  const handleRetry = () => {
    setRetryCount(0);
    setError(null);
    fetchMovies(page);
  };

  const toggleLayout = () => {
    setLayout(prev => prev === 'grid' ? 'row' : 'grid');
  };

  const toggleLike = (movie) => {
    const isLiked = myListMovies.some(m => m.id === movie.id);
    
    if (isLiked) {
      const updatedList = myListMovies.filter(m => m.id !== movie.id);
      setMyListMovies(updatedList);
      localStorage.setItem('myListMovies', JSON.stringify(updatedList));
    } else {
      const updatedList = [...myListMovies, movie];
      setMyListMovies(updatedList);
      localStorage.setItem('myListMovies', JSON.stringify(updatedList));
    }
  };

  const isLiked = (movieId) => myListMovies.some(m => m.id === movieId);

  const handleSortChange = (newSortConfig) => {
    setSortConfig(newSortConfig);
  };

  const handleFilterChange = (newFilterConfig) => {
    setFilterConfig(newFilterConfig);
  };

  const getMovieLabels = (movie) => {
    const labels = [];
    const runtime = parseInt(movie.Runtime) || 0;
    const rating = parseFloat(movie.imdbRating) || 0;
    const votes = parseInt(movie.imdbVotes?.replace(/,/g, '')) || 0;

    if (rating >= 8.0 && runtime <= 100) {
      labels.push('Binge-Worthy');
    }
    if (runtime > 140) {
      labels.push('Long Watch');
    }
    if (rating > 7 && votes < 5000) {
      labels.push('Hidden Gem');
    }

    return labels;
  };

  const sortAndFilterMovies = (movies) => {
    let filteredMovies = [...movies];

    // Apply genre filter
    if (filterConfig.genres.length > 0) {
      filteredMovies = filteredMovies.filter(movie => {
        const movieGenres = movie.genre.split(', ').map(g => g.trim());
        return filterConfig.genres.some(genre => movieGenres.includes(genre));
      });
    }

    // Apply label filter
    if (filterConfig.labels.length > 0) {
      filteredMovies = filteredMovies.filter(movie => {
        const movieLabels = getMovieLabels(movie);
        return filterConfig.labels.some(label => movieLabels.includes(label));
      });
    }

    // Apply sorting
    filteredMovies.sort((a, b) => {
      let comparison = 0;
      switch (sortConfig.sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'runtime':
          const runtimeA = parseInt(a.Runtime) || 0;
          const runtimeB = parseInt(b.Runtime) || 0;
          comparison = runtimeA - runtimeB;
          break;
        case 'rating':
          const ratingA = parseFloat(a.imdbRating) || 0;
          const ratingB = parseFloat(b.imdbRating) || 0;
          comparison = ratingB - ratingA;
          break;
        default:
          comparison = 0;
      }
      return sortConfig.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filteredMovies;
  };

  const displayMovies = sortAndFilterMovies(isMyList ? myListMovies : movies);

  if (error) {
    return (
      <div className="movie-list__error">
        <i className="fas fa-exclamation-circle"></i>
        <span>{error}</span>
        {retryCount >= maxRetries && (
          <button className="movie-list__retry-button" onClick={handleRetry}>
            <i className="fas fa-redo"></i>
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="movie-list">
      <div className="movie-list__header">
        <h2 className="movie-list__title">
          {isMyList ? 'My List' : selectedGenre ? `${genreSearchTerms[selectedGenre].charAt(0).toUpperCase() + genreSearchTerms[selectedGenre].slice(1)} Movies` : 'All Movies'}
        </h2>
        <button className="movie-list__layout-toggle" onClick={toggleLayout}>
          <i className={`fas fa-${layout === 'grid' ? 'th-large' : 'list'}`}></i>
        </button>
      </div>

      {isMyList && (
        <SortFilterControls
          onSortChange={handleSortChange}
          onFilterChange={handleFilterChange}
        />
      )}

      <div className={`movie-list__container ${layout}`}>
        {displayMovies.map((movie, index) => (
          <MovieCard
            key={movie.id}
            ref={index === displayMovies.length - 1 ? lastMovieElementRef : null}
            movie={{
              id: movie.id,
              title: movie.title,
              poster_path: movie.poster_path,
              release_date: movie.release_date,
              vote_average: movie.vote_average,
              genre: movie.genre,
              Runtime: movie.Runtime,
              imdbRating: movie.imdbRating,
              imdbVotes: movie.imdbVotes
            }}
            onLike={() => toggleLike(movie)}
            isLiked={isLiked(movie.id)}
          />
        ))}
      </div>
      {loading && (
        <div className="movie-list__loading">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Loading movies...</span>
        </div>
      )}
    </div>
  );
};

export default MovieList; 