var express = require('express');
var router = express.Router();
var { MongoClient, ObjectId } = require('mongodb');
var bcryptjs = require('bcryptjs');

const client = new MongoClient("mongodb://localhost:27017")
const db = client.db('emessenger');
const User = db.collection('users');
const Photo = db.collection('photos');
const Chat = db.collection('chats');

function generateWithTimeStamp(data, isNew = false) {
  if (isNew) {
    const d = new Date();
    return {
      ...data,
      createdAt: d,
      updatedAt: d
    };
  }
  return {
    $set: { ...data, updatedAt: new Date() },
    $currentDate: { createdAt: true }
  };
}

router.get('/photos/:imageid', async function(req, res, next) {
  try {
    const mid = req.params.imageid;
    const doc = await Photo.findOne({ _id: ObjectId.createFromHexString(mid) });
    if (doc) {
      const imageBuffer = Buffer.from(doc.file, 'base64');
      res.writeHead(200, {
        'Content-Type': doc.mimeType,
        'Content-Length': imageBuffer.length
      });
      res.end(imageBuffer);
      return;
    }
  } catch (e) {
    console.error(e);
  }
  res.status(404).send('Not Found');
});

router.post('/photos/add', async function(req, res, next) {
  try {
    const body = req.body;
    if (body) {
      const result = await Photo.insertOne(generateWithTimeStamp(body, true));
      res.status(201).json(result);
      return;
    }
  } catch (e) {}
  res.json({
    acknowledged: false,
  });
})

/* POST add user. */
router.post('/user/add', async function(req, res, next) {
  const response = {
    status: 500,
    message: 'Internal Server Error'
  };
  try {
    const body = req.body;
    const user = await User.insertOne(
      generateWithTimeStamp({ ...body, photo: body.photo ? ObjectId.createFromHexString(body.photo) : '', password: bcryptjs.hashSync(body.password) }, true)
    );
    response.status = 201;
    response.message = "Success";
    response.data = user;
  } catch(e) {
    response.message = e.message;
  }
  res.status(response.status).json(response);
});

/* POST verify user password */
router.post('/user/verify/id/:id', async function(req, res, next) {
  let result = false;
  try {
    const { password } = req.body;
    const id = req.params.id;
    const user = await User.findOne({ _id: ObjectId.createFromHexString(id) });
    if (user && bcryptjs.hashSync(password, user.password)) {
      result = true;
    }
  } catch(e) {}
  res.json(result);
});


/* POST verify user password */
router.post('/user/verify/u/:username', async function(req, res, next) {
  let result = false;
  try {
    const { password } = req.body;
    const username = req.params.username;
    const user = await User.findOne({ username });
    if (user && bcryptjs.hashSync(password, user.password)) {
      result = true;
    }
  } catch(e) {}
  res.json(result);
});

/* GET users listing. */
router.get('/users', async function(req, res, next) {
  const users = await User.find({}).toArray();
  res.json(users);
});

/* GET user by id */
router.get('/user/id/:id', async function(req, res, next) {
  let result = null;
  try {
    const id = req.params.id;
    const user = await User.findOne({ _id: ObjectId.createFromHexString(id) });
    result = user;
  } catch(e) {}
  res.json(result);
});

/* GET user by username. */
router.get('/user/u/:username', async function(req, res, next) {
  let result = null;
  try {
    const username = req.params.username;
    const user = await User.findOne({ username });
    result = user
  } catch(e) {}
  res.json(result);
});

/* PUT update user by id. */
router.put('/user/id/:id', async function(req, res, next) {
  const response = {
    status: 500,
    message: 'Internal Server Error'
  };
  try {
    const body = req.body;
    const id = req.params.id;
    const user = await User.findOneAndUpdate({ _id: ObjectId.createFromHexString(id) }, body, { upsert: false });
    if (user._id) {
      response.status = 200;
      response.message = "Success";
      response.data = user;
    }
  } catch(e) {
    response.message = e.message;
  }
  res.status(response.status).json(response);
});

/* PUT update user by username. */
router.put('/user/u/:username', async function(req, res, next) {
  const response = {
    status: 500,
    message: 'Internal Server Error'
  };
  try {
    const body = req.body;
    const username = req.params.username;
    console.log(username);
    const user = await User.findOneAndUpdate({ username }, { $set: { ...body } }, { upsert: false });
    if (user._id) {
      const u = await User.findOne({ _id: user._id });
      response.status = 200;
      response.message = "Success";
      response.data = u;
    }
  } catch(e) {
    response.message = e.message;
  }
  res.status(response.status).json(response);
});

router.get('/chat', async (req, res, next) => {
  const { query, from_user, to_user, chatid } = req.query ? req.query : {}
  try {
    switch (query) {
      case 'conversation': {
        if (!to_user && !from_user) {
          return res.status(403).json({ status: 403, message: 'Invalid Request!'})
        }
        const chatdoc = await Chat.findOne(
          {
            $or: [
              { a: ObjectId.createFromHexString(from_user), b: ObjectId.createFromHexString(to_user) },
              { a: ObjectId.createFromHexString(to_user), b: ObjectId.createFromHexString(from_user) }
            ],
          },
          { conversation: 1 }
        );
        if (!chatdoc) {
          return res.status(403).json({ status: 403, message: 'No Conversation Found!'});
        }
        const sortedConversation = [...chatdoc.conversation].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        return res.json({
          status: 200,
          data: sortedConversation,
          message: 'Chat Conversation Received!',
        })
      }
      case 'chatids': {
        if (!from_user) {
          return res.status(403).json({ status: 403, message: 'Invalid Request!' });
        }
        const chatdocs = await Chat.find(
          {
            $or: [
              { a: ObjectId.createFromHexString(from_user) },
              { b: ObjectId.createFromHexString(from_user) },
            ]
          },
          {
            a: 1, b: 1, updatedAt: 1
          }
        ).sort({updatedAt: -1}).toArray()
        if (!chatdocs) {
          return res.json({ status: 200, data: [], message: 'No Users Found' })
        }
        return res.json({ status: 200,
          data: [...chatdocs],
          message: `${chatdocs.length} Chat Conversations Found`,
        });
      }
    }
  } catch (error) {
    res.status(403).json({ status: 403, message: error.message})
  }
});


/* POST chat conversation */
router.post('/chat', async function(req, res, next) {
  let result = {
    status: 500,
    message: 'Internal Server Error'
  };
  try {
    const { id, toid, message } = req.body;
    if (!!id && !!toid && !!message) {
      // find the existing conversation
      const chat = await Chat.findOne(
        {
          $or: [
            { a: ObjectId.createFromHexString(id), b: ObjectId.createFromHexString(toid) },
            { a: ObjectId.createFromHexString(toid), b: ObjectId.createFromHexString(id) },
          ]
        }
      );
      const convo = generateWithTimeStamp({
        _id: new ObjectId(),
        timestamp: new Date(),
        message,
        senderid: ObjectId.createFromHexString(id)
      }, true); // conversation chat object

      if (!chat) {
        // does not exists. create a new one
        const newChat = await Chat.insertOne(
          generateWithTimeStamp({
            a: ObjectId.createFromHexString(id),
            b: ObjectId.createFromHexString(toid),
            conversation: [convo]
          }, true)
        );
        if (newChat.acknowledged && newChat.insertedId) {
          result.status = 201;
          result.message = "Chat Conversation started";
          result.data = newChat.insertedId;
        }
      } else {
        // Chat already exists, append conversation
        const updatedChat = await Chat.updateOne(
          { _id: chat._id },
          { $push: { conversation: convo }, ...generateWithTimeStamp({}) }
        );
        if (updatedChat.acknowledged && updatedChat.modifiedCount > 0) {
          result.status = 200;
          result.message = "Message sent";
        } else {
          result.message = "Failed to send Message";
        }
      }
    }
  } catch(e) {
    result.message = e.message;
  }
  res.status(result.status).json(result);
});


/* DELETE chat unsend conversation */
router.delete('/chat/:id/:cid', async function(req, res, next) {
  let result = {
    status: 500,
    message: 'Internal Server Error'
  };
  try {
    const chatid = req.params.id;
    const convoid = req.params.cid;
    if (!!chatid && !!convoid) {
      // delete the message of conversation
      const chat = await Chat.updateOne(
        {
          _id: ObjectId.createFromHexString(chatid),
        },
        { $pull: { 'conversation': { "_id": ObjectId.createFromHexString(convoid) } } }
      );
      if (chat.acknowledged && chat.modifiedCount > 0) {
        result.status = 200;
        result.message = "Successfully Deleted";
        result.data = chat;
      }
    }
  } catch(e) {
    result.message = e.message;
  }
  res.status(result.status).json(result);
});

module.exports = router;
