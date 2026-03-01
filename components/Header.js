import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function Header({
  theme,
  colors,
  user,
  onLogout,
  onToggleTheme,
  onOpenJourneys,
  onOpenMoodPicker,
  onOpenMoodFromText,
  onOpenFavourites,
}) {
  const isDark = theme === 'dark';

  return (
    <View style={styles.header}>
      {user?.email && (
        <View style={styles.userRow}>
          <Text style={[styles.userText, { color: colors.textDim }]} numberOfLines={1}>
            Logged in as {user.email}
          </Text>
          <Text style={[styles.userText, { color: colors.textDim }]}> · </Text>
          <TouchableOpacity onPress={onLogout} activeOpacity={0.8} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={[styles.logoutText, { color: colors.orbPlaying[0] }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.buttonsRow}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 6,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  userText: {
    fontSize: 11,
  },
  logoutText: {
    fontSize: 11,
    fontWeight: '600',
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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

