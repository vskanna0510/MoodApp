import React from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity } from 'react-native';

export default function JourneysModal({
  visible,
  onClose,
  journeys,
  colors,
  theme,
  styles,
  onSelectJourney,
  cancelJourney,
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
          <Text style={[styles.modalTitle, { color: colors.text }]}>Journeys</Text>
          <ScrollView style={styles.moodList} showsVerticalScrollIndicator={false}>
            {journeys.map((journey) => {
              const totalMinutes =
                journey.steps?.reduce((sum, step) => sum + (step.minutes || 0), 0) || 0;
              return (
                <TouchableOpacity
                  key={journey.id}
                  style={[styles.moodItem, { borderColor: colors.textDim }]}
                  onPress={() => {
                    cancelJourney();
                    onSelectJourney(journey);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.moodItemText, { color: colors.text }]}>
                    {journey.label}
                  </Text>
                  <Text style={[styles.moodDetail, { color: colors.textDim }]}>
                    {totalMinutes ? `${totalMinutes} min` : ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
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

