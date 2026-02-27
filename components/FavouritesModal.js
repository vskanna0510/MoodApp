import React from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity } from 'react-native';

export default function FavouritesModal({
  visible,
  favourites,
  colors,
  theme,
  styles,
  onClose,
  onPlayFavourite,
  onRemoveFavourite,
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
          <Text style={[styles.modalTitle, { color: colors.text }]}>Favourites</Text>
          {favourites.length === 0 ? (
            <Text
              style={[
                styles.moodDetail,
                { color: colors.textDim, marginVertical: 24 },
              ]}
            >
              No favourites yet. Play a soundscape and tap "Add to Favourites".
            </Text>
          ) : (
            <ScrollView style={styles.moodList} showsVerticalScrollIndicator={false}>
              {favourites.map((fav) => (
                <View
                  key={fav.id}
                  style={[styles.favItem, { borderColor: colors.textDim }]}
                >
                  <TouchableOpacity
                    style={styles.favItemMain}
                    onPress={() => onPlayFavourite(fav)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.moodItemText, { color: colors.text }]}>
                      {fav.label}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => onRemoveFavourite(fav.id)}
                    style={styles.favRemove}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.favRemoveText, { color: colors.textDim }]}>
                      Remove
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
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

