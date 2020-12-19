const fs = require('fs');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const PromiseThrottle = require('promise-throttle');
const hltb = require('howlongtobeat');

const hltbService = new hltb.HowLongToBeatService();
const throttleOptions = {
   requestsPerSecond: 20,
   promiseImplementation: Promise,
};
const throttle = new PromiseThrottle(throttleOptions);
const MAX_RETRIES = 2;
const OUTPUT_DATA_FILE = './data/games.json';

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

class RowGameInfo {
   constructor(name, xCloud, metacritic, releaseDate) {
      this.name = name;
      this.xCloud = xCloud;
      this.metacritic = metacritic;
      this.releaseDate = releaseDate;
   }
}

function removeSpecialCharacters(gameName) {
   let curatedName = gameName;
   const listSpecialCharacters = [
      '™',
      '®',
      '#',
      '(PC)',
      'Xbox One',
      'for Windows 10',
      'Win10',
      '(Game Preview)',
      'Standard Edition',
      'Ultimate Edition',
      'XB1',
      'EA SPORTS',
      'Deluxe Edition',
      '()',
      'Become as Gods Edition',
      'Year One Survival Edition',
      'Special Edition',
      'Definitive Edition',
      'The One Edition',
      'Juggernaut Edition',
   ];
   listSpecialCharacters.forEach((specialCharacter) => {
      curatedName = curatedName.replace(specialCharacter, '');
   });
   curatedName = curatedName.replace('Ⅲ', 'III');
   curatedName = curatedName.replace('I.5 + II.5 ReMix', '1.5 and 2.5 Remix');
   curatedName = curatedName.replace('Fandago', 'Fandango');
   curatedName = curatedName.replace('Season Two', 'Season 2');
   return curatedName;
}

function removeSuffixParts(gameName) {
   let curatedName = gameName;
   const listSpecialCharacters = [':', '-'];
   listSpecialCharacters.forEach((specialCharacter) => {
      const indexOfSeparator = curatedName.indexOf(specialCharacter);
      if (indexOfSeparator > -1) {
         curatedName = curatedName.substring(0, indexOfSeparator);
      }
   });
   if (curatedName === '') {
      console.log(
         `After removing suffix parts, the name would be empty. Reseting. So you should check this: ${gameName}`,
      );
      curatedName = gameName;
   }
   return curatedName;
}

function removeDotsInTheEndOfString(gameName) {
   return gameName.replace(/\.+$/, '');
}

function curateRetryName(originalName) {
   let retryNewName = originalName;
   retryNewName = retryNewName.trimEnd();
   retryNewName = removeSpecialCharacters(retryNewName);
   retryNewName = removeSuffixParts(retryNewName);
   retryNewName = removeDotsInTheEndOfString(retryNewName);
   return retryNewName;
}

function specificGameNameMapping(gameName) {
   const map = new Map([
      ['The Walking Dead: Season Two', 'The Walking Dead Season 2'],
      ['Wilmot’s Warehouse', "Wilmot's Warehouse"],
   ]);
   const value = map.get(gameName);
   if (value != null) {
      return gameName.replace(gameName, value);
   }
   return gameName;
}

function parseResult(gameRow, result) {
   if (result !== undefined && result.length > 0) {
      const first = result[0]; // Assuming the first option is the one that we'relooking for, more coincidence
      return new GameInfo(
         first.id,
         first.name,
         gameRow.name,
         first.gameplayMain,
         first.gameplayMainExtra,
         first.gameplayCompletionist,
         first.imageUrl,
         gameRow.releaseDate,
         gameRow.metacritic,
      );
   }
   return null;
}

function retryGameIfNeeded(gameRow, numRetry) {
   const gameName = gameRow.name;
   if (numRetry <= MAX_RETRIES) {
      let search = gameName;
      if (numRetry == 0) {
         search = search.replace(':', '');
      } else {
         search = curateRetryName(search);
      }
      return throttle.add(gameFetchPromise.bind(this, gameRow, search, numRetry + 1));
   }
   failedGames.push(gameRow);

   return null;
}

function writeResults(list) {
   console.log(`📝 Dumping results to a JSON file: ${list.length}`);
   const json = JSON.stringify(list, null, 2);
   fs.writeFile(OUTPUT_DATA_FILE, json, (err) => {
      if (err) console.log(err);
   });
}

async function fetchSpreadsheet() {
   // https://docs.google.com/spreadsheets/d/1kspw-4paT-eE5-mrCrc4R9tg70lH2ZTFrJOUmOtOytg/edit
   const doc = new GoogleSpreadsheet('1kspw-4paT-eE5-mrCrc4R9tg70lH2ZTFrJOUmOtOytg');
   await doc.useServiceAccountAuth(require('./creds-from-google.json'));
   await doc.loadInfo();

   const sheet = doc.sheetsByTitle.Xbox;
   await sheet.loadCells();

   const gameNameList = [];
   for (let i = 2; i < sheet.rowCount; i += 1) {
      const gameName = sheet.getCell(i, 0).value;

      if (gameName == null) {
         continue;
      }

      const isAvailable =
         sheet.getCell(i, 3).value != null
            ? sheet.getCell(i, 3).value.toLowerCase() === 'active'
            : false;
      if (!isAvailable) {
         continue;
      }

      const xCloud =
         sheet.getCell(i, 2).value != null
            ? sheet.getCell(i, 2).value.toLowerCase() === 'yes'
            : false;
      const metacritic = sheet.getCell(i, 9).value || -1;
      const releaseDate = sheet.getCell(i, 7).formattedValue || null;

      gameNameList.push(new RowGameInfo(gameName, xCloud, metacritic, releaseDate));
   }

   return gameNameList;
}

let gameFetchPromise = function (gameRow, search, numRetry) {
   const gameName = gameRow.name;
   console.log(`Fetching ${gameName}`);
   return hltbService
      .search(search)
      .then((result) => {
         const gameInfo = parseResult(gameRow, result);
         if (gameInfo != null) {
            return gameInfo;
         }
         return retryGameIfNeeded(gameRow, numRetry);
      })
      .catch((_) => retryGameIfNeeded(gameRow, numRetry));
};

let failedGames = [];

fetchSpreadsheet().then((gameNamesList) => {
   const promises = [];
   gameNamesList.forEach((gameRow) => {
      const search = specificGameNameMapping(gameRow.name);
      const newPromise = throttle.add(gameFetchPromise.bind(this, gameRow, search, 0));
      promises.push(newPromise);
   });

   Promise.all(promises).then((input) => {
      let gameInfos = input.filter((e) => e != null);
      // Removing duplicates
      gameInfos = gameInfos.filter(
         (v, i, a) => a.findIndex((t) => v.id != null && t.id === v.id) === i,
      );

      if (failedGames.length > 0) {
         console.log('Failed games: ');
         failedGames.forEach((g) => console.log(` - ${g.name}`));
      }

      failedGames.forEach((gameRow) => {
         gameInfos.push(
            new GameInfo(
               null,
               gameRow.name,
               gameRow.name,
               0,
               0,
               0,
               gameRow.releaseDate,
               gameRow.metacritic,
            ),
         );
      });

      gameInfos.sort((a, b) => {
         if (a.name < b.name) {
            return -1;
         }
         if (a.name > b.name) {
            return 1;
         }
         return 0;
      });
      writeResults(gameInfos);
   });
});
