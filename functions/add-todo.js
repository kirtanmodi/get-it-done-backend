//  Route: POST /note

const AWS = require("aws-sdk");
AWS.config.update({ region: "ap-south-1" });

const moment = require("moment");
const uuid = require("uuid");

const util = require("./util.js");

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.TodoTable;

// - userName
// -userId
// -noteTitle
// -noteId
// -noteContent
// -noteCategory
// - timestamps
// -completionStatus
// -priority
// -userSpecificInformation
// - Tags or Labels
// - Collaborators
// - nextAction
// - project/AreaOfFocus
// -Context
// -waiting For
// -ReferenceMaterial
// -review
// -someday/maybe

exports.handler = async (event) => {
  try {
    let body = JSON.parse(event.body);

    if (!body.userId || !body.content) {
      return {
        statusCode: 400,
        headers: util.getResponseHeaders(),
        body: JSON.stringify({
          error: "userId and content are required fields",
        }),
      };
    }

    const { userId, content } = body;

    //  {
    //      "userId": "123",
    //      "content": {
    //        "title": "Demo",
    //        "description": "Demo",
    //        "completed": false,
    //        "noteCategory": "important",
    //        "priority": "urgent",
    //        "context": "home",
    //        "nextAction": "call",
    //        "dueDate": "19-05-2023",
    //      }
    //     }

    let item = {
      userId,
      noteId: userId + ":" + uuid.v4(),
      content,
      timestamp: moment().unix(),
    };

    const params = {
      TableName: tableName,
      Item: item,
    };

    await dynamodb.put(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Todo created successfully",
        data: item,
      }),
    };
  } catch (error) {
    console.log("error", error);
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
