import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Alert } from 'react-native';
import CameraScreen from './src/screens/CameraScreen';
import { initializeModel } from './src/utils/diseaseDetector';

export default function App() {
  useEffect(() => {
    // Initialize model when app starts
    initializeModel().catch(error => {
      Alert.alert('Error', 'Failed to load disease detection model');
      console.error('Model initialization error:', error);
    });
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <CameraScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
