import React, { useEffect, useState } from "react";
import "./Navbar.css";
import { Link } from "react-router-dom";
import GenreList from "../GenreList/GenreList";

const Navbar = ({ onGenreSelect, selectedGenre, onSearch, searchQuery }) => {
  const [show, setShow] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery || "");

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShow(true);
      } else {
        setShow(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    setLocalSearchQuery(searchQuery || "");
  }, [searchQuery]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setLocalSearchQuery(value);
    onSearch(value);
  };

  const handleSearchClose = () => {
    setShowSearch(false);
    setLocalSearchQuery("");
    onSearch("");
  };

  return (
    <nav className={`nav ${show && "nav__black"}`}>
      <div className="nav__left">
        <Link to="/" className="nav__logo">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg"
            alt="Netflix Logo"
          />
        </Link>
        <div className="nav__links">
          <Link to="/" className="nav__link">
            <i className="fas fa-home nav__icon"></i>
            <span>Home</span>
          </Link>
          <GenreList onGenreSelect={onGenreSelect} selectedGenre={selectedGenre} />
          <Link to="/new" className="nav__link">
            <i className="fas fa-fire nav__icon"></i>
            <span>New & Popular</span>
          </Link>
          <Link to="/mylist" className="nav__link">
            <i className="fas fa-list nav__icon"></i>
            <span>My List</span>
          </Link>
        </div>
      </div>
      <div className="nav__right">
        <div className={`nav__search ${showSearch ? "active" : ""}`}>
          <input
            type="text"
            placeholder="Search movies..."
            value={localSearchQuery}
            onChange={handleSearch}
          />
          <i className="fas fa-search nav__icon"></i>
        </div>
        <button
          className="nav__search-toggle"
          onClick={() => setShowSearch(!showSearch)}
        >
          <i className="fas fa-search nav__icon"></i>
        </button>
        <Link to="/signin" className="nav__link">
          <i className="fas fa-user nav__icon"></i>
          <span>Sign In</span>
        </Link>
        <div className="nav__profile">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png"
            alt="Profile"
          />
          <i className="fas fa-caret-down nav__icon"></i>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
