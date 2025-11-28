import React, { useState } from 'react';
import { CheckCircle, Copy, X, ShieldCheck, FileText } from 'lucide-react';
import { t } from '../constants';
import { AppConfig } from '../types';

interface UploadedFile {
  url: string;
  name: string;
}

interface UploadSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: UploadedFile[];
  config: AppConfig;
}

export const UploadSuccessModal: React.FC<UploadSuccessModalProps> = ({ isOpen, onClose, files, config }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const lang = config?.language;

  if (!isOpen) return null;

  const handleCopy = (url: string, index: number) => {
    navigator.clipboard.writeText(url);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="p-6 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle className="w-5 h-5" />
            <h2 className="font-semibold text-lg">
              {files.length > 1 ? t(lang, 'upload_success_multi_title') : t(lang, 'upload_success_title')}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg flex gap-3 shrink-0">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                {t(lang, 'protected_link')}
            </p>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              {files.length} {t(lang, 'files_uploaded')}
            </label>
            
            <div className="space-y-3">
              {files.map((file, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <p className="text-slate-900 dark:text-slate-200 font-medium text-sm truncate flex-1">{file.name}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={file.url}
                      className="flex-1 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-telegram-100 dark:focus:ring-telegram-900"
                    />
                    <button 
                        onClick={() => handleCopy(file.url, idx)}
                        className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md transition-colors flex items-center justify-center min-w-[40px]"
                        title={t(lang, 'copy_link')}
                    >
                        {copiedIndex === idx ? <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-telegram-500 hover:bg-telegram-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {t(lang, 'done')}
          </button>
        </div>
      </div>
    </div>
  );
};