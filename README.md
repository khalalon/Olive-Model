# Olive Disease Detector

Mobile application for detecting diseases in olive trees using ONNX models.

## Setup Instructions

### 1. Add Your ONNX Model
Place your trained ONNX model file in: `assets/models/olive_disease_model.onnx`

### 2. Install Additional Dependencies
```bash
npm install expo-image-manipulator
```

### 3. Configure Model Input/Output
Edit `src/utils/diseaseDetector.js` to match your model's:
- Input shape and preprocessing requirements
- Output format and class labels
- Confidence thresholds

### 4. Run the App

Development:
```bash
npx expo start
```

iOS:
```bash
npx expo start --ios
```

Android:
```bash
npx expo start --android
```

## Model Requirements

Your ONNX model should:
- Accept image input (typically 224x224 or 299x299)
- Output classification probabilities
- Be optimized for mobile inference

## Customization

### Adding Disease Classes
Update the `diseases` array in `src/utils/diseaseDetector.js`:
```javascript
const diseases = ['YourDisease1', 'YourDisease2', ...];
```

### Adjusting Image Preprocessing
Modify `src/utils/imageProcessor.js` to match your model's requirements.

## Testing

1. Place your ONNX model in the assets folder
2. Update model input/output handling
3. Test with sample olive images
4. Adjust confidence thresholds as needed
# Olive-Model
