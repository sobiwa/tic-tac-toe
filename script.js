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
    if (start.player1.char === "x") {
        teamX.player = "player1";
        teamO.player = "player2";
    } else {
        teamX.player = "player2";
        teamO.player = "player1";
    }
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
                console.log(place);
                if (cell.classList.contains('o') || cell.classList.contains('x')
                    || endGame.checkForWin.won) return
                //
                if (start.player2.bot) {
                    if (start.player1.char === "x") {
                        makeMarks(cell, teamX, place);
                        if (!endGame.checkForWin.won) {
                            let compMove = bot.computerMove(teamO, teamX);
                            cellArray[compMove[0][0]].classList.add('o');
                            teamO.marks.push(compMove[0][0]);
                            endGame.checkForWin(teamO);
                        }
                    } else {
                        makeMarks(cell, teamO, place);
                        if (!endGame.checkForWin.won) {
                            let compMove = bot.computerMove(teamX, teamO);
                            cellArray[compMove[0][0]].classList.add('x');
                            teamX.marks.push(compMove[0][0]);
                            endGame.checkForWin(teamX);
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

    function makeMarks(cell, team, place) {
        cell.classList.add(team.character);
        team.marks.push(place);
        endGame.checkForWin(team);
    }
    function switchTurns(team, oppTeam) {
        start.board.classList.remove(team.character);
        start.board.classList.add(oppTeam.character);
    }
    return { initializeGame, cells, teamX, teamO, }
})();

const bot = (function () {
    const spaces = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    const cornerSpaces = [0, 2, 6, 8];
    const middleSpaces = [1, 3, 5, 7];
    function computerMove(team, otherTeam) {
        let options = [];
        let strategicStartingOptions = [];
        let allOpenSpaces = findOpenSpaces(spaces, team.marks, otherTeam.marks);
        let openCorners = findOpenSpaces(cornerSpaces, team.marks, otherTeam.marks);
        let openMiddles = findOpenSpaces(middleSpaces, team.marks, otherTeam.marks);
        const winPossibilities = [[0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 4, 8], [2, 4, 6]];
        for (let i = 0; i < winPossibilities.length; i++) {
            let currentWinPossibility = winPossibilities[i];
            team.count[i] = [];
            otherTeam.count[i] = [];
            for (let o = 0; o < currentWinPossibility.length; o++) {
                for (let p = 0; p < team.marks.length; p++) {
                    if (team.marks[p] === currentWinPossibility[o]) {
                        team.count[i].push(currentWinPossibility[o]);
                    }
                }
                for (let q = 0; q < otherTeam.marks.length; q++) {
                    if (otherTeam.marks[q] === currentWinPossibility[o]) {
                        otherTeam.count[i].push(currentWinPossibility[o]);
                    }
                }
            }
        }
        win:
        for (let u = 0; u < winPossibilities.length; u++) {
            let openSpaces = findOpenSpaces(winPossibilities[u], team.marks, otherTeam.marks);
            if (team.count[u].length > 1) {
                if (openSpaces.length) {
                    options.unshift(openSpaces);
                    break win;
                }
            } else if (otherTeam.count[u].length > 1) {
                if (openSpaces.length) {
                    options.unshift(openSpaces);
                }
            } else if (openSpaces.length > 1 &&
                team.count[u].some(item => winPossibilities[u].includes(item))) {
                strategicStartingOptions.push(openSpaces);
            }
        }
        if (!options.length) {
            let choice;
            if (allOpenSpaces.includes(4)) {
                choice = 4;
            } else if (otherTeam.marks.includes(4) && openCorners.length) {
                choice = arrayRandom(openCorners);
            } else if ((otherTeam.marks.includes(0) && otherTeam.marks.includes(8)) ||
            (otherTeam.marks.includes(2) && otherTeam.marks.includes(6))) {
                choice = arrayRandom(openMiddles);
            } else if (strategicStartingOptions.length) {
                //selects an array from an array of arrays//
                let preChoice = arrayRandom(strategicStartingOptions);
                choice = arrayRandom(preChoice);
            }
            else {
                choice = arrayRandom(allOpenSpaces);
            }
            options.push([choice]);
        }
        function arrayRandom (array) {
            let randomItem = array[Math.floor(Math.random() * array.length)];
            return randomItem;
        }
        return options;
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
    return { computerMove };
})();

const endGame = (function () {
    const shoutOut = document.createElement('div');
    shoutOut.innerText = '@fiufiu win!'
    shoutOut.style.cssText = 'scale: 0; transition: 0.5s; position: absolute; width: 200px; bottom: 50px; right: 0; left: 0; margin-right: auto; margin-left: auto;';
    start.board.appendChild(shoutOut);
    const cellContainer = document.querySelector('.cell-container');
    const winDisplay = document.querySelector('.winDisplay');
    const buttonContainer = document.createElement('div');
    const playAgainButton = document.createElement('button');
    playAgainButton.addEventListener('click', reset);
    playAgainButton.textContent = 'Play Again';
    const characterSelectButton = document.createElement('button');
    characterSelectButton.addEventListener('click', () => {
        location.reload();
    })
    characterSelectButton.textContent = 'Character Select';
    buttonContainer.append(playAgainButton, characterSelectButton);
    const winPossibilities = [[0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 4, 8], [2, 4, 6]];
    let strike;

    function checkForWin(team) {
        checkForWin.won = false;
        if (gameBoard.teamX.marks.length + gameBoard.teamO.marks.length === 9) {
            winDisplay.textContent = 'Draw!';
            checkForWin.won = true;
            winDisplay.appendChild(buttonContainer);
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
                winDisplay.textContent = `${team.character.toUpperCase()} wins!`;
                winDisplay.appendChild(buttonContainer);
                winCount++;
            }
            if (winCount > 1) {
                shoutOut.style.scale = '1';
            }
        }
    }

    function reset() {
        shoutOut.style.scale = '0';
        buttonContainer.remove();
        winDisplay.textContent = "";
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
    }
    return { checkForWin }
})();