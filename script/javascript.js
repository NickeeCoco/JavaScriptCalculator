
// Morgane Bentzinger - 261062953

/* CHANGE BACKGROUND COLOR */
document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
        // get the styles of the tab that was clicked
        const tabStyles = getComputedStyle(tab)
        // extract the background color
        const tabBackgroundColor = tabStyles.backgroundColor
        // apply it to the main
        document.querySelector(".main").style.backgroundColor = tabBackgroundColor
    })
})

/* CALCULATOR */

// DOM elements and styles
let body = document.querySelector("body")
let bodyStyles = getComputedStyle(body)
let fontSize = Number(bodyStyles.fontSize.slice(0, bodyStyles.fontSize.indexOf("p")))

let screen = document.querySelector(".screen")
let text = document.querySelector(".text")
let calculator = document.querySelector(".calculator")

let screenWidth = () => {
    let screenStyles = getComputedStyle(screen)
    let screenWidth = Number(screenStyles.width.slice(0, screenStyles.width.indexOf("p")))
    let screenPaddingLeft = Number(screenStyles.paddingLeft.slice(0, screenStyles.paddingLeft.indexOf("p")))
    let screenPaddingRight = Number(screenStyles.paddingRight.slice(0, screenStyles.paddingRight.indexOf("p")))
    return screenWidth - screenPaddingLeft - screenPaddingRight - fontSize
}

let textWidth = () => {
    let textStyles = getComputedStyle(text)
    return textStyles.width.slice(0, textStyles.width.indexOf("p"))
}
*
// to avoid double periods in same number input
let isPeriodAllowed = true

// to continue operation after pressing equals
let savedOperation = ""

// checks if a character is an operator
let isOperator = (character) => {
    switch (character) {
        case "+":
        case "-":
        case "/":
        case "x":
        case "%":
            return true
            break
        default:
            return false
    }
}

// checks if a character is a number
let isNumber = (character) => {
    switch (character) {
        case "0":
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
            return true
            break
        default:
            return false
    }
}

// convert operation into an array
function createOperationArray(operationString) {

    let operationArray = []
    // store all digits of a number before str
    let currentNumber = ""

    // divide screen output between numbers and operators
    for (let character in operationString) {
        let currentCharacter = operationString[character]

        if (isNumber(currentCharacter) || currentCharacter == ".") {
            currentNumber += currentCharacter
        }

        if (isOperator(currentCharacter)) {
            operationArray.push(currentNumber)
            currentNumber = ""
            operationArray.push(currentCharacter)
        }
    }

    // push last number to array and clear currentNumber value
    operationArray.push(currentNumber)
    currentNumber = ""

    return operationArray
}

// process operation array to get the result
function processOperation(operationArray) {
    let finalResult

    if (operationArray.length == 1) { // only one number in the array
        finalResult = Number(operationArray[0])
        return finalResult
    } else if (operationArray.length == 3) { // only one operation in the array
        let firstNumber = Number(operationArray[0])
        let secondNumber = Number(operationArray[2])
        let operator = operationArray[1]
        finalResult = calculate(firstNumber, secondNumber, operator)
        return finalResult
    } else {

        let firstPriorityArray = [] // stores array with first priority operations completed
        let previousOperation = false

        // manage x / % operations (from left to right)
        operationArray.forEach((element, index) => {
            switch (element) {
                case "+":
                case "-":
                    let previous = Number(operationArray[index - 1]) // value before the operator
                    let next = Number(operationArray[index + 1]) // value after the operator

                    if (previousOperation) {
                        firstPriorityArray.push(element)
                    } else {
                        firstPriorityArray.push(previous)
                        firstPriorityArray.push(element)
                    }
                    // last operation
                    if (index == operationArray.length - 2) {
                        firstPriorityArray.push(next)
                    }
                    previousOperation = false
                    break
                case "x":
                case "/":
                case "%":
                    let firstNumber
                    let secondNumber = operationArray[index + 1]
                    let operator = element
                    let pushIndex

                    if (previousOperation) {
                        firstNumber = firstPriorityArray[firstPriorityArray.length - 1]
                        pushIndex = firstPriorityArray.length - 1
                    } else {
                        firstNumber = operationArray[index - 1]
                        pushIndex = firstPriorityArray.length
                    }

                    let result = calculate(firstNumber, secondNumber, operator)
                    firstPriorityArray[pushIndex] = result
                    previousOperation = true
                    break
            }

        });

        // only multiplication, division or modulus
        if (firstPriorityArray.length == 1) {
            finalResult = firstPriorityArray[0]
            return finalResult
        }

        // manage + - operations (from left to right)
        firstPriorityArray.forEach((element, index) => {
            if (index == 0) {
                finalResult = element
            } else if (isOperator(element)) {
                finalResult = calculate(finalResult, firstPriorityArray[index + 1], element)
            }
        })

    }
    return finalResult
}

// make calculation
function calculate(num1, num2, operator) {
    switch (operator) {
        case "+":
            return num1 + num2
            break
        case "-":
            return num1 - num2
            break
        case "x":
            return num1 * num2
            break
        case "/":
            return num1 / num2
            break
        case "%":
            return num1 % num2
            break
    }
}

document.querySelectorAll(".btn").forEach(btn => {
    btn.addEventListener("click", () => {

        let lastChar = text.innerHTML[text.innerHTML.length - 1]

        if (screenWidth() > textWidth()) {
            // number button
            if (btn.classList.contains("number-btn")) {
                text.innerHTML += btn.innerHTML
                savedOperation = ""
            }

            // period button
            if (btn.classList.contains("period")) {
                if (text.innerHTML == "" || isOperator(lastChar)) {
                    text.innerHTML += "0."
                    isPeriodAllowed = false
                } else if (isNumber(lastChar)) {
                    if (isPeriodAllowed) {
                        text.innerHTML += btn.innerHTML
                        isPeriodAllowed = false
                    }
                }
            }

            // operator button
            if (btn.classList.contains("operator-btn")) {
                if (savedOperation != "") {
                    text.innerHTML = savedOperation + btn.innerHTML
                    savedOperation = ""
                } else if (text.innerHTML != "" && lastChar != "." && !isOperator(lastChar)) {
                    text.innerHTML += btn.innerHTML
                    isPeriodAllowed = true
                }
            }
        } else {
            if(btn.classList.contains("number-btn") || 
                btn.classList.contains("period") ||
                btn.classList.contains("operator-btn")) {
                    calculator.classList.add("shake")
                    setTimeout(() => {
                        alert("Sorry no more space for new input")
                        calculator.classList.remove("shake")
                    }, 500)
                }
        }

        // clear button
        if (btn.classList.contains("clear")) {
            text.innerHTML = "";
            isPeriodAllowed = true
        }

        // equals button
        if (btn.classList.contains("equals")) {
            if (isNumber(lastChar)) {
                savedOperation = text.innerHTML
                let operationArray = createOperationArray(text.innerHTML)
                let result = processOperation(operationArray)

                if (result % 1 == 0) {
                    text.innerHTML = result
                } else {
                    text.innerHTML = result.toFixed(2)
                }
                isPeriodAllowed = true
            }
        }
    })
})