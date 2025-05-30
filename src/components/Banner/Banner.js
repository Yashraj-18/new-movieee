import "./Banner.css";
import { useState, useEffect } from "react";
import axios from "axios";
import requests from "../../request";

const Banner = () => {
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const request = await axios.get(requests.fetchNetflixOriginals);
        const randomMovie = request.data.results[
          Math.floor(Math.random() * request.data.results.length)
        ];
        setMovie(randomMovie);
      } catch (error) {
        console.error("Error fetching banner movie:", error);
      }
    }
    fetchData();
  }, []);

  if (!movie) return null;

  return (
    <header
      className="banner"
      style={{
        backgroundImage: `url("https://image.tmdb.org/t/p/original/${movie?.backdrop_path}")`,
      }}
    >
      <div className="banner__contents">
        <h1 className="banner__title">
          {movie?.title || movie?.name || movie?.original_name}
        </h1>
        <div className="banner__buttons">
          <button className="banner__button">Play</button>
          <button className="banner__button">My List</button>
        </div>
        <p className="banner__description">
          {movie?.overview?.length > 150 
            ? `${movie.overview.substring(0, 150)}...` 
            : movie.overview}
        </p>
      </div>
      <div className="banner__fadeBottom" />
    </header>
  );
};

export default Banner;
