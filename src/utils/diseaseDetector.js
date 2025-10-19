import { InferenceSession, Tensor } from 'onnxruntime-react-native';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

let session = null;

// Configuration - UPDATE THESE BASED ON YOUR MODEL
const MODEL_INPUT_SIZE = 224; // Change to your model's input size
const DISEASE_CLASSES = [
  'Healthy',
  'Anthracnose',
  'Cercospora Leaf Spot',
  'Peacock Spot',
  'Verticillium Wilt'
  // Add your actual disease classes here
];

export async function initializeModel() {
  try {
    console.log('🎯 Loading ONNX model...');
    
    // Path to your model
    const modelPath = `${FileSystem.documentDirectory}olive_disease_model.onnx`;
    
    // Copy model from assets to document directory
    const modelAsset = require('../../assets/models/olive_disease_model.onnx');
    const modelInfo = await FileSystem.getInfoAsync(modelPath);
    
    if (!modelInfo.exists) {
      await FileSystem.copyAsync({
        from: modelAsset,
        to: modelPath,
      });
    }
    
    // Create inference session
    session = await InferenceSession.create(modelPath);
    console.log('✅ Model loaded successfully');
    return true;
  } catch (error) {
    console.error('❌ Error loading model:', error);
    throw error;
  }
}

async function preprocessImage(imageUri) {
  try {
    // Resize image to model input size
    const resizedImage = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: MODEL_INPUT_SIZE, height: MODEL_INPUT_SIZE } }],
      { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
    );

    // Read image as base64
    const base64 = await FileSystem.readAsStringAsync(resizedImage.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Convert base64 to array buffer
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // TODO: Parse image bytes to get RGB values
    // This is a simplified version - you'll need proper image decoding
    // Consider using a library like jimp or sharp for proper image processing
    
    // For now, return placeholder tensor
    // You need to convert the image to a Float32Array with shape [1, 3, 224, 224]
    const inputTensor = new Float32Array(1 * 3 * MODEL_INPUT_SIZE * MODEL_INPUT_SIZE);
    
    return inputTensor;
  } catch (error) {
    console.error('Error preprocessing image:', error);
    throw error;
  }
}

export async function detectDisease(imageUri) {
  try {
    if (!session) {
      await initializeModel();
    }

    console.log('🔍 Preprocessing image...');
    const inputData = await preprocessImage(imageUri);

    console.log('🧠 Running inference...');
    // Create input tensor - adjust shape based on your model
    const inputTensor = new Tensor('float32', inputData, [1, 3, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE]);
    
    // Run inference - adjust input name based on your model
    const feeds = { input: inputTensor }; // Change 'input' to your model's input name
    const results = await session.run(feeds);

    // Get output - adjust output name based on your model
    const output = results.output.data; // Change 'output' to your model's output name

    console.log('📊 Raw output:', output);

    // Process results
    const maxIndex = output.indexOf(Math.max(...output));
    const confidence = output[maxIndex];
    const isHealthy = maxIndex === 0; // Assuming first class is "Healthy"
    const disease = isHealthy ? null : DISEASE_CLASSES[maxIndex];

    return {
      isHealthy,
      confidence,
      disease,
      rawOutput: Array.from(output)
    };
  } catch (error) {
    console.error('❌ Error detecting disease:', error);
    throw error;
  }
}
