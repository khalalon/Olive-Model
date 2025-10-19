// Image preprocessing utilities
// Install: npm install react-native-image-resizer
// or: npm install expo-image-manipulator

import * as ImageManipulator from 'expo-image-manipulator';

export async function resizeAndNormalizeImage(imageUri, targetSize = 224) {
  try {
    // Resize image to model input size
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      imageUri,
      [
        { resize: { width: targetSize, height: targetSize } }
      ],
      { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
    );

    return manipulatedImage.uri;
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
}

// Convert image to tensor format
export function imageToTensor(imageData, inputShape = [1, 3, 224, 224]) {
  // This function should convert your image data to the tensor format
  // required by your ONNX model
  // Implementation depends on your specific model requirements
  
  // Placeholder implementation
  return new Float32Array(inputShape.reduce((a, b) => a * b));
}
