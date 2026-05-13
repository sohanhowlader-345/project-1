const socket = io();

const qr = document.getElementById('qr');
const urlText = document.getElementById('url');
const fileList = document.getElementById('fileList');
const fileInput = document.getElementById('fileInput');
const chooseBtn = document.getElementById('chooseBtn');
const dropZone = document.getElementById('dropZone');

async function loadInfo() {
  const res = await fetch('/api/info');
  const data = await res.json();

  urlText.innerText = data.url;
  qr.src = data.qr;
}

async function loadFiles() {
  const res = await fetch('/files');
  const files = await res.json();

  fileList.innerHTML = '';

  files.forEach(file => addFile(file));
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
}

function addFile(file) {
  const div = document.createElement('div');
  div.className = 'file-item';

  div.innerHTML = `
    <div>
      <strong>${file.name}</strong><br>
      ${formatSize(file.size)}
    </div>

    <a href="${file.url}" download>Download</a>
  `;

  fileList.prepend(div);
}

async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/upload', {
    method: 'POST',
    body: formData
  });

  const data = await res.json();
  addFile(data);
}

chooseBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (file) uploadFile(file);
});

dropZone.addEventListener('dragover', e => e.preventDefault());

dropZone.addEventListener('drop', e => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file) uploadFile(file);
});

socket.on('new-file', file => addFile(file));

loadInfo();
loadFiles();
