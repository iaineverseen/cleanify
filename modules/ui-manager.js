const UIManager = {
  formatBytes(b) {
    if (!b) return '0 bytes';
    if (b < 1024) return b + ' bytes';
    if (b < 1024 * 1024) return (b / 1024).toFixed(2) + ' KB';
    return (b / (1024 * 1024)).toFixed(2) + ' MB';
  },

  updateSizes() {
    const input = document.getElementById('input');
    const output = document.getElementById('output');
    const inputSize = document.getElementById('inputSize');
    const outputSize = document.getElementById('outputSize');
    const ratioNumber = document.getElementById('ratioNumber');
    const spaceSaved = document.getElementById('spaceSaved');
    
    const i = new Blob([input.value]).size;
    const o = new Blob([output.value]).size;
    
    inputSize.textContent = this.formatBytes(i);
    outputSize.textContent = this.formatBytes(o);
    
    if (i && o && o > 0) {
      const p = ((1 - o / i) * 100).toFixed(1);
      const saved = i - o;
      
      ratioNumber.textContent = `${p}%`;
      spaceSaved.textContent = this.formatBytes(saved);
      
      if (p > 0) {
        ratioNumber.className = 'stat-value success';
      } else if (p < 0) {
        ratioNumber.className = 'stat-value error';
      } else {
        ratioNumber.className = 'stat-value';
      }
    } else {
      ratioNumber.textContent = '0%';
      spaceSaved.textContent = '0 bytes';
      ratioNumber.className = 'stat-value';
    }
  },

  updateProcessingTime(timeMs) {
    document.getElementById('processingTime').textContent = `${Math.round(timeMs)}ms`;
  },

  setupEventListeners() {
    const input = document.getElementById('input');
    const compressBtn = document.getElementById('compressBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    
    input.addEventListener('input', () => {
      this.updateSizes();
      if (document.getElementById('output').value) {
        document.getElementById('output').value = '';
        this.updateSizes();
      }
    });
    
    compressBtn.addEventListener('click', () => App.compress());
    downloadBtn.addEventListener('click', () => FileHandler.downloadOutput());
  }
};