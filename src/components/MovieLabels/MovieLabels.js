import React from 'react';
import './MovieLabels.css';

const MovieLabels = ({ movie }) => {
  if (!movie) {
    console.log('MovieLabels: No movie data provided');
    return null;
  }

  console.log('MovieLabels: Received movie data:', movie);

  const labels = [];

  // Helper function to parse runtime
  const parseRuntime = (runtime) => {
    if (!runtime) {
      console.log('MovieLabels: No runtime data available');
      return null;
    }
    const match = runtime.match(/(\d+)/);
    const parsedRuntime = match ? parseInt(match[1]) : null;
    console.log('MovieLabels: Parsed runtime:', parsedRuntime, 'from:', runtime);
    return parsedRuntime;
  };

  // Helper function to parse votes
  const parseVotes = (votes) => {
    if (!votes) {
      console.log('MovieLabels: No votes data available');
      return null;
    }
    const parsedVotes = parseInt(votes.replace(/,/g, ''));
    console.log('MovieLabels: Parsed votes:', parsedVotes, 'from:', votes);
    return parsedVotes;
  };

  // Parse the values
  const runtime = parseRuntime(movie.Runtime);
  const rating = movie.imdbRating ? parseFloat(movie.imdbRating) : null;
  const votes = parseVotes(movie.imdbVotes);

  console.log('MovieLabels: Parsed values:', {
    title: movie.Title,
    runtime,
    rating,
    votes
  });

  // Binge-Worthy: rating ≥ 8.0 and runtime ≤ 100 mins
  if (rating && rating >= 8.0 && runtime && runtime <= 100) {
    console.log('MovieLabels: Adding Binge-Worthy label');
    labels.push({
      text: 'Binge-Worthy',
      type: 'binge'
    });
  }

  // Long Watch: runtime > 140 mins
  if (runtime && runtime > 140) {
    console.log('MovieLabels: Adding Long Watch label');
    labels.push({
      text: 'Long Watch',
      type: 'long'
    });
  }

  // Hidden Gem: rating > 7 and vote_count < 5000
  if (rating && rating > 7 && votes && votes < 5000) {
    console.log('MovieLabels: Adding Hidden Gem label');
    labels.push({
      text: 'Hidden Gem',
      type: 'hidden'
    });
  }

  console.log('MovieLabels: Generated labels:', labels);

  if (labels.length === 0) {
    console.log('MovieLabels: No labels generated for movie');
    return null;
  }

  return (
    <div className="movie-labels">
      {labels.map((label, index) => (
        <span key={index} className={`movie-label movie-label--${label.type}`}>
          {label.text}
        </span>
      ))}
    </div>
  );
};

export default MovieLabels; 