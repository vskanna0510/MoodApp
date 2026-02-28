import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';

const ECHO_OPTIONS = [
  { id: 'better', label: 'Better' },
  { id: 'same', label: 'Same' },
  { id: 'tired', label: 'Tired' },
];

export default function EchoModal({ visible, colors, theme, styles, onAnswer, onSkip }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalCard,
            { backgroundColor: theme === 'dark' ? '#1a1a2e' : '#f5f5f5' },
          ]}
        >
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            How do you feel now?
          </Text>
          <Text
            style={[
              styles.moodDetail,
              { color: colors.textDim, marginBottom: 16 },
            ]}
          >
            A quick check-in after your soundscape.
          </Text>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              gap: 8,
            }}
          >
            {ECHO_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.timerChip,
                  {
                    backgroundColor: colors.orbReady[0],
                    borderColor: 'transparent',
                    flex: 1,
                    minWidth: '30%',
                  },
                ]}
                onPress={() => onAnswer(opt.id)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.timerChipText,
                    { color: '#fff', textAlign: 'center' },
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={[
              styles.modalClose,
              {
                backgroundColor: 'transparent',
                marginTop: 12,
                borderWidth: 1,
                borderColor: colors.textDim,
              },
            ]}
            onPress={onSkip}
            activeOpacity={0.8}
          >
            <Text style={[styles.timerChipText, { color: colors.textDim }]}>
              Skip
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
