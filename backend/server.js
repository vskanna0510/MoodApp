const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const MOOD_LIBRARY = {
  low: [
    {
      id: 'low-night-chill',
      label: 'Night-time Chill',
      tracks: [
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
      ],
    },
    {
      id: 'low-deep-focus',
      label: 'Deep Focus',
      tracks: [
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3',
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3',
      ],
    },
  ],
  mid: [
    {
      id: 'mid-lofi-beats',
      label: 'Lo-Fi Study Beats',
      tracks: [
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
      ],
    },
    {
      id: 'mid-coffee-shop',
      label: 'Coffee Shop Ambience',
      tracks: [
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3',
      ],
    },
  ],
  high: [
    {
      id: 'high-sunrise',
      label: 'Bright Sunrise',
      tracks: [
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
      ],
    },
    {
      id: 'high-energetic',
      label: 'Energetic Focus',
      tracks: [
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
      ],
    },
  ],
};

app.post('/analyze', (req, res) => {
  const { audioBase64 } = req.body || {};

  if (!audioBase64) {
    return res.status(400).json({ error: 'audioBase64 is required' });
  }

  // Placeholder analysis: pick mood based on pseudo "energy" from length.
  const length = audioBase64.length;
  let band = 'mid';
  if (length % 3 === 0) band = 'low';
  else if (length % 3 === 1) band = 'high';

  const bucket = MOOD_LIBRARY[band] ?? MOOD_LIBRARY.mid;
  const mood =
    bucket[Math.floor(Math.random() * bucket.length)] ?? bucket[0];
  const trackUrl =
    mood.tracks[Math.floor(Math.random() * mood.tracks.length)] ??
    mood.tracks[0];

  res.json({
    moodBand: band,
    moodId: mood.id,
    label: mood.label,
    trackUrl,
  });
});

app.listen(PORT, () => {
  console.log(`MoodMap backend listening on http://localhost:${PORT}`);
});

