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
const headLine = document.getElementById("headLine");
const searchingBox = document.getElementById("searchingBox");

// On everyChange of the input active a function.
searchCoinBox.addEventListener("input", updateCoinsDisplay);
// On home button on nav bar
home.addEventListener("click", showCoins);
// On home button on nav bar
headLine.addEventListener("click", showCoins);
// On Live reports button on nav bar
liveReports.addEventListener("click", showLiveReports);
// On About button on nav bar
about.addEventListener("click", displayAbout);


// Get the data from local storage if there is no create an empty array.
let coins = JSON.parse(localStorage.getItem("coins")) || [];
let currency = "USD";
let coinsArray = [];
let cryptoChart = null;
let fetchIntervalId = null;

// Function to get all the coins and display.
async function getCoins() {
    try {
        //ctx.style.display = "none";
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
    const url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd";
    const response = await axios.get(url);
    const coins = response.data;
    return coins;
}

// Function to display all coins
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

        // Get the coins that are checked in the coinsArray.
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
                                <button type="button" id="flipCard" class="btn btn-info"data-id="${coin.id}" 
                                data-name="${coin.name}">Info</button>
                            </div>
                        </div>

                        <!-- Back Side Of the card -->
                        <div class="flip-card-back">
                            <div class="card-body">
                                <p class="card-text" id="details-${coin.id}"></p>
                                <button type="button" class="btn btn-secondary" data-id="${coin.id}">Close Info</button>
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
    displayCoins(coins);
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
        throw new Error("Error fetching coin:", error.message); 
    }

}


function getCoinFromArray(id) {
    const returnedCoin = coins.find(coin => coin.id === id);
    return returnedCoin;
}

// -------------------------------- Pop up Modal ------------------------------------//

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

// -----------------------------------------------------------------------------------//

// ------------------------------- jQuery IIFE-------------------------------------------//

(function () {
    // Ensure the code executes when the DOM is fully loaded
    $(document).ready(function () {
        // Event delegation for dynamically added elements
        $('body').on('click', '.btn-info', function () {
            // Get coin ID and name from data attributes
            const coinId = $(this).data('id');  
            const coinName = $(this).data('name');  
            // Call the flipCard function with appropriate arguments
            flipCard(coinId, coinName);  
        });

        // Event listener for the Close Info button
        $('body').on('click', '.btn-secondary', function () {
            // Get coin ID from data-id attribute
            const coinId = $(this).data('id');  
            // Call the unflipCard function
            unflipCard(coinId);  
        });

        // Save changes from the modal
        $('#saveChangesBtn').click(function () {
            // Call the saveChanges function
            saveChanges();  
        });
    });
})();

// ------------------------------------------------------------------------------------------//


// -------------------------------- Flip and Unflip card ------------------------------------//

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
    // Apply rotation animation
    spinner.style.animation = "spin 2s linear infinite"; 

    try {

        const coin = await getCoinById(id);

        // Get the current currency and convert to lower case.
        let currencyString = currencyBox.value.toUpperCase();

        // Get the current currency and get the value from the array of currencies.
        let currency = currencyBox.value.toLowerCase();
        // .toLocaleString() make it be readable like 1023405 = 1,023,405.
        currency = coin.market_data.current_price[currency].toLocaleString();

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

// -----------------------------------------------------------------------------------//

// ---------------------------------- Nav bar -----------------------------------------//

// Function to show the coin (Home or the Head Line in nav bar)
function showCoins() {
    searchingBox.style.display = 'block';
    displayCoins(coins);
}

//Function to display the about (About in nav bar).
function displayAbout() {
    hideSearch();
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

// Store the last active tab
let previousActiveTab = "home"; // Default to "home" when the page loads

// Add event to the links in the nav bar.
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function (event) {
        // Check if the clicked link is the Live Reports tab.
        if (this.id === 'liveReports') {
            // Prevent the Live Reports tab from becoming active if coinsArray is empty
            if (coinsArray.length === 0) {
                // Prevent default behavior (e.g., navigation)
                event.preventDefault();

                // Revert to the previous active tab.
                // Force click of the previous tab.
                document.getElementById(previousActiveTab).click();
                return;
            }
        }

        // Remove 'active' class from all links to unselect them
        document.querySelectorAll('.nav-link').forEach(item => {
            item.classList.remove('active');
        });

        // Add 'active' class to the clicked link
        this.classList.add('active');

        // Update the previous active tab
        previousActiveTab = this.id;
    });
});


// Function to show the live reports on chart.
// The first point will be coin.current_price and than its from an api
// https://min-api.cryptocompare.com/data/pricemulti?fsyms=${symbols}&tsyms=${currency}
function showLiveReports() {

    // Hide the search box.
    hideSearch();
    if (coinsArray.length === 0) {
        alert("You need to choose coins for live reports");
        return;
    }

    // Initialize chart options
    var options = {
        title: {
            text: "Live Report"
        },
        animationEnabled: true,
        exportEnabled: true,
        data: coinsArray.map(coin => ({
            type: "spline", // Ensure this is set to "spline"
            name: coin.name,
            showInLegend: true,
            dataPoints: [{ x: 0, y: coin.current_price }],
            visible: true  // Set the initial visibility to true
        })),
        legend: {
            cursor: "pointer",
            itemclick: function (e) {
                // Toggle the visibility of the series on legend click
                const series = e.dataSeries;

                // If the series is currently visible, hide it, otherwise show it
                series.visible = !series.visible;

                // Re-render the chart to apply changes
                e.chart.render();
                return false; // Prevent default legend click behavior
            }
        }
    };

    // Initialize the chart and store the reference
    const chart = new CanvasJS.Chart("coinsContainerBox", options);

    // Render the chart
    chart.render();

    // Update chart data points every 4 seconds
    setInterval(() => updateChartData(chart), 4000);
}

// Function to update the chart data
async function updateChartData(chart) {

    // Wait for data from the api.
    const priceData = await fetchCoinPrices();

    if (!priceData) {
        console.warn("Failed to update chart due to fetch error.");
        return;
    }

    coinsArray.forEach((coin, index) => {
        // Ensure USD is fetched correctly
        const currentPrice = priceData[coin.symbol.toUpperCase()]?.USD;  

        if (currentPrice) {
            const series = chart.options.data[index];
            const lastPoint = series.dataPoints[series.dataPoints.length - 1];

            // Add new data point with incremented x-value
            const newX = lastPoint.x + 1;
            const newY = currentPrice;

            // Update global coin price (optional)
            coin.current_price = newY;

            // Add the new data point to the series
            series.dataPoints.push({ x: newX, y: newY });

            // Limit data points for performance (optional)
            if (series.dataPoints.length > 50) {
                series.dataPoints.shift();
            }
        }
    });

    chart.render(); // Re-render the chart with updated data
}

// Function to get the current price from api.
async function fetchCoinPrices() {

    // Build the API URL dynamically based on coinsArray
    // The symbols to upper case to match the url.
    const symbols = coinsArray.map(coin => coin.symbol.toUpperCase()).join(",");
    const apiUrl = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${symbols}&tsyms=${currency}`;

    try {
        // Fetch the latest prices from the API
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
        }
        const priceData = await response.json();   
        // Return the fetched data     
        return priceData; 
    } catch (error) {
        alert("Error fetching coin prices:", error.message);
        // Return null on error
        return null; 
    }
}


// -----------------------------------------------------------------------------------//

// -------------------------------------- Search And Currency -------------------------------------//

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
    displaySingleCoin(coin);
}

// Function to display the desired coin (single coin).
function displaySingleCoin(coin) {
    // Check if the coin is in the coinsArray
    const isCoinChecked = coinsArray.filter(checkedCoin => checkedCoin.id === coin.id);
    const isChecked = isCoinChecked.length > 0; // If the coin is checked, set it to true

    // Start the container
    let content = `<div class="container text-center alignDataMiddle">`;

    // Start the first row
    content += `<div class="row">`;

    // Add the card for the single coin (same structure as in displayCoins)
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
                                        ${isChecked ? 'checked' : ''}> <!-- If the coin is checked, keep the checkbox checked -->
                                </div>
                                <h5 class="card-title">
                                    <img src="${coin.image}" alt="${coin.name}" class="me-2" style="width: 24px; height: 24px;">
                                    ${coin.symbol}
                                </h5>
                            </div>
                            <p class="card-text">${coin.name}</p>
                            <button type="button" id="flipCard" class="btn btn-info" data-id="${coin.id}" 
                            data-name="${coin.name}">Info</button>
                        </div>
                    </div>

                    <!-- Back Side Of the card -->
                    <div class="flip-card-back">
                        <div class="card-body">
                            <p class="card-text" id="details-${coin.id}"></p>
                            <button type="button" class="btn btn-secondary" data-id="${coin.id}">Close Info</button>
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
// -----------------------------------------------------------------------------------//

// Function to hide the search box.
function hideSearch(){
    searchingBox.style.display = 'none';
}

// Function to show the search box again.
function showSearch() {
    searchingBox.style.display = 'block'; // Make sure the search box is visible again
}
