const dialog = document.getElementById('downloadDialog');
const dialogImage = document.getElementById('dialogImage');
const dialogTitle = document.getElementById('dialogTitle');
const downloadLink = document.getElementById('downloadLink');
let selectedWallpaper = {};
let state = { device: 'desktop', resolution: '3840x2160', format: 'jpeg' };

const themeToggle = document.getElementById('themeToggle');
function setColorTheme(theme) {
  const isDark = theme === 'dark';
  document.body.classList.toggle('dark', isDark);
  themeToggle.setAttribute('aria-pressed', String(isDark));
  themeToggle.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} theme`);
  themeToggle.querySelector('.theme-icon').textContent = isDark ? '☀' : '☾';
  themeToggle.querySelector('.theme-label').textContent = isDark ? 'Light' : 'Dark';
  try { localStorage.setItem('frame-theme', theme); } catch (_) {}
}
try { setColorTheme(localStorage.getItem('frame-theme') || 'light'); } catch (_) { setColorTheme('light'); }
themeToggle.addEventListener('click', () => setColorTheme(document.body.classList.contains('dark') ? 'light' : 'dark'));

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2600);
}
function updateDownloadLink() {
  const { resolution, format, device } = state;
  downloadLink.href = '#';
  downloadLink.download = `${(selectedWallpaper.title || 'frame-wallpaper').toLowerCase().replaceAll(' ', '-')}-${resolution}.${format}`;
  downloadLink.innerHTML = `Download ${resolution === '3840x2160' ? '4K' : resolution} ${format.toUpperCase()} <span>↓</span>`;
}
function openDownload(card) {
  selectedWallpaper = { title: card.dataset.title, image: card.dataset.image };
  dialogTitle.textContent = selectedWallpaper.title;
  dialogImage.src = card.querySelector('img').src;
  dialogImage.alt = selectedWallpaper.title;
  updateDownloadLink();
  dialog.showModal();
}
document.querySelectorAll('.download-open').forEach(button => button.addEventListener('click', event => openDownload(event.currentTarget.closest('.wallpaper-card'))));
document.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
['deviceOptions', 'resolutionOptions', 'formatOptions'].forEach(id => {
  document.getElementById(id).addEventListener('click', event => {
    if (event.target.tagName !== 'BUTTON') return;
    event.currentTarget.querySelectorAll('button').forEach(button => button.classList.remove('selected'));
    event.target.classList.add('selected');
    Object.assign(state, event.target.dataset);
    if (state.device === 'mobile') {
      state.resolution = '1920x1080';
      document.querySelectorAll('#resolutionOptions button').forEach(button => button.classList.toggle('selected', button.dataset.resolution === state.resolution));
    }
    updateDownloadLink();
  });
});
downloadLink.addEventListener('click', event => {
  event.preventDefault();
  const source = new Image();
  source.onload = () => {
    const [landscapeWidth, landscapeHeight] = state.resolution.split('x').map(Number);
    const width = state.device === 'mobile' ? landscapeHeight : landscapeWidth;
    const height = state.device === 'mobile' ? landscapeWidth : landscapeHeight;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    const sourceRatio = source.naturalWidth / source.naturalHeight;
    const targetRatio = width / height;
    let sx = 0, sy = 0, sw = source.naturalWidth, sh = source.naturalHeight;
    if (sourceRatio > targetRatio) { sw = source.naturalHeight * targetRatio; sx = (source.naturalWidth - sw) / 2; }
    else { sh = source.naturalWidth / targetRatio; sy = (source.naturalHeight - sh) / 2; }
    context.drawImage(source, sx, sy, sw, sh, 0, 0, width, height);
    const mimeType = state.format === 'png' ? 'image/png' : 'image/jpeg';
    canvas.toBlob(blob => {
      const download = document.createElement('a');
      download.href = URL.createObjectURL(blob);
      download.download = `${selectedWallpaper.title.toLowerCase().replaceAll(' ', '-')}-${width}x${height}.${state.format}`;
      download.click();
      URL.revokeObjectURL(download.href);
      showToast(`Your ${resolutionLabel()} wallpaper is downloading — enjoy the view.`);
      dialog.close();
    }, mimeType, .95);
  };
  source.src = selectedWallpaper.image;
});
function resolutionLabel() { return state.resolution === '3840x2160' ? '4K' : state.resolution; }
document.querySelectorAll('.theme-card').forEach(theme => theme.addEventListener('click', () => {
  document.querySelectorAll('.theme-card').forEach(item => item.classList.remove('active'));
  theme.classList.add('active');
  const value = theme.dataset.theme;
  document.querySelectorAll('.wallpaper-card').forEach(card => {
    card.style.display = value === 'all' || card.dataset.theme === value ? '' : 'none';
  });
  document.getElementById('discover').scrollIntoView({ behavior: 'smooth', block: 'start' });
}));
document.getElementById('loadMore').addEventListener('click', event => { event.currentTarget.textContent = 'New wallpapers land tomorrow ✦'; event.currentTarget.disabled = true; showToast('Today’s collection is all caught up. Check back tomorrow!'); });
