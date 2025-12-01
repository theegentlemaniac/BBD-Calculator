const expressionDisplay = document.getElementById("expressionDisplay") as HTMLElement;
const resultDisplay = document.getElementById("resultDisplay") as HTMLElement;

let expressionTokens: string[] = [];
let currentInput = "";
let accumulator: number | null = null;
let pendingOperator: string | null = null;
let lastExpressionText: string | null = null;
let lastResult: number | null = null;
let justEvaluated = false;

const operators = new Set(["+", "-", "*", "/", "^"]);

function formatNumber(value: number): string {
    const rounded = parseFloat(value.toFixed(10));
    if (!Number.isFinite(rounded)) {
        return "Error";
    }
    return rounded.toString();
}

function updateDisplay() {
    const activeExpression = justEvaluated && lastExpressionText
        ? lastExpressionText
        : buildActiveExpression();

    expressionDisplay.textContent = activeExpression || "0";

    if (justEvaluated && lastResult !== null) {
        resultDisplay.textContent = formatNumber(lastResult);
        return;
    }

    if (currentInput !== "") {
        resultDisplay.textContent = currentInput;
    } else if (accumulator !== null) {
        resultDisplay.textContent = formatNumber(accumulator);
    } else {
        resultDisplay.textContent = "0";
    }
}

function buildActiveExpression(): string {
    const tokens = [...expressionTokens];
    if (currentInput) {
        tokens.push(currentInput);
    }
    return tokens.join(" ").trim();
}

function clearStateAfterEvaluation() {
    if (!justEvaluated) {
        return;
    }
    expressionTokens = [];
    pendingOperator = null;
    accumulator = null;
    lastExpressionText = null;
    justEvaluated = false;
}

function handleNumber(num: string) {
    clearStateAfterEvaluation();

    if (num === "." && currentInput.includes(".")) {
        return;
    }

    if (currentInput === "0" && num !== ".") {
        currentInput = num;
    } else {
        currentInput += num;
    }

    updateDisplay();
}

function performOperation(a: number, b: number, op: string): number {
    switch (op) {
        case "+": return a + b;
        case "-": return a - b;
        case "*": return a * b;
        case "/": return a / b;
        case "^": return Math.pow(a, b);
        default: return b;
    }
}

function handleOperator(op: string) {
    if (justEvaluated) {
        expressionTokens = currentInput ? [currentInput] : [];
        pendingOperator = null;
        accumulator = currentInput ? parseFloat(currentInput) : null;
        justEvaluated = false;
        lastExpressionText = null;
    }

    if (currentInput === "" && accumulator === null) {
        return;
    }

    if (currentInput !== "") {
        const numericInput = parseFloat(currentInput);
        if (isNaN(numericInput)) {
            return;
        }

        if (accumulator === null) {
            accumulator = numericInput;
        } else if (pendingOperator) {
            accumulator = performOperation(accumulator, numericInput, pendingOperator);
        }

        expressionTokens.push(currentInput);
        currentInput = "";
        lastResult = accumulator;
    }

    pendingOperator = op;

    if (expressionTokens.length === 0 && accumulator !== null) {
        expressionTokens.push(formatNumber(accumulator));
    }

    const lastToken = expressionTokens[expressionTokens.length - 1];
    if (operators.has(lastToken)) {
        expressionTokens[expressionTokens.length - 1] = op;
    } else {
        expressionTokens.push(op);
    }

    updateDisplay();
}

function calculate() {
    if (pendingOperator === null || accumulator === null || currentInput === "") {
        return;
    }

    const numericInput = parseFloat(currentInput);
    if (isNaN(numericInput)) {
        return;
    }

    expressionTokens.push(currentInput);
    const expressionText = `${expressionTokens.join(" ")} =`;
    const result = performOperation(accumulator, numericInput, pendingOperator);

    lastResult = result;
    lastExpressionText = expressionText;
    expressionTokens = [];
    currentInput = formatNumber(result);
    accumulator = null;
    pendingOperator = null;
    justEvaluated = true;

    updateDisplay();
}

function clearAll() {
    expressionTokens = [];
    currentInput = "";
    accumulator = null;
    pendingOperator = null;
    lastExpressionText = null;
    lastResult = null;
    justEvaluated = false;
    updateDisplay();
}

function degreesToRadians(value: number): number {
    return (value * Math.PI) / 180;
}

function scientific(fn: string) {
    if (currentInput === "" && lastResult !== null && !justEvaluated) {
        currentInput = formatNumber(lastResult);
    }

    const sourceValue = currentInput !== ""
        ? parseFloat(currentInput)
        : lastResult ?? accumulator;

    if (sourceValue === null || isNaN(sourceValue)) {
        return;
    }

    let result = 0;
    let label = "";

    switch (fn) {
        case "square":
            result = sourceValue * sourceValue;
            label = `square(${formatNumber(sourceValue)})`;
            break;
        case "root":
            result = Math.sqrt(sourceValue);
            label = `sqrt(${formatNumber(sourceValue)})`;
            break;
        case "log":
            result = Math.log10(sourceValue);
            label = `log(${formatNumber(sourceValue)})`;
            break;
        case "sin":
            result = Math.sin(degreesToRadians(sourceValue));
            label = `sin(${formatNumber(sourceValue)})`;
            break;
        case "cos":
            result = Math.cos(degreesToRadians(sourceValue));
            label = `cos(${formatNumber(sourceValue)})`;
            break;
        case "tan":
            result = Math.tan(degreesToRadians(sourceValue));
            label = `tan(${formatNumber(sourceValue)})`;
            break;
        case "power":
            if (currentInput === "") {
                currentInput = formatNumber(sourceValue);
            }
            handleOperator("^");
            return;
        default:
            return;
    }

    if (!Number.isFinite(result)) {
        resultDisplay.textContent = "Error";
        expressionDisplay.textContent = label;
        return;
    }

    lastResult = result;
    lastExpressionText = label;
    expressionTokens = [];
    currentInput = formatNumber(result);
    accumulator = null;
    pendingOperator = null;
    justEvaluated = true;

    updateDisplay();
}

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

document.addEventListener("keydown", (event) => {
    const { key } = event;

    if (!isNaN(Number(key)) || key === ".") {
        handleNumber(key);
        return;
    }

    if (operators.has(key)) {
        handleOperator(key);
        return;
    }

    if (key === "Enter") {
        event.preventDefault();
        calculate();
    }

    if (key === "Backspace") {
        if (currentInput !== "") {
            currentInput = currentInput.slice(0, -1);
        }
        updateDisplay();
    }

    if (key === "Escape") {
        clearAll();
    }
});

clearAll();
