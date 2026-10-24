export function downloadFile(file: File | Blob, fileName?: string): void {
  if (typeof window === 'undefined') return;
  const name = file instanceof File ? file.name : fileName || 'download';
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function shareFiles(files: File[], title?: string): Promise<void> {
  if (
    typeof navigator !== 'undefined' &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files }) &&
    typeof navigator.share === 'function'
  ) {
    try {
      await navigator.share({ files, title });
      return;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
    }
  }

  for (let i = 0; i < files.length; i++) {
    downloadFile(files[i]);
    if (i < files.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }
}
