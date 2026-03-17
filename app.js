// Your OpenWeatherMap API Key
const API_KEY = 'bcf7ec295066110ab7f78d1fb87f05ba';  // Replace with your actual API key
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

// WeatherApp constructor for DOM caching and setup
function WeatherApp(apiKey) {
    // Store API key
    this.apiKey = apiKey;

    // Store API URLs
    this.apiUrl = 'https://api.openweathermap.org/data/2.5/weather';
    this.forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';

    // Store DOM references (query once for better performance)
    this.searchBtn = document.getElementById('search-btn');
    this.cityInput = document.getElementById('city-input');
    this.weatherDisplay = document.getElementById('weather-display');

    // Initialize event listeners and welcome message
    this.init();
}

WeatherApp.prototype.init = function() {
    // Click event for search button
    this.searchBtn.addEventListener('click', this.handleSearch.bind(this));

    // Enter key event for input
    this.cityInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            this.handleSearch();
        }
    });

    // Show welcome message on page load
    this.showWelcome();
};

WeatherApp.prototype.showWelcome = function() {
    const welcomeHTML = `
        <div class="welcome-message">
            <h2>🌤️ Welcome to WeatherApp!</h2>
            <p>Enter a city name and click "Get Weather" or press Enter to start.</p>
        </div>
    `;
    this.weatherDisplay.innerHTML = welcomeHTML;
};

WeatherApp.prototype.handleSearch = function() {
    const city = this.cityInput.value.trim();

    // Validate input
    if (!city) {
        this.showError("Please enter a city name.");
        return;
    }
    if (city.length < 2) {
        this.showError("City name too short.");
        return;
    }

    // Call getWeather
    this.getWeather(city);

    // Optional: clear input
    this.cityInput.value = "";
};

WeatherApp.prototype.getWeather = async function(city) {
    this.showLoading();
    this.searchBtn.disabled = true;
    this.searchBtn.textContent = 'Searching...';

    const currentWeatherUrl = `${this.apiUrl}?q=${city}&appid=${this.apiKey}&units=metric`;

    try {
        // Fetch both current weather and forecast simultaneously
        const [currentWeather, forecastData] = await Promise.all([
            axios.get(currentWeatherUrl),
            this.getForecast(city)
        ]);

        // Display current weather
        this.displayWeather(currentWeather.data);

        // Display 5-day forecast
        this.displayForecast(forecastData);

    } catch (error) {
        console.error('Error:', error);
        if (error.response && error.response.status === 404) {
            this.showError('City not found. Please check spelling.');
        } else {
            this.showError('Something went wrong. Please try again.');
        }
    } finally {
        this.searchBtn.disabled = false;
        this.searchBtn.textContent = 'Get Weather';
    }
};

WeatherApp.prototype.showError = function(message) {
    const errorHTML = `
        <div class="error-message">
            <p>❌ Error</p>
            <p>${message}</p>
        </div>
    `;

    this.weatherDisplay.innerHTML = errorHTML;

    // Focus input for next search
    this.cityInput.focus();
};

WeatherApp.prototype.getForecast = async function(city) {
    const url = `${this.forecastUrl}?q=${city}&appid=${this.apiKey}&units=metric`;
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching forecast:', error);
        throw error; // Let caller handle the error
    }
};

// Create app instance
const app = new WeatherApp(`${API_KEY}`);

// Function to display weather data
WeatherApp.prototype.displayWeather = function(data) {
    const cityName = data.name;
    const temperature = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const icon = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

    const weatherHTML = `
        <div class="weather-info">
            <h2>${cityName}</h2>
            <img src="${iconUrl}" alt="${description}">
            <p>🌡️ ${temperature}°C</p>
            <p>${description}</p>
        </div>
    `;

    this.weatherDisplay.innerHTML = weatherHTML;

    // Focus input for next search
    this.cityInput.focus();
};

WeatherApp.prototype.displayForecast = function(data) {
    const dailyForecasts = this.processForecastData(data);

    const forecastHTML = dailyForecasts.map(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const temp = Math.round(day.main.temp);
        const description = day.weather[0].description;
        const icon = day.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

        return `
            <div class="forecast-card">
                <h4>${dayName}</h4>
                <img src="${iconUrl}" alt="${description}">
                <p>🌡️ ${temp}°C</p>
                <p>${description}</p>
            </div>
        `;
    }).join('');

    const forecastSection = `
        <div class="forecast-section">
            <h3 class="forecast-title">5-Day Forecast</h3>
            <div class="forecast-container">
                ${forecastHTML}
            </div>
        </div>
    `;

    // Append forecast without replacing current weather
    this.weatherDisplay.innerHTML += forecastSection;
};

WeatherApp.prototype.processForecastData = function(data) {
    // Filter for entries at 12:00:00 (noon) each day
    const dailyForecasts = data.list.filter(item => item.dt_txt.includes('12:00:00'));

    // Take first 5 days
    return dailyForecasts.slice(0, 5);
};

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

WeatherApp.prototype.showLoading = function() {
    const loadingHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading weather data...</p>
        </div>
    `;

    this.weatherDisplay.innerHTML = loadingHTML;
};