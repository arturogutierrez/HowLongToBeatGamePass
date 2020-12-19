import GameInfo from './home.model';
import moment from 'moment';

const homeService = {
  loadGames,
};

async function loadGames() {
  const response = await fetch('HowLongToBeatGamePass/games.json');
  const items = await response.json();
  return items.map(
    (i) =>
      new GameInfo(
        i.id,
        i.name,
        i.search,
        i.gameplayMain,
        i.gameplayMainExtra,
        i.gameplayCompletionist,
        i.imageUrl,
        moment(i.releaseDate, 'MMM YYYY').toDate(),
        i.metacritic,
      ),
  );
}

export default homeService;
