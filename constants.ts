export const TELEGRAM_API_BASE = "https://api.telegram.org";

export const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export const isFilePreviewable = (fileName: string, mimeType: string) => {
  return (
    mimeType.startsWith('image/') || 
    mimeType.startsWith('video/') || 
    mimeType.startsWith('audio/') || 
    mimeType.includes('pdf') ||
    mimeType.startsWith('text/') ||
    /\.(txt|json|md|xml|js|ts|tsx|jsx|css|html|log|sql|ini|conf|py|java|c|cpp|h|sh|yml|yaml|rb|php|go|rs)$/i.test(fileName)
  );
}
