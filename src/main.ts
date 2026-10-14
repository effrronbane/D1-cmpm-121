// Vite turns this import into a production-safe URL. Keep it as a file so
// even this tiny example demonstrates a separately deployed asset.
// @deno-types="./asset-url.d.ts"

import titleUrl from "./assets/cafe_clicker_title.png?no-inline";
import coffeeCupUrl from "./assets/coffeecup.png?no-inline";

const app = document.querySelector<HTMLElement>("#app")!;

let cupsOfCoffee = 0;
let cupsPerClick = 1;

let previousTimestamp = 0; //time of the last frame
let firstFrame = true; //true until we have seen one frame

function getCoffeePerSecond(): number {
  return getUpgradeCoffeePerSecond();
}

function growCoffee(secondsPassed: number) {
  const coffeeEarned = getCoffeePerSecond() * secondsPassed;
  cupsOfCoffee += coffeeEarned;
}

function onFrame(currentTimestamp: number) {
  if (firstFrame) {
    //theres no earlier frame to compare it with so just record the time
    previousTimestamp = currentTimestamp;
    firstFrame = false;
  } else {
    const millisecondsPassed = currentTimestamp - previousTimestamp;
    const secondsPassed = millisecondsPassed / 1000;

    growCoffee(secondsPassed);
    updateDisplay();

    previousTimestamp = currentTimestamp;
  }
  requestAnimationFrame(onFrame); //asks the browser for the next frame
}

const heading = document.createElement("h1");
const titleImage = document.createElement("img");
titleImage.src = titleUrl;
titleImage.alt = "Cafe Clicker";
titleImage.className = "title-image";
heading.append(titleImage);

const numCoffeeDisplay = document.createElement("h1");
numCoffeeDisplay.id = "numCoffeeDisplay";
const productionDisplay = document.createElement("p");
const numPerClick = document.createElement("p");

const brewButton = document.createElement("button");
brewButton.id = "brew-button";
brewButton.setAttribute("aria-label", "Brew coffee");

const cupImage = document.createElement("img");
cupImage.src = coffeeCupUrl;
cupImage.alt = "";
cupImage.draggable = false;
brewButton.append(cupImage);

brewButton.addEventListener("click", () => {
  cupsOfCoffee += cupsPerClick;
  updateDisplay();
});

const upgrades = [
  {
    name: "Barista",
    description: "Makes coffee for you",
    baseCost: 10,
    costMultiplier: 1.25,
    coffeePerSecond: 1,
    coffeePerClick: 0,
    owned: 0,
  },
  {
    name: "Coffee Machine",
    description: "Machines make every click stronger",
    baseCost: 30,
    costMultiplier: 1.3,
    coffeePerSecond: 0,
    coffeePerClick: 1,
    owned: 0,
  },
  {
    name: "Pastry Case",
    description: "Customers stay longer and order more",
    baseCost: 50,
    costMultiplier: 1.3,
    coffeePerSecond: 2,
    coffeePerClick: 0,
    owned: 0,
  },
  {
    name: "Espresso Blend",
    description: "Premium beans make every click stronger",
    baseCost: 100,
    costMultiplier: 1.5,
    coffeePerSecond: 0,
    coffeePerClick: 3,
    owned: 0,
  },
  {
    name: "Advertisements",
    description: "Hand out flyers to bring in a constant stream of customers",
    baseCost: 500,
    costMultiplier: 1.5,
    coffeePerSecond: 5,
    coffeePerClick: 0,
    owned: 0,
  },
];

//the cost of upgrade number "index"
function getUpgradeCost(index: number): number {
  const upgrade = upgrades[index];
  return Math.ceil(upgrade.baseCost * upgrade.costMultiplier ** upgrade.owned);
}

//adds the coffee per second from all the upgrades in the list
function getUpgradeCoffeePerSecond(): number {
  let total = 0;
  for (let i = 0; i < upgrades.length; i++) {
    const upgrade = upgrades[i];
    total += upgrade.owned * upgrade.coffeePerSecond;
  }
  return total;
}

//buying stuff also just works the same way for all the upgrades in the list
function buyUpgrade(index: number) {
  const upgrade = upgrades[index];
  const cost = getUpgradeCost(index);
  if (cupsOfCoffee < cost) return; //too broke :p
  cupsOfCoffee -= cost;
  upgrade.owned++;
  cupsPerClick += upgrade.coffeePerClick;
  updateDisplay();
}

//button a little info like for each
const upgradeButtons: HTMLButtonElement[] = [];
const upgradeInfoDisplays: HTMLParagraphElement[] = [];

for (let i = 0; i < upgrades.length; i++) {
  const button = document.createElement("button");
  button.addEventListener("click", () => {
    buyUpgrade(i);
  });

  const info = document.createElement("p");

  upgradeButtons.push(button);
  upgradeInfoDisplays.push(info);
}

function updateDisplay() {
  numPerClick.textContent = `Coffees per click ${Math.floor(cupsPerClick)}`;
  numCoffeeDisplay.textContent = `Coffees: ${Math.floor(cupsOfCoffee)}`;

  productionDisplay.textContent = `Total: ${
    getCoffeePerSecond().toFixed(1)
  } coffees/sec`;

  for (let i = 0; i < upgrades.length; i++) {
    const upgrade = upgrades[i];
    const cost = getUpgradeCost(i);

    upgradeButtons[i].textContent = `Buy ${upgrade.name} (${cost} coffees)`;
    upgradeButtons[i].disabled = cupsOfCoffee < cost;
    upgradeInfoDisplays[i].textContent =
      `${upgrade.name} owned: ${upgrade.owned}. ${upgrade.description}`;
  }
}

app.append(
  heading,
  numCoffeeDisplay,
  numPerClick,
  brewButton,
  productionDisplay,
);

for (let i = 0; i < upgrades.length; i++) {
  app.append(upgradeButtons[i], upgradeInfoDisplays[i]);
}

updateDisplay();
requestAnimationFrame(onFrame);
