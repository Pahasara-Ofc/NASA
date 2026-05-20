const axios = require('axios');

// 🔗 යූටියුබ් URL එකෙන් වීඩියෝ ID එක විතරක් වෙන් කරගන්නා Function එක
function extractYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// ⏱️ සෙකන්ඩ්ස් ගාණ විනාඩි සහ පැය වලට හරවන Function එක
function formatDuration(seconds) {
    if (!seconds) return "00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    if (h > 0) {
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

async function scrapeSaveTube(videoUrl) {
    try {
        const videoId = extractYouTubeId(videoUrl);
        if (!videoId) {
            return { status: false, message: "Invalid YouTube URL!" };
        }

        // 🌐 SaveTube සිරාම Backend Fetch API එක
        const apiUrl = `https://cdn.savetube.me/api/v2/fetch?url=https://www.youtube.com/watch?v=${videoId}`;
        
        const { data } = await axios.get(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://savetube.me/'
            }
        });

        if (!data || !data.status) {
            return { status: false, message: "Failed to fetch video details from SaveTube." };
        }

        // 📊 අවශ්‍ය විස්තර ටික එකතු කරගැනීම
        const title = data.title;
        const durationRaw = data.duration; // මේක එන්නේ සෙකන්ඩ්ස් වලින්
        const durationFormatted = formatDuration(durationRaw);
        const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`; // High Quality Thumbnail URL

        // 📥 වීඩියෝ (MP4) සහ ඕඩියෝ (MP3) ඩවුන්ලෝඩ් ලින්ක්ස් වෙන් කරගැනීම
        const videoLinks = [];
        const audioLinks = [];

        // වීඩියෝ Qualities (360p, 720p, 1080p වගේ)
        if (data.video_formats) {
            data.video_formats.forEach(video => {
                videoLinks.push({
                    quality: video.quality + (video.fps ? ` (${video.fps}fps)` : ''),
                    extension: video.ext,
                    size: video.size_text,
                    download_url: video.url
                });
            });
        }

        // ඕඩියෝ Qualities (128kbps, 320kbps වගේ)
        if (data.audio_formats) {
            data.audio_formats.forEach(audio => {
                audioLinks.push({
                    quality: audio.quality + 'kbps',
                    extension: audio.ext,
                    size: audio.size_text,
                    download_url: audio.url
                });
            });
        }

        return {
            status: true,
            results: {
                video_id: videoId,
                title: title,
                duration: durationFormatted,
                thumbnail: thumbnail,
                download_details: {
                    video: videoLinks,
                    audio: audioLinks
                }
            }
        };

    } catch (error) {
        console.error("SaveTube Scraper Error: ", error.message);
        return { status: false, error: error.message };
    }
}

module.exports = { scrapeSaveTube };
