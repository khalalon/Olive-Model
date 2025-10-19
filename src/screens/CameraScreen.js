import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { detectDisease } from '../utils/diseaseDetector';

export default function CameraScreen() {
  const [capturedImage, setCapturedImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant photo library access');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setCapturedImage(result.assets[0].uri);
        analyzeImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image: ' + error.message);
    }
  };

  const takePicture = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera access');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setCapturedImage(result.assets[0].uri);
        analyzeImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take picture: ' + error.message);
    }
  };

  const analyzeImage = async (imageUri) => {
    setLoading(true);
    try {
      const detectionResult = await detectDisease(imageUri);
      setResult(detectionResult);
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze image: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetImage = () => {
    setCapturedImage(null);
    setResult(null);
  };

  if (capturedImage) {
    return (
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: capturedImage }} style={styles.preview} />
        </View>
        
        {loading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>🔍 Analyzing olive...</Text>
          </View>
        )}
        
        {result && !loading && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Detection Result</Text>
            <View style={styles.resultContent}>
              <Text style={[styles.resultText, result.isHealthy ? styles.healthy : styles.diseased]}>
                {result.isHealthy ? '✓ Healthy Olive' : '⚠ Disease Detected'}
              </Text>
              {result.disease && (
                <Text style={styles.diseaseType}>{result.disease}</Text>
              )}
              <Text style={styles.confidence}>
                Confidence: {(result.confidence * 100).toFixed(1)}%
              </Text>
            </View>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={resetImage}>
            <Text style={styles.buttonText}>Analyze Another</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🫒 Olive Disease Detector</Text>
        <Text style={styles.subtitle}>
          Take a photo or select an image of an olive leaf or fruit to detect diseases
        </Text>
      </View>

      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>🌿</Text>
        <Text style={styles.emptyText}>No image selected</Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={takePicture}>
          <Text style={styles.buttonText}>📸 Take Photo</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>🖼️ Choose from Gallery</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    padding: 30,
    paddingTop: 60,
    backgroundColor: '#2a2a2a',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#2a2a2a',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
    minWidth: 160,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  imageContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  preview: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  loadingContainer: {
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  resultContainer: {
    backgroundColor: '#2a2a2a',
    padding: 20,
    margin: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  resultTitle: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  resultContent: {
    alignItems: 'center',
  },
  resultText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  healthy: {
    color: '#4CAF50',
  },
  diseased: {
    color: '#FF5252',
  },
  diseaseType: {
    color: '#FFC107',
    fontSize: 20,
    marginVertical: 8,
    fontWeight: '600',
  },
  confidence: {
    color: '#E0E0E0',
    fontSize: 16,
    marginTop: 5,
  },
});
