// route /todos

const AWS = require("aws-sdk");
AWS.config.update({ region: "ap-south-1" });

const dynamodb = new AWS.DynamoDB.DocumentClient();

const util = require("./util.js");

const _ = require("lodash");
const moment = require("moment");
const uuid = require("uuid");

const tableName = process.env.TodoTable;


const putItemFunction = async (userId, arr) => {

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



// function to add todos of a user in batch
exports.handler = async (event) => {

    try {
        let body = JSON.parse(event.body);

        // {
        //      "userId": "123",
        // "todosArray": 
        // [
        //  {
        //      "content": {
        //        "title": "batch Demo 1",
        //        "description": "batch description 1",
        //        "completed": false,
        //        "noteCategory": "important",
        //        "priority": "urgent",
        //        "context": "home",
        //        "nextAction": "call",
        //        "dueDate": "19-05-2023",
        //      }
        //     }
        //  {
        //      "content": {
        //        "title": "batch Demo 2",
        //        "description": "batch description 2",
        //        "completed": false,
        //        "noteCategory": "important",
        //        "priority": "urgent",
        //        "context": "home",
        //        "nextAction": "call",
        //        "dueDate": "19-05-2023",
        //      }
        //     }
        //  {
        //      "content": {
        //        "title": "batch Demo 3",
        //        "description": "batch description 3",
        //        "completed": false,
        //        "noteCategory": "important",
        //        "priority": "urgent",
        //        "context": "home",
        //        "nextAction": "call",
        //        "dueDate": "19-05-2023",
        //      }
        //     }
        // ]
        // }

        if (!body.userId || !body.todosArray) {
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

                await putItemFunction(userId, chunk);
            }
        } else {
            await putItemFunction(userId, todosArray);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Batch add todos successful",
                data: todosArray
            }),
        };

    } catch (error) {
        console.log(error);
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
