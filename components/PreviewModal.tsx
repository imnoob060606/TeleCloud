import React, { useState, useEffect } from 'react';
import { X, Loader2, Download, FileText } from 'lucide-react';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  fileName: string;
  mimeType: string;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ isOpen, onClose, url, fileName, mimeType }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [textContent, setTextContent] = useState<string | null>(null);

  // Determine file type category
  const isVideo = mimeType.startsWith('video/');
  const isImage = mimeType.startsWith('image/');
  const isAudio = mimeType.startsWith('audio/');
  const isPdf = mimeType.includes('pdf');
  
  // Check for text/code types
  const isText = 
    mimeType.startsWith('text/') || 
    mimeType.includes('json') || 
    mimeType.includes('xml') || 
    mimeType.includes('javascript') ||
    /\.(txt|json|md|xml|js|ts|css|html|log|sql|ini|conf)$/i.test(fileName);

  useEffect(() => {
    if (isOpen) {
        setIsLoading(true);
        setTextContent(null);
        
        if (isText) {
            // Fetch text content
            fetch(url)
                .then(res => {
                    if (!res.ok) throw new Error("Failed to load text");
                    return res.text();
                })
                .then(text => {
                    // Limit preview size to avoid browser crash on huge logs
                    if (text.length > 500000) {
                        setTextContent(text.substring(0, 500000) + "\n\n...[File truncated for preview]...");
                    } else {
                        setTextContent(text);
                    }
                })
                .catch(err => {
                    console.error(err);
                    setTextContent("Error loading file content.");
                })
                .finally(() => setIsLoading(false));
        } else {
            // For non-text files, set a timeout to hide loader if content takes too long
            const timeout = setTimeout(() => setIsLoading(false), 100);
            return () => clearTimeout(timeout);
        }
    }
  }, [isOpen, url, isText]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLoad = () => setIsLoading(false);
  
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-5xl h-full max-h-[90vh] flex flex-col">
        {/* Header - Always on top with high z-index */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-50 pointer-events-none">
           <h3 className="text-white/90 text-sm font-medium bg-black/60 px-3 py-2 rounded-lg backdrop-blur-md pointer-events-auto truncate max-w-[70%] shadow-lg">
             {fileName}
           </h3>
           <div className="flex gap-2 pointer-events-auto">
             <a 
                href={url} 
                download={fileName}
                className="p-2 bg-black/60 text-white/80 hover:text-white hover:bg-black/80 rounded-lg backdrop-blur-md transition-all shadow-lg hover:scale-105"
                title="Download"
                onClick={(e) => e.stopPropagation()}
             >
                <Download className="w-5 h-5" />
             </a>
             <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }} 
                className="p-2 bg-black/60 text-white/80 hover:text-white hover:bg-black/80 rounded-lg backdrop-blur-md transition-all shadow-lg hover:scale-105"
                title="Close (Esc)"
             >
                <X className="w-5 h-5" />
             </button>
           </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center overflow-hidden rounded-lg relative bg-black mt-16">
           {/* Loading overlay - lower z-index than header */}
           {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center text-white/50 z-10 bg-black/50 backdrop-blur-sm">
                 <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <p className="text-sm text-white/70">Loading preview...</p>
                 </div>
              </div>
           )}

           {isVideo && (
             <video 
                src={url} 
                controls 
                autoPlay 
                className="max-w-full max-h-full outline-none" 
                onLoadedData={handleLoad}
                onError={handleLoad}
             />
           )}

           {isImage && (
             <img 
                src={url} 
                alt={fileName} 
                className="max-w-full max-h-full object-contain" 
                onLoad={handleLoad}
                onError={handleLoad}
             />
           )}
           
           {isAudio && (
              <div className="w-full max-w-md bg-white/10 p-8 rounded-2xl backdrop-blur-md shadow-2xl">
                 <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                    </div>
                    <p className="text-white font-medium truncate px-4">{fileName}</p>
                 </div>
                 <audio 
                    src={url} 
                    controls 
                    className="w-full" 
                    onLoadedData={handleLoad}
                    onError={handleLoad}
                 />
              </div>
           )}

           {isPdf && (
              <iframe 
                src={url} 
                className="w-full h-full bg-white" 
                onLoad={handleLoad} 
                title="PDF Preview"
              />
           )}

           {isText && (
               <div className="w-full h-full bg-slate-50 dark:bg-slate-900 overflow-auto">
                   <div className="p-6 sm:p-8">
                       {textContent !== null ? (
                           <pre className="font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-words leading-relaxed">
                               {textContent}
                           </pre>
                       ) : (
                           <div className="h-96 flex items-center justify-center">
                               <Loader2 className="w-8 h-8 animate-spin text-slate-400 dark:text-slate-600" />
                           </div>
                       )}
                   </div>
               </div>
           )}

           {!isVideo && !isImage && !isAudio && !isPdf && !isText && (
              <div className="text-white/70 text-center p-8">
                 <div className="mb-4 flex justify-center">
                    <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center">
                        <FileText className="w-10 h-10 opacity-50" />
                    </div>
                 </div>
                 <p className="text-lg mb-2">Preview not available</p>
                 <p className="text-sm text-white/50 mb-4">This file type cannot be previewed in the browser.</p>
                 <a 
                    href={url} 
                    download={fileName}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                 >
                    <Download className="w-4 h-4" />
                    Download to view
                 </a>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};