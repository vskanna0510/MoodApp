import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

export default function MoodFromTextModal({
  visible,
  onClose,
  onSelectMood,
  colors,
  theme,
  styles: parentStyles,
  fetchSuggestions,
  allMoods,
}) {
  const [text, setText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleGetSuggestions = async () => {
    const trimmed = (text || '').trim();
    if (!trimmed) return;
    setLoading(true);
    setSuggestions([]);
    try {
      const list = await fetchSuggestions(trimmed);
      setSuggestions(list || []);
    } catch (e) {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (moodId) => {
    const mood = allMoods.find((m) => m.id === moodId);
    if (mood) onSelectMood(mood);
    setText('');
    setSuggestions([]);
    onClose();
  };

  const handleClose = () => {
    setText('');
    setSuggestions([]);
    onClose();
  };

  const bgCard = theme === 'dark' ? '#1a1a2e' : '#f5f5f5';

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={[styles.card, { backgroundColor: bgCard }]}>
          <Text style={[styles.title, { color: colors.text }]}>Mood from text</Text>
          <Text style={[styles.hint, { color: colors.textDim }]}>
            Type how you feel (e.g. "stressed about exam", "cozy rainy evening")
          </Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.textDim }]}
            placeholder="How are you feeling?"
            placeholderTextColor={colors.textDim}
            value={text}
            onChangeText={setText}
            editable={!loading}
            multiline
          />
          <TouchableOpacity
            style={[parentStyles.modalClose, { backgroundColor: colors.orbPlaying[0], marginBottom: 8 }]}
            onPress={handleGetSuggestions}
            disabled={loading || !(text || '').trim()}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={parentStyles.syncButtonText}>Get suggestions</Text>
            )}
          </TouchableOpacity>
          {suggestions.length > 0 && (
            <View style={styles.suggestions}>
              <Text style={[styles.suggestLabel, { color: colors.textDim }]}>Pick a mood:</Text>
              {suggestions.map((s) => (
                <TouchableOpacity
                  key={s.moodId}
                  style={[styles.suggestionChip, { borderColor: colors.textDim }]}
                  onPress={() => handleSelect(s.moodId)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.suggestionText, { color: colors.text }]}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <TouchableOpacity
            style={[parentStyles.modalClose, { backgroundColor: colors.orbReady[0] }]}
            onPress={handleClose}
            activeOpacity={0.8}
          >
            <Text style={parentStyles.syncButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 24,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  hint: {
    fontSize: 12,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    minHeight: 44,
    marginBottom: 12,
  },
  suggestions: {
    marginBottom: 16,
  },
  suggestLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  suggestionChip: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
