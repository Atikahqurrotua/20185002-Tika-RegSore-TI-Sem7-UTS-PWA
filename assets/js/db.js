const dbName = 'KomentarDB';
const dbVersion = 1;
const request = indexedDB.open(dbName, dbVersion);

let db;

request.onerror = (event) => {
  console.error('Gagal membuka database:', event.target.error);
  showNotification('Gagal membuka database: ' + event.target.error);
  alert('Gagal membuka database: ' + event.target.error);
};

request.onsuccess = (event) => {
  db = event.target.result;
  console.log('Database terbuka');
  displayComments();
  
  showNotification('Halaman dimuat, database terbuka');
  alert('Halaman dimuat, database terbuka');
};

request.onupgradeneeded = (event) => {
  db = event.target.result;
  const objectStore = db.createObjectStore('komentar', { keyPath: 'id', autoIncrement: true });
  objectStore.createIndex('nama', 'nama', { unique: false });
  objectStore.createIndex('isi', 'isi', { unique: false });
  console.log('Database dibuat');
};

function displayComments() {
  const commentList = document.getElementById('komentar-list');
  commentList.innerHTML = ''; 

  const transaction = db.transaction(['komentar'], 'readonly');
  const objectStore = transaction.objectStore('komentar');
  const request = objectStore.openCursor();

  request.onsuccess = (event) => {
    const cursor = event.target.result;
    if (cursor) {
      const comment = cursor.value;
      const li = document.createElement('li');
      li.textContent = `${comment.nama}: ${comment.isi}`;
      commentList.appendChild(li);

      cursor.continue();
    }
  };
}

function showNotification(message) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Notifikasi Komentar', { body: message });
  } else if ('Notification' in window && Notification.permission !== 'denied') {
    Notification.requestPermission().then(function (permission) {
      if (permission === 'granted') {
        new Notification('Notifikasi Komentar', { body: message });
      }
    });
  }
}

document.querySelector('form').addEventListener('submit', (event) => {
  event.preventDefault();

  const nama = document.getElementById('nama').value;
  const isi = document.getElementById('isi').value;

  const transaction = db.transaction(['komentar'], 'readwrite');
  const objectStore = transaction.objectStore('komentar');

  const comment = {
    nama: nama,
    isi: isi,
  };

  const request = objectStore.add(comment);

  request.onsuccess = (event) => {
    console.log('Komentar berhasil disimpan di database');
    showNotification('Komentar berhasil disimpan di database');
    alert('Komentar berhasil disimpan di database');
    displayComments();
  };

  request.onerror = (event) => {
    console.error('Gagal menyimpan komentar:', event.target.error);
    showNotification('Gagal menyimpan komentar: ' + event.target.error);
    alert('Gagal menyimpan komentar: ' + event.target.error);
  };
});
