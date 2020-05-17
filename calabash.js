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

const job = new CronJob('20 51 15 * * *', async () => {//seg/min/hour
    console.log('*** Vamos a procesar pruebas calabash ***');

    let prueba = await desencolarMensajes(`https://sqs.us-east-1.amazonaws.com/677094465990/Calabash`);


    //let prueba = { code: 100 }
    console.log('prueba : ', prueba);
    
    if (prueba.code === 100) {
        const pruebaEjecutar = {
            idPrueba: parseInt(prueba.data.MessageAttributes.idPrueba.StringValue),
            scriptFile: prueba.data.MessageAttributes.scriptFile.StringValue,
            apkAdress: prueba.data.MessageAttributes.apkAdress.StringValue,
            //apk o localización del APK
        };

        //console.log(pruebaEjecutar);

        // Ahora se debe transferir el archivo a /features
        fs.copyFile(`../files/${pruebaEjecutar.scriptFile}`, `./features/${pruebaEjecutar.scriptFile}`, (err) => {//variable
            if (err) throw err;

        });

        let nom = moment().format('YYYY-MM-DD HH:mm');
        nom = `${pruebaEjecutar.idPrueba}_${moment(nom).toDate().getTime()}_calabash.json`;

        console.log(`calabash-android run ${pruebaEjecutar.apkAdress} --format json --out ${nom} ./features/${pruebaEjecutar.scriptFile}`);

        shell.exec(`calabash-android run ${pruebaEjecutar.apkAdress} --format json --out ${nom} ./features/${pruebaEjecutar.scriptFile}`, async (e, stdout, stderr) => {
            console.log(stdout);
            console.log(stderr);

            // Cambiar estado a en ejecucion
            await axios.post('http://localhost:3000/estrategias/estado_prueba', {
                idPrueba: pruebaEjecutar.idPrueba,
                estado: 'EN_EJECUCION'
            });

            if (e) {
                console.log("error:", e);

                await axios.post('http://localhost:3000/estrategias/estado_prueba', {
                    idPrueba: pruebaEjecutar.idPrueba,
                    estado: 'FALLIDA'
                });
            }
            else {
                console.log("SATISFACTORIA");

                // Cambiar estado a satisfactorio o fallido
                await axios.post('http://localhost:3000/estrategias/estado_prueba', {
                    idPrueba: pruebaEjecutar.idPrueba,
                    estado: 'SATISFACTORIA'
                });

                fs.copyFile( `./${nom}`, `../files/results/${nom}`, (err) => {// reporte de la prueba
                    console.log("COPY: ", err);
                    if (err) throw err;
                });
            }
        });


        // Eliminar mensaje de la cola


       
        // Pasar archivos de resultados a otra carpeta

        // Guardar resultado en tabla


    }
});

job.start();

//startTest('/Users/jprieto/Documents/calabashHabitica/com.habitrpg.android.habitica.apk', '/Users/jprieto/Documents/calabashHabitica/features/login.feature');