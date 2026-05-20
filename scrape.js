const axios = require('axios');
const cheerio = require('cheerio');

// 📅 ලබාදෙන දවස අනුව අදාළ දිනය සහ Timestamp එක හදන Function එක
function getRewindTimestamp(dayName) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const targetDayIndex = days.indexOf(dayName.toLowerCase());
    
    if (targetDayIndex === -1) return null;

    let targetDate = new Date();
    // වත්මන් දවසේ ඉඳන් ආපස්සට දවස හොයනවා
    while (targetDate.getDay() !== targetDayIndex) {
        targetDate.setDate(targetDate.getDate() - 1);
    }

    // PeoTV Rewind වලට අවශ්‍ය Date Format එක (YYYYMMDD)
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const date = String(targetDate.getDate()).padStart(2, '0');
    
    return `${year}${month}${date}`;
}

async function scrapePeoRewind(channelId, day) {
    try {
        const dateStr = getRewindTimestamp(day);
        if (!dateStr) {
            return { status: false, message: "Invalid day! Use monday, tuesday, wednesday etc." };
        }

        const baseUrl = 'https://www.peomobile.com';
        // 🔗 PeoMobile චැනල් පේජ් එක (චැනල් ID එක සහ දවස අනුව)
        const channelUrl = `${baseUrl}/watch-live.php?id=${channelId}&date=${dateStr}`;

        const { data } = await axios.get(channelUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const $ = cheerio.load(data);
        
        // 🔮 ගොඩක් වෙලාවට වීඩියෝ ප්ලේයර් එකේ හෝ Script ටැග් අස්සේ තියෙන M3U8 ලින්ක් එක අල්ලනවා
        let streamUrl = '';
        
        $('script').each((i, el) => {
            const scriptContent = $(el).html();
            if (scriptContent && scriptContent.includes('.m3u8')) {
                // Regular Expression එකකින් .m3u8 ලින්ක් එක ෆිල්ටර් කරගන්නවා
                const match = scriptContent.match(/(https?:\/\/[^\s'"]+\.m3u8[^\s'"]*)/);
                if (match) {
                    streamUrl = match[1];
                }
            }
        });

        // සයිට් එකේ Script එකේ නැත්නම් වීඩියෝ සෝස් ටැග් එක බලනවා
        if (!streamUrl) {
            streamUrl = $('video source').attr('src') || $('video').attr('src') || '';
        }

        if (!streamUrl) {
            // සොයාගත නොහැකි වුණොත් PeoTV ස්ටෑන්ඩර්ඩ් Rewind URL Format එක ඔටෝ හදනවා
            // Format: https://[server]/rewind/peotv/[channel]/[date]/index.m3u8
            streamUrl = `https://www.peomobile.com/rewind/stream.php?channel=${channelId}&date=${dateStr}`;
        }

        // චැනල් එකේ නම ගන්නවා
        const channelName = $('.channel-title').text().trim() || $('.live-title').text().trim() || `Channel ${channelId}`;

        return {
            status: true,
            results: {
                channel_id: channelId,
                channel_name: channelName,
                requested_day: day,
                target_date: dateStr,
                rewind_m3u8_url: streamUrl
            }
        };

    } catch (error) {
        console.error("Scraper Error: ", error.message);
        return { status: false, error: error.message };
    }
}

module.exports = { scrapePeoRewind };
