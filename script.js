var _a, _b;
var display = document.getElementById("display");
var inputValue = "";
var operator = null;
var firstNumber = null;
// NUMBER BUTTONS
document.querySelectorAll(".btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
        var v = btn.dataset.num;
        inputValue += v;
        display.value = inputValue;
    });
});
// OPERATORS
document.querySelectorAll(".op").forEach(function (op) {
    op.addEventListener("click", function () {
        if (inputValue === "")
            return;
        firstNumber = parseFloat(inputValue);
        operator = op.dataset.op;
        inputValue = "";
        display.value = "";
    });
});
// EQUALS
(_a = document.getElementById("equals")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", function () {
    if (!operator || firstNumber === null || inputValue === "")
        return;
    var second = parseFloat(inputValue);
    var result = 0;
    switch (operator) {
        case "+":
            result = firstNumber + second;
            break;
        case "-":
            result = firstNumber - second;
            break;
        case "*":
            result = firstNumber * second;
            break;
        case "/":
            result = firstNumber / second;
            break;
        case "^":
            result = Math.pow(firstNumber, second);
            break;
    }
    display.value = result.toString();
    inputValue = result.toString();
    firstNumber = null;
    operator = null;
});
// CLEAR
(_b = document.getElementById("clear")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", function () {
    display.value = "";
    inputValue = "";
    firstNumber = null;
    operator = null;
});
// SCIENTIFIC FUNCTIONS
document.querySelectorAll(".sci").forEach(function (btn) {
    btn.addEventListener("click", function () {
        var fn = btn.dataset.fn;
        var num = parseFloat(display.value);
        if (isNaN(num))
            return;
        var result = 0;
        switch (fn) {
            case "square":
                result = num * num;
                break;
            case "root":
                result = Math.sqrt(num);
                break;
            case "sin":
                result = Math.sin(num);
                break;
            case "cos":
                result = Math.cos(num);
                break;
            case "tan":
                result = Math.tan(num);
                break;
            case "log":
                result = Math.log10(num);
                break;
            case "power":
                firstNumber = num;
                operator = "^";
                inputValue = "";
                display.value = "";
                return;
        }
        display.value = result.toString();
        inputValue = result.toString();
    });
});
