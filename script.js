/* 
Rule of thumb: 
if you only ever need ONE of something
use a module,
if you need multiples of something,
create them with factories
*/

/* Factory functions for anything of which 
you need multiple (e.g., players)

const FactoryFunction = (argument1, argument2) => {
    const _privateVariable = 'I stay within function';
    const _privateFunction = () => {};
    const variable = 'I will be returned to the outside of function';
    const function = () => {};
    return {argument1, argument2, variable, function}
}
(returns an object when called)

Modules for something of which you do not need copies

const Module = (function() {
    const _privateVariable = "foo";
    const variable = "bar";

    function _privateMethod() {
        console.log(_privateProperty);
    }

    function publicMethod() {
        _privateMethod();
    }
    return {
    variable,
    publicMethod
    };
})();

*/
const el = (selector) => document.querySelector(selector);

const start = (function () {
    let player1 = {};
    let player2 = { bot: true };
    const board = el(".board");
    const one = el(".one");
    const two = el(".two");
    const charSelect = el(".character-select");
    const xChar = document.createElement('div');
    xChar.classList.add('char', 'x')
    const oChar = document.createElement('div');
    oChar.classList.add('char', 'o');
    const display = el(".start-screen");
    const textDisplay = el(".text-display");

    function displayCharSelect() {
        one.remove();
        two.remove();
        charSelect.appendChild(xChar);
        charSelect.appendChild(oChar);
    }
    one.addEventListener("click", () => {
        displayCharSelect();
        createPlayer(1);
    })
    two.addEventListener("click", () => {
        displayCharSelect();
        createPlayer(2);
    })

    const createPlayer = (players) => {
        if (players === 2) {
            player2.bot = false;
            textDisplay.innerText = `Player 1\nChoose your character`;
        } else {
            textDisplay.textContent = `Choose your character`;
        }
        addCharSelectFunction(xChar, 'x', players);
        addCharSelectFunction(oChar, 'o', players);

    };
    function addCharSelectFunction(element, character, players) {
        element.addEventListener("click", () => {
            if (players === 1) {
                player1.char = character;
                board.classList.add(character);
                gameBoard.initializeGame();
            } else {
                if (!player1.char) {
                    player1.char = character;
                    board.classList.add(character);
                    textDisplay.innerText = `Player 2\nChoose your character`;
                    element.style.cssText = "opacity: 0.1; cursor: not-allowed";
                } else {
                    if (player1.char === character) {
                        return
                    } else {
                        player2.char = character;
                        gameBoard.initializeGame();
                    }
                }
            }
        })
    }
    return { player1, player2, display, board };
})();

const gameBoard = (function () {
    let teamX = {
        character: 'x',
        marks: [],
        count: {},
    };
    let teamO = {
        character: 'o',
        marks: [],
        count: {},
    };
    const cells = document.querySelectorAll(".cell");
    const cellArray = Array.from(cells);
    function initializeGame() {
        start.display.classList.add("hide");
        setTimeout(() => {
            start.display.remove();
        }, 300)
        cells.forEach((cell) => {
            cell.addEventListener('click', (e) => {
                let place = cellArray.indexOf(cell);
                if (cell.classList.contains('o') || cell.classList.contains('x')
                    || endGame.checkForWin.won) return
                //
                if (start.player2.bot) {
                    if (start.player1.char === "x") {
                        makeMarks(cell, teamX, place);
                        if (!endGame.checkForWin.won) {
                            moveBot(teamO, teamX)
                        }
                    } else {
                        makeMarks(cell, teamO, place);
                        if (!endGame.checkForWin.won) {
                            moveBot(teamX, teamO);
                        }
                    }
                }
                //
                else {
                    if (start.board.classList.contains('x')) {
                        makeMarks(cell, teamX, place);
                        switchTurns(teamX, teamO);
                    } else if (start.board.classList.contains('o')) {
                        makeMarks(cell, teamO, place);
                        switchTurns(teamO, teamX);
                    }
                }
            })
        })
    }

    function moveBot (botTeam, userTeam) {
        let compMove = bot.computerMove(botTeam, userTeam);
        cellArray[compMove[0][0]].classList.add(botTeam.character);
        botTeam.marks.push(compMove[0][0]);
        endGame.checkForWin(botTeam);
    }

    function makeMarks(cell, team, place) {
        cell.classList.add(team.character);
        team.marks.push(place);
        endGame.checkForWin(team);
    }
    function switchTurns(team, oppTeam) {
        start.board.classList.remove(team.character);
        start.board.classList.add(oppTeam.character);
    }
    return { initializeGame, cells, teamX, teamO, moveBot }
})();

const bot = (function () {
    //possible alternate to try
    //give each spots a score denoting cost/benefit analysis
    
    const spaces = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    // const cornerSpaces = [0, 2, 6, 8];
    // const middleSpaces = [1, 3, 5, 7];
    function computerMove(team, otherTeam) {
        let options = [];
        let strategicStartingOptions = [];
        let otherTeamSpotsBlock = [];
        let offAndDef = [];
        let allOpenWinLines = [];
        let allOpenSpaces = findOpenSpaces(spaces, team.marks, otherTeam.marks);
        // let openCorners = findOpenSpaces(cornerSpaces, team.marks, otherTeam.marks);
        // let openMiddles = findOpenSpaces(middleSpaces, team.marks, otherTeam.marks);
        const winPossibilities = [[0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 4, 8], [2, 4, 6]];
        win:
        for (let i = 0; i < winPossibilities.length; i++) {
            let openSpaces = findOpenSpaces(winPossibilities[i], team.marks, otherTeam.marks);
            let currentWinPossibility = winPossibilities[i];
            team.count[i] = [];
            otherTeam.count[i] = [];
            for (let o = 0; o < currentWinPossibility.length; o++) {
                for (let p = 0; p < team.marks.length; p++) {
                    if (team.marks[p] === currentWinPossibility[o]) {
                        team.count[i].push(currentWinPossibility[o]);
                    }
                }
                if (otherTeam.marks.some(item => currentWinPossibility.includes(item))) {
                    for (let q = 0; q < otherTeam.marks.length; q++) {
                        if (otherTeam.marks[q] === currentWinPossibility[o]) {
                            otherTeam.count[i].push(currentWinPossibility[o]);
                        }
                    }
                }
            }

            if (team.count[i].length > 1 && openSpaces.length) {
                options.unshift(openSpaces);
                break win;
            } else if (otherTeam.count[i].length > 1 && openSpaces.length) {
                options.unshift(openSpaces);
            } else {
                //find spots bot could use for win
                if (openSpaces.length > 1 &&
                    team.count[i].some(item => currentWinPossibility.includes(item))) {
                    strategicStartingOptions.push(openSpaces);
                }
                //find spots other team could use
                if (otherTeam.marks.some(item => currentWinPossibility.includes(item)) &&
                    !team.marks.some(item => currentWinPossibility.includes(item))) {
                    otherTeamSpotsBlock.push(openSpaces);
                }
                //find all fully open win lines
                if (openSpaces.length > 2) {
                    allOpenWinLines.push(openSpaces);
                }
            }
        }

        if (!options.length) {

            //compare arrays made above^ for optimal spots
            for (let u = 0; u < strategicStartingOptions.length; u++) {
                for (let o = 0; o < otherTeamSpotsBlock.length; o++) {
                    for (let y = 0; y < otherTeamSpotsBlock[o].length; y++) {
                        let spotNumber = otherTeamSpotsBlock[o][y]
                        if (strategicStartingOptions[u].includes(spotNumber)) {
                            offAndDef.push(spotNumber);
                        }
                    }
                }
            }

            //not actually most optimal as it turns out
            //array of spots effective on both offense and defense
            let mostOptimal = findMostCommon(offAndDef);
            
            //array of spots opponent can use to win
            let mergedOpponentSpots = mergeArrayOfArrays(otherTeamSpotsBlock);

            //array of spots opponent can use to win in multiple ways
            let repeatOpponentSpots = findRepeatItems(mergedOpponentSpots);

            //array of spots bot can fill to win if already filled one spot of line
            let mergedStrategicOptions = mergeArrayOfArrays(strategicStartingOptions);

            //all open lines of 3 to win
            let mergedOpenWinLines = mergeArrayOfArrays(allOpenWinLines);
            let mostVersatile = findMostCommon(mergedOpenWinLines);


            //find spaces that will guide other team to win
            let blacklist = [];
            for (let k = 0; k < winPossibilities.length; k++) {
                let openSpaces = findOpenSpaces(winPossibilities[k], team.marks, otherTeam.marks);
                if (team.count[k].length && openSpaces.length > 1) {
                    for (let j = 0; j < openSpaces.length; j++) {
                        let otherOpenSpace = openSpaces.filter(item => item !== openSpaces[j]);
                        if (otherOpenSpace.some(item => repeatOpponentSpots.includes(item))) {
                            blacklist.push(openSpaces[j]);
                        }
                    }
                }
            }
            
            //filtered array of spots opponent can use to win
            mergedOpponentSpots = removeBlacklisted(mergedOpponentSpots, blacklist);

            //not really most optimal
            //filtered array of spots effective on both offense and defense
            mostOptimal = removeBlacklisted(mostOptimal, blacklist);
            console.log(mostOptimal);

            //filtered array of spots bot can fill to win if already filled one spot of line
            mergedStrategicOptions = removeBlacklisted(mergedStrategicOptions, blacklist);
            
            //spots in lines bot is already started on that share another possible win line
            let strategicOptionsWithMutual = findSharedItems(mergedStrategicOptions, mergedOpenWinLines);

            //^^but also serve as defense
            let maxOptimal = findSharedItems(strategicOptionsWithMutual, mostOptimal);
            console.log(maxOptimal);

            let ultraMaxOptimal = findSharedItems(maxOptimal, mostVersatile);


            let choice;
            // HERE IS ORIGINAL CODE THAT WAS TOO EXPLICIT / NOT FUN
            ///////////////////////////////////////////////////
            // if (allOpenSpaces.includes(4)) {
            //     choice = 4; 
            // } else if (otherTeam.marks.includes(4) && openCorners.length) {
            //     choice = arrayRandom(openCorners);
            // } else if ((otherTeam.marks.includes(0) && otherTeam.marks.includes(8)) ||
            //     (otherTeam.marks.includes(2) && otherTeam.marks.includes(6))) {
            //     choice = arrayRandom(openMiddles); }
            ///////////////////////////////////////////////////
            if (allOpenSpaces.length === 9) {
                choice = arrayRandom(allOpenSpaces);
            } else if (repeatOpponentSpots.length) {
                let direDefense = findMostCommon(mergedOpponentSpots);
                let benefit = findSharedItems(direDefense, offAndDef);
                if (benefit.length) {
                    choice = arrayRandom(benefit);
                } else {
                    choice = arrayRandom(direDefense);
                }
            } else if (ultraMaxOptimal.length) {
                choice = arrayRandom(ultraMaxOptimal);
            } else if (maxOptimal.length) {
                choice = arrayRandom(maxOptimal);
            } else if (strategicOptionsWithMutual.length) {
                choice = arrayRandom(strategicOptionsWithMutual);
            } else if (mostOptimal.length) {
                choice = arrayRandom(mostOptimal);
            } else if (mergedStrategicOptions.length) {
                choice = arrayRandom(mergedStrategicOptions);
            }
            else {
                let strategy = mergeArrayOfArrays(allOpenWinLines);
                let bestSpots = findMostCommon(strategy);
                if (bestSpots.length) {
                    // let doubleStrategy = findSharedItems(mergedOpponentSpots, bestSpots);
                    // if (doubleStrategy.length) {
                    //     choice = arrayRandom(doubleStrategy);
                    // } else {
                    //temp
                    choice = arrayRandom(bestSpots);
                    // }
                } else {
                    choice = arrayRandom(allOpenSpaces);
                }
            }
            options.push([choice]);
        }
        return options;
    }

    function arrayRandom(array) {
        let randomItem = array[Math.floor(Math.random() * array.length)];
        return randomItem;
    }

    function findOpenSpaces(spacesForWin, spacesWeUse, spacesOppUses) {
        let openSpaces = [];
        for (let t = 0; t < spacesForWin.length; t++) {
            if (!spacesWeUse.includes(spacesForWin[t]) &&
                !spacesOppUses.includes(spacesForWin[t])) {
                openSpaces.push(spacesForWin[t])
            }
        }
        return openSpaces;
    }

    function findMostCommon(array) {
        let highestCount = 0;
        let mostCommon = array.reduce((a, b) => {
            let count = 0;
            if (!a.includes(b)) {
                for (spot of array) {
                    if (b === spot) {
                        count++;
                    }
                }
                if (count > highestCount) {
                    highestCount = count;
                    if (!a.length) {
                        a.push(b);
                    } else {
                        a = [];
                        a.push(b);
                    }
                } else if (count === highestCount) {
                    a.push(b);
                }
            }
            return a;
        }, []);
        return mostCommon;
    }

    function hasRepeat(array) {
        let repeats = 0;
        for (let i = 0; i < array.length; i++) {
            let count = 0;
            for (let p = 0; p < array.length; p++) {
                if (array[p] === array[i]) {
                    count++;
                }
            }
            if (count > 1) {
                repeats++;
            }
        }
        return repeats > 0 ? 1 : 0
    }

    function findRepeatItems(array) {
        let repeatItems = [];
        for (let i = 0; i < array.length; i++) {
            let count = 0;
            for (let p = 0; p < array.length; p++) {
                if (array[p] === array[i]) {
                    count++;
                }
            }
            if (count > 1 && !repeatItems.includes(array[i])) {
                repeatItems.push(array[i]);
            }
        }
        return repeatItems;
    }

    function mergeArrayOfArrays(array) {
        let merged = array.reduce((a, b) => a.concat(b), []);
        return merged;
    }

    function findSharedItems(array1, array2) {
        let shared = [];
        for (let i = 0; i < array1.length; i++) {
            if (array2.includes(array1[i])) {
                shared.push(array1[i]);
            }
        }
        return shared;
    }

    function removeBlacklisted(array, blacklist) {
        let newArray = []
        for (let i = 0; i < array.length; i++) {
            if (!blacklist.includes(array[i])) {
                newArray.push(array[i]);
            }
        }
        return newArray;
    }

    return { computerMove };
})();

const endGame = (function () {
    let botTurn = false;
    const shoutOut = document.createElement('div');
    shoutOut.innerText = '@fiufiu win!'
    shoutOut.classList.add('shout-out');
    start.board.appendChild(shoutOut);
    const cellContainer = document.querySelector('.cell-container');
    const winDisplay = document.querySelector('.message');
    const winningCharacter = document.querySelector('.winning-character');
    const buttonDisplay = document.querySelector('.buttons')
    const buttonContainer = document.createElement('div');
    const playAgainButton = document.createElement('button');
    playAgainButton.addEventListener('click', reset);
    playAgainButton.textContent = 'Play Again';
    const characterSelectButton = document.createElement('button');
    characterSelectButton.addEventListener('click', () => {
        location.reload();
    })
    characterSelectButton.textContent = 'Character Select';
    buttonContainer.append(characterSelectButton, playAgainButton);
    const winPossibilities = [[0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 4, 8], [2, 4, 6]];
    let strike;

    function checkForWin(team) {
        checkForWin.won = false;
        if (gameBoard.teamX.marks.length + gameBoard.teamO.marks.length === 9) {
            winDisplay.textContent = 'Draw!';
            checkForWin.won = true;
            buttonDisplay.appendChild(buttonContainer);
        }
        function isIncluded(currentValue) {
            return team.marks.includes(currentValue);
        }
        let winCount = 0;
        for (let i = 0; i < winPossibilities.length; i++) {
            let check = winPossibilities[i];
            if (check.every(isIncluded)) {
                if (i > 2) {
                    cellContainer.classList.add('rows');
                }
                strike = 'win' + i;
                cellContainer.classList.add(strike);
                checkForWin.won = true;
                winningCharacter.classList.add(team.character);
                winDisplay.textContent = `wins!`;
                buttonDisplay.appendChild(buttonContainer);
                winCount++;
            }
        }
        if (winCount > 1) {
            shoutOut.style.scale = '1';
        }
    }

    function reset() {
        shoutOut.style.scale = '0';
        buttonContainer.remove();
        winDisplay.textContent = "";
        winningCharacter.classList.remove("x", "o");
        cellContainer.classList.remove("rows");
        for (let i = 0; i < 8; i++) {
            let classS = "win" + i;
            cellContainer.classList.remove(classS);
        }
        checkForWin.won = false;
        gameBoard.cells.forEach((cell) => {
            cell.classList.remove("x", "o");
        })
        gameBoard.teamX.marks = [];
        gameBoard.teamO.marks = [];
        if (start.player2.bot) {
            botTurn = !botTurn;
            if (botTurn) {
                if (start.player1.char === "o") {
                    gameBoard.moveBot(gameBoard.teamX, gameBoard.teamO)
                } else {
                    gameBoard.moveBot(gameBoard.teamO, gameBoard.teamX);
                }
            }
        }
    }
    return { checkForWin, botTurn }
})();