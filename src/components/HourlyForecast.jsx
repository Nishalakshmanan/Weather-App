import { useContext } from "react";
import { ForecastContext } from "../App";
import weatherIcons from "./Icons";
import { roundUpTemperature } from "./DateUtils";
function HourlyForecast() {
  const {formattedForecastData,unit } = useContext(ForecastContext);
  return (
    /*hourly forecast*/
    <div className="flex flex-col gap-2">
      <p className="text-xl font-semibold underline underline-offset-2">
        3 Hour Step Forecast
      </p>
      <div className="flex gap-3 overflow-x-auto overflow-y-hidden scrollbar-hide">
        {formattedForecastData.hourlyForecastList.map((item,i) => {
            const ForecastIcon = weatherIcons[item.icon];
          return (
            <div key={i} className="flex-grow bg-white/20 py-3 px-4 rounded-lg flex flex-col items-center shadow-lg">
              <p className="text-sm">{item.time}</p>
              <ForecastIcon className="size-10"></ForecastIcon>
              <p className="text-lg font-semibold">{roundUpTemperature(item.temp)}&deg;<span className="font-normal text-sm">{unit==="metric"?"C":"F"}</span></p>
            </div>
          );
        })
        }
      </div>
    </div>
  );
}
export default HourlyForecast;
