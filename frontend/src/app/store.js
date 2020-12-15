import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import { homeReducer } from '../features/home/home';

export function initializeStore(reducer) {
  const composeEnhancers = composeWithDevTools({});
  return createStore(reducer, composeEnhancers(applyMiddleware(thunk)));
}

export function rootReducer(state = {}, action) {
  return {
    home: homeReducer(state.home, action),
  };
}

export const store = initializeStore(rootReducer);
