const shell = require('shelljs');
const cypress = require('cypress')
const CronJob = require('cron').CronJob;

const SQS = require('./sqs/sqs');
const sqs = new SQS();

const fs = require('file-system');
const axios = require('axios');

const procesarPrueba = async() => {
    cypress.run({
        spec: './cypress/integration/login-habitica-web.spec.js',
        browser: 'chrome',
        headful: true
      })
      .then((results) => {
        console.log('RES : ', results)
      })
      .catch((err) => {
        console.error(err)
      })
}

const desencolarMensajes = async(cola) => {
    let a = await sqs.receiveMessage(cola);
    //console.log('Desencolar mensaje ',a);
    return a;
}

const obtenerCantidadMensajes = async(cola) => {
    let a = await sqs.getQueueMessages(cola);
    return a;
}

const eliminarMensaje = async(cola,receipt) => {
    let a = await sqs.deleteMessage(cola,receipt);
    console.log(a);
}

const startTest = ()=> {
    shell.env['VAR_ANA'] = 'ana'
    shell.exec('set');
    shell.exec('npm run cypress:run');
}

const job = new CronJob('0 */1 * * * *', async() => {
    console.log('*** Vamos a procesar pruebas ***');
    let cantidadMensajes = await obtenerCantidadMensajes(`https://sqs.us-east-1.amazonaws.com/677094465990/Cypress`);
    if(cantidadMensajes.data > 0) {
        let prueba = await desencolarMensajes(`https://sqs.us-east-1.amazonaws.com/677094465990/Cypress`);
        console.log('prueba : ', prueba);
        if(prueba.code === 100) {
            const pruebaEjecutar = {
                idPrueba: parseInt(prueba.data.MessageAttributes.idPrueba.StringValue),
                esScript: JSON.parse(prueba.data.MessageAttributes.esScript.StringValue),
                scriptFile: prueba.data.MessageAttributes.scriptFile.StringValue,
                modo: prueba.data.MessageAttributes.modo.StringValue,
                navegador: prueba.data.MessageAttributes.navegador.StringValue,
            };

            console.log(pruebaEjecutar);
            // Ahora se debe transferir el archivo a /integration
            fs.copyFile(`../files/${pruebaEjecutar.scriptFile}`, `./cypress/integration/${pruebaEjecutar.scriptFile}`, (err) => {
                if (err) throw err;
            });

            // Formar parametros prueba cypress
            const setupCypress = {
                spec: `./cypress/integration/${pruebaEjecutar.scriptFile}`,
                browser: pruebaEjecutar.navegador.toLowerCase(),
                headed: pruebaEjecutar.modo.toLowerCase() === 'headful' ? true : false,
                headless: pruebaEjecutar.modo.toLowerCase() === 'headless' ? true : false
            }

            console.log('SETUP CYPRESS :', setupCypress);
            let resultadosGuardar = {};
            // Cambiar estado a en ejecucion
            await axios.post('http://localhost:3000/estrategias/estado_prueba', {
                idPrueba : pruebaEjecutar.idPrueba,
                estado : 'EN_EJECUCION'
            });
            // Correr prueba
            cypress.run(setupCypress)
            .then(async(results) => {
                    console.log('RESULTADOS : ', results);
                    resultadosGuardar.startedTestsAt = results.startedTestsAt;
                    resultadosGuardar.endedTestsAt = results.endedTestsAt;
                    resultadosGuardar.totalDuration = results.totalDuration;
                    resultadosGuardar.totalSuites = results.totalSuites;
                    resultadosGuardar.totalTests = results.totalTests;
                    resultadosGuardar.totalFailed = results.totalFailed;
                    resultadosGuardar.totalPassed = results.totalPassed;
                    resultadosGuardar.totalPending = results.totalPending;
                    resultadosGuardar.totalSkipped = results.totalSkipped;
                    resultadosGuardar.browserVersion = results.browserVersion;
                    resultadosGuardar.browserName = results.browserName;
                    console.log('RES : ', resultadosGuardar);
                    // Cambiar estado a satisfactorio o fallido
                    await axios.post('http://localhost:3000/estrategias/estado_prueba', {
                        idPrueba : pruebaEjecutar.idPrueba,
                        estado : resultadosGuardar.totalFailed === 0 ? 'SATISFACTORIA' : 'FALLIDA'
                    });
                    // Eliminar mensaje de la cola
                    await eliminarMensaje(``, prueba.data.ReceiptHandle)

                    let nom = moment().format('YYYY-MM-DD HH:mm');
                    nom = `${pruebaEjecutar.idPrueba}_${moment(nom).toDate().getTime()}_cypress.json`;
                    // Guardar resultados en .json
                    fs.writeFile(`../files/results/${nom}`, JSON.stringify(resultadosGuardar), 'utf8', (err) => {
                        if (err) {
                            console.log("An error occured while writing JSON Object to File.");
                            return console.log(err);
                        }
                    
                        console.log("JSON file has been saved.");
                    });
                    // Pasar archivos de resultados a otra carpeta(IMAGENES)
                    /*fs.copyFile( `./${nom}`, `../files/results/${nom}`, (err) => {// reporte de la prueba
                        console.log("COPY: ", err);
                        if (err) throw err;
                    });*/

                    // Guardar resultado en tabla
                    await axios.post('http://localhost:3000/estrategias/resultado', {
                        id_prueba: pruebaEjecutar.idPrueba,
                        tipo: "LOG",
                        url:`../files/results/${nom}`
                    });
            })
            .catch(async(err) => {
                await axios.post('http://localhost:3000/estrategias/estado_prueba', {
                    idPrueba : pruebaEjecutar.idPrueba,
                    estado : 'FALLIDA'
                });
                console.error(err);
            })
            
        }
    }
    
});

job.start();

//startTest();