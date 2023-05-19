const AWS = require("aws-sdk");
AWS.config.update({ region: "ap-south-1" });

const dynamodb = new AWS.DynamoDB.DocumentClient();

const util = require("./util.js");

const tableName = process.env.TodoTable;

const _ = require("lodash");
const moment = require("moment");
const uuid = require("uuid");


// !FIX THIS
const updateItemFunction = async (userId, arr) => {

    let params = {
        RequestItems: {
            [tableName]: [],
        },
    };

    arr.forEach((todo, i) => {
        params.RequestItems[tableName].push({
            PutRequest: {
                Item: {
                    userId: userId,
                    noteId: (moment().unix() + i) + ":" + uuid.v4(),
                    content: todo.content,
                    timestamp: moment().unix()
                },
            },
        });
    });


    console.log(' :',);
    console.log(JSON.stringify(params));
    await dynamodb.batchWrite(params).promise();

}

exports.handler = async (event) => {

    try {

        // batch update todos
        let body = JSON.parse(event.body);

        if (!body?.userId || !body?.todosArray) {
            return {
                statusCode: 400,
                headers: util.getResponseHeaders(),
                body: JSON.stringify({
                    error: "userId and todosArray are required fields",
                }),
            };
        }

        const { userId, todosArray } = body;

        if (todosArray.length > 25) {
            const chunkedTodosArray = _.chunk(todosArray, 25);

            for (let i = 0; i < chunkedTodosArray.length; i++) {
                let chunk = chunkedTodosArray[i];

                await updateItemFunction(userId, chunk);
            }
        } else {
            await updateItemFunction(userId, todosArray);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Batch add todos successful",
                data: todosArray
            }),
        };



    } catch (error) {
        console.log('error :', error);
        return {
            statusCode: error.statusCode ? error.statusCode : 500,
            headers: util.getResponseHeaders(),
            body: JSON.stringify({
                error: error.name ? error.name : "Exception",
                message: error.message ? error.message : "Unknown error",
            }),
        };
    }

}
