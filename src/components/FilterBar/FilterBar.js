import { useState, useEffect } from 'react';
import './FilterBar.css';

const FilterBar = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    genres: [],
    yearRange: [1900, new Date().getFullYear()],
    ratingRange: [0, 10],
    sortBy: 'relevance'
  });

  const genres = [
    { id: 28, name: 'Action' },
    { id: 35, name: 'Comedy' },
    { id: 18, name: 'Drama' },
    { id: 27, name: 'Horror' },
    { id: 10749, name: 'Romance' },
    { id: 878, name: 'Sci-Fi' },
    { id: 53, name: 'Thriller' },
    { id: 99, name: 'Documentary' }
  ];

  const handleGenreToggle = (genreId) => {
    setFilters(prev => {
      const newGenres = prev.genres.includes(genreId)
        ? prev.genres.filter(id => id !== genreId)
        : [...prev.genres, genreId];
      
      const newFilters = { ...prev, genres: newGenres };
      onFilterChange(newFilters);
      return newFilters;
    });
  };

  const handleYearChange = (type, value) => {
    setFilters(prev => {
      const newYearRange = [...prev.yearRange];
      newYearRange[type === 'min' ? 0 : 1] = parseInt(value);
      
      const newFilters = { ...prev, yearRange: newYearRange };
      onFilterChange(newFilters);
      return newFilters;
    });
  };

  const handleRatingChange = (type, value) => {
    setFilters(prev => {
      const newRatingRange = [...prev.ratingRange];
      newRatingRange[type === 'min' ? 0 : 1] = parseFloat(value);
      
      const newFilters = { ...prev, ratingRange: newRatingRange };
      onFilterChange(newFilters);
      return newFilters;
    });
  };

  const handleSortChange = (value) => {
    setFilters(prev => {
      const newFilters = { ...prev, sortBy: value };
      onFilterChange(newFilters);
      return newFilters;
    });
  };

  const clearFilters = () => {
    const defaultFilters = {
      genres: [],
      yearRange: [1900, new Date().getFullYear()],
      ratingRange: [0, 10],
      sortBy: 'relevance'
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  return (
    <div className="filter-bar">
      <div className="filter-bar__section">
        <h4>Genres</h4>
        <div className="filter-bar__genres">
          {genres.map(genre => (
            <button
              key={genre.id}
              className={`filter-bar__genre-btn ${filters.genres.includes(genre.id) ? 'active' : ''}`}
              onClick={() => handleGenreToggle(genre.id)}
            >
              {genre.name}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-bar__section">
        <h4>Release Year</h4>
        <div className="filter-bar__range">
          <input
            type="number"
            min="1900"
            max={new Date().getFullYear()}
            value={filters.yearRange[0]}
            onChange={(e) => handleYearChange('min', e.target.value)}
          />
          <span>to</span>
          <input
            type="number"
            min="1900"
            max={new Date().getFullYear()}
            value={filters.yearRange[1]}
            onChange={(e) => handleYearChange('max', e.target.value)}
          />
        </div>
      </div>

      <div className="filter-bar__section">
        <h4>Rating</h4>
        <div className="filter-bar__range">
          <input
            type="number"
            min="0"
            max="10"
            step="0.1"
            value={filters.ratingRange[0]}
            onChange={(e) => handleRatingChange('min', e.target.value)}
          />
          <span>to</span>
          <input
            type="number"
            min="0"
            max="10"
            step="0.1"
            value={filters.ratingRange[1]}
            onChange={(e) => handleRatingChange('max', e.target.value)}
          />
        </div>
      </div>

      <div className="filter-bar__section">
        <h4>Sort By</h4>
        <select
          value={filters.sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
          className="filter-bar__select"
        >
          <option value="relevance">Relevance</option>
          <option value="year_desc">Newest First</option>
          <option value="year_asc">Oldest First</option>
          <option value="rating_desc">Highest Rated</option>
          <option value="rating_asc">Lowest Rated</option>
        </select>
      </div>

      <button className="filter-bar__clear" onClick={clearFilters}>
        Clear Filters
      </button>
    </div>
  );
};

export default FilterBar; 