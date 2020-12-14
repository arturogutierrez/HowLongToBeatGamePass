let fs = require('fs');
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
    constructor(id, name, gameplayMain, gameplayMainExtra, gameplayCompletionist, imageUrl) {
        this.id = id;
        this.name = name;
        this.gameplayMain = gameplayMain;
        this.gameplayMainExtra = gameplayMainExtra;
        this.gameplayCompletionist = gameplayCompletionist;
        this.imageUrl = imageUrl;
    }
}

function removeSpecialCharacters(gameName) {
    let curatedName = gameName;
    listSpecialCharacters = ["™", "®", "#", "(PC)", "Xbox One", "for Windows 10", "Win10", "(Game Preview)", "Standard Edition"];
    listSpecialCharacters.forEach(specialCharacter => {
        curatedName = curatedName.replace(specialCharacter, "");
    });
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

function parseResult(result) {
    if (result !== undefined && result.length > 0) {
        const first = result[0]; //Assuming the first option is the one that we'relooking for, more coincidence
        return new GameInfo(
            first.id,
            first.name,
            first.gameplayMain,
            first.gameplayMainExtra,
            first.gameplayCompletionist,
            first.imageUrl
        );
    }
    return null;
}

function retryGameIfNeeded(game, numRetry) {
    if (numRetry <= MAX_RETRIES) {
        let clearedName = curateRetryName(game);
        return throttle.add(gameFetchPromise.bind(this, clearedName, numRetry + 1));
    } else {
        failedGames.push(game);
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


let listGameNames = "Call of the Sea|Tetris® Effect: Connected|NHL® 94 REWIND|Monster Sanctuary|Planet Coaster: Console Edition|PHOGS!|Unto The End|Gears Tactics|Haven|Control|DRAGON QUEST® XI S: Echoes of an Elusive Age™ - Definitive Edition|Yes, Your Grace|Slime Rancher|FINAL FANTASY VIII Remastered|STAR WARS Jedi: Fallen Order™|ARK: Survival Evolved Explorer's Edition|Star Renegades|River City Girls|A Plague Tale: Innocence|A Way Out|ACE COMBAT™ 7: SKIES UNKNOWN|Age of Wonders: Planetfall|Alan Wake|Alice: Madness Returns|Alien: Isolation|Alvastia Chronicles|Anthem™|Army of Two™|ASTRONEER|Banjo Kazooie: N n B|Banjo-Kazooie|Banjo-Tooie|Batman™: Arkham Knight|Battle Chasers: Nightwar|Battlefield 1943™|Battlefield 3™|Battlefield 4|Battlefield Bad Company 2|Battlefield: Bad Company|Battlefield™ 1|Battlefield™ Hardline|Battlefield™ V|Battletoads|Bejeweled 2|Bejeweled 3|Black Desert|BLACK™|Blair Witch|Bleeding Edge|Bloodstained: Ritual of the Night|Bridge Constructor Portal|Brütal Legend|Burnout™ Paradise Remastered|Carrion|Carto|Celeste|Children of Morta|Cities: Skylines - Xbox One Edition|ClusterTruck|Costume Quest 2|Crackdown 3|Cricket 19|CrossCode|Crysis|Crysis 2|Crysis® 3|Dante's Inferno™|Darksiders Genesis|Day of the Tentacle Remastered|DayZ|de Blob|Dead by Daylight: Special Edition|Dead Cells|Dead Space™|Dead Space™ 2|Dead Space™ 3|Dead Space™ Ignition|Death Squared|Deep Rock Galactic|Deliver Us The Moon|Descenders|Destiny 2|Destiny 2: Forsaken|Destiny 2: Shadowkeep|DiRT 4|Dishonored 2|Disneyland Adventures|Don't Starve: Giant Edition|DOOM Eternal Standard Edition|Double Dragon Neon|Double Kick Heroes|Dragon Age: Origins|Dragon Age™ 2|Dragon Age™: Inquisition|Drake Hollow|Dungeon of the Endless|EA SPORTS™ FIFA 16|EA SPORTS™ FIFA 17|EA SPORTS™ FIFA 20|EA SPORTS™ NHL® 18|EA SPORTS™ NHL® 19|EA SPORTS™ Rory McIlroy PGA TOUR®|EA SPORTS™ UFC®|EA SPORTS™ UFC® 2|EA SPORTS™ UFC® 3|Eastshade|eFootball PES 2020 STANDARD EDITION|Enter The Gungeon|F1® 2019|Fable Anniversary|Fable II|Fable III|Fallout 76|Fallout: New Vegas|Farming Simulator 17|Fe|Feeding Frenzy|Feeding Frenzy 2|FIFA 15|FIFA 18|FIFA 19|FIGHT NIGHT CHAMPION|FINAL FANTASY IX|FINAL FANTASY VII|FINAL FANTASY XV ROYAL EDITION|Fishing Sim World®: Pro Tour|Five Nights at Freddy's|Five Nights at Freddy's 2|Five Nights at Freddy's 3|Five Nights at Freddy's 4|Five Nights at Freddy's: Original Series|For The King|Forager|Forza Horizon 4 Standard Edition|Forza Motorsport 7 Standard Edition|Fractured Minds|Frostpunk: Console Edition|Full Throttle Remastered|Fuzion Frenzy®|Gato Roboto|Gears 5|Gears 5 Ultimate Edition|Gears of War|Gears of War 2|Gears of War 3|Gears of War 4|Gears of War: Judgment|Gears of War: Ultimate Edition|Goat Simulator|Golf With Your Friends|GONNER2|Grim Fandango Remastered|Grounded - Game Preview|Guacamelee! 2|Halo 5: Guardians|Halo Wars 2: Standard Edition|Halo Wars: Definitive Edition|Halo: Spartan Assault|Halo: The Master Chief Collection|Heavy Weapon|Hellblade: Senua's Sacrifice|Hello Neighbor|Hollow Knight: Voidheart Edition|Hotshot Racing|Human Fall Flat|HyperDot|Hypnospace Outlaw|Ikenfell|Indivisible|It Lurks Below|Jetpac Refuelled|Journey to the Savage Planet|Joy Ride Turbo|Kameo|Katana Zero XB1|Killer Instinct: Definitive Edition|KINGDOM HEARTS - HD 1.5+2.5 ReMIX -|KINGDOM HEARTS Ⅲ|KINGDOM HEARTS HD 2.8 Final Chapter Prologue|Knights and Bikes|Kona|Levelhead|Lonely Mountains: Downhill|Madden NFL 15|Madden NFL 16|Madden NFL 17|Madden NFL 18|Madden NFL 19|Madden NFL 20|Madden NFL 25|MARVEL VS. CAPCOM: INFINITE|Mass Effect|Mass Effect 2|Mass Effect™ 3|Mass Effect™: Andromeda|Max: The Curse of Brotherhood|Medal of Honor Airborne|Middle-earth™: Shadow of War™|Minecraft|Minecraft Dungeons|";
listGameNames += "Mirror's Edge™|Mirror's Edge™ Catalyst|Momodora: Reverie Under the Moonlight|MONSTER HUNTER: WORLD™|Moonlighter|Mortal Kombat X|Mount & Blade: Warband|Moving Out|MudRunner|My Friend Pedro|My Time At Portia|NARUTO TO BORUTO: SHINOBI STRIKER|NBA LIVE 18: The One Edition|NBA LIVE 19|Need for Speed Rivals|Need for Speed™|Need for Speed™ Heat|Need for Speed™ Payback|Neon Abyss|New Super Lucky's Tale|NHL® 20|NieR:Automata™ BECOME AS GODS Edition|Night Call|Night in the Woods|NINJA GAIDEN II|No Man's Sky|Nowhere Prophet|Observation|Ori and the Blind Forest: Definitive Edition|Ori and the Will of the Wisps|Outer Wilds|Overcooked! 2|Oxenfree|Pandemic: The Board Game|Pathologic 2|PAYDAY 2: CRIMEWAVE EDITION|Peggle|Peggle 2|Perfect Dark|Perfect Dark Zero|Pikuniku|Pillars of Eternity: Complete Edition|Plants vs. Zombies|Plants vs. Zombies Garden Warfare|Plants vs. Zombies: Battle for Neighborville™|Plants vs. Zombies™ Garden Warfare 2|PLAYERUNKNOWN'S BATTLEGROUNDS|Power Rangers: Battle for the Grid|Quantum Break|RAGE 2|Rare Replay|ReCore|Remnant: From the Ashes|RESIDENT EVIL 7 biohazard|Rocket Arena|Rush: A DisneyPixar Adventure|Ryse: Son of Rome|ScourgeBringer|ScreamRide|Sea of Solitude|Sea of Thieves|Sea Salt|Secret Neighbor|Shadow Warrior 2|Shadows of the Damned|Skate 3|Slay The Spire|Sniper Elite 4|SOULCALIBUR VI|Spiritfarer®|SSX|STAR WARS™ Battlefront™|STAR WARS™ Battlefront™ II|State of Decay 2: Juggernaut Edition|State of Decay: Year-One|Stellaris: Console Edition|Stranger Things 3: The Game|Streets of Rage 4|Streets of Rogue|Subnautica|Sunset Overdrive|Super Lucky's Tale|Supraland|Surviving Mars|SWORD ART ONLINE: FATAL BULLET|Tales of Vesperia™: Definitive Edition|TEKKEN 7|Tell Me Why: Chapters 1-3|Terraria|The Bard's Tale ARPG : Remastered and Resnarkled|The Bard's Tale IV: Director's Cut|The Bard's Tale Trilogy|The Dark Crystal: Age of Resistance Tactics|The Dark Pictures Anthology: Man Of Medan|The Elder Scrolls® Online|The Gardens Between|The Jackbox Party Pack 4|The Long Dark|The Messenger|The Outer Worlds|The Sims™ 4|The Surge 2|The Touryst|The Turing Test|The Walking Dead: A New Frontier - The Complete Season (Episodes 1-5)|The Walking Dead: Michonne - Ep. 2, Give No Shelter|The Walking Dead: Michonne - Ep. 3, What We Deserve|The Walking Dead: Michonne - The Complete Season|The Walking Dead: Season Two|The Walking Dead: The Complete First Season|The Witcher 3: Wild Hunt|theHunter: Call of the Wild|Thronebreaker: The Witcher Tales|Ticket to Ride|Titanfall|Titanfall® 2|Tom Clancy's Rainbow Six® Siege Deluxe Edition|Totally Accurate Battle Simulator (Game Preview)|Totally Reliable Delivery Service|Touhou Luna Nights|Trailmakers|Train Sim World® 2020|Two Point Hospital™|UnderMine|Unravel|Unravel Two|Unruly Heroes|Untitled Goose Game|Vambrace: Cold Soul|Viva Piñata|Viva Piñata: TIP|Void Bastards|Wargroove|Warhammer: Vermintide 2|Wasteland 2: Director's Cut|Wasteland 3 (Xbox One)|Wasteland Remastered|We Happy Few|West of Dead|What Remains of Edith Finch|Wizard of Legend|Wolfenstein: Youngblood|World War Z|Worms W.M.D|Xeno Crisis|Yakuza 0|Yakuza Kiwami|Yakuza Kiwami 2|Zoo Tycoon: Ultimate Animal Collection|Zuma|Zuma's Revenge!"
//let listGameNames = "The Surge 2|Planet Coaster: Console Edition|Red Dead Redemption 2";

let gameNamesList = Array.from(new Set(listGameNames.split("|")));
let failedGames = [];

let gameFetchPromise = function(game, numRetry) {
    console.log('Fetching ' + game);
    return hltbService
            .search(game)
            .then(result => {
                let gameInfo = parseResult(result);
                if (gameInfo != null) {
                    return gameInfo;
                }
                return retryGameIfNeeded(game, numRetry);
            })
            .catch(e => {
                return retryGameIfNeeded(game, numRetry);
            });
}
 
let promises = [];
gameNamesList.forEach(game => {
    let newPromise = throttle.add(gameFetchPromise.bind(this, game, 0)); 
    promises.push(newPromise);
});

Promise.all(promises).then(gameInfos => {
    gameInfos = gameInfos.filter(e => {
        return e != null;
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

    if (failedGames.length > 0) {
        console.log("Failed games: ");
        failedGames.forEach(g => console.log(' - ' + g));    
    }
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