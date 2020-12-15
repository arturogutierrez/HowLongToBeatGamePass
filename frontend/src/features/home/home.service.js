import GameInfo from './home.model';

const homeService = {
  loadGames,
};

async function loadGames() {
  const response = await fetch('games.json');
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
        i.releaseDate,
        i.metacritic,
      ),
  );
}

export default homeService;
