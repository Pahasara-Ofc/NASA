const axios = require('axios');

// 🔗 YouTube ID එක වෙන් කරගැනීම
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

        // 🌐 SaveTube V2 Fetch API
        const apiUrl = `https://cdn.savetube.me/api/v2/fetch?url=https://www.youtube.com/watch?v=${videoId}`;
        
        const { data } = await axios.get(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://savetube.me/'
            }
        });

        if (!data || !data.status || !data.video_formats || data.video_formats.length === 0) {
            return { status: false, message: "Failed to fetch video details from SaveTube." };
        }

        // 📊 මූලික විස්තර
        const title = data.title;
        const duration = data.duration; // Seconds වලින්මයි (උඹේ sample එකේ තිබ්බ විදිහට)
        const thumbnail = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;

        // 🔄 තියෙන වීඩියෝ ලින්ක්ස් ටික Quality එක අනුව Sort කරගන්නවා (ලොකුම එකේ ඉඳන් පොඩිම එකට)
        const sortedFormats = data.video_formats.sort((a, b) => {
            const qA = parseInt(a.quality) || 0;
            const qB = parseInt(b.quality) || 0;
            return qB - qA;
        });

        let selectedVideo = null;

        // 🎯 යූසර් 'best' ඉල්ලුවොත් හෝ මුකුත් එව්වේ නැත්නම් ලොකුම Quality එක දෙනවා
        if (requestedQuality === 'best') {
            selectedVideo = sortedFormats[0];
        } else {
            // නැත්නම් යූසර් ඉල්ලපු Quality එකට (උදා: 1080) මැච් වෙන එක හොයනවා
            selectedVideo = sortedFormats.find(f => f.quality.includes(requestedQuality));
            // ඉල්ලපු එක සයිට් එකේ නැත්නම් තියෙන හොඳම එක දෙනවා බැකප් එකට
            if (!selectedVideo) selectedVideo = sortedFormats[0];
        }

        // 🛠️ SaveTube එකේ 1080p වලින් එහා (1440p, 2160p) Qualities වලට Direct Sound + Video එන CDN ලින්ක් එක හදාගන්නවා
        const cleanQuality = selectedVideo.quality.replace(/p/g, ''); // '1080p' -> '1080'
        const finalDownloadLink = `https://cdn.savetube.me/api/v2/download/video/${videoId}/${cleanQuality}`;

        return {
            status: true,
            creator: "@DanuZz", // 👈 උඹේ ක්‍රියේටර් නේම් එක ගැම්මටම දැම්මා
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
