const search_button=document.getElementById("btn1");
const currentLocation_button=document.getElementById("btn2");
const city=document.getElementById("city");
const search=document.getElementById("search");

const cWeather=document.getElementById("weather");

const key='104b3a0575c5dafab770f17dd9dbd7b9';
const url='https://api.openweathermap.org/data/2.5';

const recentCitiesContainer = document.getElementById('recent-cities-container');
const recentCitiesSelect = document.getElementById('recent-cities');


search_button.addEventListener("click",async (e)=>{
    e.preventDefault();
const cityInput=city.value.trim();
if(cityInput){
    await fetchWeather(cityInput);
    city.value="";
}
else{
    alert("Enter Valid City Name");
}
});

recentCitiesSelect.addEventListener('change', async (e) => {
    const selectedCity = e.target.value;
   console.log(selectedCity);
   
    if (selectedCity) {
        await fetchWeather(selectedCity);
    }
});

async function fetchWeather(city){
    try{
        const current_weather= await fetch(`${url}/weather?q=${city}&appid=${key}&units=metric`);
        if(!current_weather.ok){
            throw new Error("City not Found");
        } 
        else{
            const get_currentWeather=await current_weather.json();
            displayWeather(get_currentWeather);
            addCitytoLocalstorage(city);
        }
    }
    catch(error){
        alert(error.message);
    }
}

async function displayWeather(data) {
    const { name, sys, weather, wind,main }=data;
    const iconUrl = `http://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;
    document.getElementById("cLocation").textContent=`${name}, ${sys.country}`;
    document.getElementById("date").textContent=new Date().toLocaleDateString();
    document.getElementById("temp").textContent=`${main.temp}°C`;
    document.getElementById("icon").src=iconUrl;
    document.getElementById("desc").textContent=weather[0].description;
    document.getElementById("wind").textContent=wind.speed;
    document.getElementById("humidity").textContent=main.humidity;

         cWeather.classList.remove('hidden');
}


function addCitytoLocalstorage(city) {
    if (!recentCities.includes(city)) {
        recentCities.unshift(city); // Add city to the start of the array
        if (recentCities.length > 5) recentCities.pop(); // Limit to 5 cities
        localStorage.setItem('recentCities', JSON.stringify(recentCities)); // Save to local storage
        updateRecentCities(); // Refresh dropdown
    }
}

function updateRecentCities() {
    if (recentCities.length > 0) {
        recentCitiesContainer.classList.remove('hidden');
        recentCitiesSelect.innerHTML = '<option class="bg-transparent" value="">Select a city</option>'; // Default option
        recentCities.forEach((city) => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            recentCitiesSelect.appendChild(option); // Append each city to the dropdown
        });
    } else {
        recentCitiesContainer.classList.add('hidden'); // Hide dropdown if no cities
    }
}

// Initialize recent cities dropdown on page load
document.addEventListener('DOMContentLoaded', () => {
    recentCities = JSON.parse(localStorage.getItem('recentCities')) || []; // Retrieve from local storage

   updateRecentCities(); // Populate dropdown
});

