const apiKey = '7a7c9788edec10ff0a54933cbbe67bcc';
const weatherDetailsDiv = document.getElementById('weather-details');
const cityNameElem = document.getElementById('city-name');
const temperatureElem = document.getElementById('temperature');
const humidityElem = document.getElementById('humidity');
const windSpeedElem = document.getElementById('wind-speed');
const weatherIconElem = document.getElementById('weather-icon');
const saveBtn = document.getElementById('save-btn');
const cityInput = document.getElementById('city-input');
const favoriteCitiesList = document.getElementById('favorite-cities');

let currentCity = null;
let favoriteCities = JSON.parse(localStorage.getItem('favoriteCities')) || [];

document.getElementById('search-btn').addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeather(city);
    }
});

saveBtn.addEventListener('click', addToFavorites);

function setWeatherIcon(weatherCondition) {
    const weatherIcon = document.getElementById('weather-icon');
    
    // Reset classes
    weatherIcon.className = 'material-icons';
    
    // Set icon and color based on weather condition
    switch(weatherCondition.toLowerCase()) {
        case 'clear':
            weatherIcon.textContent = 'wb_sunny';
            weatherIcon.classList.add('weather-sunny');
            break;
        case 'clouds':
            weatherIcon.textContent = 'cloud';
            weatherIcon.classList.add('weather-cloudy');
            break;
        case 'rain':
            weatherIcon.textContent = 'water_drop';
            weatherIcon.classList.add('weather-rainy');
            break;
        case 'drizzle':
            weatherIcon.textContent = 'grain';
            weatherIcon.classList.add('weather-rainy');
            break;
        case 'thunderstorm':
            weatherIcon.textContent = 'thunderstorm';
            weatherIcon.classList.add('weather-storm');
            break;
        case 'snow':
            weatherIcon.textContent = 'ac_unit';
            weatherIcon.classList.add('weather-snow');
            break;
        case 'mist':
        case 'fog':
        case 'haze':
            weatherIcon.textContent = 'cloud';
            weatherIcon.classList.add('weather-mist');
            break;
        default:
            weatherIcon.textContent = 'wb_sunny';
            weatherIcon.classList.add('weather-sunny');
    }
}

// Function to get local time and date for a specific timezone offset
function getLocalDateTime(timezoneOffset) {
    // Create date object for UTC
    const utc = new Date();
    
    // Convert timezone offset from seconds to milliseconds
    const localTime = new Date(utc.getTime() + (timezoneOffset * 1000));
    
    // Format date
    const dateOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        timeZone: 'UTC'
    };
    
    // Format time
    const timeOptions = { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC'
    };
    
    return {
        date: localTime.toLocaleDateString('en-US', dateOptions),
        time: localTime.toLocaleTimeString('en-US', timeOptions)
    };
}

// Update your getWeather function
async function getWeather(city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.cod === '404') {
            alert('City not found!');
            return;
        }

        // Get local time for the city using timezone offset
        const localDateTime = getLocalDateTime(data.timezone);
        
        // Update the DOM with weather data
        currentCity = city;
        cityNameElem.textContent = `${data.name}, ${data.sys.country}`;
        temperatureElem.textContent = `${Math.round(data.main.temp)}°C`;
        humidityElem.textContent = data.main.humidity;
        windSpeedElem.textContent = data.wind.speed;
        
        // Update date and time with local city time
        document.getElementById('current-date').textContent = localDateTime.date;
        document.getElementById('current-time').textContent = localDateTime.time;
        
        // Set weather icon
        setWeatherIcon(data.weather[0].main);

        // Show weather details
        weatherDetailsDiv.style.display = 'block';

        // Start updating the time for this timezone
        startTimeUpdate(data.timezone);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Variable to store the current interval
let timeUpdateInterval;

// Function to start updating time for a specific timezone
function startTimeUpdate(timezoneOffset) {
    // Clear any existing interval
    if (timeUpdateInterval) {
        clearInterval(timeUpdateInterval);
    }
    
    // Update time every second
    timeUpdateInterval = setInterval(() => {
        const localDateTime = getLocalDateTime(timezoneOffset);
        document.getElementById('current-time').textContent = localDateTime.time;
        document.getElementById('current-date').textContent = localDateTime.date;
    }, 1000);
}

// Clear interval when the page is unloaded
window.addEventListener('unload', () => {
    if (timeUpdateInterval) {
        clearInterval(timeUpdateInterval);
    }
});

function addToFavorites() {
    const cityName = document.getElementById('city-name').textContent;
    if (cityName && !favoriteCities.includes(cityName)) {
        favoriteCities.push(cityName);
        localStorage.setItem('favoriteCities', JSON.stringify(favoriteCities));
        displayFavoriteCities();
    }
}

function loadWeatherData(city) {
    // Extract just the city name from the "City, Country" format
    const cityName = city.split(',')[0];
    getWeather(cityName);
}

function displayFavoriteCities() {
    favoriteCitiesList.innerHTML = '';
    
    favoriteCities.forEach(city => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="city-name">
                <span class="material-icons">location_city</span>
                ${city}
            </span>
            <div class="city-actions">
                <button onclick="getWeather('${city.split(',')[0]}')">
                    <span class="material-icons">refresh</span>
                </button>
                <button onclick="removeFromFavorites('${city}')">
                    <span class="material-icons">delete</span>
                </button>
            </div>
        `;
        favoriteCitiesList.appendChild(li);
    });
}

function removeFromFavorites(city) {
    const index = favoriteCities.indexOf(city);
    if (index > -1) {
        favoriteCities.splice(index, 1);
        localStorage.setItem('favoriteCities', JSON.stringify(favoriteCities));
        displayFavoriteCities();
    }
}

// Initialize favorite cities display
displayFavoriteCities();

// Update time every minute
setInterval(updateDateTime, 60000);
