const express = require('express');
const cors = require('cors');
const { scrapeSaveTube } = require('./scrape');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 🔥 මෙන්න මේන් රවුට් එකටම (කෙලින්ම / එකට) හැමදේම දැම්මා මචං
app.get('/', async (req, res) => {
    const { url, quality } = req.query;

    // යූසර් url එකක් එව්වේ නැත්නම් විතරක් Welcome මැසේජ් එක පෙන්වනවා
    if (!url) {
        return res.json({
            message: "SaveTube Premium API V2 is Live 🚀",
            usage: "/?url=[youtube_url]&quality=[best/1080/720/360]"
        });
    }

    // quality එකක් එව්වේ නැත්නම් default එක 'best' කියලා ගන්නවා
    const reqQuality = quality ? quality.toLowerCase() : 'best';

    const data = await scrapeSaveTube(url, reqQuality);
    res.json(data);
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
