const express = require('express');
const cors = require('cors');
const { scrapePeoRewind } = require('./scrape');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 🏠 සාමාන්‍ය හෝම් රවුට් එක
app.get('/', (req, res) => {
    res.json({
        message: "Welcome to PeoMobile Rewind TV API 📺",
        usage: "/api/peorewind?id=[channel_id]&day=[monday/tuesday/wednesday]"
    });
});

// 🚀 Rewind API Endpoint එක
app.get('/api/peorewind', async (req, res) => {
    const { id, day } = req.query;

    if (!id || !day) {
        return res.status(400).json({
            status: false,
            message: "Missing parameters! Please provide 'id' (channel id) and 'day' (e.g. monday)"
        });
    }

    const data = await scrapePeoRewind(id, day);
    res.json(data);
});

// සර්වර් එක ස්ටාර්ට් කිරීම
app.listen(PORT, () => {
    console.log(`🚀 PeoTV Rewind Server is running on port ${PORT}`);
});
