let form = document.querySelector(".search-form");
let searchInput = document.querySelector(".search-input");
let city = document.querySelector(".city");
let state = document.querySelector(".state");
let country = document.querySelector(".country");
let humidity = document.querySelector(".humidity");
let wind = document.querySelector(".wind");
let temp = document.querySelector(".temp");
let apaTemp = document.querySelector(".apa-temp");
let dayNightStatus = document.querySelector(".daynight-status");
let weatherIcon = document.querySelector(".weather-icon");
let weatherCondition = document.querySelector(".condition p");
let locationDate = document.querySelector(".location-date");
let locationTime = document.querySelector(".location-time");
let suggSec = document.querySelector(".sugg-sec");

function getDayNightStatus(status) {
  if (status === 0) { dayNightStatus.textContent = "🌙 Night" }
  if (status === 1) { dayNightStatus.textContent = "☀️ Day" }
}

function getWeatherCondition(code) {
  if (code === 0) { return { condition: "Clear sky", icon: "☀️" } }
  if (code === 1) { return { condition: "Mainly clear", icon: "🌤️" } }
  if (code === 2) { return { condition: "Partly cloudy", icon: "⛅" } }
  if (code === 3) { return { condition: "Overcast", icon: "☁️" } }
  if (code === 45 || code === 48) { return { condition: "Fog", icon: "🌫️" } }
  if (code >= 51 && code <= 57) { return { condition: "Drizzle", icon: "🌦️" } }
  if (code >= 61 && code <= 67) { return { condition: "Rain", icon: "🌧️" } }
  if (code >= 71 && code <= 77) { return { condition: "Snow", icon: "❄️" } }
  if (code >= 80 && code <= 82) { return { condition: "Rain showers", icon: "🌦️" } }
  if (code >= 95 && code <= 99) { return { condition: "Thunderstorm", icon: "⛈️" } }
  return { condition: "Weather unavailable", icon: "🌡️" }
}
let getLatLon = () => {

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition((position) => {
      
      let latitude = position.coords.latitude;
      let longitude = position.coords.longitude;
      console.log("current lat long", position);
  
      resolve({latitude,longitude});
    });
    
  });
};



let getData = async (searchText) => {
console.log("------------------------");

  try {
    let myCoordinates = await getLatLon();
    console.log("my Current laong", myCoordinates.longitude, "my current Latt", myCoordinates.latitude);
    var requestOptions = {
      method: 'GET',
    };
    console.log("Search Result Coordernates fetching started");
    console.log("Searching", searchText);
    let response = await fetch(`https://api.geoapify.com/v1/geocode/search?text=${searchText}&bias=proximity:${myCoordinates.longitude},${myCoordinates.latitude}&apiKey=9b62d2675dc642df9ccb58618f437507`, requestOptions)
    
    let data = await response.json();
    let results = data.features[0].properties;
    results.country;
    city.textContent = results.name;
    state.textContent = results.state;
    country.textContent = results.country;
    console.log("Search Result coordinates", data);
    console.log("Search Result latitude", results.lat,"Search Result longitude", results.lon);
    console.log("Search Result Coordinates Fetching succesful");
    let weatherResp = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${results.lat}&longitude=${results.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,wind_speed_10m,wind_direction_10m,rain,weather_code&timezone=auto`
    );
    let weatherDataResults = await weatherResp.json();
    getDayNightStatus(weatherDataResults.current.is_day);
    let currentCondition = getWeatherCondition(weatherDataResults.current.weather_code);
    weatherCondition.textContent = currentCondition.condition;
    weatherIcon.textContent = currentCondition.icon;
    humidity.textContent = weatherDataResults.current.relative_humidity_2m;
    wind.textContent = weatherDataResults.current.wind_speed_10m;
    temp.textContent = weatherDataResults.current.temperature_2m;
    apaTemp.textContent = weatherDataResults.current.apparent_temperature;


    // const time = new Intl.DateTimeFormat("en-IN", {
    //   timeZone: weatherDataResults.timezone,
    //   hour: "2-digit",
    //   minute: "2-digit",
    //   second: "2-digit",
    //   hour12: true
    // }).format();

    // console.log(time);
    // console.log(typeof time);

    // let dateBasedOnLocation = new Date().toLocaleString(`en`, {
    //   timeZone: weatherDataResults.timezone,
      //   year: "2-digit",
      //   month: "2-digit",
      //   day: "2-digit",
      //  hour: "2-digit",
      //   weekday: "long",
    //   dateStyle: "short",
    //   timeStyle: "medium",
    //   hour12: true
    // });
    // let fullDate = new Date(dateBasedOnLocation);
    // console.log(
    //   fullDate.getHours(), fullDate.getMinutes()
    // );
    
   let date = new Date().toLocaleString("en", {
      timeZone: weatherDataResults.timezone,
    dateStyle:"medium",
    
   });
   let time = new Date().toLocaleString("en", {
      timeZone: weatherDataResults.timezone,
    timeStyle:"short",
   });

    locationDate.textContent = date;
    locationTime.textContent = time;


    console.log("weather result", weatherDataResults);
    console.log("Weather Fetching succesful");
  } catch (error) {
    console.log("Can not fetch data:", error);
  };
  form.querySelector("input").value = "";
suggSec.innerHTML = "";
  suggSec.style.visibility = "hidden";
};

let latLongToAdd = async () => {
  try{

    let mmyCoordinates = await getLatLon();
    console.log("myCurrentlong", mmyCoordinates.longitude, "myCurrentLatt", mmyCoordinates.latitude);
    let addressRes = await fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${mmyCoordinates.latitude}&lon=${mmyCoordinates.longitude}&limit=10&&apiKey=d6aa67b22ee241cbb4fc1b28b1617e40`);
    let addressObj = await addressRes.json(); 
    let address = addressObj.features[0].properties;
    console.log("currentAddres", addressObj)
    // console.log("name", address.address_line1, "city", address.city, "country", address.country)
    getData(address.city || address.address_line1);
    
    let sugg = async () => {
console.log(searchInput.value);
      let autoSugg = await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${searchInput.value}&limit=10&bias=proximity:${mmyCoordinates.longitude},${mmyCoordinates.latitude}&apiKey=aececa5655b14f29baae1b8c82b3a27d`);
      
      let autoSuggdata = await autoSugg.json();
suggSec.innerHTML = "";
      autoSuggdata.features.forEach(elem => {
        let pro = elem.properties;
        console.log(pro.address_line1 || pro.city, pro.state || "", pro.country);
        suggSec.innerHTML += `<div class="suggested-address" data-loca="${pro.address_line1 || pro.city}, ${pro.state || ""}, ${pro.country}">${pro.address_line1 || pro.city}, ${pro.state || ""}, ${pro.country}</div>`;
        
      });

      document.querySelectorAll(".suggested-address").forEach((elem) => {
        elem.addEventListener("click", (e) => {
           
          getData(e.target.dataset.loca);
        });
});

      console.log();
      console.log("autoSuggdata---->", autoSuggdata);
    };
     
   searchInput.addEventListener("input", () => {
      
      if(searchInput.value != ""){
        suggSec.style.visibility = "visible";
        sugg();
      }else{
        suggSec.style.visibility = "hidden";
        suggSec.innerHTML = "";
      }

    });

  } catch(error) {
console.log(error);
  };
  };
latLongToAdd();



form.addEventListener("submit", (e) => {
  e.preventDefault();
  let inputValue = form.querySelector("input").value;
  if(inputValue == ""){

    alert("please enter location");
  }
  else{
    let searchText = inputValue;
    console.log(searchText);
    getData(searchText);
  }

});






