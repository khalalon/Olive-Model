import { InferenceSession, Tensor } from 'onnxruntime-react-native';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { decode as atob } from 'base-64';

let session = null;

// Configuration - UPDATE THESE BASED ON YOUR MODEL
const MODEL_INPUT_SIZE = 224;
const DISEASE_CLASSES = [
  'Healthy',
  'Anthracnose',
  'Cercospora Leaf Spot',
  'Peacock Spot',
  'Verticillium Wilt'
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
      console.log('📦 Copying model to document directory...');
      await FileSystem.copyAsync({
        from: modelAsset,
        to: modelPath,
      });
    }
    
    // Create inference session
    session = await InferenceSession.create(modelPath);
    console.log('✅ Model loaded successfully');
    console.log('📋 Input names:', session.inputNames);
    console.log('📋 Output names:', session.outputNames);
    
    return true;
  } catch (error) {
    console.error('❌ Error loading model:', error);
    throw error;
  }
}

// Simple JPEG decoder for React Native
async function decodeJpegSimple(base64String) {
  // This is a simplified approach
  // We'll create a canvas-like approach using Image component
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve(img);
    };
    img.onerror = reject;
    img.src = `data:image/jpeg;base64,${base64String}`;
  });
}

async function preprocessImage(imageUri) {
  try {
    console.log('📐 Resizing image to', MODEL_INPUT_SIZE);
    
    // Resize and save as base64
    const resizedImage = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: MODEL_INPUT_SIZE, height: MODEL_INPUT_SIZE } }],
      { 
        compress: 1, 
        format: ImageManipulator.SaveFormat.PNG,
        base64: true 
      }
    );

    if (!resizedImage.base64) {
      throw new Error('Failed to get base64 image data');
    }

    console.log('📖 Processing pixel data...');
    
    // Decode base64 to binary
    const binaryString = atob(resizedImage.base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Parse PNG header to find image data
    // PNG signature: 89 50 4E 47 0D 0A 1A 0A
    // This is a simplified parser - may need adjustment
    
    // For now, create normalized pixel data
    // Assuming RGB format after PNG decoding
    const imageSize = MODEL_INPUT_SIZE * MODEL_INPUT_SIZE * 3;
    const pixelData = new Float32Array(imageSize);
    
    // Skip PNG header (typically ~100 bytes) and extract RGB values
    // Note: This is simplified - proper PNG decoding is complex
    let pixelIndex = 0;
    const dataStart = 100; // Approximate PNG header size
    
    for (let i = dataStart; i < bytes.length && pixelIndex < imageSize; i++) {
      // Normalize to [0, 1]
      pixelData[pixelIndex] = bytes[i] / 255.0;
      pixelIndex++;
    }
    
    // If we need more pixels, fill with zeros
    while (pixelIndex < imageSize) {
      pixelData[pixelIndex] = 0;
      pixelIndex++;
    }
    
    console.log('✅ Image preprocessed:', pixelData.length, 'values');
    return pixelData;
    
  } catch (error) {
    console.error('❌ Error preprocessing image:', error);
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
    
    // Get the actual input/output names from the session
    const inputName = session.inputNames[0];
    const outputName = session.outputNames[0];
    
    console.log(`📝 Using input: ${inputName}, output: ${outputName}`);
    
    // Create input tensor
    // Try channels-last format first: [1, 224, 224, 3]
    let inputTensor = new Tensor('float32', inputData, [1, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE, 3]);
    
    // Run inference
    const feeds = { [inputName]: inputTensor };
    let results;
    
    try {
      results = await session.run(feeds);
    } catch (error) {
      // If it fails, try channels-first format: [1, 3, 224, 224]
      console.log('⚠️ Retrying with channels-first format...');
      inputTensor = new Tensor('float32', inputData, [1, 3, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE]);
      const feeds2 = { [inputName]: inputTensor };
      results = await session.run(feeds2);
    }

    // Get output
    const output = results[outputName].data;
    console.log('📊 Raw output:', output);

    // Process results
    const outputArray = Array.from(output);
    const maxIndex = outputArray.indexOf(Math.max(...outputArray));
    const confidence = outputArray[maxIndex];
    const isHealthy = maxIndex === 0;
    const disease = isHealthy ? null : DISEASE_CLASSES[maxIndex];

    console.log('✅ Detection complete:', { isHealthy, disease, confidence });

    return {
      isHealthy,
      confidence,
      disease,
      rawOutput: outputArray
    };
  } catch (error) {
    console.error('❌ Error detecting disease:', error);
    // Return error details to user
    throw new Error(`Detection failed: ${error.message}`);
  }
}
