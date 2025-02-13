const fireflies = [];
const numfire = 100;
const numbers = [
    [1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1], // 0
    [0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], // 1
    [1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1], // 2
    [1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1], // 3
    [1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1], // 4
    [1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1], // 5
    [1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1], // 6
    [1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1], // 7
    [1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1], // 8
    [1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1], // 9
];

const clockElement = document.getElementById("clock");

function createFirefly() {
  for (let i = 0; i < numfire; i++) {
    const firefly = document.createElement("div");
    firefly.className = "firefly";
    firefly.style.left = Math.random() * window.innerWidth + "px";
    firefly.style.top = Math.random() * window.innerHeight + "px";
    firefly.style.animationDuration = Math.random() * 5 + 3 + "s";
    document.body.appendChild(firefly);
    fireflies.push(firefly);
  }
}

function createDigit(digit) {
    const digitElement = document.createElement("div");
    digitElement.classList.add("digit");

    for (let i = 0; i < 15; i++) {
        const dot = document.createElement("div");
        dot.classList.add("dot");
        if (numbers[digit][i] == 1) {
            dot.classList.add("active");
        }
        digitElement.appendChild(dot);
    }

    return digitElement;
}
function displayClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timeString = hours + minutes + seconds;

    clockElement.innerHTML = '';

    timeString.split('').forEach(digit => {
        clockElement.appendChild(createDigit(Number(digit)));
    });
}
window.onload = () => {
    createFirefly();
    displayClock();
    setInterval(displayClock, 1000);
};