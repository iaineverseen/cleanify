const FileHandler = {
  currentFileName: 'compressed',
  
  setupFileUpload() {
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    
    uploadBtn.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', (e) => this._handleFileSelect(e));
  },
  
  _handleFileSelect(e) {
    const fileInput = e.target;
    const f = fileInput.files[0];
    
    if (!f) return;
    
    const fileName = f.name.toLowerCase();
    const isValidExtension = fileName.endsWith('.lua') || fileName.endsWith('.txt');
    
    if (!isValidExtension) {
      ToastManager.show('Only .lua and .txt files are allowed', 'error');
      fileInput.value = '';
      return;
    }
    
    const minSize = 1.5 * 1024;
    if (f.size < minSize) {
      const fileSizeKB = (f.size / 1024).toFixed(2);
      ToastManager.show(`File too small (${fileSizeKB} KB). Minimum is 1.50 KB`, 'error');
      fileInput.value = '';
      return;
    }
    
    const nameWithoutExt = f.name.replace(/\.(lua|txt)$/i, '');
    this.currentFileName = nameWithoutExt;
    
    const maxSize = 5 * 1024 * 1024;
    if (f.size > maxSize) {
      const fileSizeMB = (f.size / (1024 * 1024)).toFixed(2);
      ToastManager.show(`File too large (${fileSizeMB} MB). Maximum is 5.00 MB`, 'error');
      fileInput.value = '';
      return;
    }
    
    const r = new FileReader();
    r.onload = e => {
      document.getElementById('input').value = e.target.result;
      document.getElementById('output').value = '';
      UIManager.updateSizes();
      const loadedSizeKB = (new Blob([e.target.result]).size / 1024).toFixed(2);
      ToastManager.show(`File loaded (${loadedSizeKB} KB)`);
    };
    r.onerror = () => {
      ToastManager.show('Failed to read file', 'error');
      fileInput.value = '';
    };
    r.readAsText(f);
  },
  
  downloadOutput() {
    const output = document.getElementById('output');
    if (!output.value) {
      ToastManager.show('Nothing to download', 'error');
      return;
    }
    
    try {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([output.value], { type: 'text/plain' }));
      a.download = `${this.currentFileName}_compressed.lua`;
      a.click();
      URL.revokeObjectURL(a.href);
      ToastManager.show('Download started!');
    } catch (e) {
      ToastManager.show('Download failed', 'error');
    }
  }
};