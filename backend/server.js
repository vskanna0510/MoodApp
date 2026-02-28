const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Base Lo‑Fi / ambient track pool (SoundHelix 1–17; reuse across moods for 80+ track entries)
const TRACKS = Array.from({ length: 17 }, (_, i) =>
  `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${i + 1}.mp3`
);

function pickTracks(indices) {
  return indices.map((i) => TRACKS[i % TRACKS.length]);
}

// Mood taxonomy: families -> moods, each with band and track list (80+ track entries)
const MOOD_FAMILIES = [
  {
    id: 'focus',
    label: 'Focus',
    moods: [
      { id: 'low-deep-focus', band: 'low', label: 'Deep Focus', tracks: pickTracks([0, 1, 2, 3, 4]) },
      { id: 'mid-lofi-beats', band: 'mid', label: 'Lo-Fi Study Beats', tracks: pickTracks([1, 5, 6, 7, 8]) },
      { id: 'mid-rainy-focus', band: 'mid', label: 'Rainy Window Focus', tracks: pickTracks([2, 6, 9, 10]) },
      { id: 'mid-night-coding', band: 'mid', label: 'Late Night Coding', tracks: pickTracks([3, 7, 10, 11, 12]) },
      { id: 'mid-minimal-beats', band: 'mid', label: 'Minimal Beats', tracks: pickTracks([4, 8, 11, 13]) },
      { id: 'mid-concentration', band: 'mid', label: 'Concentration Flow', tracks: pickTracks([5, 9, 12, 14]) },
      { id: 'mid-reading-nook', band: 'mid', label: 'Reading Nook', tracks: pickTracks([0, 4, 8, 12]) },
      { id: 'low-library-quiet', band: 'low', label: 'Library Quiet', tracks: pickTracks([1, 5, 9, 13]) },
      { id: 'mid-deep-work-block', band: 'mid', label: 'Deep Work Block', tracks: pickTracks([2, 6, 10, 14]) },
      { id: 'high-energetic', band: 'high', label: 'Energetic Focus', tracks: pickTracks([6, 10, 13, 15, 16]) },
      { id: 'high-morning-flow', band: 'high', label: 'Morning Flow', tracks: pickTracks([7, 11, 14]) },
    ],
  },
  {
    id: 'relax',
    label: 'Relax',
    moods: [
      { id: 'mid-coffee-shop', band: 'mid', label: 'Coffee Shop Ambience', tracks: pickTracks([8, 9, 10, 11]) },
      { id: 'high-sunrise', band: 'high', label: 'Bright Sunrise', tracks: pickTracks([0, 2, 4, 6]) },
      { id: 'low-evening-chill', band: 'low', label: 'Evening Wind Down', tracks: pickTracks([1, 3, 5, 7]) },
      { id: 'mid-jazz-cafe', band: 'mid', label: 'Jazz Café', tracks: pickTracks([2, 6, 10, 12]) },
      { id: 'mid-soft-rain', band: 'mid', label: 'Soft Rain', tracks: pickTracks([3, 7, 11, 13]) },
      { id: 'low-calm-piano', band: 'low', label: 'Calm Piano', tracks: pickTracks([4, 8, 12, 14]) },
      { id: 'high-afternoon', band: 'high', label: 'Lazy Afternoon', tracks: pickTracks([5, 9, 13, 15]) },
      { id: 'mid-forest-walk', band: 'mid', label: 'Forest Walk', tracks: pickTracks([6, 10, 14, 16]) },
      { id: 'low-cozy-corner', band: 'low', label: 'Cozy Corner', tracks: pickTracks([0, 7, 11, 15]) },
      { id: 'mid-tea-time', band: 'mid', label: 'Tea Time', tracks: pickTracks([1, 5, 9, 13]) },
      { id: 'low-hammock-day', band: 'low', label: 'Hammock Day', tracks: pickTracks([2, 6, 10, 14]) },
      { id: 'mid-ocean-breeze', band: 'mid', label: 'Ocean Breeze', tracks: pickTracks([3, 7, 11, 15]) },
      { id: 'low-fireplace', band: 'low', label: 'Fireplace', tracks: pickTracks([4, 8, 12, 16]) },
      { id: 'high-sunday-morning', band: 'high', label: 'Sunday Morning', tracks: pickTracks([0, 5, 10, 15]) },
    ],
  },
  {
    id: 'sleep',
    label: 'Sleep',
    moods: [
      { id: 'low-night-chill', band: 'low', label: 'Night-time Chill', tracks: pickTracks([0, 1, 2, 3, 4, 5]) },
      { id: 'low-dreamy-drift', band: 'low', label: 'Dreamy Drift', tracks: pickTracks([1, 3, 5, 7, 9]) },
      { id: 'low-midnight', band: 'low', label: 'Midnight Calm', tracks: pickTracks([2, 4, 6, 8, 10]) },
      { id: 'mid-sleepy-beats', band: 'mid', label: 'Sleepy Beats', tracks: pickTracks([3, 5, 7, 9, 11]) },
      { id: 'low-starlight', band: 'low', label: 'Starlight', tracks: pickTracks([4, 6, 8, 10, 12]) },
      { id: 'low-deep-rest', band: 'low', label: 'Deep Rest', tracks: pickTracks([0, 2, 5, 9, 13]) },
      { id: 'low-cloud-nine', band: 'low', label: 'Cloud Nine', tracks: pickTracks([1, 4, 7, 11]) },
      { id: 'low-gentle-waves', band: 'low', label: 'Gentle Waves', tracks: pickTracks([2, 5, 8, 12]) },
      { id: 'low-moonlight', band: 'low', label: 'Moonlight', tracks: pickTracks([3, 6, 9, 13]) },
      { id: 'mid-dusk-till-dawn', band: 'mid', label: 'Dusk Till Dawn', tracks: pickTracks([0, 4, 8, 12, 16]) },
    ],
  },
  {
    id: 'creative',
    label: 'Creative',
    moods: [
      { id: 'mid-creative-flow', band: 'mid', label: 'Creative Flow', tracks: pickTracks([1, 4, 8, 12]) },
      { id: 'high-inspiration', band: 'high', label: 'Inspiration', tracks: pickTracks([2, 6, 10, 14]) },
      { id: 'mid-doodle-mode', band: 'mid', label: 'Doodle Mode', tracks: pickTracks([3, 7, 11, 15]) },
      { id: 'high-ideation', band: 'high', label: 'Ideation', tracks: pickTracks([5, 9, 13, 16]) },
      { id: 'mid-sketch-pad', band: 'mid', label: 'Sketch Pad', tracks: pickTracks([0, 5, 10, 15]) },
      { id: 'low-writers-room', band: 'low', label: "Writer's Room", tracks: pickTracks([1, 6, 11]) },
      { id: 'mid-studio-vibes', band: 'mid', label: 'Studio Vibes', tracks: pickTracks([2, 7, 12]) },
      { id: 'high-brainstorm', band: 'high', label: 'Brainstorm', tracks: pickTracks([4, 9, 14]) },
    ],
  },
  {
    id: 'energy',
    label: 'Energy',
    moods: [
      { id: 'high-workout', band: 'high', label: 'Light Workout', tracks: pickTracks([6, 10, 14]) },
      { id: 'high-commute', band: 'high', label: 'Commute', tracks: pickTracks([7, 11, 15]) },
      { id: 'mid-groovy', band: 'mid', label: 'Groovy', tracks: pickTracks([8, 12, 16, 0]) },
      { id: 'high-wake-up', band: 'high', label: 'Wake Up', tracks: pickTracks([0, 3, 6, 9]) },
      { id: 'high-pre-workout', band: 'high', label: 'Pre-workout', tracks: pickTracks([1, 5, 10, 14]) },
      { id: 'high-road-trip', band: 'high', label: 'Road Trip', tracks: pickTracks([2, 7, 12, 16]) },
    ],
  },
  {
    id: 'chill',
    label: 'Chill',
    moods: [
      { id: 'mid-lofi-hip-hop', band: 'mid', label: 'Lo-Fi Hip Hop', tracks: pickTracks([1, 4, 8, 12, 16]) },
      { id: 'mid-vinyl-crackle', band: 'mid', label: 'Vinyl Crackle', tracks: pickTracks([2, 6, 10, 14]) },
      { id: 'low-nostalgia', band: 'low', label: 'Nostalgia', tracks: pickTracks([0, 5, 9, 13]) },
      { id: 'mid-chill-hop', band: 'mid', label: 'Chill Hop', tracks: pickTracks([3, 7, 11, 15]) },
      { id: 'high-sunset-drive', band: 'high', label: 'Sunset Drive', tracks: pickTracks([4, 8, 12]) },
      { id: 'mid-late-night-lofi', band: 'mid', label: 'Late Night Lo-Fi', tracks: pickTracks([0, 2, 5, 10, 15]) },
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

// Journeys reference mood IDs from above
const JOURNEYS = [
  { id: 'focus20', label: '20‑min Focus', steps: [{ moodId: 'mid-lofi-beats', minutes: 10 }, { moodId: 'low-deep-focus', minutes: 10 }] },
  { id: 'focus30', label: '30‑min Deep Work', steps: [{ moodId: 'mid-rainy-focus', minutes: 15 }, { moodId: 'low-deep-focus', minutes: 15 }] },
  { id: 'relax15', label: '15‑min Coffee Break', steps: [{ moodId: 'mid-coffee-shop', minutes: 15 }] },
  { id: 'relax30', label: '30‑min Relax', steps: [{ moodId: 'mid-coffee-shop', minutes: 15 }, { moodId: 'low-evening-chill', minutes: 15 }] },
  { id: 'sleep30', label: '30‑min Sleep Drift', steps: [{ moodId: 'low-night-chill', minutes: 30 }] },
  { id: 'sleep45', label: '45‑min Wind Down', steps: [{ moodId: 'low-evening-chill', minutes: 15 }, { moodId: 'low-dreamy-drift', minutes: 30 }] },
  { id: 'creative25', label: '25‑min Creative', steps: [{ moodId: 'mid-creative-flow', minutes: 25 }] },
  { id: 'chill20', label: '20‑min Chill', steps: [{ moodId: 'mid-lofi-hip-hop', minutes: 20 }] },
];

app.get('/moods', (req, res) => {
  res.json({ families: MOOD_FAMILIES });
});

app.get('/journeys', (req, res) => {
  res.json({ journeys: JOURNEYS });
});

// Mood from text: suggest 1–3 moods based on keywords
const KEYWORD_TO_FAMILY = {
  focus: ['focus', 'work', 'study', 'exam', 'stress', 'concentrate', 'code', 'read', 'project'],
  relax: ['relax', 'chill', 'cozy', 'rain', 'calm', 'peace', 'tea', 'lazy', 'sunday', 'wind down', 'unwind'],
  sleep: ['sleep', 'tired', 'night', 'bed', 'rest', 'dream', 'midnight', 'insomnia'],
  creative: ['creative', 'idea', 'draw', 'write', 'design', 'inspire', 'brainstorm', 'sketch'],
  energy: ['energy', 'workout', 'run', 'commute', 'wake', 'morning', 'exercise', 'motivation'],
  chill: ['lofi', 'hip hop', 'vinyl', 'nostalgia', 'vibe'],
};
const FAMILY_IDS = Object.keys(KEYWORD_TO_FAMILY);

function suggestMoodsFromText(text) {
  const t = (text || '').toLowerCase().trim();
  if (!t) return [];
  const matchedFamilies = [];
  for (const [familyId, keywords] of Object.entries(KEYWORD_TO_FAMILY)) {
    if (keywords.some((kw) => t.includes(kw))) matchedFamilies.push(familyId);
  }
  if (matchedFamilies.length === 0) matchedFamilies.push('focus', 'relax'); // default
  const pool = ALL_MOODS.filter((m) => matchedFamilies.includes(m.familyId));
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3).map((m) => ({ moodId: m.id, label: m.label }));
}

app.post('/suggest-moods', (req, res) => {
  const { text } = req.body || {};
  const suggestions = suggestMoodsFromText(text);
  res.json({ suggestions });
});

app.post('/analyze', (req, res) => {
  const { audioBase64 } = req.body || {};

  if (!audioBase64) {
    return res.status(400).json({ error: 'audioBase64 is required' });
  }

  const length = audioBase64.length;
  let band = 'mid';
  if (length % 3 === 0) band = 'low';
  else if (length % 3 === 1) band = 'high';

  const bucket = MOODS_BY_BAND[band] ?? ALL_MOODS;
  const mood = bucket[Math.floor(Math.random() * bucket.length)] ?? bucket[0];
  const trackIndex = mood.tracks && mood.tracks.length ? Math.floor(Math.random() * mood.tracks.length) : 0;
  const trackUrl = mood.tracks[trackIndex] ?? mood.tracks[0];
  const recipeId = `${mood.id}__${trackIndex}`;

  res.json({
    moodBand: band,
    moodId: mood.id,
    label: mood.label,
    recipeId,
    trackUrl,
  });
});

app.listen(PORT, () => {
  console.log(`MoodMap backend listening on http://localhost:${PORT}`);
});
