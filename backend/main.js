let fs = require('fs');
const { GoogleSpreadsheet } = require('google-spreadsheet');
let PromiseThrottle = require('promise-throttle');
let hltb = require('howlongtobeat');
let hltbService = new hltb.HowLongToBeatService();
let throttleOptions = {
    requestsPerSecond: 20,
    promiseImplementation: Promise
};
let throttle = new PromiseThrottle(throttleOptions);
const MAX_RETRIES = 2;
const OUTPUT_DATA_FILE = './data/games.json';


class GameInfo {
    constructor(id, name, search, gameplayMain, gameplayMainExtra, gameplayCompletionist, imageUrl, releaseDate) {
        this.id = id;
        this.name = name;
        this.search = search;
        this.gameplayMain = gameplayMain;
        this.gameplayMainExtra = gameplayMainExtra;
        this.gameplayCompletionist = gameplayCompletionist;
        this.imageUrl = imageUrl;
        this.releaseDate = releaseDate;
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
    listSpecialCharacters = ["™", "®", "#", "(PC)", "Xbox One", "for Windows 10", "Win10", "(Game Preview)", "Standard Edition", "Ultimate Edition", "XB1", "EA SPORTS", "Deluxe Edition", "()"];
    listSpecialCharacters.forEach(specialCharacter => {
        curatedName = curatedName.replace(specialCharacter, "");
    });
    curatedName = curatedName.replace("Ⅲ", "III");
    curatedName = curatedName.replace("I.5 + II.5 ReMix", "1.5 and 2.5 Remix");
    curatedName = curatedName.replace("Fandago", "Fandango");
    curatedName = curatedName.replace("Season Two", "Season 2")
    return curatedName;
}

function removeSuffixParts(gameName) {
    let curatedName = gameName;
    listSpecialCharacters = [":", "-"];
    listSpecialCharacters.forEach((specialCharacter) => {
        const indexOfSeparator = curatedName.indexOf(specialCharacter);
        if (indexOfSeparator > -1) {
            curatedName = curatedName.substring(0, indexOfSeparator);
        }
    });
    if (curatedName === "") {
        console.log("After removing suffix parts, the name would be empty. Reseting. So you should check this: " + gameName);
        curatedName = gameName;
    }
    return curatedName;
}

function removeDotsInTheEndOfString(gameName) {
    return gameName.replace(/\.+$/, "");
}

function curateRetryName(originalName) {
    let retryNewName = originalName;
    retryNewName = retryNewName.trimEnd();
    retryNewName = removeSpecialCharacters(retryNewName);
    retryNewName = removeSuffixParts(retryNewName);
    retryNewName = removeDotsInTheEndOfString(retryNewName);
    return retryNewName;
}

function parseResult(gameRow, result) {
    if (result !== undefined && result.length > 0) {
        const first = result[0]; //Assuming the first option is the one that we'relooking for, more coincidence
        return new GameInfo(
            first.id,
            first.name,
            gameRow.name,
            first.gameplayMain,
            first.gameplayMainExtra,
            first.gameplayCompletionist,
            first.imageUrl,
            gameRow.releaseDate
        );
    }
    return null;
}

function retryGameIfNeeded(gameRow, numRetry) {
    let gameName = gameRow.name;
    if (numRetry <= MAX_RETRIES) {
        let clearedName = curateRetryName(gameName);
        return throttle.add(gameFetchPromise.bind(this, gameRow, clearedName, numRetry + 1));
    } else {
        failedGames.push(gameName);
    }

    return null;
}

function writeResults(list) {
    console.log("📝 Dumping results to a JSON file: " + list.length);
    let json = JSON.stringify(list, null, 2);
    fs.writeFile(OUTPUT_DATA_FILE, json, err => {
        if (err) return console.log(err);
      });
}


async function fetchSpreadsheet() {
    // https://docs.google.com/spreadsheets/d/1kspw-4paT-eE5-mrCrc4R9tg70lH2ZTFrJOUmOtOytg/edit
    const doc = new GoogleSpreadsheet('1kspw-4paT-eE5-mrCrc4R9tg70lH2ZTFrJOUmOtOytg');
    await doc.useServiceAccountAuth(require('./creds-from-google.json'));
    await doc.loadInfo();

    const sheet = doc.sheetsByTitle['Xbox'];
    await sheet.loadCells();

    let gameNameList = [];
    for(var i = 2; i < sheet.rowCount; i++) {
        let gameName = sheet.getCell(i, 0).value;
        
        if (gameName == null) continue;
        
        let isAvailable = sheet.getCell(i, 3).value != null ? sheet.getCell(i, 3).value.toLowerCase() == 'active' : false;    
        if (!isAvailable) continue;

        let xCloud = sheet.getCell(i, 2).value != null ? sheet.getCell(i, 2).value.toLowerCase() == 'yes' : false;
        let metacritic = sheet.getCell(i, 9).value != null ?? -1;
        let releaseDate = sheet.getCell(i, 7).formattedValue ?? null;

        gameNameList.push(
            new RowGameInfo(gameName, xCloud, metacritic, releaseDate)
        );
    }

    return gameNameList;
}

let gameFetchPromise = function(gameRow, search, numRetry) {
    let gameName = gameRow.name;
    console.log('Fetching ' + gameName);
    return hltbService
            .search(search)
            .then(result => {
                let gameInfo = parseResult(gameRow, result);
                if (gameInfo != null) {
                    return gameInfo;
                }
                return retryGameIfNeeded(gameRow, numRetry);
            })
            .catch(e => {
                return retryGameIfNeeded(gameRow, numRetry);
            });
}

let failedGames = [];

fetchSpreadsheet().then(gameNamesList => {     
    let promises = [];
    gameNamesList.forEach(gameRow => {
        let newPromise = throttle.add(gameFetchPromise.bind(this, gameRow, gameRow.name, 0)); 
        promises.push(newPromise);
    });
    
    Promise.all(promises).then(gameInfos => {
        gameInfos = gameInfos.filter(e => {
            return e != null;
        });

        if (failedGames.length > 0) {
            console.log("Failed games: ");
            failedGames.forEach(g => console.log(' - ' + g));    
        }

        failedGames.forEach(name => {
            gameInfos.push(
                new GameInfo(null, name, name, 0, 0, 0, null)
            );
        });
    
        gameInfos.sort((a, b) => {
            if (a.name < b.name) {
                return -1;
            } else if (a.name > b.name) {
                return 1;
            }
            return 0;
        });
        writeResults(gameInfos);
    
    });
});

//////// Script for getting data in: https://www.xbox.com/en-US/xbox-game-pass/games#
/*
    let listOutput = [];
    let listGames = document.getElementsByClassName("c-subheading-4 x1GameName");
    for (let i = 0; i < listGames.length; ++i){
            let name = listGames[i].innerText;
            listOutput.push(name);
    };
    let allGamesString = listOutput.join("|");
    console.log(allGamesString);
*/