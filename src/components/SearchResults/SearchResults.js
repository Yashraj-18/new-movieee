import { useEffect, useState, useRef, useCallback } from 'react';
import { API_KEY, BASE_URL } from '../../config';
import FilterBar from '../FilterBar/FilterBar';
import './SearchResults.css';

const SearchResults = ({ query, onClose }) => {
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [filters, setFilters] = useState({
    yearRange: [1900, new Date().getFullYear()],
    ratingRange: [0, 10],
    sortBy: 'relevance'
  });
  const [favorites, setFavorites] = useState(() => {
    const savedFavorites = localStorage.getItem('favoriteMovies');
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });
  const observer = useRef();
  const abortControllerRef = useRef(null);
  const maxRetries = 3;

  useEffect(() => {
    localStorage.setItem('favoriteMovies', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setResults([]);
    setPage(1);
    setHasMore(true);
    setError(null);
    setRetryCount(0);
  }, [debouncedQuery, filters]);

  const fetchResults = async (pageNum = 1, append = false) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      const url = `${BASE_URL}/?apikey=${API_KEY}&s=${encodeURIComponent(debouncedQuery)}&type=movie&page=${pageNum}`;
      const response = await fetch(url, { signal: abortControllerRef.current.signal });
      const data = await response.json();

      if (data.Response === 'False') {
        throw new Error(data.Error || 'No results found');
      }

      // Fetch additional details for each movie
      const resultsWithDetails = await Promise.all(
        data.Search.map(async (movie) => {
          const detailResponse = await fetch(`${BASE_URL}/?apikey=${API_KEY}&i=${movie.imdbID}`);
          const detailData = await detailResponse.json();
          return {
            ...movie,
            ...detailData,
            id: movie.imdbID,
            title: movie.Title,
            poster_path: movie.Poster,
            release_date: movie.Year,
            vote_average: parseFloat(detailData.imdbRating) || 0,
            overview: detailData.Plot || 'No description available'
          };
        })
      );

      // Apply filters
      const filteredResults = resultsWithDetails.filter(movie => {
        const year = parseInt(movie.Year);
        const rating = parseFloat(movie.imdbRating) || 0;
        return (
          year >= filters.yearRange[0] &&
          year <= filters.yearRange[1] &&
          rating >= filters.ratingRange[0] &&
          rating <= filters.ratingRange[1]
        );
      });

      // Sort results
      const sortedResults = [...filteredResults].sort((a, b) => {
        switch (filters.sortBy) {
          case 'year':
            return parseInt(b.Year) - parseInt(a.Year);
          case 'rating':
            return (parseFloat(b.imdbRating) || 0) - (parseFloat(a.imdbRating) || 0);
          default:
            return 0;
        }
      });

      setResults(prevResults => append ? [...prevResults, ...sortedResults] : sortedResults);
      setHasMore(data.Search.length === 10);
      setLoading(false);
      setRetryCount(0);
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('Error fetching search results:', err);
      setError(err.message);
      setLoading(false);

      if (retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000;
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchResults(pageNum, append);
        }, delay);
      }
    }
  };

  useEffect(() => {
    if (debouncedQuery.trim()) {
      fetchResults(1, false);
    }
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedQuery, filters]);

  const lastResultRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
        fetchResults(page + 1, true);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, page]);

  const handleRetry = () => {
    setRetryCount(0);
    setError(null);
    fetchResults(page);
  };

  const toggleFavorite = (movie) => {
    setFavorites(prev => {
      const isFavorite = prev.some(fav => fav.id === movie.id);
      if (isFavorite) {
        return prev.filter(fav => fav.id !== movie.id);
      } else {
        return [...prev, movie];
      }
    });
  };

  const isFavorite = (movieId) => {
    return favorites.some(fav => fav.id === movieId);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="search-results" role="dialog" aria-label="Search Results">
      <div className="search-results__header">
        <h3>Search Results for "{debouncedQuery}"</h3>
        <button 
          className="search-results__close" 
          onClick={onClose}
          aria-label="Close search results"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>

      <FilterBar onFilterChange={setFilters} />
      
      <div className="search-results__content">
        {error && (
          <div className="search-results__error">
            <i className="fas fa-exclamation-circle"></i>
            {error}
            {retryCount >= maxRetries && (
              <button 
                className="search-results__retry"
                onClick={handleRetry}
                aria-label="Retry search"
              >
                <i className="fas fa-redo"></i> Retry
              </button>
            )}
          </div>
        )}

        {results.map((result, index) => (
          <div
            key={result.id}
            ref={index === results.length - 1 ? lastResultRef : null}
            className="search-result-item"
            role="article"
          >
            <img 
              src={result.poster_path !== 'N/A' ? result.poster_path : 'https://via.placeholder.com/500x750?text=No+Image'}
              alt={`Poster for ${result.title}`}
              className="search-result-item__poster"
              loading={index < 4 ? "eager" : "lazy"}
            />
            <div className="search-result-item__info">
              <div className="search-result-item__header">
                <h4>{result.title}</h4>
                <button
                  className={`search-result-item__favorite ${isFavorite(result.id) ? 'active' : ''}`}
                  onClick={() => toggleFavorite(result)}
                  aria-label={isFavorite(result.id) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <i className={`fas fa-heart ${isFavorite(result.id) ? 'fas' : 'far'}`}></i>
                </button>
              </div>
              <p>{result.overview}</p>
              <div className="search-result-item__meta">
                <span>{result.release_date}</span>
                <span>{result.vote_average}/10</span>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="search-results__loading">
            <i className="fas fa-spinner fa-spin"></i>
            <span>Loading more results...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults; 