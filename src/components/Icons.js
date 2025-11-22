





import {
  IoSunnyOutline,
  IoMoonOutline,
  IoPartlySunnyOutline,
  IoRainyOutline,
} from "react-icons/io5";
import { PiCloudMoon } from "react-icons/pi";
import { GoCloud } from "react-icons/go";
import { BsClouds } from "react-icons/bs";
import { LuCloudSunRain, LuCloudMoonRain } from "react-icons/lu";
import { TbCloudStorm, TbMist } from "react-icons/tb";
import { IoIosSnow } from "react-icons/io";
const weatherIcons = {
  "01d": IoSunnyOutline, // clear sky (day)
  "01n": IoMoonOutline, // clear sky (night)
  "02d": IoPartlySunnyOutline, // few clouds (day)
  "02n": PiCloudMoon, // few clouds (night)
  "03d": GoCloud, // scattered clouds (day)
  "03n": GoCloud, // scattered clouds (night)
  "04d": BsClouds, // broken clouds (day)
  "04n": BsClouds, // broken clouds (night)
  "09d": LuCloudSunRain, // shower rain (day)
  "09n": LuCloudMoonRain, // shower rain (night)
  "10d": IoRainyOutline, // rain (day)
  "10n": IoRainyOutline, // rain (night)
  "11d": TbCloudStorm, // thunderstorm (day)
  "11n": TbCloudStorm, // thunderstorm (night)
  "13d": IoIosSnow, // snow (day)
  "13n": IoIosSnow, // snow (night)
  "50d": TbMist, // mist (day)
  "50n": TbMist, // mist (night)
};

export default weatherIcons