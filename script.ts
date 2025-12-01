const display = document.getElementById("display") as HTMLInputElement;

let expression: string = ""; // what is shown on screen
let firstNumber: number | null = null;
let operator: string | null = null;
let waitingForSecond: boolean = false;

// --------------------------
// Helper to refresh display
// --------------------------
function updateDisplay() {
    display.value = expression;
}

// --------------------------
// Handle number input
// --------------------------
function handleNumber(num: string) {
    expression += num;
    updateDisplay();
}

// --------------------------
// Handle operator input
// --------------------------
function handleOperator(op: string) {
    if (expression === "") return;

    if (!waitingForSecond) {
        firstNumber = parseFloat(expression);
        operator = op;
        expression += " " + op + " ";
        waitingForSecond = true;
    } else {
        // replaces operator if user changes mind
        expression = expression.slice(0, -3) + ` ${op} `;
        operator = op;
    }

    updateDisplay();
}

// --------------------------
// Evaluate expression
// --------------------------
function calculate() {
    if (!operator || firstNumber === null) return;

    const parts = expression.split(" ");
    const secondNumber = parseFloat(parts[2]);

    if (isNaN(secondNumber)) return;

    let result = 0;

    switch (operator) {
        case "+": result = firstNumber + secondNumber; break;
        case "-": result = firstNumber - secondNumber; break;
        case "*": result = firstNumber * secondNumber; break;
        case "/": result = firstNumber / secondNumber; break;
        case "^": result = Math.pow(firstNumber, secondNumber); break;
    }

    expression = result.toString();
    firstNumber = null;
    operator = null;
    waitingForSecond = false;

    updateDisplay();
}

// --------------------------
// Clear
// --------------------------
function clearAll() {
    expression = "";
    firstNumber = null;
    operator = null;
    waitingForSecond = false;
    updateDisplay();
}

// --------------------------
// Scientific functions
// --------------------------
function scientific(fn: string) {
    const num = parseFloat(expression);
    if (isNaN(num)) return;

    let result = 0;

    switch (fn) {
        case "square": result = num * num; break;
        case "root": result = Math.sqrt(num); break;
        case "log": result = Math.log10(num); break;
        case "sin": result = Math.sin(num); break;
        case "cos": result = Math.cos(num); break;
        case "tan": result = Math.tan(num); break;
        case "power":
            firstNumber = num;
            operator = "^";
            expression += " ^ ";
            waitingForSecond = true;
            updateDisplay();
            return;
    }

    expression = result.toString();
    updateDisplay();
}

// --------------------------
// Button listeners
// --------------------------
document.querySelectorAll(".btn").forEach(btn => {
    btn.addEventListener("click", () => {
        handleNumber((btn as HTMLElement).dataset.num!);
    });
});

document.querySelectorAll(".op").forEach(btn => {
    btn.addEventListener("click", () => {
        handleOperator((btn as HTMLElement).dataset.op!);
    });
});

document.getElementById("equals")?.addEventListener("click", calculate);
document.getElementById("clear")?.addEventListener("click", clearAll);

document.querySelectorAll(".sci").forEach(btn => {
    btn.addEventListener("click", () => {
        scientific((btn as HTMLElement).dataset.fn!);
    });
});

// --------------------------
// Keyboard Support
// --------------------------
document.addEventListener("keydown", (e) => {
    const key = e.key;

    if (!isNaN(Number(key))) {
        handleNumber(key);
    }

    if (["+", "-", "*", "/"].includes(key)) {
        handleOperator(key);
    }

    if (key === "Enter") calculate();
    if (key === "Backspace") {
        expression = expression.slice(0, -1);
        updateDisplay();
    }
    if (key === "Escape") clearAll();
});
