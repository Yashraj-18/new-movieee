import React, { useState } from 'react';
import "./App.css";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import MovieList from './components/MovieList/MovieList';
import TrendingCarousel from './components/TrendingCarousel/TrendingCarousel';
import SearchResults from './components/SearchResults/SearchResults';

function App() {
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const handleGenreSelect = (genreId) => {
    setSelectedGenre(genreId);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setShowSearchResults(true);
  };

  const handleSearchClose = () => {
    setShowSearchResults(false);
    setSearchQuery('');
  };

  return (
    <div className="app">
      <Navbar 
        onGenreSelect={handleGenreSelect} 
        selectedGenre={selectedGenre}
        onSearch={handleSearch}
        searchQuery={searchQuery}
      />
      <main className="app__content">
        {showSearchResults && (
          <SearchResults 
            query={searchQuery} 
            onClose={handleSearchClose}
          />
        )}
        <Routes>
          <Route
            path="/"
            element={
              <>
                <TrendingCarousel />
                <MovieList selectedGenre={selectedGenre} />
              </>
            }
          />
          <Route
            path="/new"
            element={<MovieList selectedGenre={selectedGenre} />}
          />
          <Route
            path="/mylist"
            element={<MovieList selectedGenre={selectedGenre} isMyList={true} />}
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
