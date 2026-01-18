import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface OnboardingModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function OnboardingModal({ visible, onClose }: OnboardingModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text 
            style={styles.title}
            accessibilityRole="header"
            accessibilityLabel="How It Works"
          >
            How It Works
          </Text>

          <View style={styles.grid}>
            {/* Row 1 */}
            <View style={styles.row}>
              <View 
                style={styles.card}
                accessible={true}
                accessibilityRole="text"
                accessibilityLabel="Step 1: Scan. Point your camera at art, monuments, or landscapes"
              >
                <View style={[styles.iconCircle, { backgroundColor: '#1e3a5f' }]}>
                  <MaterialIcons name="photo-camera" size={36} color="#5B9FED" />
                </View>
                <Text style={styles.stepTitle}>1. Scan</Text>
                <Text style={styles.stepDescription}>
                  Point your camera at art, monuments, or landscapes
                </Text>
              </View>

              <MaterialIcons 
                name="arrow-forward" 
                size={24} 
                color="#FF69B4" 
                style={styles.arrow}
                accessible={false}
              />

              <View 
                style={styles.card}
                accessible={true}
                accessibilityRole="text"
                accessibilityLabel="Step 2: Analyze. AI recognizes and identifies the subject"
              >
                <View style={[styles.iconCircle, { backgroundColor: '#3d2557' }]}>
                  <MaterialIcons name="center-focus-strong" size={36} color="#9D6CE8" />
                </View>
                <Text style={styles.stepTitle}>2. Analyze</Text>
                <Text style={styles.stepDescription}>
                  AI recognizes and identifies the subject
                </Text>
              </View>
            </View>

            {/* Row 2 */}
            <View style={styles.row}>
              <View 
                style={styles.card}
                accessible={true}
                accessibilityRole="text"
                accessibilityLabel="Step 3: Listen. Hear AI-generated music and narration"
              >
                <View style={[styles.iconCircle, { backgroundColor: '#4a1f3d' }]}>
                  <MaterialIcons name="headset" size={36} color="#E85D9A" />
                </View>
                <Text style={styles.stepTitle}>3. Listen</Text>
                <Text style={styles.stepDescription}>
                  Hear AI-generated music and narration
                </Text>
              </View>

              <MaterialIcons 
                name="arrow-forward" 
                size={24} 
                color="#4CAF50" 
                style={styles.arrow}
                accessible={false}
              />

              <View 
                style={styles.card}
                accessible={true}
                accessibilityRole="text"
                accessibilityLabel="Step 4: Experience. Immerse yourself in art through sound"
              >
                <View style={[styles.iconCircle, { backgroundColor: '#1f3d2f' }]}>
                  <MaterialIcons name="favorite" size={36} color="#5ACB6F" />
                </View>
                <Text style={styles.stepTitle}>4. Experience</Text>
                <Text style={styles.stepDescription}>
                  Immerse yourself in art through sound
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.closeButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Get started"
            accessibilityHint="Double tap to close this guide and begin using the app"
          >
            <Text style={styles.closeButtonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 700,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 24,
    textAlign: 'center',
  },
  grid: {
    width: '100%',
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: 'rgba(30, 35, 50, 0.8)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: 160,
    justifyContent: 'center',
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
  arrow: {
    marginHorizontal: 4,
  },
  closeButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginTop: 24,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
