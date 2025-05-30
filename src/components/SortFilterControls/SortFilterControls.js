import React, { useState, useEffect } from 'react';
import './SortFilterControls.css';

const STORAGE_KEY = 'myListSortFilter';
const defaultSort = { sortBy: 'title', sortOrder: 'asc' };
const defaultFilter = { genres: [], labels: [] };

const SortFilterControls = ({ onSortChange, onFilterChange }) => {
  // Load from localStorage or use defaults
  const getInitialState = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved) {
        return {
          sortBy: saved.sortBy || defaultSort.sortBy,
          sortOrder: saved.sortOrder || defaultSort.sortOrder,
          selectedGenres: saved.genres || [],
          selectedLabels: saved.labels || [],
        };
      }
    } catch {}
    return {
      sortBy: defaultSort.sortBy,
      sortOrder: defaultSort.sortOrder,
      selectedGenres: [],
      selectedLabels: [],
    };
  };

  const [sortBy, setSortBy] = useState(getInitialState().sortBy);
  const [sortOrder, setSortOrder] = useState(getInitialState().sortOrder);
  const [selectedGenres, setSelectedGenres] = useState(getInitialState().selectedGenres);
  const [selectedLabels, setSelectedLabels] = useState(getInitialState().selectedLabels);
  const [minimized, setMinimized] = useState(false);

  const genres = [
    'Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller', 'Documentary'
  ];

  const labels = [
    'Binge-Worthy', 'Long Watch', 'Hidden Gem'
  ];

  // Save to localStorage whenever sort/filter changes
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        sortBy,
        sortOrder,
        genres: selectedGenres,
        labels: selectedLabels,
      })
    );
  }, [sortBy, sortOrder, selectedGenres, selectedLabels]);

  // Notify parent on mount and when state changes
  useEffect(() => {
    onSortChange({ sortBy, sortOrder });
    onFilterChange({ genres: selectedGenres, labels: selectedLabels });
    // eslint-disable-next-line
  }, []); // Only on mount

  const handleSortChange = (newSortBy) => {
    const newSortOrder = newSortBy === sortBy && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    onSortChange({ sortBy: newSortBy, sortOrder: newSortOrder });
  };

  const handleGenreChange = (genre) => {
    const newGenres = selectedGenres.includes(genre)
      ? selectedGenres.filter(g => g !== genre)
      : [...selectedGenres, genre];
    setSelectedGenres(newGenres);
    onFilterChange({ genres: newGenres, labels: selectedLabels });
  };

  const handleLabelChange = (label) => {
    const newLabels = selectedLabels.includes(label)
      ? selectedLabels.filter(l => l !== label)
      : [...selectedLabels, label];
    setSelectedLabels(newLabels);
    onFilterChange({ genres: selectedGenres, labels: newLabels });
  };

  const handleReset = () => {
    setSortBy(defaultSort.sortBy);
    setSortOrder(defaultSort.sortOrder);
    setSelectedGenres([]);
    setSelectedLabels([]);
    onSortChange(defaultSort);
    onFilterChange(defaultFilter);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...defaultSort,
      genres: [],
      labels: [],
    }));
  };

  const handleMinimize = () => {
    setMinimized(true);
  };

  const handleExpand = () => {
    setMinimized(false);
  };

  if (minimized) {
    return (
      <div className="sort-filter-controls__minimized">
        <button className="sort-filter-controls__expand-btn" onClick={handleExpand} title="Show filters">
          &#x25BC; Show Filters
        </button>
      </div>
    );
  }

  return (
    <div className="sort-filter-controls">
      <div className="sort-filter-controls__topbar">
        <button className="sort-filter-controls__minimize-btn" onClick={handleMinimize} title="Minimize filters">
          &#x25B2;
        </button>
        <button className="sort-filter-controls__reset-btn" onClick={handleReset} title="Reset filters and sort">
          Reset
        </button>
      </div>
      <div className="sort-filter-controls__section">
        <h3>Sort by</h3>
        <div className="sort-filter-controls__buttons">
          <button
            className={`sort-filter-controls__button ${sortBy === 'title' ? 'active' : ''}`}
            onClick={() => handleSortChange('title')}
          >
            Title {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            className={`sort-filter-controls__button ${sortBy === 'runtime' ? 'active' : ''}`}
            onClick={() => handleSortChange('runtime')}
          >
            Runtime {sortBy === 'runtime' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            className={`sort-filter-controls__button ${sortBy === 'rating' ? 'active' : ''}`}
            onClick={() => handleSortChange('rating')}
          >
            Rating {sortBy === 'rating' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>

      <div className="sort-filter-controls__section">
        <h3>Filter by</h3>
        <div className="sort-filter-controls__filters">
          <div className="sort-filter-controls__filter-group">
            <h4>Genre</h4>
            <div className="sort-filter-controls__chips">
              {genres.map(genre => (
                <button
                  key={genre}
                  className={`sort-filter-controls__chip ${selectedGenres.includes(genre) ? 'active' : ''}`}
                  onClick={() => handleGenreChange(genre)}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          <div className="sort-filter-controls__filter-group">
            <h4>Label</h4>
            <div className="sort-filter-controls__chips">
              {labels.map(label => (
                <button
                  key={label}
                  className={`sort-filter-controls__chip ${selectedLabels.includes(label) ? 'active' : ''}`}
                  onClick={() => handleLabelChange(label)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SortFilterControls; 