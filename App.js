import { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import {
  useAudioPlayer,
  useAudioRecorder,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
} from 'expo-audio';
import * as FileSystem from 'expo-file-system';

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

// Rich mood categories per band with Lo-Fi style tracks
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

export default function App() {
  const [phase, setPhase] = useState(PHASES.IDLE);
  const [moodProfile, setMoodProfile] = useState(null);
  const [hasMicPermission, setHasMicPermission] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  );
  const orbScale = useRef(new Animated.Value(1)).current;
  const orbOpacity = useRef(new Animated.Value(0.9)).current;
  const ringScale = useRef(new Animated.Value(1)).current;
  const ringOpacity = useRef(new Animated.Value(0.3)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslate = useRef(new Animated.Value(24)).current;
  const barScales = useRef([1, 1, 1].map(() => new Animated.Value(0.3))).current;
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const player = useAudioPlayer(currentTrack);

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
      setCurrentTrack(data.trackUrl);
      setMoodProfile({
        peaks: {},
        dominant: data.moodBand,
        moodId: data.moodId,
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
    const bucket = MOOD_LIBRARY[dominant] ?? MOOD_LIBRARY.low;
    const mood =
      bucket[Math.floor(Math.random() * bucket.length)] ?? bucket[0];
    const track =
      mood.tracks[Math.floor(Math.random() * mood.tracks.length)] ??
      mood.tracks[0];
    setCurrentTrack(track);
    setMoodProfile({
      peaks,
      dominant,
      moodId: mood.id,
      label: mood.label,
    });
  };

  const syncEnvironment = async () => {
    if (phase === PHASES.LISTENING || phase === PHASES.ANALYZING) return;

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

  const playSoundscape = async () => {
    if (phase !== PHASES.READY && phase !== PHASES.PLAYING) return;
    if (phase === PHASES.PLAYING) {
      try {
        player.pause();
        player.seekTo(0);
      } catch (e) {
        // ignore pause errors
      }
      setPhase(PHASES.READY);
      return;
    }
    setPhase(PHASES.PLAYING);
    try {
      await player.play();
    } catch (e) {
      setPhase(PHASES.READY);
    }
  };

  const isSyncDisabled = phase === PHASES.LISTENING || phase === PHASES.ANALYZING;
  const showPlayButton = phase === PHASES.READY || phase === PHASES.PLAYING;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#0f0c29', '#302b63', '#24243e']}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentTranslate }],
            },
          ]}
        >
          <Text style={styles.title}>MoodMap</Text>
          <Text style={styles.subtitle}>Emotional Soundscape Generator</Text>

          <TouchableOpacity
            style={styles.orbContainer}
            onPress={() => phase === PHASES.IDLE && syncEnvironment()}
            activeOpacity={1}
          >
            <Animated.View
              style={[
                styles.ring,
                {
                  transform: [{ scale: ringScale }],
                  opacity: ringOpacity,
                },
              ]}
            />
            <Animated.View
              style={[
                styles.orb,
                {
                  transform: [{ scale: orbScale }],
                  opacity: orbOpacity,
                },
              ]}
            >
              <LinearGradient
                colors={
                  phase === PHASES.PLAYING
                    ? ['#667eea', '#764ba2']
                    : phase === PHASES.READY
                    ? ['#11998e', '#38ef7d']
                    : ['#4568dc', '#b06ab3']
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
                    {
                      transform: [{ scaleY: anim }],
                    },
                  ]}
                />
              ))}
            </View>
          )}

          <Text style={styles.phaseLabel}>{MOOD_LABELS[phase]}</Text>
          {moodProfile && (
            <Text style={styles.moodDetail}>{moodProfile.label}</Text>
          )}

          <TouchableOpacity
            style={[styles.syncButton, isSyncDisabled && styles.syncButtonDisabled]}
            onPress={syncEnvironment}
            disabled={isSyncDisabled}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isSyncDisabled ? ['#555', '#333'] : ['#667eea', '#764ba2']}
              style={styles.syncGradient}
            >
              <Text style={styles.syncButtonText}>
                {phase === PHASES.LISTENING
                  ? 'Listening...'
                  : phase === PHASES.ANALYZING
                  ? 'Analyzing...'
                  : 'Sync Environment'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {showPlayButton && (
            <TouchableOpacity
              style={styles.playButton}
              onPress={playSoundscape}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#11998e', '#38ef7d']}
                style={styles.playGradient}
              >
                <Text style={styles.playButtonText}>
                  {phase === PHASES.PLAYING ? 'Stop Soundscape' : 'Play Soundscape'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </Animated.View>
      </SafeAreaView>
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: Platform.OS === 'ios' ? 24 : 24,
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
    backgroundColor: 'rgba(102, 126, 234, 0.8)',
    borderRadius: 4,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 48,
    letterSpacing: 0.5,
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
    borderColor: 'rgba(102, 126, 234, 0.5)',
  },
  orb: {
    width: width * 0.38,
    height: width * 0.38,
    borderRadius: width * 0.19,
    overflow: 'hidden',
    shadowColor: '#667eea',
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
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
    fontWeight: '600',
  },
  moodDetail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 32,
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
});
