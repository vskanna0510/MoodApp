import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function Header({
  theme,
  colors,
  onToggleTheme,
  onOpenJourneys,
  onOpenMoodPicker,
  onOpenMoodFromText,
  onOpenFavourites,
}) {
  const isDark = theme === 'dark';

  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={[
          styles.iconButton,
          { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)' },
        ]}
        onPress={onToggleTheme}
        activeOpacity={0.8}
      >
        <Text style={[styles.iconButtonText, { color: colors.text }]}>
          {isDark ? '☀️' : '🌙'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.iconButton,
          { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)' },
        ]}
        onPress={onOpenJourneys}
        activeOpacity={0.8}
      >
        <Text style={[styles.iconButtonText, { color: colors.text }]}>Journeys</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.iconButton,
          { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)' },
        ]}
        onPress={onOpenMoodPicker}
        activeOpacity={0.8}
      >
        <Text style={[styles.iconButtonText, { color: colors.text }]}>Pick mood</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.iconButton,
          { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)' },
        ]}
        onPress={onOpenMoodFromText}
        activeOpacity={0.8}
      >
        <Text style={[styles.iconButtonText, { color: colors.text }]}>Type</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.iconButton,
          { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)' },
        ]}
        onPress={onOpenFavourites}
        activeOpacity={0.8}
      >
        <Text style={[styles.iconButtonText, { color: colors.text }]}>❤️ Favs</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
});

