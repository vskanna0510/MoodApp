import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function NowPlayingBar({
  moodProfile,
  canPlay,
  timerMinutes,
  colors,
  theme,
  onTogglePlay,
  isPlaying,
}) {
  if (!moodProfile || !canPlay) return null;

  const isDark = theme === 'dark';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.9)',
        },
      ]}
    >
      <Text style={[styles.label, { color: colors.text }]} numberOfLines={1}>
        {moodProfile.label}
      </Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.orbReady[0] }]}
        onPress={onTogglePlay}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>{isPlaying ? '⏸' : '▶'}</Text>
      </TouchableOpacity>
      {timerMinutes > 0 && (
        <Text style={[styles.timer, { color: colors.textDim }]}>{timerMinutes}m</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.2)',
  },
  label: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  timer: {
    fontSize: 12,
  },
});

