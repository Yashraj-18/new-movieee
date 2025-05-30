// Get your API key from http://www.omdbapi.com/apikey.aspx
// 1. Visit http://www.omdbapi.com/apikey.aspx
// 2. Fill out the form to get a free API key
// 3. Copy your API key and paste it below

const OMDB_API_KEY = process.env.REACT_APP_OMDB_API_KEY || '3a7eb0a2';

if (!OMDB_API_KEY) {
  console.error('OMDB API key is missing. Please set REACT_APP_OMDB_API_KEY in your environment variables.');
}

export const API_KEY = OMDB_API_KEY;
export const BASE_URL = 'https://www.omdbapi.com';
export const IMAGE_BASE_URL = 'https://img.omdbapi.com';

// Helper function to check API response
export const checkApiResponse = (data) => {
  if (data.Response === 'False') {
    throw new Error(data.Error || 'API request failed');
  }
  return data;
}; 