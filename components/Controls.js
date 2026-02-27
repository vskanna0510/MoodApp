import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function Controls({
  volume,
  setVolume,
  timerMinutes,
  setTimerMinutes,
  onSync,
  onPlay,
  canPlay,
  moodProfile,
  isPlaying,
  colors,
  theme,
  onAddFavourite,
  styles,
}) {
  const isDark = theme === 'dark';

  return (
    <>
      {/* Volume */}
      <View style={styles.volumeRow}>
        <Text style={[styles.volumeLabel, { color: colors.textDim }]}>Volume</Text>
        <View style={styles.volumeSegments}>
          {[0, 0.25, 0.5, 0.75, 1].map((v) => (
            <TouchableOpacity
              key={v}
              style={[
                styles.volumeSegment,
                {
                  backgroundColor:
                    volume >= v
                      ? colors.orbReady[0]
                      : isDark
                      ? 'rgba(255,255,255,0.2)'
                      : 'rgba(0,0,0,0.1)',
                },
              ]}
              onPress={() => setVolume(v)}
              activeOpacity={0.8}
            />
          ))}
        </View>
      </View>

      {/* Timer / Sleep */}
      <View style={styles.timerRow}>
        <Text style={[styles.volumeLabel, { color: colors.textDim }]}>Sleep timer</Text>
        <View style={styles.timerChips}>
          {[0, 15, 30, 45, 60].map((m) => (
            <TouchableOpacity
              key={m}
              style={[
                styles.timerChip,
                {
                  backgroundColor:
                    timerMinutes === m
                      ? colors.orbPlaying[0]
                      : isDark
                      ? 'rgba(255,255,255,0.15)'
                      : 'rgba(0,0,0,0.08)',
                  borderColor: colors.textDim,
                },
              ]}
              onPress={() => setTimerMinutes(m)}
              activeOpacity={0.8}
            >
              <Text style={[styles.timerChipText, { color: colors.text }]}>
                {m === 0 ? 'Off' : `${m}m`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Sync Environment */}
      <TouchableOpacity
        style={[
          styles.syncButton,
          (timerMinutes === 0 || !onSync) && styles.syncButtonDisabled,
        ]}
        onPress={onSync}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.syncGradient}
        >
          <Text style={styles.syncButtonText}>Sync Environment</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Play + Favourites */}
      <TouchableOpacity
        style={[styles.playButton, !canPlay && { opacity: 0.5 }]}
        onPress={canPlay ? onPlay : undefined}
        activeOpacity={canPlay ? 0.8 : 1}
      >
        <LinearGradient
          colors={['#11998e', '#38ef7d']}
          style={styles.playGradient}
        >
          <Text style={styles.playButtonText}>
            {canPlay && isPlaying ? 'Stop Soundscape' : 'Play Soundscape'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.favButton,
          { borderColor: colors.textDim, opacity: moodProfile ? 1 : 0.5 },
        ]}
        onPress={moodProfile ? onAddFavourite : undefined}
        activeOpacity={moodProfile ? 0.8 : 1}
      >
        <Text style={[styles.favButtonText, { color: colors.text }]}>
          ❤️ Add to Favourites
        </Text>
      </TouchableOpacity>
    </>
  );
}

