<!-- <script setup>
import TestComponent from "../components/TestComponent.vue";
import Button from "primevue/button"
import InputText from 'primevue/inputtext';
// import SvgText from "../components/SvgText.vue"
import { ref } from "vue";
import {useUserStore}  from '@/stores/index.js'
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';

const functionUrl=ref('http://localhost:5000/run-pix/us-central1/api')
</script>

<template>

    <h1>Test Functions</h1>
    <InputText v-model="functionUrl" label="functionUrl"></InputText>
    <InputText v-model="functionUrl" label="params"></InputText>
    <Button @click="apiCall(params)"/>

</template> -->

<template>
  <div class="ocr-container">
    <h2>Vue 3 + Tesseract.js OCR</h2>
    
    <!-- Image Upload Input -->
    <input type="file" @change="handleImageUpload" accept="image/*" />

    <!-- Loading & Progress States -->
    <div v-if="isLoading" class="status-box">
      <p>Processing image... <strong>{{ progressStatus }}</strong></p>
      <progress :value="progressValue" max="1"></progress>
    </div>

    <!-- Extracted Output Display -->
    <div v-if="extractedText" class="result-box">
      <h3>Extracted Text:</h3>
      <pre>{{ extractedText }}</pre>
    </div>
  </div>
</template>

<script setup>
console.log('>>>>>>>>>>>>>>>>>>>>testfunctions')

import { ref } from 'vue';
import { createWorker } from 'tesseract.js';

const extractedText = ref('');
const isLoading = ref(false);
const progressStatus = ref('');
const progressValue = ref(0);

const handleImageUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Reset states
  extractedText.value = '';
  isLoading.value = true;
  progressValue.value = 0;
  progressStatus.value = 'Initializing engine...';

  try {
    // 1. Initialize the Tesseract worker with a logger to track live progress
    const worker = await createWorker('eng', 1, {
      logger: (message) => {
        if (message.status === 'recognizing text') {
          progressStatus.value = `Recognizing text: ${Math.round(message.progress * 100)}%`;
          progressValue.value = message.progress;
        } else {
          progressStatus.value = message.status;
        }
      },
    });

    // 2. Run the OCR recognition engine on the target file
    const { data: { text } } = await worker.recognize(file);
    
    // 3. Store the output string
    extractedText.value = text;

    // 4. Terminate the worker thread to clean up browser resources
    await worker.terminate();
  } catch (error) {
    console.error('OCR Error:', error);
    progressStatus.value = 'Failed to process image.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.ocr-container {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
.status-box {
  margin: 15px 0;
  color: #31708f;
}
progress {
  width: 100%;
  height: 20px;
}
.result-box {
  margin-top: 20px;
  background: #f9f9f9;
  padding: 15px;
  border-left: 4px solid #42b983;
}
pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>