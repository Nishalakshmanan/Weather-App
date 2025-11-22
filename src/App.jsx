import { useEffect, useState, useRef, createContext } from "react";
import Search from "./components/Search";
import DailyForecast from "./components/DailyForecast";
import WeatherDetails from "./components/WeatherDetails";
import bgImage from "./assets/bg-img.jpg";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  formatDate,
  getFormattedWeatherData,
  roundUpTemperature,
} from "./components/DateUtils";
export const ForecastContext = createContext();
function App() {
  const [loading, setLoading] = useState(false);
  const [firstTimeUser, setFirstTimeUser] = useState(false);
  const [city, setCity] = useState(localStorage.getItem("City") || "");
  const [unit, setUnit] = useState(localStorage.getItem("Unit") || "metric");
  const [weatherData, setWeatherData] = useState();
  const [formattedForecastData, setFormattedForecastData] = useState();
  const [forecastList, setForecastList] = useState();
  const [localTime, setLocalTime] = useState();
  const [day, setDay] = useState();
  const [sunTimes, setSunTimes] = useState();
  const [sunMoonDetails, setSunMoonDetails] = useState();
  const [geoError, setGeoError] = useState(null);
  const fetchIntervalIdRef = useRef(null);
  const localTimeIntervalIdRef = useRef(null);

  function getFormattedForecastData(data, timezone) {
    const list = data ? data.list : forecastList;
    const [hour, minute] = formatDate(Date.now(), "time", timezone).split(":");
    const currentDay = formatDate(Date.now(), "day", timezone);
    const requiredList = list.map((item) => {
      return {
        dt: item.dt,
        time: formatDate(item.dt * 1000, "time", timezone),
        day: formatDate(item.dt * 1000, "day", timezone),
        weekDay: formatDate(item.dt * 1000, "week", timezone),
        month: formatDate(item.dt * 1000, "month", timezone),
        icon: item.weather[0].icon,
        desc: item.weather[0].description,
        humidity: item.main.humidity,
        temp: roundUpTemperature(item.main.temp),
      };
    });
    const HourlyForecastList = requiredList
      .filter((item) => {
        const [itemHr, itemMin] = item.time.split(":");
        if (item.day === currentDay) {
          return itemHr > hour || (itemHr == hour && itemMin > minute);
        }
        return true;
      })
      .slice(0, 5);

    const dailyMap = new Map();
    for (const item of requiredList) {
      if (item.day == currentDay) continue; // skip today
      if (!dailyMap.has(item.day)) {
        dailyMap.set(item.day, item); // only first entry per day
      }
    }
    const DailyForecastList = Array.from(dailyMap.values());
    return [HourlyForecastList, DailyForecastList];
  }

  async function callGeoLocation() {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log("location success:", position.coords);
        try {
          const response = await fetch(
            `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=8d040d9c54cea311d922989f85857c9f`
          );
          console.log(response);
          const cityData = await response.json();
          if (Array.isArray(cityData) && cityData.length > 0) {
            console.log(cityData);
            setCity(cityData[0].name);
          } else {
            // Reverse geocoding gave empty data
            setGeoError({
              dt: Date.now(),
              message:
                "Unable to identify your city.Please search your city manually.",
            });
          }
        } catch (error) {
          // API failed
          console.log(error);
          // Catch network/API errors for reverse geocoding
          setGeoError({
            dt: Date.now(),
            message:
              "Failed to fetch city data. Please search your city manually.",
          });
        }
      },
      (error) => {
        let msg = "";

        if (error.code === 1) {
          msg =
            "Location permission denied. Please allow access in browser settings or search your city manually.";
        } else if (error.code === 2) {
          msg =
            "Device cannot detect location. Please enable Location Services or search your city manually.";
        } else if (error.code === 3) {
          if (firstTimeUser) {
            msg = "Location request timed out.Search your city manually.";
          } else {
            msg =
              "Location request timed out. Try again or search your city manually.";
          }
        } else {
          msg =
            "Something went wrong while getting the location. Please search manually.";
        }
        setGeoError({ dt: Date.now(), message: msg });
      }
    );
  }
  useEffect(() => {
    //getCurrentPosition(successCallback,errorCallback)
    if (!city) {
      setFirstTimeUser(true);
      callGeoLocation();
    }
    if (city) {
      console.log("I am the culprit");
      setFirstTimeUser(false); // mark that the user is no longer "first-time"
      setGeoError(null); // optional: clear previous geolocation error
    }

    const fetchWeather = async () => {
      if (!city) return;
      try{
      const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${unit}&appid=8d040d9c54cea311d922989f85857c9f`;
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${unit}&appid=8d040d9c54cea311d922989f85857c9f`;

      const [currentResponse, forecastResponse] = await Promise.all([
        fetch(currentUrl),
        fetch(forecastUrl),
      ]);

      const [currentData, forecastData] = await Promise.all([
        currentResponse.json(),
        forecastResponse.json(),
      ]);
      console.log("weather and forecast api called and received data");
      setWeatherData(getFormattedWeatherData(currentData));
      setForecastList(forecastData.list);
      const [hourlyForecastList, dailyForecastList] = getFormattedForecastData(
        forecastData,
        currentData.timezone
      );
      setFormattedForecastData({ hourlyForecastList, dailyForecastList });
    }
    catch(error){
      console.error("Weather API error:", error);
      toast.error(
        "Failed to fetch latest weather information. Please try again.",
        {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          draggable: true,
        }
      );
    }
    };
  
    fetchIntervalIdRef.current = setInterval(fetchWeather, 1000 * 60 * 10); //10 MINUTES
    fetchWeather(); // call the async function immediately once
    return () => {
      clearInterval(fetchIntervalIdRef.current);
      fetchIntervalIdRef.current = null;
    };
  }, [city, unit]);

  // ---------------------------------------------------------
  // 1) localTime INTERVAL — runs every second
  // ---------------------------------------------------------
  useEffect(() => {
    if (!weatherData) {
      console.log(
        "localtime is going to set on mount so just going to return withnothing"
      );
      return;
    }
    const updateTime = () => {
      console.log("localtime is going to set since weatherData state is set");

      // Get current UTC timestamp
      const now = Date.now();

      // Build the new local time object based on the timezone from weatherData
      const newLocal = {
        time: formatDate(now, "time", weatherData.timeZone),
        weekDay: formatDate(now, "week", weatherData.timeZone),
        day: formatDate(now, "day", weatherData.timeZone),
        month: formatDate(now, "month", weatherData.timeZone),
        month2Digit: formatDate(now, "month2Digit", weatherData.timeZone),
        year: formatDate(now, "year", weatherData.timeZone),
      };

      // Update state only if minutes actually changed
      setLocalTime((prev) => {
        if (!prev) return newLocal;

        // Compare only HH:mm to prevent unnecessary re-renders
        if (prev.time === newLocal.time) {
          return prev; // No change → skip update
        }

        return newLocal; // Minute changed → update state
      });
    };
    // run every second internally
    localTimeIntervalIdRef.current = setInterval(updateTime, 1000);
    // run immediately
    updateTime();
    return () => {
      clearInterval(localTimeIntervalIdRef.current);
      localTimeIntervalIdRef.current = null;
    };
  }, [weatherData]);

  // ---------------------------------------------------------
  // 2) UPDATE  FORMATTEDFORECASTLIST — when localTime changes
  // ---------------------------------------------------------

  useEffect(() => {
    if (!forecastList || !weatherData) {
      console.log(
        "entered forecast filter useeffect on mount but iam just going to return"
      );
      return;
    }
    console.log(
      "forecast is going to get filtered since localtime  state changes"
    );
    const [hourlyForecastList, dailyForecastList] = getFormattedForecastData(
      null,
      weatherData.timeZone
    );
    setFormattedForecastData({ hourlyForecastList, dailyForecastList });
  }, [localTime]);

  // ---------------------------------------------------------
  // 3) FETCH SUNRISE/SUNSET — only when lat/lon or localTime.day changes
  // ---------------------------------------------------------
  useEffect(() => {
    if (!weatherData?.lat || !weatherData?.lon) return;

    const fetchForDate = async ({ y, m, d }, day) => {
    try{
      console.log("sunrise sunset api call is going to made");
      const res = await fetch(
        `https://api.sunrise-sunset.org/json?lat=${weatherData.lat}&lng=${weatherData.lon}&date=${y}-${m}-${d}&formatted=0`
      );
      const json = await res.json();
      console.log("datareceied from then sunrise sunset api");
      console.log({
        whatday: day,
        dateforWhichsunrisesunsetapiiscalled: `${y}-${m}-${d}`,
        sunrise: new Date(json.results.sunrise).toUTCString(),
        sunset: new Date(json.results.sunset).toUTCString(),
      });
      return {
        sunrise: new Date(json.results.sunrise).getTime(),
        sunset: new Date(json.results.sunset).getTime(),
      };
    }
    catch(error){
      console.error("Sunrise/Sunset API failed:", error);
      toast.error(
        "Failed to fetch latest weather information. Please try again.",
        {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          draggable: true,
        }
      );
    }
    };

    const getDateObj = (offset) => {
      const localMS = Date.now() + weatherData.timeZone * 1000;
      const d = new Date(localMS + offset * 86400000);

      return {
        y: d.getUTCFullYear(),
        m: String(d.getUTCMonth() + 1).padStart(2, "0"),
        d: String(d.getUTCDate()).padStart(2, "0"),
      };
    };

    const loadSunTimes = async () => {
      const yd = getDateObj(-1);
      const td = getDateObj(0);
      const tm = getDateObj(1);

      const [y, t, m] = await Promise.all([
        fetchForDate(yd, "yesterday"),
        fetchForDate(td, "today"),
        fetchForDate(tm, "tomorrow"),
      ]);

      setSunTimes({
        sunriseYesterday: y.sunrise,
        sunsetYesterday: y.sunset,
        sunriseToday: t.sunrise,
        sunsetToday: t.sunset,
        sunriseTomorrow: m.sunrise,
        sunsetTomorrow: m.sunset,
        timezoneOffset: weatherData.timeZone,
      });
    };

    loadSunTimes();
  }, [weatherData, localTime?.day]);

  // ---------------------------------------------------------
  // 4) setSunMoonDetails INTERVAL — runs every second
  // ---------------------------------------------------------
  useEffect(() => {
    if (!sunTimes) return;
    console.log("sunset sunsrise current checking is going to made");

    const sunriseSunsetFind = () => {
      const localNow = Date.now() + weatherData.timeZone * 1000;

      const sunriseY_local =
        sunTimes.sunriseYesterday + weatherData.timeZone * 1000;
      const sunsetY_local =
        sunTimes.sunsetYesterday + weatherData.timeZone * 1000;

      const sunriseT_local =
        sunTimes.sunriseToday + weatherData.timeZone * 1000;
      const sunsetT_local = sunTimes.sunsetToday + weatherData.timeZone * 1000;

      const sunriseTm_local =
        sunTimes.sunriseTomorrow + weatherData.timeZone * 1000;
      const sunsetTm_local =
        sunTimes.sunsetTomorrow + weatherData.timeZone * 1000;

      let dayOrNight;
      let sunrise = sunTimes.sunriseToday;
      let sunset = sunTimes.sunsetToday;
      let flagEnter = false;

      console.log({
        localNow: new Date(localNow).toISOString(),
        sunriseT_local: new Date(sunriseT_local).toISOString(),
        sunsetT_local: new Date(sunsetT_local).toISOString(),
        sunriseY_local: new Date(sunriseY_local).toISOString(),
        sunsetY_local: new Date(sunsetY_local).toISOString(),
        sunriseTm_local: new Date(sunriseTm_local).toISOString(),
        sunsetTm_local: new Date(sunsetTm_local).toISOString(),
      });
      /* --------------------------------------------------------
       1) TODAY (2 cases — COMPLETE TODAY)
       -------------------------------------------------------- */

      // 1) Today sunrise → Today sunset (day)
      if (localNow >= sunriseT_local && localNow < sunsetT_local) {
        flagEnter = true;
        dayOrNight = "day";
        sunrise = sunTimes.sunriseToday;
        sunset = sunTimes.sunsetToday;
        console.log("Today sunrise → Today sunset");
        console.log({
          sunrise: new Date(sunriseT_local).toISOString(),
          current: new Date(localNow).toISOString(),
          sunset: new Date(sunsetT_local).toISOString(),
        });
      }
      // 2) Today sunset → Today sunrise (night)
      else if (
        sunriseT_local > sunsetT_local &&
        localNow >= sunsetT_local &&
        localNow < sunriseT_local
      ) {
        flagEnter = true;
        dayOrNight = "night";
        sunrise = sunTimes.sunriseToday;
        sunset = sunTimes.sunsetToday;
        console.log("Today sunset → Today sunrise");
        console.log({
          sunset: new Date(sunsetT_local).toISOString(),
          current: new Date(localNow).toISOString(),
          sunrise: new Date(sunriseT_local).toISOString(),
        });
      }
      /* --------------------------------------------------------
       2) YESTERDAY (4 cases)
       -------------------------------------------------------- */

      // 1) Yesterday sunset → Today sunrise (night)
      else if (
        localNow >= sunsetY_local &&
        localNow < sunriseT_local &&
        sunsetT_local > sunriseT_local
      ) {
        flagEnter = true;
        dayOrNight = "night";
        sunrise = sunTimes.sunriseToday;
        sunset = sunTimes.sunsetYesterday;
        console.log("Yesterday sunset → Today sunrise");
        console.log({
          sunset: new Date(sunsetY_local).toISOString(),
          current: new Date(localNow).toISOString(),
          sunrise: new Date(sunriseT_local).toISOString(),
        });
      }
      // 2) Yesterday sunrise → today sunset (day)
      else if (
        localNow >= sunriseY_local &&
        localNow < sunsetT_local &&
        sunriseT_local > sunsetT_local
      ) {
        flagEnter = true;
        dayOrNight = "day";
        sunrise = sunTimes.sunriseYesterday;
        sunset = sunTimes.sunsetToday;
        console.log("Yesterday sunrise → Today sunset");
        console.log({
          sunrise: new Date(sunriseY_local).toISOString(),
          current: new Date(localNow).toISOString(),
          sunset: new Date(sunsetT_local).toISOString(),
        });
      }
      // 3) Yesterday sunrise → yes sunset (day)
      else if (localNow >= sunriseY_local && localNow < sunsetY_local) {
        flagEnter = true;
        dayOrNight = "day";
        sunrise = sunTimes.sunriseYesterday;
        sunset = sunTimes.sunsetYesterday;
        console.log("Yesterday sunrise → yes sunset");
        console.log({
          sunrise: new Date(sunriseY_local).toISOString(),
          current: new Date(localNow).toISOString(),
          sunset: new Date(sunsetY_local).toISOString(),
        });
      }
      // 4) Yesterday sunSET → yes sunRISE (night)
      else if (localNow >= sunsetY_local && localNow < sunriseY_local) {
        flagEnter = true;
        dayOrNight = "night";
        dayOrNight = "day";
        sunrise = sunTimes.sunriseYesterday;
        sunset = sunTimes.sunsetYesterday;
        console.log("Yesterday sunSET → yes sunRISE");
        console.log({
          sunrise: new Date(sunriseY_local).toISOString(),
          current: new Date(localNow).toISOString(),
          sunset: new Date(sunsetY_local).toISOString(),
        });
      }
      /* --------------------------------------------------------
       3) TOMORROW (2 cases)
       -------------------------------------------------------- */

      // 1) Today sunrise → Tomorrow sunset (polar day)
      else if (
        localNow >= sunriseT_local &&
        localNow < sunsetTm_local &&
        sunriseT_local > sunsetT_local
      ) {
        flagEnter = true;
        dayOrNight = "day";
        sunrise = sunTimes.sunriseToday;
        sunset = sunTimes.sunsetTomorrow;
        console.log("Today sunrise → Tomorrow sunset");
        console.log({
          sunrise: new Date(sunriseT_local).toISOString(),
          current: new Date(localNow).toISOString(),
          sunset: new Date(sunsetTm_local).toISOString(),
        });
      }
      // 2) Today sunset → Tmr sunrise (polar night)
      else if (
        localNow >= sunsetT_local &&
        localNow < sunriseTm_local &&
        sunsetT_local > sunriseT_local
      ) {
        flagEnter = true;
        dayOrNight = "night";
        sunrise = sunTimes.sunriseTomorrow;
        sunset = sunTimes.sunsetToday;
        console.log("Today sunset → Tomorrow sunrise");
        console.log({
          sunset: new Date(sunsetT_local).toISOString(),
          current: new Date(localNow).toISOString(),
          sunrise: new Date(sunriseTm_local).toISOString(),
        });
      }

      if (!flagEnter) {
        const events = [
          { type: "sunrise", time: sunriseT_local },
          { type: "sunset", time: sunsetT_local },
        ];

        // Find next event after current time
        const nextEvent = events
          .filter((e) => e.time > localNow)
          .sort((a, b) => a.time - b.time)[0];

        // Find previous event before current time
        const prevEvent = events
          .filter((e) => e.time <= localNow)
          .sort((a, b) => b.time - a.time)[0];

        // Assign based on next/previous logic, always using today's sunrise/sunset values
        if (nextEvent) {
          if (nextEvent.type === "sunrise") {
            dayOrNight = "night";
          } else {
            dayOrNight = "day";
          }
        } else if (prevEvent) {
          if (prevEvent.type === "sunrise") {
            dayOrNight = "day";
          } else {
            dayOrNight = "night";
          }
        }
      }
      setSunMoonDetails({ sunrise, sunset });
      setDay(dayOrNight);
    };
    sunriseSunsetFind();
    const id = setInterval(sunriseSunsetFind, 1000);

    return () => clearInterval(id);
  }, [sunTimes]);

  useEffect(() => {
    if (geoError&&!firstTimeUser) {
      toast.error(geoError.message, {
        position: "top-center",
        autoClose: 5000,  // toast disappears after 5s
        hideProgressBar:false,
        closeOnClick: true,
        draggable: true,
      });
    }
  }, [geoError]);

  /*BELOW USE EFFECTS FOR CHECKING PURPOSE */
  useEffect(() => {
    if (formattedForecastData)
      console.log("formattedForecastData is set", formattedForecastData);
    else
      console.log(
        "called on mount formattedForecastData may not be set",
        formattedForecastData
      );
  }, [formattedForecastData]);

  useEffect(() => {
    if (forecastList) console.log("forecastList is set", forecastList);
    else
      console.log("called on mount forecastList may not be set", forecastList);
  }, [forecastList]);

  useEffect(() => {
    if (formattedForecastData) console.log("localTime is set", localTime);
    else console.log("called on mount localTime may not be set", localTime);
  }, [localTime]);

  useEffect(() => {
    if (sunMoonDetails) console.log("sunMoonDetails is set", sunMoonDetails);
    else
      console.log(
        "called on mount  sunMoonDetails may not be set",
        sunMoonDetails
      );
  }, [sunMoonDetails]);

  useEffect(() => {
    if (city) {
      console.log("effect for city since city is set", city);
      localStorage.setItem("City", city);
    } else {
      console.log("effect for city on mount", city);
    }
  }, [city]);

  useEffect(() => {
    if (unit) {
      console.log("effect for unit since unit is set", unit);
      localStorage.setItem("Unit", unit);
    } else {
      console.log("effect for unit on mount", unit);
    }
  }, [unit]);

  useEffect(() => {
    if (day) {
      console.log("effect for day since day is set", day);
    } else {
      console.log("effect for day on mount", day);
    }
  }, [day]);
  useEffect(() => {
    if (geoError) {
      console.log("effect for geoError since  geoError is set", geoError);
    } else {
      console.log("effect for geoError on mount", day);
    }
  }, [geoError]);

  if (
    !weatherData ||
    !localTime ||
    !formattedForecastData ||
    !sunMoonDetails ||
    !day
  ) {
    console.log("hello iam skipped");
    console.log("reason", {
      weatherDatacCond: weatherData,
      localTimeCond: localTime,
      formattedForecastDataCond: formattedForecastData,
      sunMoonDetailsCond: sunMoonDetails,
      day: day,
    });
  }
  const isDataLoading =
    !weatherData ||
    !localTime ||
    !formattedForecastData ||
    !sunMoonDetails ||
    !day; //true ->everything is not set false->everything is set
  if (!geoError && loading !== isDataLoading) {
    setLoading(isDataLoading);
  }
  if (geoError && loading) {
    setLoading(false);
  }


  return (
    <div className="relative">
      <img src={bgImage} alt="" className="w-full  fixed h-full -z-20" />
      <ToastContainer newestOnTop={true}/>
      <ForecastContext.Provider
        value={{
          formattedForecastData,
          sunMoonDetails,
          weatherData,
          day,
          setDay,
          unit,
          setUnit,
          city,
          setCity,
          loading,
          callGeoLocation,
        }}
      >
        <Search></Search>
        {
          //firsttime user and no geolocation error
          (firstTimeUser && !geoError && !isDataLoading ? (
            <>
              <div className="flex flex-col md:gap-5 md:flex-row md:justify-center ">
                <WeatherDetails localTime={localTime}></WeatherDetails>
                <DailyForecast></DailyForecast>
              </div>
            </>
          ) : (
            ""
          )) ||
            //firsttime user and geolocation error
            (firstTimeUser && geoError&&(
              <div className=" bg-white/5 shadow-black flex flex-col items-start md:items-center  shadow-md transparent px-7 py-5 rounded-md mt-12 mx-auto min-w-[280px] max-w-[85%] ">
                <p className="font-medium text-red-700 ">{geoError.message}</p>

                {/* Only show button if permission denied and Chromium */}
                {geoError.message.includes("Location permission denied")?(
                  <p className="mt-2 text-gray-50 ">
                    To access location , Go to browser settings → Enable location acess
                  </p>
                ):""}
              </div>
            ))||
            //not firsttime user
            (!firstTimeUser && !isDataLoading ? (
              <>
                <div className="flex flex-col md:gap-5 md:flex-row md:justify-center ">
                  <WeatherDetails localTime={localTime}></WeatherDetails>
                  <DailyForecast></DailyForecast>
                </div>
              </>
            ) : (
              ""
            ))
        }
      </ForecastContext.Provider>
    </div>
  );
}
export default App;
