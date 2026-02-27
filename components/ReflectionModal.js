import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';

export default function ReflectionModal({ visible, colors, theme, styles, onAnswer }) {
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
            How was your session?
          </Text>
          <Text
            style={[
              styles.moodDetail,
              { color: colors.textDim, marginBottom: 16 },
            ]}
          >
            Did this journey help you focus or relax?
          </Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              gap: 8,
            }}
          >
            {['yes', 'some', 'no'].map((result) => (
              <TouchableOpacity
                key={result}
                style={[
                  styles.timerChip,
                  {
                    backgroundColor: colors.orbReady[0],
                    borderColor: 'transparent',
                    flex: 1,
                  },
                ]}
                onPress={() => onAnswer(result)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.timerChipText,
                    { color: '#fff', textAlign: 'center' },
                  ]}
                >
                  {result === 'yes' ? 'Yes' : result === 'some' ? 'A bit' : 'Not really'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

