const weatherForm= document.querySelector(".weatherforecast");
const cityInput=document.querySelector(".cityinput");
const container=document.querySelector(".container");
const apiKey="943c11d294da87bf303c64ca465b1a6e";
weatherForm.addEventListener("submit",async event=>{

        event.preventDefault();
        const city= cityInput.value;
        if(city){
            try {
                const weatherData= await getWeatherData(city);
                displayData(weatherData);
            } catch (error) {
                console.error(error);
                displayError(error);
            }
        }
        else{
            displayError("Please Enter Correct city ");
        }
})

async function getWeatherData(city){
    const apiUrl=`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`

    const response= await fetch(apiUrl);
    if(!response.ok){
        throw new Error("Couldn't Fetch The city");
    }
     const data = await response.json();  
  const lat = data.coord.lat;
  const lon = data.coord.lon;

  const aqiRes = await fetch(
    `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`
  );
  const aqiData = await aqiRes.json();
  const aqi = aqiData.list[0].main.aqi;

  // Return all data
  return {
    weather: data,
    aqi: aqiData,
  };
}

function displayData(data) {
  console.log(data);

  const {
    weather: {
      name: city,
      main: { temp, humidity, pressure },
      weather: [{ description, id }],
      sys: { sunrise, sunset },
      wind:{ deg,speed,gust}
    },
    aqi: {
      list: [
        {
          components: { pm2_5, pm10 },
          main: { aqi }
        }
      ]
    }
  } = data;
  const cityDisplay=document.getElementById("cityname");
  const weatherEmoji=document.getElementById("emoji");
  const tempDisplay=document.getElementById("temperature");
  const weatherDisplay=document.getElementById("weather");
  const humidityDisplay=document.getElementById("humidity");
  const windSpeedDisplay=document.getElementById("windSpeed");
  const aqiDisplay=document.getElementById("AQI");
  const airQualityDisplay=document.getElementById("airquality");
  const sunriseDisplay=document.getElementById("sunrise");
  const sunsetDisplay=document.getElementById("sunset");
  const pressureDisplay=document.getElementById("pressure");
  container.style.display="flex";
  cityDisplay.textContent=city;
  tempDisplay.textContent=`Temperature : ${(temp-273.15).toFixed(2)}°C`;
  weatherDisplay.textContent=`Weather : ${description}`;
  humidityDisplay.textContent=`Humidity : ${humidity}%`;
  const direction = getWindDirection(deg);
  windSpeedDisplay.textContent = `Wind: ${speed} m/s,\tDirection: ${direction} (${deg}°)`;
  const aqiIndex=calculateAQIfromPM25(pm2_5);
  aqiDisplay.textContent=`AQI Index : ${aqiIndex}`;
  const airQuality=getAQICategory(aqiIndex);
  airQualityDisplay.textContent=`Air Quality : ${airQuality}`;
  const sunRise = convertUnixToTime(sunrise);
  const sunSet = convertUnixToTime(sunset);
  sunriseDisplay.textContent=`Sunrise 🌅 :  ${sunRise}`;
  sunsetDisplay.textContent=`Sunset 🌇 :  ${sunSet}`;
  pressureDisplay.textContent=`Pressure : ${pressure} hPa`;
  weatherEmoji.textContent=getWeatherEmoji(id);
}

function getWeatherEmoji(weatherId){
    if(weatherId>=200&&weatherId<300){
        return "⛈️";
    }
    else if(weatherId>=300&&weatherId<400){
        return "🌧️";
    }
    else if(weatherId>=500&&weatherId<600){
        return "🌧️";
    }
    else if(weatherId>=600&&weatherId<700){
        return "☃️";
    }
    else if(weatherId>=700&&weatherId<800){
        return "🌁";
    }
    else if(weatherId===800){
        return "☀️";
    }
    else if(weatherId>800&&weatherId<810){
        return "☁️";
    }
    else{
        return "👽";
    }

}
function convertTo12HourFormat(time24) {
  const [hoursStr, minutesStr] = time24.split(":");
  let hours = parseInt(hoursStr);
  const minutes = minutesStr.padStart(2, '0');
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12 || 12; 
  return `${hours}:${minutes} ${ampm}`;
}
function convertUnixToTime(unixTimestamp) {
  const date = new Date(unixTimestamp * 1000);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
   return convertTo12HourFormat(`${hours}:${minutes}`);
}

function getWindDirection(deg) {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(deg / 45) % 8;
  return directions[index];
}

function calculateAQIfromPM25(pm25) {
  const breakpoints = [
    { cLow: 0, cHigh: 12, iLow: 0, iHigh: 50 },
    { cLow: 12.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
    { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
    { cLow: 55.5, cHigh: 150.4, iLow: 151, iHigh: 200 },
    { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300 },
    { cLow: 250.5, cHigh: 350.4, iLow: 301, iHigh: 400 },
    { cLow: 350.5, cHigh: 500.4, iLow: 401, iHigh: 500 },
  ];

  for (const bp of breakpoints) {
    if (pm25 >= bp.cLow && pm25 <= bp.cHigh) {
      const aqi = ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (pm25 - bp.cLow) + bp.iLow;
      return Math.round(aqi);
    }
  }

  return -1; // If out of range
}

function getAQICategory(aqi) {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Satisfactory";
  if (aqi <= 200) return "Moderate";
  if (aqi <= 300) return "Poor";
  if (aqi <= 400) return "Very Poor";
  return "Severe";
}

function displayError(message){
    const errorDisplay=document.createElement("p");
    errorDisplay.textContent=message;
    errorDisplay.classList.add("errordisplay");
    container.textContent="";
    container.style.display="flex";
    container.appendChild(errorDisplay)
}