const aws = require('aws-sdk');
const q = require('q');

// Load your AWS credentials and try to instantiate the object.
aws.config = new aws.Config();
aws.config.accessKeyId = process.env.ACCESS_KEY_ID;
aws.config.secretAccessKey = process.env.SECRET_ACCESS_KEY;
aws.config.region = process.env.AWS_REGION;
aws.config.sessionToken = process.env.SESSION_TOKEN;

// Instantiate SQS.
const sqs = new aws.SQS();

class SQS {
    sendMessage = async(message,queueUrl) => {
        let d = q.defer();
        const params = {
            MessageAttributes: {
                "idPrueba": {
                    DataType: "Number",
                    StringValue: JSON.stringify(message.idPrueba)
                },
                "esScript": {
                    DataType: "String",
                    StringValue: JSON.stringify(message.esScript)
                },
                "scriptFile": {
                    DataType: "String",
                    StringValue: message.scriptFile
                },
                "tipo": {
                    DataType: "String",
                    StringValue: message.tipo
                },
                "herramienta": {
                    DataType: "String",
                    StringValue: message.herramienta
                },
                "modo": {
                    DataType: "String",
                    StringValue: message.modo
                },
                "navegador": {
                    DataType: "String",
                    StringValue: message.navegador
                },
                "resolucion": {
                    DataType: "String",
                    StringValue: message.resolucion
                }
            },
            MessageBody: `${message.idPrueba}-${message.tipo}-${message.herramienta}-${message.modo}`,
            QueueUrl: queueUrl,
            DelaySeconds: 0
        };
        sqs.sendMessage(params, (err, data) => {
            if(err) {
                d.resolve({ code: 105, message: err });
            }
            else {
                d.resolve({ code: 100, data: data });
            }
        });
        return d.promise;
    }

    receiveMessage = async(queueUrl) => {
        let d = q.defer();
        const params = {
            AttributeNames: [
                "SentTimestamp"
             ],
             MaxNumberOfMessages: 1,
             MessageAttributeNames: [
                "All"
             ],
             QueueUrl: queueUrl,
             VisibilityTimeout: 20,
             WaitTimeSeconds: 0
        };
    
        sqs.receiveMessage(params, (err, data) => {
            if(err) {
                d.resolve({ code: 105, message: err });
            }
            else {
                let msg = data.Messages[0] !== undefined ? data.Messages[0] : [];
                d.resolve({ code: 100, data: msg });
            }
        });
        return d.promise;
    }

    getQueueMessages = async(queueUrl) => {
        let d = q.defer();
        const params = {
            QueueUrl: queueUrl,
            AttributeNames: [
                "ApproximateNumberOfMessages"
            ]
        };
        sqs.getQueueAttributes(params,(err, data) => {
            if (err) {
                d.resolve({ code: 105, message: err });
            } else {
                d.resolve({ code: 100, data: parseInt(data.Attributes.ApproximateNumberOfMessages) });
            }
        });
        return d.promise;
    }
    
    deleteMessage = async(queueUrl, receipt) => {
        let d = q.defer();
        const params = {
            QueueUrl: queueUrl,
            ReceiptHandle: receipt
        };
    
        sqs.deleteMessage(params, function(err, data) {
            if(err) {
                d.resolve({ code: 105, message: err });
            }
            else {
                d.resolve({ code: 100, data: 'Eliminado' });
            }
        });
        return d.promise;
    }
}

module.exports = SQS;