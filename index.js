const express = require('express');
const path = require('path');
const ytdl = require('ytdl-core');
const sanitize = require('sanitize-filename');

const app = express();
const PORT = process.env.PORT || 8774;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/ytmp3', async (req, res) => {
    const url = req.query.url;

    if (!url) {
        return res.status(400).send('No URL provided');
    }

    try {
        const info = await ytdl.getInfo(url);
        let title = sanitize(info.videoDetails.title || 'audio');

        title = encodeURIComponent(title);
        res.setHeader('Content-Disposition', `attachment; filename="${title}.mp3"`);
        res.setHeader('Content-Type', 'audio/mpeg');

        ytdl(url, {
            filter: 'audioonly',
            quality: 'highestaudio',
            format: 'mp3'
        }).pipe(res);

    } catch (err) {
        console.error('Error processing audio:', err);
        if (!res.headersSent) {
            res.status(500).send('Error processing audio');
        }
    }
});

app.get('*', (req, res) => {
    res.status(404).json({
        "error": "Couldn't find my About me? That's a bummer!"
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
