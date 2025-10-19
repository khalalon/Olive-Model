import { InferenceSession } from 'onnxruntime-react-native';
import * as FileSystem from 'expo-file-system';

export async function inspectModel() {
  try {
    const modelPath = `${FileSystem.documentDirectory}olive_disease_model.onnx`;
    const modelAsset = require('../../assets/models/olive_disease_model.onnx');
    
    const modelInfo = await FileSystem.getInfoAsync(modelPath);
    if (!modelInfo.exists) {
      await FileSystem.copyAsync({
        from: modelAsset,
        to: modelPath,
      });
    }
    
    const session = await InferenceSession.create(modelPath);
    
    console.log('📋 MODEL INFO:');
    console.log('Input names:', session.inputNames);
    console.log('Output names:', session.outputNames);
    
    return {
      inputNames: session.inputNames,
      outputNames: session.outputNames
    };
  } catch (error) {
    console.error('Error inspecting model:', error);
    throw error;
  }
}
