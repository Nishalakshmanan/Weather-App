import { useContext } from "react";
import HourlyForecast from "./HourlyForecast"
import { CiLocationOn } from "react-icons/ci";
import { IoEyeOutline } from "react-icons/io5";
import { WiHumidity } from "react-icons/wi";
import { BiTachometer } from "react-icons/bi";
import { WiSunrise } from "react-icons/wi";
import { WiSunset } from "react-icons/wi";
import { WiThermometerExterior } from "react-icons/wi";
import { LuWind } from "react-icons/lu";
import weatherIcons from "./Icons";
import { ForecastContext } from "../App";
import { formatDate,roundUpTemperature } from "./DateUtils";
function WeatherDetails({localTime}){
    
     const { weatherData,day,sunMoonDetails:{sunrise,sunset},unit } = useContext(ForecastContext);
     const ForecastIcon1=weatherIcons[weatherData.icon]
    return(
        <div className="mt-10  p-3 xs:p-4 text-gray-50 flex flex-col gap-6 justify-center w-[95%] mx-auto md:w-[55%] md:mx-0 bg-white/10 rounded-lg shadow-sm text-sm xs:text-base">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-2">
              <CiLocationOn className="bg-white/20 rounded-full p-1 size-6 shadow-sm" />
              <div>
                <p>{weatherData.city}</p>
                <p>{weatherData.country}</p>
              </div>
            </div>
            <div>
              <p>{localTime.weekDay},{localTime.month} {localTime.day}</p>
              <p>{localTime.time}</p>
            </div>
          </div>
          <div className="flex justify-between items-center w-full">
            <div>
              <p className="text-4xl font-bold">
                {roundUpTemperature(weatherData.degree)}&deg;<span className="text-3xl font-normal">{unit==="metric"?"C":"F"}</span>
              </p>
              <p>{weatherData.desc}</p>
            </div>
            <ForecastIcon1 className="size-20"></ForecastIcon1>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
            {/*Visibility*/}
            <div className="p-3.5 bg-white/20 rounded-lg flex gap-3 shadow-xl">
              <IoEyeOutline className="text-sky-200 bg-white/25 rounded-full p-1 size-6 shadow-lg" />
              <div>
                <p>Visibility</p>
                <p>{weatherData.visibility} Km</p>
              </div>
            </div>
            {/*Wind Speed*/}
            <div className="p-3.5 bg-white/20 rounded-lg flex gap-3 shadow-xl">
              <LuWind className="text-green-200 bg-white/25 rounded-full p-1 size-6 shadow-lg" />
              <div>
                <p>Wind Speed</p>
                <p>{weatherData.windSpeed} {unit==="metric"?"m/s":"mph"}</p>
              </div>
            </div>
            {/*Humidity*/}
            <div className="p-3.5 bg-white/20 rounded-lg flex gap-3 shadow-xl">
              <WiHumidity className="text-cyan-200 bg-white/25 rounded-full  size-6 shadow-lg" />
              <div>
                <p>Humidity</p>
                <p>{weatherData.humidity}%</p>
              </div>
            </div>
            {/*Pressure*/}
            <div className="p-3.5 bg-white/20 rounded-lg flex gap-3 shadow-xl">
              <BiTachometer className="text-cyan-200 p-1 bg-white/25 rounded-full  size-6 shadow-lg" />
              <div>
                <p>Pressure</p>
                <p>{weatherData.pressure} hPa</p>
              </div>
            </div>
            {/*Feels Like*/}
            <div className="p-3.5 bg-white/20 rounded-lg flex gap-3 shadow-xl">
              <WiThermometerExterior className="text-orange-300 p-1 bg-white/25 rounded-full  size-6 shadow-lg" />
              <div>
                <p>Feels Like</p>
                <p>{weatherData.feelsLike}&deg;{unit==="metric"?"C":"F"}</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <div className="flex gap-2 flex-grow">
              <div className={`p-3.5 bg-gradient-to-r from-orange-300 to-amber-200 rounded-lg flex gap-3 flex-grow shadow-xl ${day==="day"?"order-1":"order-2"}`}>
              <WiSunrise className="text-orange-300 bg-yellow-200 rounded-full p-1 size-6 shadow-lg" />
              <div>
                <p>Sunrise</p>
                <p>{formatDate(sunrise,"time",weatherData.timeZone)}</p>
              </div>
              </div>
              <div className={`p-3.5 bg-gradient-to-r from-violet-400 to-fuchsia-400  rounded-lg flex gap-3 flex-grow shadow-xl ${day==="night"?"order-1":"order-2"}`}>
              <WiSunset className="text-violet-200 bg-violet-400 rounded-full p-1 size-6 shadow-lg" />
              <div>
                <p>Sunset</p>
                <p>{formatDate(sunset,"time",weatherData.timeZone)}</p>
              </div>
             </div>
          </div>           
          </div>
          <HourlyForecast></HourlyForecast>
        </div>
    )
}
export default WeatherDetails