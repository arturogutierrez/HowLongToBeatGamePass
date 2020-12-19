import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
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
      <BrowserRouter basename={process.env.PUBLIC_URL}>
        <Switch>
          <Route path={INDEX} component={HomeScreen} />
        </Switch>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
