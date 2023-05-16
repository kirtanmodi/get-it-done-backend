const AWS = require("aws-sdk");
AWS.config.update({ region: "ap-south-1" });

const dynamodb = new AWS.DynamoDB.DocumentClient();

const util = require("./util.js");

const tableName = process.env.TodoTable;

// function to get todos of a user

exports.handler = async (event) => {

    try {

        let body = event.queryStringParameters;

        console.log('body :', event);

        if (!body?.userId) {
            return {
                statusCode: 400,
                headers: util.getResponseHeaders(),
                body: JSON.stringify({
                    error: "userId is required field",
                }),
            };
        }

        const { userId } = body;

        let params = {
            TableName: tableName,
            KeyConditionExpression: "userId = :userId",
            ExpressionAttributeValues: {
                ":userId": userId,
            },
            ScanIndexForward: false,
        };

        let data = await dynamodb.query(params).promise();

        if (data.Items.length > 0) {
            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: "Todos fetched successfully",
                    todos: data.Items,
                }),
            };
        } else {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    error: "No todos found for this user",
                }),
            };
        }


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
};