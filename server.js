const express = require('express');
const multer = require('multer');
const ILoveIMGClient = require('./ILoveIMGClient'); // ඔයාගේ ක්ලාස් එක තියෙන ෆයිල් එකේ නම

const app = express();
const port = process.env.PORT || 3000;

// ඉමේජ් එක මෙමරියේ තියාගෙන Buffer එකක් විදිහට ගන්න multer සෙටප් කිරීම
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // උපරිම 10MB දක්වා ෆයිල්ස්
});

app.use(express.json());

// සර්වර් එක වැඩද බලන්න සරල රූට් එකක්
app.get('/', (req, res) => {
    res.json({ status: "running", message: "Face Blur API is alive!" });
});

// ප්‍රධාන බ්ලර් කරන API එක
app.post('/api/blur', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: "Please upload an image file using the 'image' field." });
        }

        const client = new ILoveIMGClient();
        
        // ඔයාගේ execute ෆන්ක්ෂන් එකට බෆර් එක සහ ෆයිල් නම යවනවා
        const result = await client.execute(req.file.buffer, req.file.originalname);

        if (result.success && !result.is_error) {
            return res.json(result);
        } else {
            return res.status(result.code || 500).json(result);
        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            status: "error",
            error: "Internal Server Error",
            message: error.message || error
        });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
