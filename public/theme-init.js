(function () {
  try {
    var saved = localStorage.getItem('faktografia-theme');
    if (saved && saved !== 'system') {
      document.documentElement.setAttribute('data-theme', saved);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  } catch {}
})();
