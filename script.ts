const expressionDisplay = document.getElementById("expressionDisplay") as HTMLElement;
const resultDisplay = document.getElementById("resultDisplay") as HTMLElement;

let expressionText = "";
let lastAnswer = "0";
let resetOnNumber = false;

const negativePattern = /\(-([0-9.]+)\)$/;
const positivePattern = /([0-9.]+)$/;

const operators = new Set(["+", "-", "*", "/", "^"]);

function formatNumber(value: number): string {
    const rounded = Number(value.toFixed(10));
    return Number.isFinite(rounded) ? rounded.toString() : "Error";
}

function updateDisplays() {
    const expression = expressionText || "0";
    expressionDisplay.textContent = expression;
    if (resetOnNumber) {
        resultDisplay.textContent = lastAnswer;
    } else {
        resultDisplay.textContent = expression;
    }
}

function clearAll() {
    expressionText = "";
    lastAnswer = "0";
    resetOnNumber = false;
    expressionDisplay.textContent = "0";
    resultDisplay.textContent = "0";
}

function appendCharacter(char: string) {
    if (!char) {
        return;
    }
    if (resetOnNumber) {
        expressionText = "";
        resetOnNumber = false;
    }
    expressionText += char;
    updateDisplays();
}

function appendOperator(op: string) {
    if (!operators.has(op)) {
        return;
    }

    if (expressionText === "" && lastAnswer !== "0") {
        expressionText = lastAnswer;
    }

    if (expressionText === "" && op !== "-") {
        return;
    }

    const trimmed = expressionText.trim();
    const lastChar = trimmed.slice(-1);
    if (operators.has(lastChar) && op !== "-") {
        expressionText = `${trimmed.slice(0, -1)}${op}`;
    } else {
        expressionText += op;
    }

    resetOnNumber = false;
    updateDisplays();
}

function removeLastCharacter() {
    if (resetOnNumber) {
        resetOnNumber = false;
    }
    expressionText = expressionText.slice(0, -1);
    updateDisplays();
}

function toggleNegative() {
    if (resetOnNumber) {
        expressionText = "";
        resetOnNumber = false;
    }

    if (expressionText === "") {
        expressionText = "-";
        updateDisplays();
        return;
    }

    if (negativePattern.test(expressionText)) {
        expressionText = expressionText.replace(negativePattern, (_: string, captured: string) => captured);
        updateDisplays();
        return;
    }

    if (positivePattern.test(expressionText)) {
        expressionText = expressionText.replace(positivePattern, (_: string, captured: string) => `(-${captured})`);
        updateDisplays();
        return;
    }

    expressionText += "(-";
    updateDisplays();
}

function prepareExpression(expr: string): string | null {
    const trimmed = expr.trim();
    if (trimmed === "") {
        return null;
    }
    const stripped = trimmed.replace(/\s+/g, "");
    if (!/^[0-9()+\-*/.^]+$/.test(stripped)) {
        return null;
    }
    return trimmed.replace(/\^/g, "**");
}

function evaluateExpression(expr: string): number | null {
    const prepared = prepareExpression(expr);
    if (!prepared) {
        return null;
    }
    try {
        const value = Function(`return (${prepared});`)();
        return Number.isFinite(value) ? Number(value) : null;
    } catch {
        return null;
    }
}

function showError() {
    resultDisplay.textContent = "Error";
    resetOnNumber = true;
}

function handleEquals() {
    const trimmed = expressionText.trim();
    if (trimmed === "") {
        return;
    }

    const result = evaluateExpression(trimmed);
    if (result === null) {
        showError();
        return;
    }

    lastAnswer = formatNumber(result);
    expressionDisplay.textContent = `${trimmed} =`;
    resultDisplay.textContent = lastAnswer;
    expressionText = lastAnswer;
    resetOnNumber = true;
}

function degreesToRadians(value: number): number {
    return (value * Math.PI) / 180;
}

function currentValue(): number | null {
    if (expressionText.trim() !== "") {
        const evaluated = evaluateExpression(expressionText);
        if (evaluated !== null) {
            return evaluated;
        }
    }
    const parsed = parseFloat(lastAnswer);
    return Number.isFinite(parsed) ? parsed : null;
}

function handleScientific(fn: string) {
    if (fn === "power") {
        appendOperator("^");
        return;
    }

    const value = currentValue();
    if (value === null) {
        showError();
        return;
    }

    let result = 0;
    let label = "";

    switch (fn) {
        case "square":
            result = value * value;
            label = `square(${formatNumber(value)})`;
            break;
        case "root":
            result = Math.sqrt(value);
            label = `sqrt(${formatNumber(value)})`;
            break;
        case "log":
            result = Math.log10(value);
            label = `log(${formatNumber(value)})`;
            break;
        case "sin":
            result = Math.sin(degreesToRadians(value));
            label = `sin(${formatNumber(value)})`;
            break;
        case "cos":
            result = Math.cos(degreesToRadians(value));
            label = `cos(${formatNumber(value)})`;
            break;
        case "tan":
            result = Math.tan(degreesToRadians(value));
            label = `tan(${formatNumber(value)})`;
            break;
        case "fraction":
            if (value === 0) {
                showError();
                return;
            }
            result = 1 / value;
            label = `1/(${formatNumber(value)})`;
            break;
        default:
            return;
    }

    if (!Number.isFinite(result)) {
        showError();
        return;
    }

    lastAnswer = formatNumber(result);
    expressionDisplay.textContent = `${label} =`;
    resultDisplay.textContent = lastAnswer;
    expressionText = lastAnswer;
    resetOnNumber = true;
}

document.querySelectorAll(".btn").forEach(btn => {
    btn.addEventListener("click", () => {
        appendCharacter((btn as HTMLElement).dataset.num ?? "");
    });
});

document.querySelectorAll(".op").forEach(btn => {
    btn.addEventListener("click", () => {
        appendOperator((btn as HTMLElement).dataset.op ?? "");
    });
});

document.getElementById("equals")?.addEventListener("click", handleEquals);
document.getElementById("clear")?.addEventListener("click", clearAll);
document.getElementById("negative")?.addEventListener("click", toggleNegative);

document.querySelectorAll(".sci").forEach(btn => {
    btn.addEventListener("click", () => {
        handleScientific((btn as HTMLElement).dataset.fn ?? "");
    });
});

document.addEventListener("keydown", (event) => {
    const { key } = event;

    if (!isNaN(Number(key)) || key === "." || key === "(" || key === ")") {
        appendCharacter(key);
        return;
    }

    if (operators.has(key)) {
        event.preventDefault();
        appendOperator(key);
        return;
    }

    if (key === "Enter") {
        event.preventDefault();
        handleEquals();
        return;
    }

    if (key === "Backspace") {
        event.preventDefault();
        removeLastCharacter();
        return;
    }

    if (key === "Escape") {
        clearAll();
    }
});

clearAll();
