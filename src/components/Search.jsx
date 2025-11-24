import { IoIosSearch } from "react-icons/io";
import { FaLocationCrosshairs } from "react-icons/fa6";
import { ForecastContext } from "../App";
import { useContext,useState } from "react";
import Loading from "./Loading";
function Search(){
  const {unit,setUnit,city,loading,fetchWeather}=useContext(ForecastContext)
  const [cityInput,setCityInput]=useState("")

  function SearchWeather(){
    if(cityInput.trim()){
        fetchWeather(cityInput)
        setCityInput("")
    }
   
  }
  return (
    <div className='sticky top-0 backdrop-blur-md'>
    <h1 className='text-gray-50 text-3xl xs-sm:text-4xl md:text-5xl font-bold pt-10 text-center'>Weather <span className='bg-gradient-to-r  to-purple-500 from-blue-400 text-transparent bg-clip-text'>Pro</span></h1>
    <p className='text-gray-50 text-center mt-3 text-[16px] px-4 xs-sm:text-lg xs:px-7 md:px-20'>Experience weather like never before with real-time data,beautiful visuals and precise forecasts for any location worldwide </p>
    <div className='min-w-[200px] max-w-3xl mx-auto mt-4 px-3 xs:px-6 flex flex-col justify-center items-center gap-3 xs-sm:flex-row xs-sm:gap-5  '>
         <div className='flex gap-5 items-center w-full xs-sm:w-[70%]'>
           <div className='px-2 bg-white/5 border-2  border-gray-200 flex items-center rounded-md flex-grow shadow-xl'>
              <input value={cityInput} type="text" onChange={(evt)=>setCityInput(evt.target.value)} className="flex-grow px-1 py-1.5 bg-transparent text-gray-50 focus:outline-none" placeholder='search for any city' />
              <IoIosSearch className='size-6 text-gray-50' onClick={SearchWeather}/>
           </div>
         </div>
         {city?
         (<div className=' bg-white/5 text-gray-50 border-2 border-gray-200 flex text-lg rounded-3xl overflow-hidden shadow-xl'>
          <p className={`px-4 py-1 rounded-r-2xl ${unit==="metric"?"bg-gray-200":"bg-white/5"} ${unit==="metric"?"text-black":"text-gray-50"}`} onClick={()=>{setUnit("metric")}}>&deg;C</p>
          <p className={`px-4 py-1 rounded-l-2xl  ${unit==="imperial"?"bg-gray-200":"bg-white/5"} ${unit==="imperial"?"text-black":"text-gray-50"}`} onClick={()=>{setUnit("imperial")}}>&deg;F</p>
         </div>):"" }    
    </div>
    {loading?<Loading/>:""}   
   </div>
  )
}
export default Search