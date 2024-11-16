const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}))

let db;

// related to db setup
async function main() {
    const uri = 'mongodb://0.0.0.0:27017';
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        console.log('Connected successfully to MongoDB');
        db = client.db('microblog'); 
    } catch (err) {
        console.error('Connection failed:', err);
        process.exit(1);
    }
}

main().catch(console.error);


// related to add new users to the database
app.post('/user', async (req, res) => {
    const { username } = req.body;
    try {
        let user = await db.collection('users').findOne({ username });
        if (!user) {
            const result = await db.collection('users').insertOne({ 
                username, 
                followers: [username], 
                posts: [] 
            });
            user = { _id: result.insertedId, username, followers: [], posts: [] };
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create or find user' });
    }
});

// related to add new posts to the database
app.post('/post', async (req, res) => {
    const { username, content } = req.body;
    
    try {
        console.log('user_id from adding post:', username);
        const user = await db.collection('users').findOne({ username });
        console.log('user from adding post:', user);
        if (user && content) {
            const result = await db.collection('posts').insertOne({ 
                user_id: user._id,
                username: user.username,
                content,
                timestamp: new Date()
            });
            await db.collection('users').updateOne(
                { username: username },
                { $push: { posts: result.insertedId } }
            );
            res.status(201).json({ _id: result.insertedId, content });
        } else {
            res.status(400).json({ error: 'User not found or content missing' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to create post' });
    }
});

// get all the posts
app.get('/posts', async (req, res) => {
    try {
        const posts = await db.collection('posts').find().sort({ timestamp: -1 }).toArray();
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve posts' });
    }
});

// get selected users posts
app.get('/post/:username', async (req, res) => {
    const { username } = req.params;
    try { 
        const posts = await db.collection('posts').find({ username: username }).sort({ timestamp: -1 }).toArray();
        res.json(posts || []);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve user posts' });
    }
}
);

// update the user's followers
app.post('/follow', async (req, res) => {
    const { followerusername, userNameToFollow } = req.body;
    try {
        if (followerusername === userNameToFollow) {
            return res.status(400).json({ error: 'Cannot follow yourself' });
        }
        const user = await db.collection('users').findOne({ username: (followerusername) });
        const followUser = await db.collection('users').findOne({ username: (userNameToFollow) });
        if (user && followUser) {
            await db.collection('users').updateOne(
                { username: followerusername },
                { $addToSet: { followers: (userNameToFollow) } }
            );
            res.json({ message: `You are now following ${followUser.username}` });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to follow user' });
    }
});

// get the followers of a user
app.get('/following', async (req, res) => {
    const { userName } = req.query;
    try {
      const user = await db.collection('users').findOne({ username: userName });
      res.json({ following: user.followers || [] });
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve following list' });
    }
  });
  

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
