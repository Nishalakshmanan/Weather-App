import weatherIcons from "./Icons";
import { WiHumidity } from "react-icons/wi";
import { IoCalendarClearOutline } from "react-icons/io5";
import { ForecastContext } from "../App";
import { useContext } from "react";
import { roundUpTemperature } from "./DateUtils";
function DailyForecast() {
  const { formattedForecastData,unit } = useContext(ForecastContext);
  return (
    <div className="h-fit text-gray-50 mt-10 bg-white/10 flex flex-col gap-6  w-[95%] mx-auto md:w-[40%] md:mx-0 shadow-sm rounded-lg p-3 xs:p-4">
      <p className=" flex items-center gap-1.5 text-xl font-semibold ">
        <IoCalendarClearOutline className="size-6 font-bold inline" />
        Daily Forecast
      </p>
      {formattedForecastData.dailyForecastList.map((item,i) => {
        const ForecastIcon = weatherIcons[item.icon];
        return (
          <div key={i} className="flex justify-around gap-1.5 bg-white/10 p-3 items-center rounded-lg shadow-lg">
            <ForecastIcon className="size-10"></ForecastIcon>
            <div>
              <p className="text-[15px]">{item.weekDay.slice(0,3)},{item.month} {item.day}</p>
              <p className="text-xs">{item.desc}</p>
            </div>
            <div className="flex items-center">
              <WiHumidity className="text-blue-200 size-7"></WiHumidity>
              <p>{item.humidity}%</p>
            </div>
            <p className=" text-lg xs:text-xl font-semibold">{roundUpTemperature(item.temp)}&deg;<span className="font-normal text-base xs:text-lg">{unit==="metric"?"C":"F"}</span></p>
          </div>
        );
      })}
    </div>
  );
}
export default DailyForecast;
