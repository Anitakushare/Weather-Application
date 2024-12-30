const search_button = document.getElementById("btn1");
const currentLocation_button = document.getElementById("btn2");
const city = document.getElementById("city");
const search = document.getElementById("search");

const cWeather = document.getElementById("weather");
const errorMessage=document.getElementById("error-message");
const recentCitiesContainer = document.getElementById("recent-cities-container");
const recentCitiesSelect = document.getElementById("recent-cities");

const forecastContainer = document.getElementById("forecast-container");
const forecastCards= document.getElementById("forecast-cards");

const key = "104b3a0575c5dafab770f17dd9dbd7b9";
const url = "https://api.openweathermap.org/data/2.5";

//Event Listener for search weather according to city Name
search_button.addEventListener("click", async (e) => {
  e.preventDefault();
  const cityInput = city.value.trim();
  if (!cityInput) throw new Error("Enter Vlid City Name");
  await fetchWeather(cityInput);
            city.value = '';
});
//Event Listener for search weather using current Location
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
//Event Listener for search weather according to Recent Searcher city
recentCitiesSelect.addEventListener("change", async (e) => {
  const selectedCity = e.target.value;
  //console.log(selectedCity);

  if (selectedCity) {
    await fetchWeather(selectedCity);
  }
});

  //Function to fetch data using Weather Api and Key 
async function fetchWeather(city) {
  try {
    const current_weather = await fetch(`${url}/weather?q=${city}&appid=${key}&units=metric`);
    if (!current_weather.ok){
      throw new Error("City not found. Please check the spelling and try again.");
    }
    const get_currentWeather = await current_weather.json();
    displayWeather(get_currentWeather);
    addCitytoLocalstorage(city);
    
    const forecastRes = await fetch(
     
      `${url}/forecast?q=${city}&appid=${key}&units=metric`
    );
   
    if (!forecastRes.ok) 
      throw new Error("Error fetching forecast data");
    const forecastData = await forecastRes.json();
    getFiveDayForecast(forecastData);
    
   
  } catch (error) {
    alert(error.message);
  }
}
//function for display weather data
async function displayWeather(data) {
  const { name, sys, weather, wind, main } = data;
  const iconUrl = `http://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;
  document.getElementById("cLocation").textContent = `${name},${sys.country}`;
  document.getElementById("date").textContent = "(" + new Date().toLocaleDateString() +")";
  document.getElementById("temp").textContent = `${main.temp}°C`;
  document.getElementById("icon").src = iconUrl;
  document.getElementById("desc").textContent = weather[0].description;
  document.getElementById("wind").textContent = wind.speed;
  document.getElementById("humidity").textContent = main.humidity;

  cWeather.classList.remove("hidden");
  document.getElementById("weather-section").classList.remove("hidden");
}
//function to fetch 5 days forcast 
 async function getFiveDayForecast(data) {
  forecastCards.innerHTML = "";
  const forecasts = data.list.filter((item) =>
    item.dt_txt.endsWith("12:00:00")
  );
 
  forecasts.forEach((forecast) => {
    const { dt_txt, weather, main, wind } = forecast;
    const iconUrl = `http://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;

    const card = document.createElement("div");
    card.className = "bg-blue-950 flex flex-col sm:flex-row justify-center items-center h-auto gap-4 sm:gap-6 md:gap-8 text-white w-full max-w-3xl p-2 sm:p-4 rounded-lg border border-purple shadow-[#5dadec3b] shadow-lg ";
    card.innerHTML = `
                <p class="font-bold">${new Date(
                  dt_txt 
                ).toLocaleDateString()}</p>
                <img src="${iconUrl}" alt="${
      weather[0].description
    }" class=" w-16 h-16">
                <p class="text-lg font-bold">${main.temp}°C</p>
                <p><i class="fa-solid fa-wind"></i> : ${wind.speed} m/s</p>
                 <p><i class="fa-solid fa-droplet"></i> : ${main.humidity}%</p>
            `;
    forecastCards.appendChild(card);
  });

  forecastContainer.classList.remove("hidden");
}
//function to fecth weather of current location
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
     // Add city name to recent cities
    addCitytoLocalstorage(currentWeatherData.name);

   
  } catch (error) {
    alert(error.message);
  }
}



// add city to local storage
function addCitytoLocalstorage(city) {
  if (!recentCities.includes(city)) {
    recentCities.unshift(city); // Add city to the start of the array
    if(recentCities.length>6) recentCities.pop();
    localStorage.setItem("recentCities", JSON.stringify(recentCities)); // Save to local storage
    updateRecentCities(); // Refresh dropdown
  }
}
//update recent Cities
function updateRecentCities() {
  if (recentCities.length > 0) {
    recentCitiesContainer.classList.remove("hidden");
    recentCitiesSelect.innerHTML =
      '<option class="value="">Select a city</option>'; // Default option
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
