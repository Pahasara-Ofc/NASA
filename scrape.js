const axios = require('axios');

function extractYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

async function scrapeSaveTube(videoUrl, requestedQuality = 'best') {
    try {
        const videoId = extractYouTubeId(videoUrl);
        if (!videoId) {
            return { status: false, message: "Invalid YouTube URL!" };
        }

        // 🌐 🔥 2026 අලුත්ම වැඩ කරන සර්වර් ලිපිනය (su.savetube.me)
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
            return { status: false, message: "Failed to fetch video details from SaveTube Backend." };
        }

        const title = data.title;
        const duration = data.duration; 
        const thumbnail = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;

        // Quality අනුව Sort කරගැනීම (ලොකුම එකේ ඉඳන් පොඩිම එකට)
        const sortedFormats = data.video_formats.sort((a, b) => {
            const qA = parseInt(a.quality) || 0;
            const qB = parseInt(b.quality) || 0;
            return qB - qA;
        });

        let selectedVideo = null;

        if (requestedQuality === 'best') {
            selectedVideo = sortedFormats[0];
        } else {
            selectedVideo = sortedFormats.find(f => f.quality.includes(requestedQuality));
            if (!selectedVideo) selectedVideo = sortedFormats[0];
        }

        const cleanQuality = selectedVideo.quality.replace(/p/g, ''); 
        
        // 🛠️ ඩවුන්ලෝඩ් Endpoint එකත් අලුත් සර්වර් එකටම හැදුවා
        const finalDownloadLink = `https://su.savetube.me/api/v2/download/video/${videoId}/${cleanQuality}`;

        return {
            status: true,
            creator: "@DanuZz", 
            title: title,
            duration: duration,
            thumbnail: thumbnail,
            url: `https://youtu.be/${videoId}`,
            download: {
                type: "video",
                quality: parseInt(cleanQuality) || 1080,
                label: `${cleanQuality}p`,
                link: finalDownloadLink
            }
        };

    } catch (error) {
        console.error("Scraper Error: ", error.message);
        return { status: false, error: error.message };
    }
}

module.exports = { scrapeSaveTube };
