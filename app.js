// Your OpenWeatherMap API Key
const API_KEY = 'bcf7ec295066110ab7f78d1fb87f05ba';  // Replace with your actual API key
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Async function to fetch weather data
async function getWeather(city) {
     // 🔄 Show loading FIRST
    showLoading();

    // Build the API URL (example using OpenWeatherMap)
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

    // Disable button
    searchBtn.disabled = true;
    searchBtn.textContent = "Searching...";

    try {
        // Await the API response
        const response = await axios.get(url);

        // Pass the data to displayWeather function
        displayWeather(response.data);

    } catch (error) {
        console.error(error);

        // Handle different errors
        if (error.response && error.response.status === 404) {
            showError("City not found. Please check the spelling and try again.");
        } else {
            showError("Something went wrong. Please try again later.");
        }
    } finally {
        // Re-enable button
        searchBtn.disabled = false;
        searchBtn.textContent = "Get Weather";
    }
}

// Function to display weather data
function displayWeather(data) {
    // Extract the data we need
    const cityName = data.name;
    const temperature = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const icon = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    
    // Create HTML to display
    const weatherHTML = `
        <div>
            <h2>${data.name}</h2>
            <p>🌡 Temperature: ${data.main.temp}°C</p>
            <p>🌥 Condition: ${data.weather[0].description}</p>
        </div>
    `;
    
    // Put it on the page
    document.getElementById('weather-display').innerHTML = weatherHTML;
}

// Call the function when page loads
// getWeather('Chennai');

document.getElementById("weather-display").innerHTML = `
    <div class="welcome-message">
        <h2>🌤️ Weather App</h2>
        <p>Enter a city name to get started!</p>
    </div>
`;

// Function to display error messages
function showError(message = "Something went wrong. Please try again.") {
    
    // Create HTML for error message
    const errorHTML = `
        <div class="error-message">
            <div class="error-icon">❌</div>
            <h3>Error</h3>
            <p>${message}</p>
        </div>
    `;

    // Display in #weather-display div
    document.getElementById("weather-display").innerHTML = errorHTML;
}

// Get references to HTML elements
const searchBtn = document.getElementById("search-btn");
const cityInput = document.getElementById("city-input");

// Function to handle search logic
function handleSearch() {
    const city = cityInput.value.trim();

    // Validate input
    // Empty or only spaces
    if (!city) {
        showError("Please enter a city name.");
        return;
    }

    // Too short
    if (city.length < 2) {
        showError("City name too short.");
        return;
    }

    // Call API
    getWeather(city);

    // Clear input (optional)
    cityInput.value = "";
}

// Click event
searchBtn.addEventListener("click", handleSearch);

// BONUS: Enter key support
cityInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        handleSearch();
    }
});

// Show loading state
function showLoading() {
    const loadingHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading weather data...</p>
        </div>
    `;

    document.getElementById("weather-display").innerHTML = loadingHTML;
}