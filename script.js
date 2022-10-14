/* 
Choose your character

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

// const createPlayer = (char) => {
//     return { char };
// }


const el = (selector) => document.querySelector(selector);

const startScreen = (function () {
    let player1 = {};
    let player2 = {};
    let players = 0;
    const board = el(".board");
    const xCharOne = el(".char.one");
    const oCharTwo = el(".char.two")
    const display = el(".start-screen");
    const textDisplay = el(".text-display");
    const cells = document.querySelectorAll(".cell");
    xCharOne.addEventListener("click", () => {
        createPlayer(1);
        players = 1;
        
    })
    oCharTwo.addEventListener("click", () => {
        createPlayer(2);
        players = 2;
    })

    const createPlayer = (players) => {
        if (players === 2) {
            textDisplay.textContent = `Player 1 \r\nChoose your character`;
        } else {
            textDisplay.textContent = `Choose your character`;
        }
        addCharSelectFunction(xCharOne, 'x');
        addCharSelectFunction(oCharTwo, 'o');

        function addCharSelectFunction(element, character) {
            element.textContent = "";
            element.classList.add(character);
            element.addEventListener("click", () => {
                if (players === 1) {
                    player1.char = character;
                    board.classList.add(character);
                    initializeGame();

                } else {
                    if (!player1.char) {
                        player1.char = character;
                        board.classList.add(character);
                        textDisplay.textContent = `Player 2 \r\nChoose your character`;
                        element.style.cssText = "opacity: 0.1; cursor: not-allowed";
                    } else {
                        player2.char = character;
                        initializeGame();
                    }
                }
            })
        }

        function initializeGame() {
            display.classList.add("hide");
            setTimeout(() => {
                display.remove();
            }, 300)
            cells.forEach((cell) => {
                cell.addEventListener('click', () => {
                    if (board.classList.contains('x')) {
                    cell.classList.add(`x`);
                    board.classList.remove('x');
                    board.classList.add('o');
                    } else if (board.classList.contains('o')) {
                        cell.classList.add('o');
                        board.classList.remove('x');
                        board.classList.add('o');
                    }

                })
            })
        }
    };
    return {player1, player2, players};
})();

const gameBoard = (function () {
    let p1 = startScreen.player1.char;
    if (startScreen.players === 2) { 
    let p2 = startScreen.player2;
    }
})();