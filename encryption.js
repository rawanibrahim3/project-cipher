const algorithmSelect = document.getElementById("algorithm");

const inputText = document.getElementById("plainText");

const outputText = document.getElementById("encryptedText");

const encryptBtn = document.getElementById("encryptBtn");

const copyBtn = document.getElementById("copyBtn");

const downloadBtn = document.getElementById("downloadBtn");

const clearBtn = document.getElementById("clearBtn");

const historyList = document.getElementById("historyList");

const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const keyGroups = {
    caesar: document.getElementById("caesar-key"),
    playfair: document.getElementById("playfair-key"),
    vigenere: document.getElementById("vigenere-key"),
    hill: document.getElementById("hill-key")
};

function updateKeyFields() {

    for (let group of Object.values(keyGroups)) {
        group.hidden = true;
    }

    keyGroups[algorithmSelect.value].hidden = false;
}

algorithmSelect.addEventListener("change", updateKeyFields);

updateKeyFields();

function caesarEncrypt(text, key) {
    let result = "";

    for (let char of text) {
        if (char.match(/[a-z]/i)) {
            let start = char === char.toUpperCase() ? 65 : 97;

            let newChar = String.fromCharCode(
                (char.charCodeAt(0) - start + key + 26) % 26 + start
            );

            result += newChar;
        } else {
            result += char;
        }
    }

    return result;
}
function createPlayfairMatrix(key) {
    let alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ";
    let letters = (key.toUpperCase() + alphabet)
        .replace(/J/g, "I");

    let uniqueLetters = "";

    for (let char of letters) {
        if (!uniqueLetters.includes(char) && /[A-Z]/.test(char)) {
            uniqueLetters += char;
        }
    }

    let matrix = [];

    for (let i = 0; i < 25; i += 5) {
        matrix.push(uniqueLetters.slice(i, i + 5).split(""));
    }

    return matrix;
}
function playfairEncrypt(text, key) {
    let matrix = createPlayfairMatrix(key);

    let cleanText = text.toUpperCase()
        .replace(/J/g, "I")
        .replace(/[^A-Z]/g, "");

    let pairs = [];

    for (let i = 0; i < cleanText.length; i += 2) {
        let first = cleanText[i];
        let second = cleanText[i + 1];

        if (second === undefined) {
            second = "X";
        }

        else if (first === second) {
            second = "X";
            i--;
        }

        pairs.push([first, second]);
    }

    let result = "";

    for (let pair of pairs) {
        let [a, b] = pair;

        let row1, col1, row2, col2;

        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                if (matrix[r][c] === a) {
                    row1 = r;
                    col1 = c;
                }

                if (matrix[r][c] === b) {
                    row2 = r;
                    col2 = c;
                }
            }
        }

        if (row1 === row2) {
            result += matrix[row1][(col1 + 1) % 5];
            result += matrix[row2][(col2 + 1) % 5];
        }

        else if (col1 === col2) {
            result += matrix[(row1 + 1) % 5][col1];
            result += matrix[(row2 + 1) % 5][col2];
        }

        else {
            result += matrix[row1][col2];
            result += matrix[row2][col1];
        }
    }

    return result;
}
function vigenereEncrypt(text, key) {
    let result = "";
    key = key.toUpperCase();

    let keyIndex = 0;

    for (let char of text) {
        if (/[a-z]/i.test(char)) {
            let shift = key.charCodeAt(keyIndex % key.length) - 65;

            let start = char === char.toUpperCase() ? 65 : 97;

            let newChar = String.fromCharCode(
                (char.charCodeAt(0) - start + shift) % 26 + start
            );

            result += newChar;
            keyIndex++;
        }

        else {
            result += char;
        }
    }

    return result;
}
function hillEncrypt(text, key) {
    let numbers = key.split(",").map(Number);

    if (numbers.length !== 4 || numbers.some(n => !Number.isInteger(n))) {
        throw new Error("Enter 4 numbers separated by commas");
    }

    let [a, b, c, d] = numbers;

    let determinant = (a * d - b * c) % 26;
    determinant = (determinant + 26) % 26;

    function gcd(x, y) {
        return y === 0 ? x : gcd(y, x % y);
    }

    if (gcd(determinant, 26) !== 1) {
        throw new Error("Invalid Hill key. Choose another matrix.");
    }

    let cleanText = text.toUpperCase().replace(/[^A-Z]/g, "");

    if (cleanText.length % 2 !== 0) {
        cleanText += "X";
    }

    let result = "";

    for (let i = 0; i < cleanText.length; i += 2) {
        let x = cleanText.charCodeAt(i) - 65;
        let y = cleanText.charCodeAt(i + 1) - 65;

        let first = (a * x + b * y) % 26;
        let second = (c * x + d * y) % 26;

        result += String.fromCharCode(first + 65);
        result += String.fromCharCode(second + 65);
    }

    return result;
}
function getEncryptionKey() {

    let algorithm = algorithmSelect.value;

    // Caesar Cipher
    if (algorithm === "caesar") {

        let key = document.getElementById("caesarValue").value;

        if (key.trim() === "") {
            throw new Error("Please enter Caesar key");
        }

        key = Number(key);

        if (!Number.isInteger(key) || key < 0 || key > 25) {
            throw new Error("Caesar key must be an integer between 0 and 25");
        }

        return key;
    }


    // Playfair Cipher
    if (algorithm === "playfair") {

        let key = document.getElementById("playfairValue").value.trim();

        if (key === "") {
            throw new Error("Please enter Playfair keyword");
        }

        if (!/^[a-zA-Z]+$/.test(key)) {
            throw new Error("Playfair key must contain English letters only");
        }

        return key;
    }


    // Vigenere Cipher
    if (algorithm === "vigenere") {

        let key = document.getElementById("vigenereValue").value.trim();

        if (key === "") {
            throw new Error("Please enter Vigenere keyword");
        }

        if (!/^[a-zA-Z]+$/.test(key)) {
            throw new Error("Vigenere key must contain English letters only");
        }

        return key;
    }


    // Hill Cipher
    if (algorithm === "hill") {

        let a = document.getElementById("hillA").value;
        let b = document.getElementById("hillB").value;
        let c = document.getElementById("hillC").value;
        let d = document.getElementById("hillD").value;

        let values = [a, b, c, d];

        if (values.some(value => value.trim() === "")) {
            throw new Error("Please enter all 4 Hill matrix numbers");
        }

        let numbers = values.map(Number);

        if (numbers.some(n =>
            !Number.isInteger(n) || n < 0 || n > 25
        )) {
            throw new Error("Hill key must contain 4 integers between 0 and 25");
        }

        return numbers.join(",");
    }
}
encryptBtn.addEventListener("click", function () {
    try {
        let text = inputText.value;
        let key = getEncryptionKey();
        let algorithm = algorithmSelect.value;
        let result = "";

        if (text.trim() === "") {
            throw new Error("Please enter your text");
        }

        if (algorithm === "caesar") {
            result = caesarEncrypt(text, Number(key));
        }

        else if (algorithm === "playfair") {
            result = playfairEncrypt(text, key);
        }

        else if (algorithm === "vigenere") {
            result = vigenereEncrypt(text, key);
        }

        else if (algorithm === "hill") {
            result = hillEncrypt(text, key);
        }

        outputText.value = result;

        saveHistory(algorithm, text, result);

        alert("Encryption completed successfully!");

    } catch (error) {
        alert(error.message);
    }
});
copyBtn.addEventListener("click", function () {
    if (outputText.value.trim() === "") {
        alert("No result to copy");
        return;
    }

    navigator.clipboard.writeText(outputText.value)
        .then(() => alert("Copied successfully!"))
        .catch(() => alert("Copy failed"));
});


downloadBtn.addEventListener("click", function () {
    if (outputText.value.trim() === "") {
        alert("No result to download");
        return;
    }

    let file = new Blob([outputText.value], {
        type: "text/plain"
    });

    let link = document.createElement("a");

    link.href = URL.createObjectURL(file);
    link.download = "encrypted-text.txt";
    link.click();

    URL.revokeObjectURL(link.href);
});


clearBtn.addEventListener("click", function () {
    inputText.value = "";
    outputText.value = "";
});
function saveHistory(algorithm, input, output) {
    let history = JSON.parse(
        localStorage.getItem("cryptoHistory") || "[]"
    );

    history.unshift({
        algorithm: algorithm,
        input: input,
        output: output,
        date: new Date().toLocaleString()
    });

    localStorage.setItem(
        "cryptoHistory",
        JSON.stringify(history)
    );

    displayHistory();
}


function displayHistory() {
    let history = JSON.parse(
        localStorage.getItem("cryptoHistory") || "[]"
    );

    historyList.innerHTML = "";

    history.forEach(function (item) {
        let div = document.createElement("div");

        let title = document.createElement("h4");
        title.textContent = item.algorithm.toUpperCase();

        let input = document.createElement("p");
        input.textContent = "Input: " + item.input;

        let output = document.createElement("p");
        output.textContent = "Output: " + item.output;

        let date = document.createElement("small");
        date.textContent = item.date;

        div.append(title, input, output, date);

        historyList.appendChild(div);
    });
}


clearHistoryBtn.addEventListener("click", function () {
    localStorage.removeItem("cryptoHistory");
    displayHistory();
});


displayHistory();
