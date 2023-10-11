const apiKey = "6e1731ad28eb43f8a9b183443230810";
const baseUrl = "https://api.weatherapi.com/v1/forecast.json";
const searchBox = document.getElementById("searchBox");
const locationCoutry = document.getElementById("location");
const percent = document.querySelectorAll(".percent");
const rainBars = document.querySelectorAll(".clock");
let currentLocation = "cairo";
let cityContainer = document.querySelector(".city-items");
let recentCities = JSON.parse(localStorage.getItem("cities")) || [];
const deleteBtn = document.getElementById("deleteBtn");
deleteBtn.addEventListener("click", clearAll);



function success(position) {
  const latitude = position.coords.latitude;
  const longitude = position.coords.latitude;
  currentLocation = `${latitude},${longitude}`;
  getWeather(currentLocation);
}

window.addEventListener("load", () => {
  navigator.geolocation.getCurrentPosition(success); //to know your current location
  for (let i = 0; i < recentCities.length; i++) {
    displayCityImage(recentCities[i].city, recentCities[i].country);
  }
});

async function getWeather(location) {
  const response = await fetch(`${baseUrl}?key=${apiKey}&days=7&q=${location}`);
  if (response.status != 200) {
    searchBox.value = "";
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Please Enter a Valid City",
    });
    return;
  }
  const data = await response.json();
  displayWeather(data);
}

function displayWeather(data) {
  let cardsHtml = ``;
  const days = data.forecast.forecastday;
  console.log(data);
  locationCoutry.innerHTML = `<span class="city-name">${data.location.name}</span>${data.location.country}
  `;
  const currentTime = new Date();
  for (let [index, day] of days.entries()) {
    const date = new Date(day.date);
    cardsHtml += `
    <div class ='card ${index == 0 ? " active" : ""}' data-index=${index} >
      <div class="card-header">
        <span class="day">${date.toLocaleDateString("en-us", {
          weekday: "long",
        })}</span>
        <span class="time">${
          currentTime.getHours() > 12
            ? currentTime.getHours() - 12
            : currentTime.getHours()
        },${currentTime.getMinutes()} ${
      currentTime.getHours() > 11 ? "PM" : "AM"
    }</span>
      </div>
      <div class="card-body align-items-center">
        <div class="day-temp">${day.hour[currentTime.getHours()].temp_c}°C</div>
        <img src="./images/conditions/${day.day.condition.text}.svg" alt="" />
      </div>
      <div class="card-data">
        <ul>
          <li>Real Feel: <span class="real-feel"> ${
            day.hour[currentTime.getHours()].feelslike_c
          }°C</span></li>
          <li>Wind: <span class="wind"> ${
            day.hour[currentTime.getHours()].wind_kph
          }K/h</span></li>
          <li>Pressure: <span class="pressure">${
            day.hour[currentTime.getHours()].pressure_mb
          } Mb </span></li>
          <li>Humidity: <span class="humidity">${
            day.hour[currentTime.getHours()].humidity
          } %</span></li>
        </ul>
        <ul>
          <li>Sunset: <span>${day.astro.sunrise}</span></li>
          <li>Sunrise: <span> ${day.astro.sunset}</span></li>
        </ul>
      </div>
  </div>
  `;
  }

  document.getElementById("forecastCard").innerHTML = cardsHtml;
  const cards = document.querySelectorAll(".card");
  for (let card of cards) {
    card.addEventListener("click", (e) => {
      const activeCard = document.querySelector(".card.active");
      activeCard.classList.remove("active");
      e.currentTarget.classList.add("active");
      displayRain(days[e.currentTarget.dataset.index]);
    });
  }

  let exist = recentCities.find(function (currentCity) {
    return currentCity.city == data.location.name;
  });
  if (exist) return;
  recentCities.push({
    city: data.location.name,
    country: data.location.country,
  });
  localStorage.setItem("cities", JSON.stringify(recentCities));
  displayCityImage(data.location.country, data.location.name);
}

function displayRain(rainInfo) {
  console.log(rainInfo);
  for (let element of rainBars) {
    let clock = element.dataset.clock;
    console.log(rainInfo.hour[clock].chance_of_rain);
    let height = rainInfo.hour[clock].chance_of_rain;
    element.querySelector(".percent").style.height = `${height}%`;
  }
}

searchBox.addEventListener("keyup", function (e) {
  if (e.key == "Enter") {
    getWeather(this.value);
    searchBox.value = "";
  }
});

async function getCityImage(city) {
  const response = await fetch(
    `https://api.unsplash.com/search/photos?page=1&query=${city}&client_id=maVgNo3IKVd7Pw7-_q4fywxtQCACntlNXKBBsFdrBzI&per_page=5&orientation=landscape`
  );
  const data = await response.json();
  const random = Math.trunc(Math.random() * data.results.length);
  return data.results[random];
}

async function displayCityImage(city, country) {
  let cityInfo = await getCityImage(city);
  if (cityInfo) {
    let itemContent = `
  <div class="item">
    <div class="city-image">
      <img src="${cityInfo.urls.regular}" alt="Image for ${city} city" />
    </div>
    <div class="city-name"><span class="city-name">${city}</span>, ${country}</div>
  </div>
`;

    cityContainer.innerHTML += itemContent;
  }
}

function clearAll() {
  cityContainer.innerHTML = "";
  localStorage.removeItem("cities");
  displayWeather();
}
