import { None, Some } from 'monet';
import gameService from './home.service';

const FETCHING_GAMES = 'FETCHING_GAMES';
const ERROR_FETCHING_GAMES = 'ERROR_FETCHING_GAMES';
const GAMES_FETCHED = 'GAMES_FETCHED';

export const homeActions = {
  loadGames,
};

function loadGames() {
  return (dispatch) => {
    dispatch(fetching());

    gameService.loadGames().then((response) => {
      dispatch(gameListFetched(response));
    });
  };

  function fetching() {
    return { type: FETCHING_GAMES };
  }

  function errorFetching(error) {
    return { type: ERROR_FETCHING_GAMES, error };
  }

  function gameListFetched(games) {
    return { type: GAMES_FETCHED, games };
  }
}

const initialState = {
  loading: false,
  games: [],
  errorFetching: None(),
};

export function homeReducer(state = initialState, action) {
  switch (action.type) {
    case FETCHING_GAMES:
      return Object.assign({}, state, {
        loading: true,
        errorFetching: None(),
      });
    case ERROR_FETCHING_GAMES:
      return Object.assign({}, state, {
        loading: false,
        errorFetching: Some(action.error),
      });
    case GAMES_FETCHED:
      return Object.assign({}, state, {
        loading: false,
        errorFetching: None(),
        games: action.games,
      });
    default:
      return state;
  }
}
