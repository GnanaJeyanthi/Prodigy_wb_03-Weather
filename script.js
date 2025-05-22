const API_KEY = 'your_openweathermap_api_key'; // Replace with your actual API key
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// For demo purposes, we'll use a mock API response
const DEMO_MODE = true;

function showLoading() {
    document.getElementById('loading').classList.add('show');
    document.getElementById('weatherInfo').classList.remove('show');
    document.getElementById('error').classList.remove('show');
}

function hideLoading() {
    document.getElementById('loading').classList.remove('show');
}

function showError(message) {
    const errorElement = document.getElementById('error');
    errorElement.textContent = message;
    errorElement.classList.add('show');
    hideLoading();
}

function getWeatherIcon(weatherCode, isDay = true) {
    const iconMap = {
        '01': isDay ? '☀️' : '🌙',
        '02': isDay ? '⛅' : '🌙',
        '03': '☁️',
        '04': '☁️',
        '09': '🌧️',
        '10': isDay ? '🌦️' : '🌧️',
        '11': '⛈️',
        '13': '🌨️',
        '50': '🌫️'
    };
    return iconMap[weatherCode] || '🌤️';
}

function displayWeather(data) {
    const weatherInfo = document.getElementById('weatherInfo');
    
    document.getElementById('locationName').textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°C`;
    document.getElementById('weatherDescription').textContent = data.weather[0].description;
    document.getElementById('feelsLike').textContent = `${Math.round(data.main.feels_like)}°C`;
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
    document.getElementById('windSpeed').textContent = `${data.wind.speed} m/s`;
    document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;
    document.getElementById('visibility').textContent = `${(data.visibility / 1000).toFixed(1)} km`;
    document.getElementById('uvIndex').textContent = 'N/A'; // UV index requires separate API call
    
    // Set weather icon
    const weatherCode = data.weather[0].icon.slice(0, 2);
    const isDay = data.weather[0].icon.includes('d');
    document.getElementById('weatherIcon').textContent = getWeatherIcon(weatherCode, isDay);
    
    hideLoading();
    weatherInfo.classList.add('show');
}

async function fetchWeatherData(query) {
    if (DEMO_MODE) {
        // Return mock data for demonstration
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    name: "New York",
                    sys: { country: "US" },
                    main: {
                        temp: 22,
                        feels_like: 25,
                        humidity: 65,
                        pressure: 1013
                    },
                    weather: [{
                        description: "partly cloudy",
                        icon: "02d"
                    }],
                    wind: { speed: 3.5 },
                    visibility: 10000
                });
            }, 1000);
        });
    }
    
    try {
        const response = await fetch(`${BASE_URL}?${query}&appid=${API_KEY}&units=metric`);
        
        if (!response.ok) {
            throw new Error('Weather data not found');
        }
        
        return await response.json();
    } catch (error) {
        throw new Error('Failed to fetch weather data');
    }
}

async function searchWeather() {
    const cityInput = document.getElementById('cityInput');
    const city = cityInput.value.trim();
    
    if (!city) {
        showError('Please enter a city name');
        return;
    }
    
    showLoading();
    
    try {
        const data = await fetchWeatherData(`q=${encodeURIComponent(city)}`);
        displayWeather(data);
    } catch (error) {
        showError(error.message);
    }
}

async function getCurrentLocation() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by this browser');
        return;
    }
    
    showLoading();
    
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            
            try {
                const data = await fetchWeatherData(`lat=${latitude}&lon=${longitude}`);
                displayWeather(data);
            } catch (error) {
                showError(error.message);
            }
        },
        () => {
            showError('Unable to retrieve your location');
        }
    );
}

// Add event listener for Enter key on search input
document.getElementById('cityInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        searchWeather();
    }
});

// Load default weather data on page load (demo mode)
window.addEventListener('load', () => {
    if (DEMO_MODE) {
        document.getElementById('cityInput').value = 'New York';
        searchWeather();
    }
});