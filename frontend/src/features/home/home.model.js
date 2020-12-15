class GameInfo {
  constructor(
    id,
    name,
    search,
    gameplayMain,
    gameplayMainExtra,
    gameplayCompletionist,
    imageUrl,
    releaseDate,
    metacritic,
  ) {
    this.id = id;
    this.name = name;
    this.search = search;
    this.gameplayMain = gameplayMain;
    this.gameplayMainExtra = gameplayMainExtra;
    this.gameplayCompletionist = gameplayCompletionist;
    this.imageUrl = imageUrl;
    this.releaseDate = releaseDate;
    this.metacritic = metacritic;
  }
}

export default GameInfo;
