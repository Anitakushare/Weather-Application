const search_button=document.getElementById("btn1");
const currentLocation_button=document.getElementById("btn2");
const city=document.getElementById("city");
const search=document.getElementById("search");

const cWeather=document.getElementById("weather");

const key='104b3a0575c5dafab770f17dd9dbd7b9';
const url='https://api.openweathermap.org/data/2.5';

const recentCity_container=document.getElementById("recent-cities");
const recentCity=document.getElementById("recent_city");

// console.log(recentCity_container);

// const localCities=JSON.parse(localStorage.getItem('localCities')) || [];
//update
//updateRecentCities();

search.addEventListener("submit",async (e)=>{
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

async function fetchWeather(city){
    try{
        const current_weather= await fetch(`${url}/weather?q=${city}&appid=${key}&units=metric`);
        if(!current_weather.ok){
            throw new Error("City not Found");
        } 
        else{
            const get_currentWeather=await current_weather.json();
            displayWeather(get_currentWeather);
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

// function addCityToRecent(city) {
//     if (!localCities.includes(city)) {
//         localCities = [city, ...localCities.slice(0, 4)]; // Add city to the front and keep only 5
//         localStorage.setItem('localcities', JSON.stringify(localCities));
//         updateRecentCities();
//     }
// }

// function updateRecentCities() {
//     recentCity_container.classList.toggle('hidden', localCities.length === 0);
//     recentCity.innerHTML = localCities
//         .map(city => `<option value="${city}">${city}</option>`)
//         .join('');
// }
