const shell = require('shelljs');

const startTest = ()=> {
    shell.exec('npm run cypress:run');
}

startTest();