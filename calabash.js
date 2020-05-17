const shell = require('shelljs');
const CronJob = require('cron').CronJob;
const SQS = require('./sqs/sqs');
const sqs = new SQS();
const fs = require('file-system');
const moment = require('moment');

const axios = require('axios');

const desencolarMensajes = async (cola) => {
    let a = await sqs.receiveMessage(cola);
    //console.log('Desencolar mensaje ',a);
    return a;
}

const startTest = (apkAdress, scriptsAdress) => {

    shell.exec('calabash-android run ' + apkAdress + ' ' + '--format json --out report.json' + ' ' + scriptsAdress, function (e, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        if (e) {
            console.log(e);
        }
    });
    console.log('ok');
    //shell.exec(`hola`);
}

const job = new CronJob('20 51 19 * * *', async () => {//seg/min/hour
    console.log('*** Vamos a procesar pruebas calabash ***');

    //let prueba = await desencolarMensajes(``);
    let prueba = { code: 100 }
    console.log('prueba : ', prueba);
    if (prueba.code === 100) {
        const pruebaEjecutar = {
            idPrueba: 1/*parseInt(prueba.data.MessageAttributes.idPrueba.StringValue)*/,
            scriptFile: "login.feature"/*prueba.data.MessageAttributes.scriptFile.StringValue*/,
            apkAdress: "../apks/com.habitrpg.android.habitica.apk"
            //apk o localización del APK
        };

        //console.log(pruebaEjecutar);

        // Ahora se debe transferir el archivo a /features
        fs.copyFile(`../files/${pruebaEjecutar.scriptFile}`, `./features/${pruebaEjecutar.scriptFile}`, (err) => {//variable
            if (err) throw err;

        });

        console.log("salio:");

        console.log(`calabash-android run ${pruebaEjecutar.apkAdress} --format json --out ${pruebaEjecutar.idPrueba}.json ./features/${pruebaEjecutar.scriptFile}`);

        shell.exec(`calabash-android run ${pruebaEjecutar.apkAdress} --format json --out ${pruebaEjecutar.idPrueba}.json ./features/${pruebaEjecutar.scriptFile}`, function (e, stdout, stderr) {
            console.log(stdout);
            console.log(stderr);
            if (e) {
                console.log("error:", e);
                /*axios.post('http://localhost:3000/estrategias/estado_prueba', {
                    idPrueba: pruebaEjecutar.idPrueba,
                    estado: 'fallida'
                });*/
            }
            else {
                console.log("No error");
            }
        });
        /// Correr por consola
        //shell.exec('calabash-android run ' + apkAdress + ' ' + '--format json --out report.json' + ' ' + `./features/${pruebaEjecutar.scriptFile}`, function (e, stdout, stderr) {
        //shell.exec('calabash-android run ' + '../apks/com.habitrpg.android.habitica.apk' + ' ' + '--format json --out report.json' + ' ' 


        // Cambiar estado a en ejecucion
        /*await axios.post('http://localhost:3000/estrategias/estado_prueba', {
            idPrueba: pruebaEjecutar.idPrueba,
            estado: 'enEjecucion'
        });




        // Cambiar estado a satisfactorio o fallido
        await axios.post('http://localhost:3000/estrategias/estado_prueba', {
            idPrueba: pruebaEjecutar.idPrueba,
            estado: resultadosGuardar.totalFailed === 0 ? 'satisfactoria' : 'fallida'
        });
        // Eliminar mensaje de la cola


        fs.copyFile('report.json', '../files/results/', (err) => {// reporte de la prueba
            if (err) throw err;
        });*/
        // Pasar archivos de resultados a otra carpeta

        // Guardar resultado en tabla




    }
});

job.start();

//startTest('/Users/jprieto/Documents/calabashHabitica/com.habitrpg.android.habitica.apk', '/Users/jprieto/Documents/calabashHabitica/features/login.feature');