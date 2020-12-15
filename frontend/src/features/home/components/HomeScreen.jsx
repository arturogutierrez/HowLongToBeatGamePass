import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { homeActions } from '../home';

import AppBar from '@material-ui/core/AppBar';
import Container from '@material-ui/core/Container';
import GamepadIcon from '@material-ui/icons/Gamepad';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';

const styles = (theme) => ({
  appbar: {
    alignItems: 'center',
  },
  icon: {
    marginRight: theme.spacing(2),
  },
  heroContent: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(6, 0, 6),
  },
  tableContent: {
    textAlign: 'center',
    padding: theme.spacing(12, 0, 12),
  },
  table: {
    minWidth: 750,
  },
});

class HomeScreen extends React.Component {
  componentWillMount() {
    this.props.onComponentMounted();
  }

  render() {
    const { classes } = this.props;
    const { loading } = this.props;
    const { games } = this.props;

    return (
      <React.Fragment>
        <AppBar position="relative" className={classes.appbar}>
          <Toolbar>
            <GamepadIcon className={classes.icon} />
            <Typography variant="h6" color="inherit" noWrap>
              How long to beat each GamePass game
            </Typography>
          </Toolbar>
        </AppBar>
        <main>
          <div className={classes.heroContent}>
            <Container maxWidth="lg">
              <Typography
                component="h1"
                variant="h4"
                align="center"
                color="textPrimary"
                gutterBottom
              >
                Number of hours playing needed to beat each Xbox Game Pass game (data from{' '}
                <a href="https://howlongtobeat.com" target="_blank">
                  HWLT
                </a>
                )
              </Typography>
            </Container>
            <div className={classes.tableContent}>
              {loading && <CircularProgress variant="indeterminate" />}
              {!loading && <div id="tableContentBody"></div>}
            </div>
          </div>
        </main>
      </React.Fragment>
    );
  }
}

export function mapStateToProps(state) {
  return {
    loading: state.home.loading && state.home.games.length === 0,
    games: state.home.games,
  };
}

export function mapPropsToDispatch(dispatch) {
  return {
    onComponentMounted: () => {
      dispatch(homeActions.loadGames());
    },
  };
}

export const PureHomeScreen = HomeScreen;
export default withRouter(
  connect(mapStateToProps, mapPropsToDispatch)(withStyles(styles)(PureHomeScreen)),
);
