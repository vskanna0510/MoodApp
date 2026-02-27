const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Mood taxonomy: families -> moods, each with a band and track list
const MOOD_FAMILIES = [
  {
    id: 'focus',
    label: 'Focus',
    moods: [
      {
        id: 'low-deep-focus',
        band: 'low',
        label: 'Deep Focus',
        tracks: [
          'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3',
          'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3',
        ],
      },
      {
        id: 'mid-lofi-beats',
        band: 'mid',
        label: 'Lo-Fi Study Beats',
        tracks: [
          'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
          'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
        ],
      },
    ],
  },
  {
    id: 'relax',
    label: 'Relax',
    moods: [
      {
        id: 'mid-coffee-shop',
        band: 'mid',
        label: 'Coffee Shop Ambience',
        tracks: [
          'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
          'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3',
        ],
      },
      {
        id: 'high-sunrise',
        band: 'high',
        label: 'Bright Sunrise',
        tracks: [
          'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
          'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        ],
      },
    ],
  },
  {
    id: 'sleep',
    label: 'Sleep',
    moods: [
      {
        id: 'low-night-chill',
        band: 'low',
        label: 'Night-time Chill',
        tracks: [
          'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
          'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
        ],
      },
      {
        id: 'high-energetic',
        band: 'high',
        label: 'Energetic Focus',
        tracks: [
          'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
          'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
        ],
      },
    ],
  },
];

const ALL_MOODS = MOOD_FAMILIES.flatMap((family) =>
  (family.moods || []).map((mood) => ({ ...mood, familyId: family.id }))
);

const MOODS_BY_BAND = ALL_MOODS.reduce((acc, mood) => {
  if (!acc[mood.band]) acc[mood.band] = [];
  acc[mood.band].push(mood);
  return acc;
}, {});

app.get('/moods', (req, res) => {
  res.json({ families: MOOD_FAMILIES });
});

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

  const bucket = MOODS_BY_BAND[band] ?? ALL_MOODS;
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

