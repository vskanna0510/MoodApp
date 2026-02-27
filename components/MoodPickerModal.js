import React from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity } from 'react-native';

export default function MoodPickerModal({
  visible,
  onClose,
  moodFamilies,
  allMoods,
  onSelectMood,
  colors,
  theme,
  styles,
}) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalCard,
            { backgroundColor: theme === 'dark' ? '#1a1a2e' : '#f5f5f5' },
          ]}
        >
          <Text style={[styles.modalTitle, { color: colors.text }]}>Pick a mood</Text>
          <ScrollView style={styles.moodList} showsVerticalScrollIndicator={false}>
            {moodFamilies.length > 0
              ? moodFamilies.map((family) => (
                  <View key={family.id} style={{ marginBottom: 12 }}>
                    <Text style={[styles.moodFamilyLabel, { color: colors.textDim }]}>
                      {family.label}
                    </Text>
                    {(family.moods || []).map((mood) => (
                      <TouchableOpacity
                        key={mood.id}
                        style={[styles.moodItem, { borderColor: colors.textDim }]}
                        onPress={() => onSelectMood({ ...mood, band: mood.band })}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.moodItemText, { color: colors.text }]}>
                          {mood.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ))
              : allMoods.map((mood) => (
                  <TouchableOpacity
                    key={mood.id}
                    style={[styles.moodItem, { borderColor: colors.textDim }]}
                    onPress={() => onSelectMood(mood)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.moodItemText, { color: colors.text }]}>
                      {mood.label}
                    </Text>
                  </TouchableOpacity>
                ))}
          </ScrollView>
          <TouchableOpacity
            style={[styles.modalClose, { backgroundColor: colors.orbPlaying[0] }]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.syncButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

