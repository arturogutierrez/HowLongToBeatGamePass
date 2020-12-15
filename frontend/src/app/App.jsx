import React from 'react';
import { Route, Router, Switch } from 'react-router-dom';
import history from './history';
// Routes
import { INDEX } from '../routes';
// Screens
import HomeScreen from '../features/home/components/HomeScreen';

// Theme
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/core/styles';
import green from '@material-ui/core/colors/green';
import blueGrey from '@material-ui/core/colors/blueGrey';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: blueGrey[500],
    },
    secondary: {
      main: green[500],
    },
    background: {
      paper: blueGrey[50],
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router history={history}>
        <Switch>
          <Route exact path={INDEX} component={HomeScreen} />
        </Switch>
      </Router>
    </ThemeProvider>
  );
}

export default App;
