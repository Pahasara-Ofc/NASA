const express = require('express');
const cors = require('cors');
const { scrapeSaveTube } = require('./scrape');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 🏠 හෝම් රවුට් එක
app.get('/', (req, res) => {
    res.json({
        message: "Welcome to SaveTube YouTube Downloader API 🚀",
        usage: "/api/savetube?url=[youtube_video_url]"
    });
});

// 🚀 SaveTube API Endpoint එක
app.get('/api/savetube', async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({
            status: false,
            message: "Missing parameter! Please provide 'url' (YouTube Video URL)"
        });
    }

    const data = await scrapeSaveTube(url);
    res.json(data);
});

app.listen(PORT, () => {
    console.log(`🚀 SaveTube API Server is running on port ${PORT}`);
});
