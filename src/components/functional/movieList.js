import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Redirect  } from "react-router-dom";
import PropTypes from 'prop-types';
import Movie from '../presentational/movie';
import '../../assets/css/movieList.css';
import { fetchMovieListBy } from '../../redux/actions/index';

const MovieList = ({ location, apiSearch, movies, genres, filter, status, fetchMovieListBy }) => {
  const [selectedMovie, selectMovie] = useState({});
  const [moviePage, gotoMoviePage] = useState(false);

  const apiSearchQuery = apiSearch ? apiSearch : location.route_state ? location.route_state : movies;

  useEffect(() => {
    fetchMovieListBy(apiSearchQuery.apiURL, apiSearchQuery.searchBy, '1', apiSearchQuery.genreIDs);
  }, [apiSearchQuery.apiURL, apiSearchQuery.genreIDs, apiSearchQuery.searchBy, fetchMovieListBy]);

  // const filteredMovies = (filter !== 'All') ? movies.results.filter(movie => movie.genre === filter) : movies;
  const { isLoading } = status;
  const { page, total_pages, apiURL, searchBy, genreIDs } = movies;
  const moviesContainer = React.useRef(null);
  const prevPage = (page - 1) <= 0 ? 1 : (page - 1);
  const nextPage = (page + 1) > total_pages? total_pages : (page + 1);

  const scrollHorizontal = (event) => {
    moviesContainer.current.scrollLeft += event.deltaY;
    // if(event.deltaY > 0) this.style.fontSize = "25px";
  }
  const scrollOnHover = (element) => {
    element.current.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
  };

  const movieDetails = (element, movie) => {
    scrollOnHover(element);
    if (movie !== selectedMovie) {selectMovie(movie); }
    else {
      gotoMoviePage(true);
    }
  };

  const renderMain = isLoading
    ? (
      <div className="text-center">
        <div className="loader center" />
        <h1 className="text-white">Loading...</h1>
      </div>
    )
    : (
      <div>
        <div className="text-center font-header">Movies sorted by {searchBy}</div>
        <div className="pagination">
          <button type="button"
            title="Previous 20 movies"
            onClick={() => fetchMovieListBy(apiURL, searchBy, prevPage, genreIDs)}>
              Prev
          </button>
          <div>{page} / {total_pages}</div>
          <button type="button"
            title="Next 20 movies"
            onClick={() => fetchMovieListBy(apiURL, searchBy, nextPage, genreIDs)}>
              Next
          </button>
        </div>
        <div ref={moviesContainer} className="movies-section" onWheel={scrollHorizontal}>
          {movies.results.map(movie => (
            <Movie
              movie={movie}
              key={movie.id + movie.title}
              movieDetails={movieDetails}
            />
          ))}
        </div>
      </div>
    );

  return !moviePage ? renderMain : 
    (
      <Redirect push to={{
        pathname: `/movie/${selectedMovie.id}`,
        route_state: {
          selectedMovie,
          movies,
        }
      }} />
    );
}

MovieList.defaultProps = {
  filter: 'All',
  apiSearch: null,
  location: null,
};

MovieList.propTypes = {
  location: PropTypes.instanceOf(Object),
  movies: PropTypes.instanceOf(Object).isRequired,
  genres: PropTypes.instanceOf(Array).isRequired,
  filter: PropTypes.string,
  status: PropTypes.instanceOf(Object).isRequired,
  apiSearch: PropTypes.instanceOf(Object),
  fetchMovieListBy: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  movies: state.movies,
  genres: state.genres,
  filter: state.filter,
  status: state.status,
});

const mapDispatchToProps = dispatch => ({
  fetchMovieListBy: (API_GET_MOVIE_BY, searchBy, page, genre_ids) => {
    dispatch(fetchMovieListBy(API_GET_MOVIE_BY, searchBy, page, genre_ids));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(MovieList);
