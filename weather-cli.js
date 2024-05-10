const fs = require('node:fs');
const path = require('path');
const os = require('os')

const filePath = path.join(os.homedir(), '.weather-cli');

async function setApiKey() {
    const readline = require('node:readline');
    
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
    // it reads a file in which there is stored API key for OpenWeather 
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
        console.log(`location: ${args.l}`);
        console.log(`api key: ${apiKey}`);
    } else {
        console.log("Please define your city (i. e. weather-cli -l Poznan)");
    }
}

main();

