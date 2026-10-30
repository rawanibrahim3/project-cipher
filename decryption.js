const algorithmSelect = document.getElementById("algorithm");

const inputText = document.getElementById("cipherText");

const outputText = document.getElementById("decryptedText");

const decryptBtn = document.getElementById("decryptBtn");

const copyBtn = document.getElementById("copyBtn");

const downloadBtn = document.getElementById("downloadBtn");

const clearBtn = document.getElementById("clearBtn");

const historyList = document.getElementById("historyList");

const clearHistoryBtn = document.getElementById("clearHistoryBtn");

const statusText = document.getElementById("status");
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
function getDecryptionKey() {

    let algorithm = algorithmSelect.value;

    // Caesar
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

    // Playfair
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

    // Vigenere
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

    // Hill
    if (algorithm === "hill") {

        let values = [
            document.getElementById("hillA").value,
            document.getElementById("hillB").value,
            document.getElementById("hillC").value,
            document.getElementById("hillD").value
        ];

        if (values.some(value => value.trim() === "")) {
            throw new Error("Please enter all 4 Hill matrix numbers");
        }

        let numbers = values.map(Number);

        if (numbers.some(n =>
            !Number.isInteger(n) || n < 0 || n > 25
        )) {
            throw new Error("Hill key must contain 4 integers between 0 and 25");
        }

        return numbers;
    }
}
function caesarDecrypt(text, key) {

    let result = "";

    for (let char of text) {

        if (/[a-z]/i.test(char)) {

            let start = char === char.toUpperCase() ? 65 : 97;

            let newChar = String.fromCharCode(
                (char.charCodeAt(0) - start - key + 26) % 26 + start
            );

            result += newChar;

        } else {

            result += char;

        }
    }

    return result;
}
function vigenereDecrypt(text, key) {

    let result = "";

    key = key.toUpperCase();

    let keyIndex = 0;

    for (let char of text) {

        if (/[a-z]/i.test(char)) {

            let shift = key.charCodeAt(keyIndex % key.length) - 65;

            let start = char === char.toUpperCase() ? 65 : 97;

            let newChar = String.fromCharCode(
                (char.charCodeAt(0) - start - shift + 26) % 26 + start
            );

            result += newChar;

            keyIndex++;

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


function playfairDecrypt(text, key) {

    let matrix = createPlayfairMatrix(key);

    let cleanText = text.toUpperCase()
        .replace(/J/g, "I")
        .replace(/[^A-Z]/g, "");

    if (cleanText.length === 0) {
        throw new Error("Please enter encrypted text");
    }

    if (cleanText.length % 2 !== 0) {
        throw new Error("Playfair encrypted text must contain an even number of letters");
    }

    let result = "";

    for (let i = 0; i < cleanText.length; i += 2) {

        let a = cleanText[i];
        let b = cleanText[i + 1];

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

            result += matrix[row1][(col1 + 4) % 5];
            result += matrix[row2][(col2 + 4) % 5];

        }

        else if (col1 === col2) {

            result += matrix[(row1 + 4) % 5][col1];
            result += matrix[(row2 + 4) % 5][col2];

        }

        else {

            result += matrix[row1][col2];
            result += matrix[row2][col1];

        }
    }

    return result;
}
function gcd(a, b) {

    if (b === 0) {
        return a;
    }

    return gcd(b, a % b);
}


function modInverse(number, mod) {

    for (let i = 1; i < mod; i++) {

        if ((number * i) % mod === 1) {
            return i;
        }
    }

    return null;
}


function getInverseMatrix(numbers) {

    let [a, b, c, d] = numbers;

    let determinant = (a * d - b * c) % 26;

    determinant = (determinant + 26) % 26;

    if (gcd(determinant, 26) !== 1) {
        throw new Error("Hill matrix is not invertible modulo 26");
    }

    let inverseDet = modInverse(determinant, 26);

    if (inverseDet === null) {
        throw new Error("Cannot calculate inverse matrix");
    }

    return [
        (d * inverseDet % 26 + 26) % 26,
        ((-b * inverseDet % 26) + 26) % 26,
        ((-c * inverseDet % 26) + 26) % 26,
        (a * inverseDet % 26 + 26) % 26
    ];
}
function hillDecrypt(text, key) {

    let cleanText = text.toUpperCase()
        .replace(/[^A-Z]/g, "");

    if (cleanText.length === 0) {
        throw new Error("Please enter encrypted text");
    }

    if (cleanText.length % 2 !== 0) {
        throw new Error("Hill encrypted text must have an even number of letters");
    }

    let inverseMatrix = getInverseMatrix(key);

    let [a, b, c, d] = inverseMatrix;

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
decryptBtn.addEventListener("click", function () {

    try {

        let text = inputText.value;

        if (text.trim() === "") {
            throw new Error("Please enter encrypted text");
        }

        let key = getDecryptionKey();

        let algorithm = algorithmSelect.value;

        let result = "";

        if (algorithm === "caesar") {

            result = caesarDecrypt(text, key);

        }

        else if (algorithm === "playfair") {

            result = playfairDecrypt(text, key);

        }

        else if (algorithm === "vigenere") {

            result = vigenereDecrypt(text, key);

        }

        else if (algorithm === "hill") {

            result = hillDecrypt(text, key);

        }

        outputText.value = result;

        statusText.textContent = "Decryption Successful";

        saveHistory(algorithm, text, result);

    }

    catch (error) {

        statusText.textContent = "Decryption Failed";

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

    link.download = "decrypted-text.txt";

    link.click();

    URL.revokeObjectURL(link.href);

});


clearBtn.addEventListener("click", function () {

    inputText.value = "";
    outputText.value = "";

    statusText.textContent = "Waiting...";

});
function saveHistory(algorithm, input, output) {

    let history = JSON.parse(
        localStorage.getItem("decryptionHistory") || "[]"
    );

    history.unshift({

        algorithm: algorithm,
        input: input,
        output: output,
        date: new Date().toLocaleString()

    });

    localStorage.setItem(
        "decryptionHistory",
        JSON.stringify(history)
    );

    displayHistory();
}


function displayHistory() {

    let history = JSON.parse(
        localStorage.getItem("decryptionHistory") || "[]"
    );

    historyList.innerHTML = "";

    history.forEach(function (item) {

        let div = document.createElement("div");

        let title = document.createElement("h4");
        title.textContent = item.algorithm.toUpperCase();

        let input = document.createElement("p");
        input.textContent = "Encrypted: " + item.input;

        let output = document.createElement("p");
        output.textContent = "Decrypted: " + item.output;

        let date = document.createElement("small");
        date.textContent = item.date;

        div.append(title, input, output, date);

        historyList.appendChild(div);

    });
}


clearHistoryBtn.addEventListener("click", function () {

    localStorage.removeItem("decryptionHistory");

    displayHistory();

});


displayHistory();