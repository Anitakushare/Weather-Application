const search_button = document.getElementById("btn1");
const currentLocation_button = document.getElementById("btn2");
const city = document.getElementById("city");
const search = document.getElementById("search");

const cWeather = document.getElementById("weather");

const key = "104b3a0575c5dafab770f17dd9dbd7b9";
const url = "https://api.openweathermap.org/data/2.5";

const recentCitiesContainer = document.getElementById(
  "recent-cities-container"
);
const recentCitiesSelect = document.getElementById("recent-cities");

const forecastContainer = document.getElementById("forecast-container");
const forecastCards= document.getElementById("forecast-cards");

search_button.addEventListener("click", async (e) => {
  e.preventDefault();
  const cityInput = city.value.trim();
  if (!cityInput) {
    alert("Enter Valid City Name");
    return;
  } 
  await fetchWeather(cityInput);
            city.value = '';
});

currentLocation_button.addEventListener("click", async () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await getWeatherByCurrentLoction(latitude, longitude);
      },
      (error) => {
        alert(
          "Unable to retrieve your location. Please enable location services."
        );
        console.error(error);
      }
    );
  } else {
    alert("Geolocation is not supported by your browser.");
  }
});

recentCitiesSelect.addEventListener("change", async (e) => {
  const selectedCity = e.target.value;
  //console.log(selectedCity);

  if (selectedCity) {
    await fetchWeather(selectedCity);
  }
});

async function fetchWeather(city) {
  try {
    const current_weather = await fetch(`${url}/weather?q=${city}&appid=${key}&units=metric`);
    if (!current_weather.ok) throw new Error("City not Found");

    const get_currentWeather = await current_weather.json();
    displayWeather(get_currentWeather);
    addCitytoLocalstorage(city);
    
    const forecastRes = await fetch(
     
      `${url}/forecast?q=${city}&appid=${key}&units=metric`
    );
   
    if (!forecastRes.ok) throw new Error("Error fetching forecast data");
    const forecastData = await forecastRes.json();
    getFiveDayForecast(forecastData);
    
   
  } catch (error) {
    alert(error.message);
  }
}

async function displayWeather(data) {
  const { name, sys, weather, wind, main } = data;
  const iconUrl = `http://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;
  document.getElementById("cLocation").textContent = `${name}, ${sys.country}`;
  document.getElementById("date").textContent = new Date().toLocaleDateString();
  document.getElementById("temp").textContent = `${main.temp}°C`;
  document.getElementById("icon").src = iconUrl;
  document.getElementById("desc").textContent = weather[0].description;
  document.getElementById("wind").textContent = wind.speed;
  document.getElementById("humidity").textContent = main.humidity;

  cWeather.classList.remove("hidden");
}

 async function getFiveDayForecast(data) {
  forecastCards.innerHTML = "";
  const forecasts = data.list.filter((item) =>
    item.dt_txt.endsWith("12:00:00")
  );

  forecasts.forEach((forecast) => {
    const { dt_txt, weather, main, wind } = forecast;
    const iconUrl = `http://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;

    const card = document.createElement("div");
    card.className = "bg-blue-950 text-white w-full p-4 text-center rounded-lg border border-purple shadow-[#5dadec3b] shadow-xl transition-shadow duration-300 hover:shadow-lg hover:shadow-gray-400 ";
    card.innerHTML = `
                <p class="font-bold">${new Date(
                  dt_txt 
                ).toLocaleDateString()}</p>
                <img src="${iconUrl}" alt="${
      weather[0].description
    }" class="mx-auto w-16 h-16">
                <p class="text-lg font-bold">${main.temp}°C</p>
                <p><i class="fa-solid fa-wind"></i> : ${wind.speed} m/s</p>
                 <p><i class="fa-solid fa-droplet"></i> : ${main.humidity}%</p>
            `;
    forecastCards.appendChild(card);
  });

  forecastContainer.classList.remove("hidden");
}

async function getWeatherByCurrentLoction(latitude, longitude) {
  try {
    // Fetch Weather using current Location
    const currentWeatherRes = await fetch(
      `${url}/weather?lat=${latitude}&lon=${longitude}&appid=${key}&units=metric`
    );
    if (!currentWeatherRes.ok)
      throw new Error("Error fetching weather data for current location");

    const currentWeatherData = await currentWeatherRes.json();
    displayWeather(currentWeatherData);
   

    //5 days forcast
    const forecastRes = await fetch(
      `${url}/forecast?lat=${latitude}&lon=${longitude}&appid=${key}&units=metric`
    );
    if (!forecastRes.ok)
      throw new Error("Error fetching forecast data for current location");

    const forecastData = await forecastRes.json();
    getFiveDayForecast(forecastData);
    addCitytoLocalstorage(currentWeatherData.name);

    // Add city name to recent cities
  } catch (error) {
    alert(error.message);
  }
}

function addCitytoLocalstorage(city) {
  if (!recentCities.includes(city)) {
    recentCities.unshift(city); // Add city to the start of the array
    if (recentCities.length > 5) recentCities.pop(); // Limit to 5 cities
    localStorage.setItem("recentCities", JSON.stringify(recentCities)); // Save to local storage
    updateRecentCities(); // Refresh dropdown
  }
}

function updateRecentCities() {
  if (recentCities.length > 0) {
    recentCitiesContainer.classList.remove("hidden");
    recentCitiesSelect.innerHTML =
      '<option class="bg-transparent" value="">Select a city</option>'; // Default option
    recentCities.forEach((city) => {
      const option = document.createElement("option");
      option.value = city;
      option.textContent = city;
      recentCitiesSelect.appendChild(option); // Append each city to the dropdown
    });
  } else {
    recentCitiesContainer.classList.add("hidden"); // Hide dropdown if no cities
  }
}
// Initialize recent cities dropdown on page load
document.addEventListener("DOMContentLoaded", () => {
  recentCities = JSON.parse(localStorage.getItem("recentCities")) || []; // Retrieve from local storage

  updateRecentCities(); // Populate dropdown
});
