////////////////////Variables//////////////////////////////////////
const $=document
const city=_id('city')
const country=_id('country')
const weatherStatus=_id('weather-status')
const temp=_id('temp')
const minTemp=_id('min-temp')
const maxTemp=_id('max-temp')
const pressure=_id('pressure')
const humidity=_id('humidity')
const windSpeed=_id('wind-speed')
const longitude=_id('longitude')
const latitude=_id('latitude')
const countryInput=_id('country-input')
const cityInput=_id('city-input')
const showBtn=_id('show-btn')
const errorMessage=_q('.error-message')
const weatherIcon=_id('w-icon')
let allCountries;
let myModal = new bootstrap.Modal(_id('exampleModal'))
/////////////// Catching Elements with functions////////////////////
function _id(tag) {
    return  $.getElementById(tag)
}
function _class(tag) {
    return $.getElementsByClassName(tag)
}
function _q(tag) {
    return $.querySelector(tag)
}
function _qAll(tag) {
    return $.querySelectorAll(tag)
}
////////////////////////////////////////////////////////////////////
const setCountryData= async (e)=>{
    try{
        let res=await fetch('https://battuta.medunes.net/api/country/all/?key=e39ede1b24b5fcfca0cd004a1c2bef6a')
        if(res.ok){
            let countries=await res.json()
            allCountries=[...countries]
            countryGenerator(countries)
        }else{
            throw Error(`${res.status}`)
        }
    }catch (e) {
        console.log(e)
    }

}
const countryGenerator=(countries)=>{
    countryInput.insertAdjacentHTML('beforeend','<option value="default" selected>Select a country</option>')
    let allCountries=countries.map(country=>{
        return `<option  value="${country.code}">${country.name}</option>`
    }).join('')
    countryInput.insertAdjacentHTML('beforeend',allCountries)

}
const setRegionData=async (e)=>{
    try{
        let {target:input}=e
        let res=await fetch(`https://battuta.medunes.net/api/region/${input.value}/all/?key=e39ede1b24b5fcfca0cd004a1c2bef6a`)
        if(res.ok){
            let regions=await res.json()
            regionGenerator(regions)
            localStorage.setItem('countryName',targetCountryName(input.value))
        }else{
            throw Error(`${res.status}`)
        }
    }catch (e) {
        console.log(e)
    }
}
const targetCountryName=(value)=>{
    let mainCountry=allCountries.find(country=>{
        return country.code===value
    })
    return mainCountry.name
}
const regionGenerator=(regions)=>{
    cityInput.innerHTML=''
    cityInput.insertAdjacentHTML('beforeend','<option value="default" selected>Select a city</option>')
    let allRegions=regions.map(region=>{
        return `<option value="${region.region}">${region.region}</option>`
    }).join('')
    cityInput.insertAdjacentHTML('beforeend',allRegions)
}
class WeatherInfo {
    constructor(city,country) {
        this.city=city
        this.country=country
    }
}
class Weather {
    static getData(e){
        myModal.show()

        let weatherInfo=new WeatherInfo(cityInput.value,countryInput.value)

        let weather=new Weather()

        if(weatherInfo.city==='default' || weatherInfo.country==='default'){
            errorMessage.classList.replace('d-none','d-inline-block')
            e.preventDefault()
        }else{
            errorMessage.classList.replace('d-inline-block','d-none')
            let dataStore=new DataStore()
            dataStore.saveInDB(weatherInfo)
            myModal.hide()
        }



        weather.sendRequest(weatherInfo.city,weatherInfo.country)
    }
    async sendRequest(city,country){
        try{
            let res= await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&appid=86b0bd9b76517148d71f0967cc7de574`)
            if(res.ok){
                let weatherData=await res.json()
                let weather=new Weather()
                weather.showData(weatherData,city,localStorage.getItem('countryName'))
            }else{
                throw Error(`${res.status}`)
            }
        }catch (e) {
            console.log(e)
        }
    }
    showData(data,cityTarget,countryTarget){
        let {temp:temperature,temp_min:minimumTemp,temp_max:maximumTemp,pressure:targetPressure,humidity:targetHumidity}=data.main
        let {speed}=data.wind
        let {lat,lon}=data.coord
        let iconVal=data.weather[0].icon
        let weatherCondition=data.weather[0].main
        temp.innerHTML=temperature
        minTemp.innerHTML=minimumTemp
        maxTemp.innerHTML=maximumTemp
        pressure.innerHTML=targetPressure
        humidity.innerHTML=targetHumidity
        windSpeed.innerHTML=speed
        latitude.innerHTML=lat
        longitude.innerHTML=lon
        city.innerHTML=cityTarget
        country.innerHTML=countryTarget
        weatherStatus.innerHTML=weatherCondition
        weatherIcon.setAttribute('src',`http://openweathermap.org/img/wn/${iconVal}@2x.png`)

    }
}
class DataStore {
    saveInDB(weatherObj){
        localStorage.setItem('weather',JSON.stringify(weatherObj))
    }
    getData(){
        let prevData=JSON.parse(localStorage.getItem('weather'))
        if(prevData!==null){
            return prevData
        }else{
            myModal.show()
        }
    }
    restoreData(){
        let weather=new Weather()
        weather.sendRequest(this.getData().city,this.getData().country)
    }
}
window.addEventListener('load',()=>{
    let dataStore=new DataStore()
    dataStore.restoreData()
})
countryInput.addEventListener('change',setRegionData)
window.addEventListener('load',setCountryData)
showBtn.addEventListener('click',Weather.getData)

