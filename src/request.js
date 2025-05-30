// Get your API key from https://www.themoviedb.org/settings/api
// 1. Create an account at https://www.themoviedb.org/
// 2. Go to Settings -> API
// 3. Request an API key
// 4. Copy your API key and paste it below

const API_KEY = process.env.REACT_APP_TMDB_API_KEY || "086cfe05dd16828e37291d2f37293a38";

const requests = {
  fetchTrending: `https://api.themoviedb.org/3/trending/all/week?api_key=${API_KEY}`,
  fetchTopRated: `https://api.themoviedb.org/3/movie/top_rated?api_key=${API_KEY}&language=en-US&page=1`,
  fetchNetflixOriginals: `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&page=1&timezone=%20Europe%2FIstanbul&with_networks=213`,
  fetchHistoryMovies: `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=36`,
  fetchAnimationMovies: `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=16`,
  fetchFantasyMovies: `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=14`,
  fetchRomanceMovies: `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=10749`,
  fetchSearch: (query) => `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`,
};

export default requests;
