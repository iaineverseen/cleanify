const App = {
  init() {
    FileHandler.setupFileUpload();
    UIManager.setupEventListeners();
    UIManager.updateSizes();
  },

  compress() {
    const input = document.getElementById('input');
    const output = document.getElementById('output');
    
    if (!input.value.trim()) {
      ToastManager.show('Enter some Lua code first', 'error');
      return;
    }
    
    const startTime = performance.now();
    
    try {
      output.value = LZWCompressor.compress(input.value);
      const endTime = performance.now();
      const timeTaken = endTime - startTime;
      
      UIManager.updateProcessingTime(timeTaken);
      UIManager.updateSizes();
      ToastManager.show('Code compressed successfully!');
    } catch (e) {
      const errorMsg = e.message || 'Unknown compression error';
      ToastManager.show(errorMsg, 'error');
    }
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());