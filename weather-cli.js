const fs = require('node:fs');
const path = require('path');
const os = require('os');
const readline = require('node:readline');

const filePath = path.join(os.homedir(), '.weather-cli');

async function setApiKey() {
    // ask the user for the API key acquire his answer 
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve, reject) => {
        rl.question(`Enter your API key (from OpenWeather): `, answer => {
            rl.close();
            // write that api key to a file 
            fs.writeFile(filePath, answer, { flag: 'w+' }, err => {
                if (err) {
                    reject(err);
                } else {
                    resolve(answer);
                }
            })
        });
    });
}


async function getApiKey() {
    return new Promise((resolve, reject) => {
        // it reads a file in which there is stored API key for OpenWeather 
        fs.readFile(filePath, 'utf8', async (err, data) => {
            // if the file doesn't exist the function setApiKey is called to set the API key 
            if (err && err.code === 'ENOENT') { 
                let apiKey = await setApiKey();
                resolve(apiKey);
            } else if (err) {
                reject(err);
            } else {
                resolve(data)
            } 
        })
    })
}

async function getLatLon(location, apiKey) {
    return new Promise(async (resolve, reject) => {
        const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=5&appid=${apiKey}`);
        const potentialLocations = await response.json();

        if (potentialLocations.length === 0) {
            console.log('Sorry, I can\'t find such a city :C');
            reject([]);
        } else if (potentialLocations.length === 1) {
            resolve([potentialLocations[0].lat, potentialLocations[0].lon]);
        } else {
            for (let x in potentialLocations) {
                console.log('===================')
                console.log(`${1+Number(x)}. ${potentialLocations[x].name}`);
                console.log(`${potentialLocations[x].country}, ${potentialLocations[x].state}`);
            }
            console.log('===================')
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            });
            rl.question(`Which place do you mean? (1-${potentialLocations.length}): `, answer => {
                rl.close();
                resolve([potentialLocations[Number(answer)-1].lat, potentialLocations[Number(answer)-1].lon]);
            });
        }
    });
}


async function displayWeatherInfo(latitude, longtitude, apiKey, unit='metric') {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longtitude}&appid=${apiKey}&units=${unit}`);
    const weatherData = await response.json();
    
    console.log('===================')
    console.log('Current weather: ' + weatherData.weather[0].description);
    console.log('Current temperature: ' + weatherData.main.temp + String.fromCharCode(176) + 'C');
    console.log('Feels like: ' + weatherData.main.feels_like + String.fromCharCode(176) + 'C');
    console.log('Pressure: ' + weatherData.main.pressure + 'hPa');
    console.log('Humidity: ' + weatherData.main.humidity + '%');
    console.log('Visibility: ' + weatherData.visibility/1000 + 'km');
    console.log('Wind: ' + weatherData.wind.speed + 'm/s');
}


async function main() {
    const minimist = require('minimist');
    let apiKey;
    
    // it reads given arguments and sets aliases
    let args = minimist(process.argv.slice(2), {
        alias: {
            l: 'location'
        }
    });
    try {
        apiKey = await getApiKey();
    } catch (error) {
        console.log(error);
    }
    
    if (typeof args.l === 'string') {
        try { 
            const letLon = await getLatLon(args.l, apiKey);
            displayWeatherInfo(letLon[0], letLon[1], apiKey);
        } catch (error) {
            console.error(error) 
        }
    } else {
        console.log("Please define your city (i. e. weather-cli -l Poznan)");
    }
}

main();

