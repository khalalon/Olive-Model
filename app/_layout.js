import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { Alert } from 'react-native';
import { initializeModel } from '../src/utils/diseaseDetector';
import { inspectModel } from '../src/utils/modelInspector';

export default function RootLayout() {
  useEffect(() => {
    // Inspect model first
    inspectModel()
      .then(info => {
        console.log('✅ Model inspection complete:', info);
      })
      .catch(error => {
        console.error('❌ Model inspection failed:', error);
      });

    // Initialize model
    initializeModel().catch(error => {
      Alert.alert('Error', 'Failed to load disease detection model');
      console.error('Model initialization error:', error);
    });
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
