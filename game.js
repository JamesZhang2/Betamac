function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Game state
let operations = [];
let score = 0;
let currentProblem;
let timeLeft = 0;
let timerId;
let currentProblemStart;
let stats = [];

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

const showTimer = document.getElementById('show-timer');
const showScore = document.getElementById('show-score');
const timerInGameDiv = document.getElementById('timer-in-game');
const scoreInGameDiv = document.getElementById('score-in-game');

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

function parseSettings() {
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
    // Note that this is an en-dash, not the same character as the hyphen-minus sign on the keyboard!
    if (subBox.checked) operations.push('–');
    if (mulBox.checked) operations.push('×');
    if (divBox.checked) operations.push('÷');

    if (operations.length === 0) {
        alert("Select at least one operation!");
        return;
    }

    // TODO: Add range checks for add/mul ranges and time

    if (showTimer.checked) {
        timerInGameDiv.style.visibility = 'visible';
    } else {
        timerInGameDiv.style.visibility = 'hidden';
    }

    if (showScore.checked) {
        scoreInGameDiv.style.visibility = 'visible';
    } else {
        scoreInGameDiv.style.visibility = 'hidden';
    }
}

function runGame() {
    score = 0;
    scoreText.textContent = score;
    timeLeft = parseInt(timeLimitInput.value);
    document.getElementById('time').textContent = timeLeft;

    stats = [];

    answerInput.value = "";
    answerInput.focus();
    nextProblem();

    timerId = setInterval(() => {
        timeLeft--;
        document.getElementById('time').textContent = timeLeft;
        if (timeLeft <= 0) endGame();
    }, 1000);
}

document.getElementById('start-btn').onclick = () => {
    parseSettings();
    document.getElementById('settings').style.display = 'none';
    document.getElementById('game').style.display = 'block';
    runGame();
};

function generateProblem() {
    const op = operations[Math.floor(Math.random() * operations.length)];
    let a, b;

    switch (op) {
        case '+':
            a = rand(addRange1, addRange2);
            b = rand(addRange3, addRange4);
            return { first: a, op: "+", second: b, answer: a + b };
        case '–':
            a = rand(addRange1, addRange2);
            b = rand(addRange3, addRange4);
            return { first: a + b, op: "–", second: a, answer: b };
        case '×':
            a = rand(mulRange1, mulRange2);
            b = rand(mulRange3, mulRange4);
            return { first: a, op: "×", second: b, answer: a * b };
        case '÷':
            a = rand(mulRange1, mulRange2);
            b = rand(mulRange3, mulRange4);
            return { first: a * b, op: "÷", second: a, answer: b };
    }
}

function nextProblem() {
    currentProblem = generateProblem();
    currentProblemStart = Date.now();
    problemText.textContent = currentProblem.first + " " + currentProblem.op + " " + currentProblem.second + " = ";
}

function handleCorrectAnswer() {
    // TODO Track backspace stats
    score++;
    scoreText.textContent = score;
    answerInput.value = "";
    const currentProblemEnd = Date.now();
    stats.push({ problem: currentProblem, time: currentProblemEnd - currentProblemStart });
    nextProblem();
}

// Stats
function statsToCSV(stats) {
    csv = "first,op,second,answer,time\n";
    for (const stat of stats) {
        csv += stat.problem.first + "," + stat.problem.op + "," + stat.problem.second + "," + stat.problem.answer + "," + stat.time + "\n";
    }
    return csv;
}

document.getElementById("copy-to-clipboard-btn").addEventListener("click", () => {
    const text = statsToCSV(stats);
    navigator.clipboard.writeText(text)
        // .then(() => alert("Copied to clipboard!"))
        .catch(err => alert("Error copying: " + err));
});

document.getElementById("download-btn").addEventListener("click", () => {
    const text = statsToCSV(stats);
    // Create Blob for download
    const blob = new Blob([text], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    const now = Date.now()
    a.download = "arithmetic_game_results.csv";
    a.click();

    URL.revokeObjectURL(url);
});

function showAnalytics(stats) {
    const opStats = {
        "+": { count: 0, totalTime: 0 },
        "–": { count: 0, totalTime: 0 },
        "×": { count: 0, totalTime: 0 },
        "÷": { count: 0, totalTime: 0 }
    };
    for (const stat of stats) {
        if (!["+", "–", "×", "÷"].includes(stat.problem.op)) {
            throw new Error("Unrecognized operation: " + stat.problem.op);
        }
        opStats[stat.problem.op].count++;
        opStats[stat.problem.op].totalTime += stat.time;
    }

    const tbody = document.querySelector("#analytics-table tbody");
    tbody.innerHTML = "";

    for (const op of ["+", "–", "×", "÷"]) {
        const data = opStats[op];

        // skip operations that did not appear
        if (data.count === 0) continue;

        const avg = (data.totalTime / data.count).toFixed(1);

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${op}</td>
            <td>${data.count}</td>
            <td>${avg}</td>
        `;
        tbody.appendChild(tr);
    }
}

// End game
function endGame() {
    clearInterval(timerId);
    document.getElementById('settings').style.display = 'none';
    document.getElementById('game').style.display = 'none';
    document.getElementById('stats').style.display = 'block';
    document.getElementById('final-score').textContent = score;
    document.getElementById("per-question-stats-box").value = statsToCSV(stats);
    showAnalytics(stats);
}

function playAgain() {
    clearInterval(timerId)
    document.getElementById('settings').style.display = 'none';
    document.getElementById('game').style.display = 'block';
    document.getElementById('stats').style.display = 'none';
    runGame();
}

function changeSettings() {
    clearInterval(timerId)
    document.getElementById('settings').style.display = 'block';
    document.getElementById('game').style.display = 'none';
    document.getElementById('stats').style.display = 'none';
}

document.getElementById('reset-btn').onclick = () => {
    playAgain();
}

document.getElementById('in-game-change-settings-btn').onclick = () => {
    changeSettings();
}

document.getElementById('play-again-btn').onclick = () => {
    playAgain();
}

document.getElementById('change-settings-btn').onclick = () => {
    changeSettings();
}
