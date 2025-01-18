"use strict"

// Get the elements.
const coinsContainerBox = document.getElementById("coinsContainerBox");
const searchBox = document.getElementById("searchBox");
const searchCoinBox = document.getElementById("searchCoinBox");
const currencyBox = document.getElementById("currencyBox");
const ctx = document.getElementById('cryptoChart');
const home = document.getElementById("home");
const liveReports = document.getElementById("liveReports")
const about = document.getElementById("about");
home.addEventListener("click", showCoins);
liveReports.addEventListener("click", showLiveReports);
about.addEventListener("click", displayAbout);

// Get the data from local storage if there is no create an empty array.
let coins = JSON.parse(localStorage.getItem("coins")) || [];
let currency = "";
let coinsArray = [];
let isLiveActive = false;
let cryptoChart = null;
let fetchIntervalId = null;

// Function to get all the coins and display.
async function getCoins() {
    try {
        ctx.style.display = "none";
        if (coins.length === 0) {
            coins = await getAllCoins();
            localStorage.setItem("coins", JSON.stringify(coins));
        }
        displayCoins(coins);

    } catch (error) {
        alert(error.message);
    }
}

// Function to return the coins data from the API.
async function getAllCoins() {
    // const url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd";
    const url = "coins.json";
    const response = await axios.get(url);
    const coins = response.data;
    return coins;
}


function displayCoins(coins) {
    // Start the container
    let content = `<div class="container text-center alignDataMiddle">`;

    // Initialize index
    let index = 0;

    // Start the first row
    content += `<div class="row">`;

    // Loop through the coins and create rows of 4 coins.
    // There is also back side of card that on click the info is displayed.
    for (const coin of coins) {

        // Check if the coin is in the coinsArray.
        const isCoinChecked = coinsArray.filter(checkedCoin => checkedCoin.id === coin.id);
        const isChecked = isCoinChecked.length > 0;

        // Add the card to the current row
        content += `
            <div class="col-lg-3 col-md-6 mb-4">
                <div class="card flip-card" id="${coin.id}">

                    <!-- Front Side Of the card -->
                    <div class="flip-card-inner">
                        <!-- Front Side -->
                        <div class="flip-card-front">
                            <div class="card-body">
                                <div id="headerContainer">
                                    <div class="form-check form-switch">
                                        <input 
                                            class="form-check-input" 
                                            type="checkbox" 
                                            onChange="addCoin('${coin.id}')" 
                                            role="switch" 
                                            id="switchCheckToAdd-${coin.id}" 
                                            ${isChecked ? 'checked' : ''}   <!-- Check if it's selected -->
                                    </div>
                                    <h5 class="card-title">
                                        <img src="${coin.image}" alt="${coin.name}" class="me-2" style="width: 24px; height: 24px;">
                                        ${coin.symbol}
                                    </h5>
                                </div>
                                <p class="card-text">${coin.name}</p>
                                <button type="button" id="flipCard" class="btn btn-info" onclick="flipCard('${coin.id}', '${coin.name}'')">Info</button>
                            </div>
                        </div>

                        <!-- Back Side Of the card -->
                        <div class="flip-card-back">
                            <div class="card-body">
                                <p class="card-text" id="details-${coin.id}"></p>
                                <button type="button" class="btn btn-secondary" onclick="unflipCard('${coin.id}')">Close Info</button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        `;

        index++;

        // Close the row and start a new one after every 4 cards
        if (index % 4 === 0 && index < coins.length) {
            content += `</div><div class="row">`;
        }
    }

    // Close the last row
    content += `</div>`;

    // Close the container
    content += `</div>`;

    coinsContainerBox.innerHTML = content;
}


// Function to change the currency in every change of the select.
function changeCurrency() {
    currency = currencyBox.value;
}

// Function to add coin after press the toggle button.
async function addCoin(id) {

    try {

        // Get the element of the radio button of the coin.
        const switchCheckToAdd = document.getElementById(`switchCheckToAdd-${id}`);

        // Get if its checked or not
        const isChecked = switchCheckToAdd.checked;

        const coin = getCoinFromArray(id);
        // If checked add to the array else remove from the array.
        if (isChecked) {
            coinsArray.push(coin);
        }
        else {
            coinsArray = coinsArray.filter(coin => coin.id !== id);
        }
        // Check if there are more than 5 coins and display modal.
        if (coinsArray.length > 5) {
            showModal();
        }
    } catch (error) {
        throw new Error("Error fetching coin:", error.message); // Log error details
    }

}


function getCoinFromArray(id) {
    const returnedCoin = coins.find(coin => coin.id === id);
    return returnedCoin;
}

// Function to show the modal using bootstrap.
function showModal() {
    const modal = new bootstrap.Modal(document.getElementById('cardModal'));

    // Clear any existing checkboxes in the form
    const removeCoinsForm = document.getElementById('removeCoinsForm');

    let content = '';

    // Dynamically generate checkboxes for selected coins
    coinsArray.forEach((coin) => {
        content += `
            <div class="form-check">
                <input type="checkbox" class="form-check-input-remove" id="remove-${coin.id}" value="${coin.id}">
                <label class="form-check-label" for="remove-${coin.id}">
                    ${coin.name} (${coin.symbol.toUpperCase()})
                </label>
            </div>
        `;
    });

    // Set the generated content to the form
    removeCoinsForm.innerHTML = content;

    // Show the modal
    modal.show();
}

// Function to save the changes after the save changes button of the pop up model.
function saveChanges() {

    // Get all checked checkboxes for coins marked for removal
    const selectedCheckboxes = document.querySelectorAll('#removeCoinsForm input:checked');

    // Remove from the array of checkboxes those who not selected
    selectedCheckboxes.forEach((checkbox) => {
        const coinId = checkbox.value;
        // Remove the coin from the coinsArray
        coinsArray = coinsArray.filter(coin => coin.id !== coinId);
    });

    // Update the checkboxes to reflect the remaining coins
    const allCheckboxes = document.querySelectorAll('#removeCoinsForm input');


    allCheckboxes.forEach((checkbox) => {
        // Check if coin exists
        const coin = coinsArray.find(coin => coin.id === checkbox.value);
        // Set if it checked or not.
        checkbox.checked = coin ? true : false;
    });

    // Hide the modal
    const modal = document.getElementById('cardModal');
    const bsModal = bootstrap.Modal.getInstance(modal);
    bsModal.hide();

    // Display the coins but the selected will be removed.
    displayCoins(coins);
}


// Function to flip the specific card and show the details.
async function flipCard(id, name) {

    // Get the card and the details container
    const card = document.getElementById(id);
    const detailsContainer = document.getElementById(`details-${id}`);
    // Show rotating spinner inside the card before loading the details
    detailsContainer.innerHTML = `
        <div class="loading-spinner">
            <img src="https://media4.giphy.com/media/EIOKH2p0wqgl9KW5fg/giphy.gif" width="100" height="100" alt="Loading..."/>
        </div>
    `;

    // Add CSS for rotating spinner
    const spinner = document.querySelector(`#details-${id} .loading-spinner img`);
    spinner.style.animation = "spin 2s linear infinite"; // Apply rotation animation

    try {

        const coin = await getCoinById(id);

        // Get the current currency and convert to lower case.
        let currencyString = currencyBox.value.toUpperCase();

        // Get the current currency and get the value from the array of currencies.
        let currency = currencyBox.value.toLowerCase();
        currency = coin.market_data.current_price[currency];

        // Get the current value percent of the coin in the market.
        const priceChangePercent = coin.market_data.price_change_percentage_30d;

        // If negative i want to set background color red else green.
        let priceChangeClass = priceChangePercent < 0 ? 'negative' : 'positive'

        // Flip the card
        card.classList.add('flipped');

        // Load additional data dynamically (e.g., fetch details)
        const detailsContainer = document.getElementById(`details-${id}`);
        detailsContainer.innerHTML = `
        ${name}<br>
        ${currencyString} ${currency} <br>
            <span class="price-change ${priceChangeClass}">
        ${priceChangePercent}
            </span>
    `;
    } catch (error) {
        detailsContainer.innerHTML = `<span class="error">Error loading details. Please try again.</span>`;
    }

}

// Function to get the coin by id.
async function getCoinById(id) {

    const url = `https://api.coingecko.com/api/v3/coins/${id}`;
    const response = await axios.get(url);
    const coin = response.data;
    return coin;
}

// Function to return the card
function unflipCard(id) {

    // Unflip the card
    const card = document.getElementById(id);
    card.classList.remove('flipped');
}

function showCoins() {
    // Show coins container
    if (isLiveActive) {
        cryptoChart.destroy();
        clearInterval(fetchIntervalId);
        fetchIntervalId = null; // Reset the interval ID
    }
    coinsContainerBox.style.display = "block";
    // Hide chart
    ctx.style.display = "none";
    displayCoins(coins);
}


function displayAbout() {


    coinsContainerBox.innerHTML = `
        <div id="aboutText">
            <p>
            Welcome to the Digital Coins & Live Reports platform!
            </p>
            <p>
            This page is designed to provide an interactive and user-friendly experience for cryptocurrency enthusiasts.
            </p>
            <p>
            Whether you're exploring various digital currencies or tracking live price changes, this page has all the essential features to keep you informed.
            </p>
        </div>
    `
}

// Function to display the live report in chart.
function showLiveReports() {

    // Check if the user chose coins to see there live reports.
    if (coinsArray.length > 0) {
        // Hide coins container
        coinsContainerBox.style.display = "none";
        //Hide the about section
        about.style.display = "none";
        // Show chart
        ctx.style.display = "block";

        isLiveActive = !isLiveActive;
        // Optionally, initialize or update the chart here
        renderChart();
    }
    else {
        alert("You must choose a coin if you want to see live report");
    }
}

// Generate random data for testing (replace this with your fetch logic)
function fetchCryptoData() {

    coinsArray = coinsArray.map(coin => ({
        // Spread operator to create a shallow copy of coin.
        ...coin,
        current_price: coin.current_price + (Math.random() * 800 - 1200), // Random fluctuation
        price_change_percentage_24h: Math.random() * 10 - 1, // Random percentage
    }));
    updateChart(); // Update the chart with new data
}

// Function to initialize the chart
function renderChart() {

    ctx.getContext("2d");

    //Map through the selected coins and update the data.
    const datasets = coinsArray.map(coin => ({
        label: coin.name,
        data: [coin.current_price],
        borderColor: getRandomColor(),
        borderWidth: 2,
        fill: false,
    }));

    // Create new chart.
    cryptoChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: ["Start"], // Initial label
            datasets: datasets,
        },
    });

    // Start fetching data every 4 seconds
    fetchIntervalId = setInterval(fetchCryptoData, 4000);
}

// Function to update the chart
function updateChart() {

    if (cryptoChart) {
        // Add new data points for each dataset
        cryptoChart.data.labels.push(new Date().toLocaleTimeString()); // Add timestamp
        cryptoChart.data.datasets.forEach((dataset, index) => {
            // Update with new price
            dataset.data.push(coinsArray[index].current_price);
        });

        cryptoChart.update(); // Refresh the chart
    }
}

// Function to generate random colors for each dataset
function getRandomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);

    return `rgb(${r},${g},${b})`;
}


// On everyChange of the input active a function.
document.getElementById("searchCoinBox").addEventListener("input", updateCoinsDisplay);

// After every change of the search text the display is changed.
function updateCoinsDisplay() {

    // Normalize and trim input
    const searchValue = searchCoinBox.value.toLowerCase().trim();

    if (searchValue === "") {
        // If input is empty, display all coins
        displayCoins(coins);
        return;
    }

    // Filter coins based on id or symbol
    const newCoinsList = coins.filter(coin =>
        coin.id.toLowerCase().includes(searchValue) ||
        coin.symbol.toLowerCase().includes(searchValue)
    );

    // Display the filtered list
    displayCoins(newCoinsList);
}

// Add event to the search button.
searchBox.addEventListener("click", function (event) {
    event.preventDefault();
    displayDesired();
});

// Function to get the value of the coin and display.
function displayDesired() {
    const value = document.getElementById("searchCoinBox").value;
    const coin = coins.find(coin => coin.id === value);
    displayCoin(coin);
}

// Function to display the desired coin (single coin).
function displayCoin(coin) {

    // Start the container
    let content = `<div class="container text-center alignDataMiddle">`;

    // Start the first row
    content += `<div class="row">`;

    // Add the card for the single coin
    content += `
        <div class="col-lg-3 col-md-6 mb-4">
            <div class="card flip-card" id="${coin.id}">

                <!-- Front Side Of the card -->
                <div class="flip-card-inner">
                    <!-- Front Side -->
                    <div class="flip-card-front">
                        <div class="card-body">
                            <div id="headerContainer">
                                <div class="form-check form-switch">
                                    <input 
                                        class="form-check-input" 
                                        type="checkbox" 
                                        onChange="addCoin('${coin.id}')" 
                                        role="switch" 
                                        id="switchCheckToAdd-${coin.id}">
                                    </div>
                                    <h5 class="card-title">
                                        <img src="${coin.image}" alt="${coin.name}" class="me-2" style="width: 24px; height: 24px;">
                                        ${coin.symbol}
                                    </h5>
                            </div>
                            <p class="card-text">${coin.name}</p>
                            <button type="button" class="btn btn-info" onclick="flipCard('${coin.id}', '${coin.name}'')">Info</button>
                        </div>
                        <!-- Back Side Of the card -->
                        <div class="flip-card-back">
                            <div class="card-body">
                                <p class="card-text" id="details-${coin.id}"></p>
                                <button type="button" class="btn btn-secondary" onclick="unflipCard('${coin.id}')">Close Info</button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    `;

    // Close the row
    content += `</div>`;

    // Close the container
    content += `</div>`;

    // Update the coinsContainerBox with the new content
    coinsContainerBox.innerHTML = content;

}
