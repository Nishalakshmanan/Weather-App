
export function formatDate(dt, type, offsetInSeconds) {
  const date = new Date(dt + offsetInSeconds * 1000);
  const weeks = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  switch (type) {
    case "week":
      return weeks[date.getUTCDay()];
    case "month":
      return months[date.getUTCMonth()];
    case "month2Digit":
      return Number(String(date.getUTCMonth()).padStart(2, "0"))+1;
    case "day":
      return date.getUTCDate();
    case "time":
      const hours = String(date.getUTCHours()).padStart(2, "0");
      const minutes = String(date.getUTCMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    case "year":
        return date.getUTCFullYear()
    default:
      return "";
  }
}

export function getFormattedWeatherData(data) {
    return {
      lat: data.coord.lat,
      lon: data.coord.lon,
      timeZone: data.timezone,
      dateAccordingToLastFetch: formatDate(
        data.dt * 1000,
        "day",
        data.timezone
      ), //used for fetching nextSunrise
      sunsetDt: data.sys.sunset,
      sunriseDt: data.sys.sunrise,
      city: data.name,
      country: data.sys.country,
      degree:roundUpTemperature(data.main.temp),
      desc: data.weather[0].description,
      icon: data.weather[0].icon,
      visibility: Math.round(data.visibility / 1000),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      feelsLike: Math.round(data.main.feels_like),
      windSpeed: Math.round(data.wind.speed), //now in m/s
      sunrise: formatDate(data.sys.sunrise * 1000, "time", data.timezone),
      sunset: formatDate(data.sys.sunset * 1000, "time", data.timezone),
    };
  }



  export function roundUpTemperature(temp) {
  return temp > 0 ? Math.ceil(temp) : Math.floor(temp);
 }




