const express = require('express');
const nasaLandsatScraper = require('./scraper');

const app = express();
const PORT = process.env.PORT || 3000;

// API Endpoint එක
app.get('/generate', async (req, res) => {
    const text = req.query.text;

    if (!text) {
        return res.status(400).json({ error: 'Please provide a "text" query parameter. Example: /generate?text=nelumi' });
    }

    try {
        console.log(`Generating image for: ${text}`);
        const imageBuffer = await nasaLandsatScraper(text);
        
        // Response එක image එකක් විදිහට සෙට් කරනවා
        res.set('Content-Type', 'image/jpeg');
        res.send(imageBuffer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Something went wrong while generating the image.' });
    }
});

// Server එක start කිරීම
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Test URL: http://localhost:${PORT}/generate?text=danupa`);
});
