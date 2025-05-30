import { useState, useEffect, useRef } from 'react';
import './GenreList.css';

const GenreList = ({ onGenreSelect }) => {
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Static list of genres with their IDs
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

  const handleGenreClick = (genre) => {
    setSelectedGenre(genre.id);
    onGenreSelect(genre.id);
    setIsOpen(false);
  };

  const handleAllGenresClick = () => {
    setSelectedGenre(null);
    onGenreSelect(null);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedGenreName = genres.find(g => g.id === selectedGenre)?.name || 'All Genres';

  return (
    <div className="genre-list" ref={dropdownRef}>
      <button className="genre-list__button" onClick={toggleDropdown}>
        <span>{selectedGenreName}</span>
        <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`}></i>
      </button>
      {isOpen && (
        <div className="genre-list__dropdown">
          <button
            className={`genre-list__item ${!selectedGenre ? 'active' : ''}`}
            onClick={handleAllGenresClick}
          >
            All Genres
          </button>
          {genres.map(genre => (
            <button
              key={genre.id}
              className={`genre-list__item ${selectedGenre === genre.id ? 'active' : ''}`}
              onClick={() => handleGenreClick(genre)}
            >
              {genre.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default GenreList; 