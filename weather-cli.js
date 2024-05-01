function main() {
    const minimist = require('minimist');

    let args = minimist(process.argv.slice(2), {
        alias: {
            l: 'location'
        }
    });
    
    if (typeof args.l === 'string') {
        console.log(args.l);
    } else {
        console.log("Please define your city (i. e. weather-cli -l Poznan)");
    }
}

main();

