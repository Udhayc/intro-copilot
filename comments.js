// Create web server
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

app.use(bodyParser.json());
app.use(express.static('public'));

let commentsData = [];
let currentCommentId = 1;

// Load existing comments from JSON file
function loadComments() {
    const dataPath = path.join(__dirname, 'comments.json');
    if (fs.existsSync(dataPath)) {
        const data = fs.readFileSync(dataPath, 'utf8');
        commentsData = JSON.parse(data);
        currentCommentId = commentsData.length > 0 ? Math.max(...commentsData.map(c => c.id)) + 1 : 1;
    }
}

// Save comments to JSON file
function saveComments() {
    const dataPath = path.join(__dirname, 'comments.json');
    fs.writeFileSync(dataPath, JSON.stringify(commentsData, null, 2));
}

// Add a new comment
app.post('/api/comments', (req, res) => {
    const { name, email, comment } = req.body;
    if (!name || !email || !comment) {
        return res.status(400).json({ error: 'Name, email, and comment are required.' });
    }

    const newComment = {
        id: currentCommentId++,
        name,
        email,
        comment,
        date: new Date().toISOString()
    };

    commentsData.push(newComment);
    saveComments();
    res.status(201).json(newComment);
});

// Get all comments
app.get('/api/comments', (req, res) => {
    res.json(commentsData);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    loadComments();
});
