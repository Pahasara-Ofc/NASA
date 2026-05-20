const express = require('express');
const cors = require('cors');
const { scrapeSaveTube } = require('./scrape');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 🚀 YouTube Downloader API Endpoint
app.get('/v2/ytdown', async (req, res) => {
    const { url, quality } = req.query;

    if (!url) {
        return res.status(400).json({
            status: false,
            message: "Missing 'url' parameter! Please provide a valid YouTube URL."
        });
    }

    // quality එකක් එව්වේ නැත්නම් default එක 'best' කියලා ගන්නවා
    const reqQuality = quality ? quality.toLowerCase() : 'best';

    const data = await scrapeSaveTube(url, reqQuality);
    res.json(data);
});

// 🏠 Base Route
app.get('/', (req, res) => {
    res.json({
        message: "SaveTube Premium API V2 is Live 🚀",
        usage: "/v2/ytdown?url=[youtube_url]&quality=[best/1080/720/360]"
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
