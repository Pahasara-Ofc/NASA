const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 📊 සපෝට් කරන වීඩියෝ Qualities
const ytmp4VideoQualities = ['360', '480', '720', '1080', 'best'];

// 🔗 YouTube URL එකෙන් ID එක වෙන් කරගැනීම
function ytmp4ExtractId(url) {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|embed|watch|shorts)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[&?]|$)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// 📥 SaveTube Scraper එක හරහා වැඩ කරන ප්‍රධාන Function එක
async function ytmp4Download(yturl, quality = 'best') {
  const videoId = ytmp4ExtractId(yturl);
  if (!videoId) {
    throw new Error('Invalid YouTube URL');
  }

  const q = String(quality).toLowerCase();
  if (!ytmp4VideoQualities.includes(q)) {
    throw new Error(`Invalid video quality. Supported: ${ytmp4VideoQualities.join(', ')}`);
  }

  // 🌐 SaveTube V2 Fetch API (2026 Working URL)
  const apiUrl = `https://su.savetube.me/api/v2/fetch?url=https://www.youtube.com/watch?v=${videoId}`;
  
  const { data } = await axios.get(apiUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Referer': 'https://savetube.me/',
      'Origin': 'https://savetube.me',
      'Accept': 'application/json, text/plain, */*'
    }
  });

  if (!data || !data.status || !data.video_formats || data.video_formats.length === 0) {
    throw new Error('Failed to fetch video details from SaveTube Backend.');
  }

  // 🔄 Quality එක අනුව Sort කිරීම
  const sortedFormats = data.video_formats.sort((a, b) => {
    const qA = parseInt(a.quality) || 0;
    const qB = parseInt(b.quality) || 0;
    return qB - qA;
  });

  let selectedVideo = null;

  if (q === 'best') {
    selectedVideo = sortedFormats[0];
  } else {
    selectedVideo = sortedFormats.find(f => f.quality.includes(q));
    if (!selectedVideo) selectedVideo = sortedFormats[0]; 
  }

  const cleanQuality = selectedVideo.quality.replace(/p/g, ''); 
  
  // 🛠️ Audio + Video Merged ඩවුන්ලෝඩ් ලින්ක් එක
  const finalDownloadLink = `https://su.savetube.me/api/v2/download/video/${videoId}/${cleanQuality}`;

  // 📦 උඹ ඉල්ලපු Output Format එකමයි
  return {
    title: data.title,
    download: finalDownloadLink   
  };
}

// ==================== API Route (No Endpoints - Direct Base URL) ====================

app.get('/', async (req, res) => {
    const { url, quality } = req.query;

    // යූසර් පරාමීටර්ස් එව්වේ නැත්නම් විතරක් Usage එක පෙන්වනවා
    if (!url) {
        return res.json({
            status: false,
            message: "SaveTube Custom API is Live 🚀",
            usage: "/?url=[youtube_url]&quality=[best/1080/720/480/360]"
        });
    }

    try {
        const reqQuality = quality ? quality.toLowerCase() : 'best';
        const result = await ytmp4Download(url, reqQuality);
        
        // 🎯 සාර්ථක නම් උඹේ Format එකටම JSON එක දෙනවා
        res.json({
            status: true,
            title: result.title,
            download: result.download
        });

    } catch (error) {
        res.status(500).json({
            status: false,
            error: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
