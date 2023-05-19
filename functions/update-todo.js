// update users todo by noteId

const AWS = require("aws-sdk");
AWS.config.update({ region: "ap-south-1" });

const dynamodb = new AWS.DynamoDB.DocumentClient();

const util = require("./util.js");

// eslint-disable-next-line no-undef
const tableName = process.env.TodoTable;



exports.handler = async (event) => {

    try {


        let body = JSON.parse(event.body);

        if (!body?.userId || !body?.noteId || !body?.content) {
            return {
                statusCode: 400,
                headers: util.getResponseHeaders(),
                body: JSON.stringify({
                    error: "userId, noteId and content are required fields",
                }),
            };
        }

        const { userId, noteId, content } = body;

        let params = {
            TableName: tableName,
            Key: {
                userId: userId,
                noteId: noteId,
            },
            ConditionExpression: "attribute_exists(noteId)",
            UpdateExpression: 'set content = :content',
            ExpressionAttributeValues: {
                ':content': content
            }
        };

        await dynamodb.update(params).promise();

        return {
            statusCode: 200,
            headers: util.getResponseHeaders(),
            body: JSON.stringify({
                message: "Todo updated successfully",
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