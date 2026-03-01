import { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, Dimensions, Platform, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useAudioPlayer,
  useAudioRecorder,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
} from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import Header from './components/Header';
import NowPlayingBar from './components/NowPlayingBar';
import Controls from './components/Controls';
import MoodPickerModal from './components/MoodPickerModal';
import JourneysModal from './components/JourneysModal';
import ReflectionModal from './components/ReflectionModal';
import FavouritesModal from './components/FavouritesModal';
import MoodFromTextModal from './components/MoodFromTextModal';
import EchoModal from './components/EchoModal';

const { width } = Dimensions.get('window');
const API_URL = 'http://10.0.2.2:4000/analyze';

const PHASES = {
  IDLE: 'idle',
  LISTENING: 'listening',
  ANALYZING: 'analyzing',
  READY: 'ready',
  PLAYING: 'playing',
};

const MOOD_LABELS = {
  idle: 'Tap to sync with your environment',
  listening: 'Listening...',
  analyzing: 'Analyzing your soundscape',
  ready: 'Soundscape ready',
  playing: 'Playing your soundscape',
};

// High-level mood "bands" used for visualization
const MOOD_BANDS = ['low', 'mid', 'high'];

// Rich mood categories per band with Lo-Fi style tracks (80+ track entries, matches backend)
const TRACKS_BASE = Array.from({ length: 17 }, (_, i) =>
  `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${i + 1}.mp3`
);
const pickTracks = (indices) => indices.map((i) => TRACKS_BASE[i % TRACKS_BASE.length]);

const MOOD_LIBRARY = {
  low: [
    { id: 'low-night-chill', label: 'Night-time Chill', tracks: pickTracks([0, 1, 2, 3, 4, 5]) },
    { id: 'low-deep-focus', label: 'Deep Focus', tracks: pickTracks([0, 1, 2, 3, 4]) },
    { id: 'low-evening-chill', label: 'Evening Wind Down', tracks: pickTracks([1, 3, 5, 7]) },
    { id: 'low-calm-piano', label: 'Calm Piano', tracks: pickTracks([4, 8, 12, 14]) },
    { id: 'low-cozy-corner', label: 'Cozy Corner', tracks: pickTracks([0, 7, 11, 15]) },
    { id: 'low-dreamy-drift', label: 'Dreamy Drift', tracks: pickTracks([1, 3, 5, 7, 9]) },
    { id: 'low-midnight', label: 'Midnight Calm', tracks: pickTracks([2, 4, 6, 8, 10]) },
    { id: 'low-starlight', label: 'Starlight', tracks: pickTracks([4, 6, 8, 10, 12]) },
    { id: 'low-deep-rest', label: 'Deep Rest', tracks: pickTracks([0, 2, 5, 9, 13]) },
    { id: 'low-library-quiet', label: 'Library Quiet', tracks: pickTracks([1, 5, 9, 13]) },
    { id: 'low-hammock-day', label: 'Hammock Day', tracks: pickTracks([2, 6, 10, 14]) },
    { id: 'low-fireplace', label: 'Fireplace', tracks: pickTracks([4, 8, 12, 16]) },
    { id: 'low-cloud-nine', label: 'Cloud Nine', tracks: pickTracks([1, 4, 7, 11]) },
    { id: 'low-gentle-waves', label: 'Gentle Waves', tracks: pickTracks([2, 5, 8, 12]) },
    { id: 'low-moonlight', label: 'Moonlight', tracks: pickTracks([3, 6, 9, 13]) },
    { id: 'low-writers-room', label: "Writer's Room", tracks: pickTracks([1, 6, 11]) },
    { id: 'low-nostalgia', label: 'Nostalgia', tracks: pickTracks([0, 5, 9, 13]) },
  ],
  mid: [
    { id: 'mid-lofi-beats', label: 'Lo-Fi Study Beats', tracks: pickTracks([1, 5, 6, 7, 8]) },
    { id: 'mid-coffee-shop', label: 'Coffee Shop Ambience', tracks: pickTracks([8, 9, 10, 11]) },
    { id: 'mid-rainy-focus', label: 'Rainy Window Focus', tracks: pickTracks([2, 6, 9, 10]) },
    { id: 'mid-night-coding', label: 'Late Night Coding', tracks: pickTracks([3, 7, 10, 11, 12]) },
    { id: 'mid-minimal-beats', label: 'Minimal Beats', tracks: pickTracks([4, 8, 11, 13]) },
    { id: 'mid-concentration', label: 'Concentration Flow', tracks: pickTracks([5, 9, 12, 14]) },
    { id: 'mid-jazz-cafe', label: 'Jazz Café', tracks: pickTracks([2, 6, 10, 12]) },
    { id: 'mid-soft-rain', label: 'Soft Rain', tracks: pickTracks([3, 7, 11, 13]) },
    { id: 'mid-forest-walk', label: 'Forest Walk', tracks: pickTracks([6, 10, 14, 16]) },
    { id: 'mid-sleepy-beats', label: 'Sleepy Beats', tracks: pickTracks([3, 5, 7, 9, 11]) },
    { id: 'mid-creative-flow', label: 'Creative Flow', tracks: pickTracks([1, 4, 8, 12]) },
    { id: 'mid-doodle-mode', label: 'Doodle Mode', tracks: pickTracks([3, 7, 11, 15]) },
    { id: 'mid-groovy', label: 'Groovy', tracks: pickTracks([8, 12, 16, 0]) },
    { id: 'mid-reading-nook', label: 'Reading Nook', tracks: pickTracks([0, 4, 8, 12]) },
    { id: 'mid-deep-work-block', label: 'Deep Work Block', tracks: pickTracks([2, 6, 10, 14]) },
    { id: 'mid-tea-time', label: 'Tea Time', tracks: pickTracks([1, 5, 9, 13]) },
    { id: 'mid-ocean-breeze', label: 'Ocean Breeze', tracks: pickTracks([3, 7, 11, 15]) },
    { id: 'mid-dusk-till-dawn', label: 'Dusk Till Dawn', tracks: pickTracks([0, 4, 8, 12, 16]) },
    { id: 'mid-sketch-pad', label: 'Sketch Pad', tracks: pickTracks([0, 5, 10, 15]) },
    { id: 'mid-studio-vibes', label: 'Studio Vibes', tracks: pickTracks([2, 7, 12]) },
    { id: 'mid-lofi-hip-hop', label: 'Lo-Fi Hip Hop', tracks: pickTracks([1, 4, 8, 12, 16]) },
    { id: 'mid-vinyl-crackle', label: 'Vinyl Crackle', tracks: pickTracks([2, 6, 10, 14]) },
    { id: 'mid-chill-hop', label: 'Chill Hop', tracks: pickTracks([3, 7, 11, 15]) },
    { id: 'mid-late-night-lofi', label: 'Late Night Lo-Fi', tracks: pickTracks([0, 2, 5, 10, 15]) },
  ],
  high: [
    { id: 'high-sunrise', label: 'Bright Sunrise', tracks: pickTracks([0, 2, 4, 6]) },
    { id: 'high-energetic', label: 'Energetic Focus', tracks: pickTracks([6, 10, 13, 15, 16]) },
    { id: 'high-morning-flow', label: 'Morning Flow', tracks: pickTracks([7, 11, 14]) },
    { id: 'high-afternoon', label: 'Lazy Afternoon', tracks: pickTracks([5, 9, 13, 15]) },
    { id: 'high-inspiration', label: 'Inspiration', tracks: pickTracks([2, 6, 10, 14]) },
    { id: 'high-ideation', label: 'Ideation', tracks: pickTracks([5, 9, 13, 16]) },
    { id: 'high-workout', label: 'Light Workout', tracks: pickTracks([6, 10, 14]) },
    { id: 'high-commute', label: 'Commute', tracks: pickTracks([7, 11, 15]) },
    { id: 'high-sunday-morning', label: 'Sunday Morning', tracks: pickTracks([0, 5, 10, 15]) },
    { id: 'high-brainstorm', label: 'Brainstorm', tracks: pickTracks([4, 9, 14]) },
    { id: 'high-wake-up', label: 'Wake Up', tracks: pickTracks([0, 3, 6, 9]) },
    { id: 'high-pre-workout', label: 'Pre-workout', tracks: pickTracks([1, 5, 10, 14]) },
    { id: 'high-road-trip', label: 'Road Trip', tracks: pickTracks([2, 7, 12, 16]) },
    { id: 'high-sunset-drive', label: 'Sunset Drive', tracks: pickTracks([4, 8, 12]) },
  ],
};

// Flatten for manual picker (fallback when backend /moods is unreachable)
const ALL_MOODS = [
  ...MOOD_LIBRARY.low.map((m) => ({ ...m, band: 'low' })),
  ...MOOD_LIBRARY.mid.map((m) => ({ ...m, band: 'mid' })),
  ...MOOD_LIBRARY.high.map((m) => ({ ...m, band: 'high' })),
];

const STORAGE_KEYS = {
  THEME: '@moodmap_theme',
  FAVOURITES: '@moodmap_favourites',
  TRACK_CACHE: '@moodmap_track_cache',
  REFLECTIONS: '@moodmap_reflections',
  ECHO: '@moodmap_echo',
  SESSIONS: '@moodmap_sessions',
  AUTH_TOKEN: '@moodmap_auth_token',
  USER: '@moodmap_user',
};
const TIMER_OPTIONS = [0, 15, 30, 45, 60]; // 0 = off

const THEME = { DARK: 'dark', LIGHT: 'light' };
const COLORS = {
  dark: {
    bg: ['#0f0c29', '#302b63', '#24243e'],
    text: '#fff',
    textDim: 'rgba(255,255,255,0.7)',
    orbPlaying: ['#667eea', '#764ba2'],
    orbReady: ['#11998e', '#38ef7d'],
    orbIdle: ['#4568dc', '#b06ab3'],
    bar: 'rgba(102, 126, 234, 0.8)',
    ring: 'rgba(102, 126, 234, 0.5)',
  },
  light: {
    bg: ['#e0e5ec', '#a8b5c4', '#c5ced9'],
    text: '#1a1a2e',
    textDim: 'rgba(26,26,46,0.7)',
    orbPlaying: ['#667eea', '#764ba2'],
    orbReady: ['#11998e', '#38ef7d'],
    orbIdle: ['#5a67d8', '#9f7aea'],
    bar: 'rgba(90, 103, 216, 0.7)',
    ring: 'rgba(90, 103, 216, 0.5)',
  },
};

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const MOODS_URL = 'http://10.0.2.2:4000/moods';
const JOURNEYS_URL = 'http://10.0.2.2:4000/journeys';
const SUGGEST_MOODS_URL = 'http://10.0.2.2:4000/suggest-moods';
const AUTH_BASE_URL = 'http://10.0.2.2:4000';

function computeStreakSummary(sessions) {
  if (!Array.isArray(sessions) || sessions.length === 0) {
    return { totalSessions: 0, totalDays: 0, currentStreak: 0, longestStreak: 0 };
  }
  const uniqueDays = new Set(
    sessions.map((s) => s.day || new Date(s.at).toISOString().slice(0, 10))
  );
  const days = Array.from(uniqueDays).sort();
  const dayNums = days.map((d) => Math.floor(new Date(d).getTime() / 86400000));
  let longest = 1;
  let current = 1;
  for (let i = 1; i < dayNums.length; i += 1) {
    if (dayNums[i] === dayNums[i - 1] + 1) {
      current += 1;
    } else {
      longest = Math.max(longest, current);
      current = 1;
    }
  }
  longest = Math.max(longest, current);
  const currentStreak = current;
  return {
    totalSessions: sessions.length,
    totalDays: days.length,
    currentStreak,
    longestStreak: longest,
  };
}

export default function App() {
  const [phase, setPhase] = useState(PHASES.IDLE);
  const [moodProfile, setMoodProfile] = useState(null);
  const [hasMicPermission, setHasMicPermission] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  );
  const [theme, setTheme] = useState(THEME.DARK);
  const [volume, setVolume] = useState(1);
  const [timerMinutes, setTimerMinutes] = useState(0);
  const [favourites, setFavourites] = useState([]);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [showFavourites, setShowFavourites] = useState(false);
  const [showMoodFromText, setShowMoodFromText] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [authToken, setAuthToken] = useState(null);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');
  const [moodFamilies, setMoodFamilies] = useState([]);
  const [allMoods, setAllMoods] = useState(ALL_MOODS);
  const [journeys, setJourneys] = useState([]);
  const [showJourneys, setShowJourneys] = useState(false);
  const [activeJourneyId, setActiveJourneyId] = useState(null);
  const [activeJourneyStep, setActiveJourneyStep] = useState(0);
  const [showReflection, setShowReflection] = useState(false);
  const [lastJourneyId, setLastJourneyId] = useState(null);
  const [showEchoModal, setShowEchoModal] = useState(false);
  const timerRef = useRef(null);
  const fadeRef = useRef(null);
  const trackCacheRef = useRef({});
  const currentTrackUrlRef = useRef(null);
  const journeyTimerRef = useRef(null);
  const orbScale = useRef(new Animated.Value(1)).current;
  const orbOpacity = useRef(new Animated.Value(0.9)).current;
  const ringScale = useRef(new Animated.Value(1)).current;
  const ringOpacity = useRef(new Animated.Value(0.3)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslate = useRef(new Animated.Value(24)).current;
  const barScales = useRef([1, 1, 1].map(() => new Animated.Value(0.3))).current;
  const moodAnim = useRef(new Animated.Value(1)).current;
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const player = useAudioPlayer(currentTrack);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
        if (stored === THEME.LIGHT || stored === THEME.DARK) setTheme(stored);
        const fav = await AsyncStorage.getItem(STORAGE_KEYS.FAVOURITES);
        if (fav) setFavourites(JSON.parse(fav));
        const sessionsRaw = await AsyncStorage.getItem(STORAGE_KEYS.SESSIONS);
        if (sessionsRaw) {
          try {
            const parsedSessions = JSON.parse(sessionsRaw);
            if (Array.isArray(parsedSessions)) setSessions(parsedSessions);
          } catch (e) {}
        }
        const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);
        if (token) setAuthToken(token);
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {}
        }
      } catch (e) {}
      setAuthLoading(false);

      // Load cached track URIs for faster playback
      try {
        const cacheRaw = await AsyncStorage.getItem(STORAGE_KEYS.TRACK_CACHE);
        if (cacheRaw) {
          const parsed = JSON.parse(cacheRaw);
          if (parsed && typeof parsed === 'object') {
            trackCacheRef.current = parsed;
          }
        }
      } catch (e) {}

      // Load mood taxonomy from backend
      try {
        const res = await fetch(MOODS_URL);
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.families)) {
            setMoodFamilies(data.families);
            const flat = data.families.flatMap((family) =>
              (family.moods || []).map((mood) => ({
                ...mood,
                familyId: family.id,
              }))
            );
            if (flat.length) setAllMoods(flat);
          }
        }
      } catch (e) {
        // Fallback to static ALL_MOODS when backend is unreachable
        setMoodFamilies([]);
      }

      // Load journeys from backend
      try {
        const res = await fetch(JOURNEYS_URL);
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.journeys)) {
            setJourneys(data.journeys);
          }
        }
      } catch (e) {
        // ignore if journeys endpoint is unavailable
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const status = await AudioModule.requestRecordingPermissionsAsync();
        if (!status.granted) {
          return;
        }
        setHasMicPermission(true);
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
        });
      } catch (e) {
        // If audio mode or permissions fail, continue with fallback behavior.
      }
    })();
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslate, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    moodAnim.setValue(0);
    Animated.timing(moodAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [moodProfile, phase]);

  const haptic = (type = 'light') => {
    try {
      if (type === 'heavy') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      else if (type === 'medium') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
  };

  useEffect(() => {
    if (theme) AsyncStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  useEffect(() => {
    if (phase !== PHASES.PLAYING || timerMinutes <= 0) return;
    const ms = timerMinutes * 60 * 1000;
    timerRef.current = setTimeout(() => {
      try {
        player.pause();
        player.seekTo(0);
      } catch (e) {}
      setPhase(PHASES.READY);
      haptic('medium');
    }, ms);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (fadeRef.current) clearTimeout(fadeRef.current);
    };
  }, [phase, timerMinutes]);

  const runListeningAnimation = () => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(orbScale, {
            toValue: 1.15,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(orbScale, {
            toValue: 0.95,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(ringScale, {
            toValue: 1.4,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(ringScale, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ]),
      { iterations: -1 }
    ).start();
  };

  const runAnalyzingAnimation = () => {
    Animated.sequence([
      Animated.timing(orbOpacity, {
        toValue: 0.5,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(orbOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      orbOpacity.setValue(0.9);
    });
  };

  const stopAnimations = () => {
    orbScale.stopAnimation();
    ringScale.stopAnimation();
    orbScale.setValue(1);
    ringScale.setValue(1);
    ringOpacity.setValue(0.3);
    orbOpacity.setValue(0.9);
  };

  const analyzeWithBackend = async (recordingUri) => {
    if (!recordingUri) return false;
    try {
      const base64 = await FileSystem.readAsStringAsync(recordingUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioBase64: base64 }),
      });
      if (!response.ok) {
        throw new Error('Bad status');
      }
      const data = await response.json();
      if (!data || !data.moodBand || !data.moodId || !data.label || !data.trackUrl) {
        throw new Error('Invalid response');
      }
      setTrackForPlayback(data.trackUrl);
      setMoodProfile({
        peaks: {},
        dominant: data.moodBand,
        moodId: data.moodId,
        recipeId: data.recipeId || null,
        label: data.label,
      });
      return true;
    } catch (e) {
      return false;
    }
  };

  const simulateFrequencyAnalysis = () => {
    const peaks = {
      low: 0.2 + Math.random() * 0.5,
      mid: 0.1 + Math.random() * 0.6,
      high: 0.1 + Math.random() * 0.5,
    };
    const dominant = Object.entries(peaks).sort((a, b) => b[1] - a[1])[0][0];
    const candidates = allMoods.filter((mood) => mood.band === dominant);
    const pool = candidates.length ? candidates : allMoods;
    const mood =
      pool[Math.floor(Math.random() * pool.length)] ?? pool[0] ?? ALL_MOODS[0];
    const trackIndex =
      mood.tracks && mood.tracks.length
        ? Math.floor(Math.random() * mood.tracks.length)
        : 0;
    const track =
      mood.tracks[trackIndex] ?? mood.tracks[0];
    setTrackForPlayback(track);
    setMoodProfile({
      peaks,
      dominant,
      moodId: mood.id,
      recipeId: `${mood.id}__${trackIndex}`,
      label: mood.label,
    });
  };

  const pickMoodManually = (mood) => {
    cancelJourney();
    const trackIndex =
      mood.tracks && mood.tracks.length
        ? Math.floor(Math.random() * mood.tracks.length)
        : 0;
    const track = mood.tracks[trackIndex] ?? mood.tracks[0];
    setTrackForPlayback(track);
    setMoodProfile({ peaks: {}, dominant: mood.band, moodId: mood.id, label: mood.label });
    setPhase(PHASES.READY);
    setShowMoodPicker(false);
    setShowMoodFromText(false);
    haptic('medium');
  };

  const fetchMoodSuggestions = async (text) => {
    try {
      const res = await fetch(SUGGEST_MOODS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.suggestions || [];
      }
    } catch (e) {}
    const t = (text || '').toLowerCase().trim();
    const bandKeywords = {
      low: ['sleep', 'tired', 'night', 'relax', 'calm', 'chill', 'cozy'],
      mid: ['focus', 'work', 'study', 'cozy', 'rain', 'coffee'],
      high: ['energy', 'workout', 'morning', 'commute'],
    };
    let pool = allMoods;
    for (const [band, kws] of Object.entries(bandKeywords)) {
      if (kws.some((kw) => t.includes(kw))) {
        pool = allMoods.filter((m) => m.band === band);
        break;
      }
    }
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3).map((m) => ({ moodId: m.id, label: m.label }));
  };

  const addToFavourites = () => {
    if (!moodProfile || !currentTrack) return;
    haptic('light');
    const entry = {
      id: Date.now().toString(),
      label: moodProfile.label,
      trackUrl: currentTrackUrlRef.current || currentTrack,
      moodId: moodProfile.moodId,
    };
    const next = [entry, ...favourites].slice(0, 50);
    setFavourites(next);
    AsyncStorage.setItem(STORAGE_KEYS.FAVOURITES, JSON.stringify(next));
  };

  const playFromFavourite = (fav) => {
    setTrackForPlayback(fav.trackUrl);
    setMoodProfile({ label: fav.label, moodId: fav.moodId, dominant: 'mid', peaks: {} });
    setPhase(PHASES.READY);
    setShowFavourites(false);
    haptic('medium');
  };

  const removeFavourite = (id) => {
    const next = favourites.filter((f) => f.id !== id);
    setFavourites(next);
    AsyncStorage.setItem(STORAGE_KEYS.FAVOURITES, JSON.stringify(next));
    haptic('light');
  };

  const cancelJourney = () => {
    if (journeyTimerRef.current) clearTimeout(journeyTimerRef.current);
    journeyTimerRef.current = null;
    setActiveJourneyId(null);
    setActiveJourneyStep(0);
  };

  const setTrackForPlayback = (trackUrl) => {
    if (!trackUrl) return;
    currentTrackUrlRef.current = trackUrl;
    const cached = trackCacheRef.current[trackUrl];
    setCurrentTrack(cached || trackUrl);
    // Kick off background download for next time
    ensureTrackCached(trackUrl);
  };

  const ensureTrackCached = async (trackUrl) => {
    if (!trackUrl || trackCacheRef.current[trackUrl]) return;
    try {
      const safeName = encodeURIComponent(trackUrl);
      const fileUri = `${FileSystem.cacheDirectory}moodmap-${safeName}`;
      const info = await FileSystem.getInfoAsync(fileUri);
      let finalUri = fileUri;
      if (!info.exists) {
        const { uri } = await FileSystem.downloadAsync(trackUrl, fileUri);
        finalUri = uri;
      }
      trackCacheRef.current[trackUrl] = finalUri;
      await AsyncStorage.setItem(
        STORAGE_KEYS.TRACK_CACHE,
        JSON.stringify(trackCacheRef.current)
      );
    } catch (e) {
      // ignore caching errors
    }
  };

  // Journey stepping
  useEffect(() => {
    if (!activeJourneyId) return;
    const journey = journeys.find((j) => j.id === activeJourneyId);
    if (!journey || !journey.steps || !journey.steps.length) {
      cancelJourney();
      return;
    }
    const step = journey.steps[activeJourneyStep];
    if (!step) {
      // Journey finished
      cancelJourney();
      try {
        player.pause();
        player.seekTo(0);
      } catch (e) {}
      setPhase(PHASES.READY);
      setLastJourneyId(journey.id);
      setShowReflection(true);
      return;
    }

    // Load mood for this step
    const mood =
      allMoods.find((m) => m.id === step.moodId) ||
      ALL_MOODS.find((m) => m.id === step.moodId) ||
      allMoods[0] ||
      ALL_MOODS[0];
    if (mood && mood.tracks && mood.tracks.length) {
      const trackIndex = Math.floor(Math.random() * mood.tracks.length);
      const track = mood.tracks[trackIndex] ?? mood.tracks[0];
      setTrackForPlayback(track);
      setMoodProfile({
        peaks: {},
        dominant: mood.band,
        moodId: mood.id,
        recipeId: `${mood.id}__${trackIndex}`,
        label: mood.label,
      });
      setPhase(PHASES.READY);
    }

    // Schedule next step
    if (journeyTimerRef.current) clearTimeout(journeyTimerRef.current);
    const ms = (step.minutes || 0) * 60 * 1000;
    if (ms > 0) {
      journeyTimerRef.current = setTimeout(() => {
        setActiveJourneyStep((idx) => idx + 1);
      }, ms);
    }

    return () => {
      if (journeyTimerRef.current) clearTimeout(journeyTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeJourneyId, activeJourneyStep]);

  const syncEnvironment = async () => {
    if (phase === PHASES.LISTENING || phase === PHASES.ANALYZING) return;
    haptic('medium');
    setPhase(PHASES.LISTENING);
    runListeningAnimation();

    let recordingUri = null;
    try {
      if (hasMicPermission) {
        await audioRecorder.prepareToRecordAsync();
        audioRecorder.record();
        await new Promise((resolve) => setTimeout(resolve, 5000));
        await audioRecorder.stop();
        recordingUri = audioRecorder.uri;
      } else {
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    } catch (e) {
      setPhase(PHASES.IDLE);
      stopAnimations();
      return;
    }

    setPhase(PHASES.ANALYZING);
    stopAnimations();
    runAnalyzingAnimation();
    barScales.forEach((anim, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 0.4 + Math.random() * 0.6,
            duration: 200 + i * 100,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.2,
            duration: 200 + i * 100,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });

    (async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      barScales.forEach((a) => a.stopAnimation());
      barScales.forEach((a) => a.setValue(0.3));

      const usedBackend = await analyzeWithBackend(recordingUri);
      if (!usedBackend) {
        simulateFrequencyAnalysis();
      }
      stopAnimations();
      setPhase(PHASES.READY);
    })();
  };

  const logSession = (triggerPhase) => {
    if (triggerPhase !== PHASES.READY) return;
    try {
      const now = Date.now();
      const day = new Date(now).toISOString().slice(0, 10);
      setSessions((prev) => {
        const next = [...prev, { at: now, day }].slice(-365);
        AsyncStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(next));
        return next;
      });
      if (authToken) {
        fetch(`${AUTH_BASE_URL}/usage/session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            at: Date.now(),
            day,
            moodLabel: moodProfile?.label || null,
          }),
        }).catch(() => {});
      }
    } catch (e) {}
  };

  const playSoundscape = async () => {
    if (phase !== PHASES.READY && phase !== PHASES.PLAYING) return;
    if (phase === PHASES.PLAYING) {
      haptic('light');
      try {
        player.pause();
        player.seekTo(0);
      } catch (e) {
        // ignore pause errors
      }
      setPhase(PHASES.READY);
      setShowEchoModal(true);
      return;
    }
    logSession(phase);
    haptic('medium');
    setPhase(PHASES.PLAYING);
    try {
      // Ensure player uses current volume and just play
      try {
        player.volume = volume;
      } catch (e) {}
      await player.play();
    } catch (e) {
      setPhase(PHASES.READY);
    }
  };

  const handleEchoAnswer = async (result) => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.ECHO);
      const list = raw ? JSON.parse(raw) : [];
      list.push({
        result,
        at: Date.now(),
        moodLabel: moodProfile?.label,
      });
      await AsyncStorage.setItem(
        STORAGE_KEYS.ECHO,
        JSON.stringify(list.slice(-100))
      );
    } catch (e) {}
    setShowEchoModal(false);
    haptic('light');
  };

  const isSyncDisabled = phase === PHASES.LISTENING || phase === PHASES.ANALYZING;
  const canPlay = phase === PHASES.READY || phase === PHASES.PLAYING;
  const c = COLORS[theme];
  const streakSummary = computeStreakSummary(sessions);
  const moodTranslateY = moodAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [8, 0],
  });

  const handleAuthSubmit = async () => {
    const email = authEmail.trim();
    const password = authPassword.trim();
    const name = authName.trim();
    if (!email || !password) {
      setAuthError('Email and password are required');
      return;
    }
    setAuthError('');
    setAuthLoading(true);
    try {
      const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';
      const res = await fetch(`${AUTH_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name: authMode === 'register' ? name : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setAuthError(data.error || 'Authentication failed');
        return;
      }
      const data = await res.json();
      setAuthToken(data.token);
      setUser(data.user);
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
      setAuthEmail('');
      setAuthPassword('');
      setAuthName('');
    } catch (e) {
      setAuthError('Unable to reach server');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    setAuthToken(null);
    setUser(null);
    await AsyncStorage.multiRemove([STORAGE_KEYS.AUTH_TOKEN, STORAGE_KEYS.USER]);
  };

  if (authLoading) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text>Loading…</Text>
      </View>
    );
  }

  if (!authToken) {
    const c = COLORS[theme];
    return (
      <View style={styles.container}>
        <StatusBar style={theme === THEME.DARK ? 'light' : 'dark'} />
        <LinearGradient colors={c.bg} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={styles.safe} edges={['top']}>
          <View style={[styles.content, { paddingHorizontal: 24 }]}>
            <Text style={[styles.title, { color: c.text }]}>MoodMap</Text>
            <Text style={[styles.subtitle, { color: c.textDim }]}>Sign in to save your mood journeys</Text>
            <View style={{ width: '100%', marginTop: 12 }}>
              <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                <TouchableOpacity
                  style={[
                    styles.authTab,
                    authMode === 'login' && { backgroundColor: c.orbReady[0] },
                  ]}
                  onPress={() => setAuthMode('login')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.authTabText,
                      { color: authMode === 'login' ? '#fff' : c.textDim },
                    ]}
                  >
                    Login
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.authTab,
                    authMode === 'register' && { backgroundColor: c.orbReady[0] },
                  ]}
                  onPress={() => setAuthMode('register')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.authTabText,
                      { color: authMode === 'register' ? '#fff' : c.textDim },
                    ]}
                  >
                    Register
                  </Text>
                </TouchableOpacity>
              </View>
              {authMode === 'register' && (
                <TextInput
                  style={[
                    styles.authInput,
                    { borderColor: c.textDim, color: c.text, marginBottom: 8 },
                  ]}
                  placeholder="Name"
                  placeholderTextColor={c.textDim}
                  value={authName}
                  onChangeText={setAuthName}
                />
              )}
              <TextInput
                style={[styles.authInput, { borderColor: c.textDim, color: c.text }]}
                placeholder="Email"
                placeholderTextColor={c.textDim}
                autoCapitalize="none"
                keyboardType="email-address"
                value={authEmail}
                onChangeText={setAuthEmail}
              />
              <TextInput
                style={[
                  styles.authInput,
                  { borderColor: c.textDim, color: c.text, marginTop: 8 },
                ]}
                placeholder="Password"
                placeholderTextColor={c.textDim}
                secureTextEntry
                value={authPassword}
                onChangeText={setAuthPassword}
              />
              {authError ? (
                <Text style={{ color: '#ff6b6b', marginTop: 8, fontSize: 12 }}>
                  {authError}
                </Text>
              ) : null}
              <TouchableOpacity
                style={[
                  styles.syncButton,
                  { marginTop: 16, opacity: authLoading ? 0.7 : 1 },
                ]}
                onPress={handleAuthSubmit}
                disabled={authLoading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.syncGradient}
                >
                  <Text style={styles.syncButtonText}>
                    {authMode === 'login' ? 'Login' : 'Create account'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style={theme === THEME.DARK ? 'light' : 'dark'} />
      <LinearGradient
        colors={c.bg}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header
          theme={theme}
          colors={c}
          user={user}
          onLogout={() => {
            handleLogout();
            haptic('light');
          }}
          onToggleTheme={() => {
            setTheme((t) => (t === THEME.DARK ? THEME.LIGHT : THEME.DARK));
            haptic('light');
          }}
          onOpenJourneys={() => {
            setShowJourneys(true);
            haptic('light');
          }}
          onOpenMoodPicker={() => {
            setShowMoodPicker(true);
            haptic('light');
          }}
          onOpenMoodFromText={() => {
            setShowMoodFromText(true);
            haptic('light');
          }}
          onOpenFavourites={() => {
            setShowFavourites(true);
            haptic('light');
          }}
        />

        <AnimatedScrollView
          style={{ flex: 1, width: '100%' }}
          contentContainerStyle={[
            styles.content,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentTranslate }],
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.title, { color: c.text }]}>MoodMap</Text>
          <Text style={[styles.subtitle, { color: c.textDim }]}>Emotional Soundscape Generator</Text>
          {streakSummary.totalSessions > 0 && (
            <View style={styles.streakRow}>
              <Text style={[styles.streakText, { color: c.textDim }]}>
                Sessions: {streakSummary.totalSessions} · Days: {streakSummary.totalDays} · Streak: {streakSummary.currentStreak}{' '}
                day{streakSummary.currentStreak === 1 ? '' : 's'}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.orbContainer}
            onPress={() => phase === PHASES.IDLE && syncEnvironment()}
            activeOpacity={1}
          >
            <Animated.View
              style={[
                styles.ring,
                { borderColor: c.ring, transform: [{ scale: ringScale }], opacity: ringOpacity },
              ]}
            />
            <Animated.View
              style={[
                styles.orb,
                { transform: [{ scale: orbScale }], opacity: orbOpacity, shadowColor: c.orbIdle[0] },
              ]}
            >
              <LinearGradient
                colors={
                  phase === PHASES.PLAYING
                    ? c.orbPlaying
                    : phase === PHASES.READY
                    ? c.orbReady
                    : c.orbIdle
                }
                style={styles.orbGradient}
              />
            </Animated.View>
          </TouchableOpacity>

          {phase === PHASES.ANALYZING && (
            <View style={styles.barsRow}>
              {barScales.map((anim, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.bar,
                    { backgroundColor: c.bar, transform: [{ scaleY: anim }] },
                  ]}
                />
              ))}
            </View>
          )}

          <Animated.View
            style={{
              alignItems: 'center',
              opacity: moodAnim,
              transform: [{ translateY: moodTranslateY }],
              marginBottom: 16,
            }}
          >
            <Text style={[styles.phaseLabel, { color: c.text }]}>{MOOD_LABELS[phase]}</Text>
            {moodProfile && (
              <Text style={[styles.moodDetail, { color: c.textDim }]}>{moodProfile.label}</Text>
            )}
          </Animated.View>

          <Controls
            volume={volume}
            setVolume={(v) => {
              setVolume(v);
              haptic('light');
            }}
            timerMinutes={timerMinutes}
            setTimerMinutes={(m) => {
              setTimerMinutes(m);
              haptic('light');
            }}
            onSync={isSyncDisabled ? undefined : syncEnvironment}
            onPlay={playSoundscape}
            canPlay={canPlay}
            moodProfile={moodProfile}
            isPlaying={phase === PHASES.PLAYING}
            colors={c}
            theme={theme}
            onAddFavourite={addToFavourites}
            styles={styles}
          />
        </AnimatedScrollView>

        <NowPlayingBar
          moodProfile={moodProfile}
          canPlay={canPlay}
          timerMinutes={timerMinutes}
          colors={c}
          theme={theme}
          onTogglePlay={playSoundscape}
          isPlaying={phase === PHASES.PLAYING}
        />
      </SafeAreaView>

      <MoodPickerModal
        visible={showMoodPicker}
        onClose={() => {
          setShowMoodPicker(false);
          haptic('light');
        }}
        moodFamilies={moodFamilies}
        allMoods={allMoods}
        onSelectMood={pickMoodManually}
        colors={c}
        theme={theme}
        styles={styles}
      />

      <MoodFromTextModal
        visible={showMoodFromText}
        onClose={() => {
          setShowMoodFromText(false);
          haptic('light');
        }}
        onSelectMood={pickMoodManually}
        colors={c}
        theme={theme}
        styles={styles}
        fetchSuggestions={fetchMoodSuggestions}
        allMoods={allMoods}
      />

      {/* Favourites Modal */}

      <JourneysModal
        visible={showJourneys}
        onClose={() => {
          setShowJourneys(false);
          haptic('light');
        }}
        journeys={journeys}
        colors={c}
        theme={theme}
        styles={styles}
        onSelectJourney={(journey) => {
          cancelJourney();
          setActiveJourneyId(journey.id);
          setActiveJourneyStep(0);
          setShowJourneys(false);
          haptic('medium');
        }}
        cancelJourney={cancelJourney}
      />

      <ReflectionModal
        visible={showReflection}
        colors={c}
        theme={theme}
        styles={styles}
        onAnswer={async (result) => {
          try {
            const raw = await AsyncStorage.getItem(STORAGE_KEYS.REFLECTIONS);
            const list = raw ? JSON.parse(raw) : [];
            list.push({
              journeyId: lastJourneyId,
              result,
              at: Date.now(),
            });
            await AsyncStorage.setItem(
              STORAGE_KEYS.REFLECTIONS,
              JSON.stringify(list.slice(-100))
            );
          } catch (e) {}
          setShowReflection(false);
          setLastJourneyId(null);
        }}
      />

      <FavouritesModal
        visible={showFavourites}
        favourites={favourites}
        colors={c}
        theme={theme}
        styles={styles}
        onClose={() => {
          setShowFavourites(false);
          haptic('light');
        }}
        onPlayFavourite={playFromFavourite}
        onRemoveFavourite={removeFavourite}
      />

      <EchoModal
        visible={showEchoModal}
        colors={c}
        theme={theme}
        styles={styles}
        onAnswer={handleEchoAnswer}
        onSkip={() => {
          setShowEchoModal(false);
          haptic('light');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 8,
  },
  iconButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  iconButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  authTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  authTabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  authInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginTop: 8,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 32,
    paddingTop: Platform.OS === 'ios' ? 12 : 12,
    paddingBottom: 32,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 32,
    marginBottom: 16,
    gap: 8,
  },
  bar: {
    width: 8,
    height: 24,
    borderRadius: 4,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  streakRow: {
    marginBottom: 16,
  },
  streakText: {
    fontSize: 12,
  },
  orbContainer: {
    width: width * 0.5,
    height: width * 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  ring: {
    position: 'absolute',
    width: width * 0.45,
    height: width * 0.45,
    borderRadius: width * 0.225,
    borderWidth: 2,
  },
  orb: {
    width: width * 0.38,
    height: width * 0.38,
    borderRadius: width * 0.19,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  orbGradient: {
    flex: 1,
  },
  phaseLabel: {
    fontSize: 16,
    marginBottom: 4,
    fontWeight: '600',
  },
  moodDetail: {
    fontSize: 14,
    marginBottom: 16,
  },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
    gap: 12,
  },
  volumeLabel: {
    fontSize: 12,
    width: 56,
  },
  volumeSegments: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
  },
  volumeSegment: {
    flex: 1,
    height: 24,
    borderRadius: 4,
  },
  timerRow: {
    marginBottom: 24,
    width: '100%',
  },
  timerChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  timerChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  timerChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  syncButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#764ba2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  syncButtonDisabled: {
    opacity: 0.8,
  },
  syncGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  playButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#38ef7d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  playGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  favButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 16,
  },
  favButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 16,
  },
  moodFamilyLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  modalClose: {
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  moodList: {
    maxHeight: 280,
  },
  moodItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  moodItemText: {
    fontSize: 16,
    fontWeight: '600',
  },
  favItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  favItemMain: {
    flex: 1,
  },
  favRemove: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  favRemoveText: {
    fontSize: 13,
  },
});
