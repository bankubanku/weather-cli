function setApiKey() {
    const fs = require('node:fs');
    const path = require('path');
    const os = require('os')
    const readline = require('node:readline');

    const filePath = path.join(os.homedir(), '.weather-cli');
    let apiKey;

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.question(`Enter your API key (from OpenWeather): `, answer => {
        apiKey = answer;
    })

    fs.writeFile(filePath, apiKey, { flag: 'w+' }, err => {
        if (err) {
            console.error(err);
        }     
    })

    return apiKey;
}


function getApiKey() {
    const fs = require('node:fs');

    fs.readFile('~/.weather-cli', 'utf8', (err, data) => {
        if (err.code === 'ENOENT') { 
            let apiKey = setApiKey();
            return apiKey;
        } else if (err) {
            console.error(err);
            return;
        } 
        return data;
    })

}


function main() {
    const minimist = require('minimist');

    let args = minimist(process.argv.slice(2), {
        alias: {
            l: 'location'
        }
    });
    
    const apiKey = getApiKey();
    
    if (typeof args.l === 'string') {
        console.log(args.l);
        console.log(apiKey);
    } else {
        console.log("Please define your city (i. e. weather-cli -l Poznan)");
    }
}

main();

