function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Game state
let operations = [];
let score = 0;
let currentProblem;
let timeLeft = 0;
let timerId;

const addBox = document.getElementById('add');
const subBox = document.getElementById('sub');
const mulBox = document.getElementById('mul');
const divBox = document.getElementById('div');
const addRange1Input = document.getElementById('add-range-1');
const addRange2Input = document.getElementById('add-range-2');
const addRange3Input = document.getElementById('add-range-3');
const addRange4Input = document.getElementById('add-range-4');
const mulRange1Input = document.getElementById('mul-range-1');
const mulRange2Input = document.getElementById('mul-range-2');
const mulRange3Input = document.getElementById('mul-range-3');
const mulRange4Input = document.getElementById('mul-range-4');
const timeLimitInput = document.getElementById('time-limit');
const answerInput = document.getElementById('answer');
const scoreText = document.getElementById('score');
const problemText = document.getElementById('problem');

answerInput.addEventListener('input', () => {
    const value = answerInput.value.trim();

    // If not a valid number yet, do nothing
    if (!/^-?\d+$/.test(value)) return;

    const userAns = Number(value);

    // Only proceed if fully correct
    if (userAns === currentProblem.answer) {
        handleCorrectAnswer();
    }
});

let addRange1, addRange2, addRange3, addRange4;
let mulRange1, mulRange2, mulRange3, mulRange4;

document.getElementById('start-btn').onclick = () => {
    addRange1 = parseInt(addRange1Input.value);
    addRange2 = parseInt(addRange2Input.value);
    addRange3 = parseInt(addRange3Input.value);
    addRange4 = parseInt(addRange4Input.value);
    mulRange1 = parseInt(mulRange1Input.value);
    mulRange2 = parseInt(mulRange2Input.value);
    mulRange3 = parseInt(mulRange3Input.value);
    mulRange4 = parseInt(mulRange4Input.value);

    operations = [];
    if (addBox.checked) operations.push('+');
    if (subBox.checked) operations.push('-');
    if (mulBox.checked) operations.push('×');
    if (divBox.checked) operations.push('÷');

    if (operations.length === 0) {
        alert("Select at least one operation!");
        return;
    }

    // TODO: Add range checks for add/mul ranges and time

    document.getElementById('settings').style.display = 'none';
    document.getElementById('game').style.display = 'block';

    timeLeft = parseInt(timeLimitInput.value);
    document.getElementById('time').textContent = timeLeft;

    nextProblem();

    timerId = setInterval(() => {
        timeLeft--;
        document.getElementById('time').textContent = timeLeft;
        if (timeLeft <= 0) endGame();
    }, 1000);
};

function generateProblem() {
    const op = operations[Math.floor(Math.random() * operations.length)];
    let a, b;

    switch (op) {
        case '+':
            a = rand(addRange1, addRange2);
            b = rand(addRange3, addRange4);
            return { text: `${a} + ${b} = `, answer: a + b, op: "+" };
        case '-':
            a = rand(addRange1, addRange2);
            b = rand(addRange3, addRange4);
            return { text: `${a + b} – ${a} = `, answer: b, op: "-" };
        case '×':
            a = rand(mulRange1, mulRange2);
            b = rand(mulRange3, mulRange4);
            return { text: `${a} × ${b} = `, answer: a * b, op: "×" };
        case '÷':
            a = rand(mulRange1, mulRange2);
            b = rand(mulRange3, mulRange4);
            return { text: `${a * b} ÷ ${a} = `, answer: b, op: "÷" };
    }
}

function nextProblem() {
    currentProblem = generateProblem();
    problemText.textContent = currentProblem.text;
}

function handleCorrectAnswer() {
    // TODO Track stats
    score++;
    scoreText.textContent = score;
    answerInput.value = "";
    nextProblem();
}

// End game
function endGame() {
    clearInterval(timerId);
    document.getElementById('game').style.display = 'none';
    document.getElementById('stats').style.display = 'block';
    document.getElementById('final-score').textContent = score;

    // TODO Implement Play Again and Change Settings
}
