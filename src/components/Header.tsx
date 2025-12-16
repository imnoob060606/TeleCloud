import React from "react";
import {
  UploadCloud,
  Download,
  Menu,
  Check,
  Sun,
  Moon,
  Monitor,
  RefreshCw,
  Settings,
  Search,
  X,
  Globe,
} from "lucide-react";
import { t } from "@/constants";
import { DownloadTask } from "@/types";

interface HeaderProps {
  lang: string;
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;
  activeDownloads: DownloadTask[];
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
  isThemeMenuOpen: boolean;
  setIsThemeMenuOpen: (isOpen: boolean) => void;
  isLangMenuOpen: boolean;
  setIsLangMenuOpen: (isOpen: boolean) => void;
  isSortMenuOpen: boolean;
  setIsSortMenuOpen: (isOpen: boolean) => void;
  setIsDownloadListOpen: (isOpen: boolean) => void;
  handleLanguageChange: (lang: string) => void;
  fetchFiles: () => void;
  setIsSettingsOpen: (isOpen: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  theme,
  setTheme,
  activeDownloads,
  isLoading,
  searchQuery,
  setSearchQuery,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  isThemeMenuOpen,
  setIsThemeMenuOpen,
  isLangMenuOpen,
  setIsLangMenuOpen,
  isSortMenuOpen,
  setIsSortMenuOpen,
  setIsDownloadListOpen,
  handleLanguageChange,
  fetchFiles,
  setIsSettingsOpen,
}) => {
  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 sm:px-6 py-4 sticky top-0 z-20 shadow-sm">
      <div className="mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 min-w-10 bg-telegram-500 rounded-xl flex items-center justify-center shadow-lg shadow-telegram-500/20">
              <UploadCloud className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-slate-900 dark:text-white tracking-tight leading-none">
                {t(lang, "app_title")}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                {t(lang, "app_subtitle")}
              </p>
            </div>
          </div>

          {/* Mobile Actions Right */}
          <div className="flex items-center gap-2 sm:hidden">
            {/* Download List Button */}
            {activeDownloads.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDownloadListOpen(true);
                }}
                className="p-2 text-slate-400 hover:text-telegram-500 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-all relative"
                title={t(lang, "download_list_button") as string}
              >
                <Download className="w-5 h-5" />
                {activeDownloads.some((d) => d.status === "downloading") && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-telegram-500 rounded-full animate-pulse"></span>
                )}
              </button>
            )}

            {/* Burger Menu (Mobile Menu) */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                }}
                className="p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
              >
                <Menu className="w-6 h-6" />
              </button>

              {isMobileMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-30 py-2 animate-in fade-in zoom-in-95 duration-100 origin-top-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Language Section */}
                  <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {t(lang, "language") as string}
                  </div>
                  <button
                    onClick={() => {
                      handleLanguageChange("en");
                      // setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between"
                  >
                    English
                    {lang === "en" && (
                      <Check className="w-4 h-4 text-telegram-500" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      handleLanguageChange("zh");
                      // setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between"
                  >
                    中文
                    {lang === "zh" && (
                      <Check className="w-4 h-4 text-telegram-500" />
                    )}
                  </button>

                  <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>

                  {/* Actions */}
                  {/* Theme Section */}
                  <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mt-2">
                    {t(lang, "theme")}
                  </div>
                  <button
                    onClick={() => setTheme("light")}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Sun className="w-4 h-4" />
                      {t(lang, "theme_light")}
                    </div>
                    {theme === "light" && (
                      <Check className="w-4 h-4 text-telegram-500" />
                    )}
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Moon className="w-4 h-4" />
                      {t(lang, "theme_dark")}
                    </div>
                    {theme === "dark" && (
                      <Check className="w-4 h-4 text-telegram-500" />
                    )}
                  </button>
                  <button
                    onClick={() => setTheme("system")}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Monitor className="w-4 h-4" />
                      {t(lang, "theme_system")}
                    </div>
                    {theme === "system" && (
                      <Check className="w-4 h-4 text-telegram-500" />
                    )}
                  </button>

                  <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>

                  <button
                    onClick={() => {
                      fetchFiles();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                    />
                    {t(lang, "refresh")}
                  </button>

                  <button
                    onClick={() => {
                      setIsSettingsOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3"
                  >
                    <Settings className="w-4 h-4" />
                    {t(lang, "settings")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="min-w-40 flex-1 w-full sm:max-w-md mx-4 relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400 group-focus-within:text-telegram-500 transition-colors" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t(lang, "search_placeholder") as string}
            className="block w-full pl-10 pr-10 py-2 border border-slate-200 dark:border-slate-600 rounded-xl leading-5 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-telegram-500 focus:ring-1 focus:ring-telegram-500 sm:text-sm transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-3">
          {/* Download List Button */}
          {activeDownloads.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsDownloadListOpen(true);
              }}
              className="p-2 text-slate-400 hover:text-telegram-500 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-all relative"
              title={t(lang, "downloads") as string}
            >
              <Download className="w-5 h-5" />
              {activeDownloads.some((d) => d.status === "downloading") && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-telegram-500 rounded-full animate-pulse"></span>
              )}
            </button>
          )}

          {/* Language Switcher Desktop */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsLangMenuOpen(!isLangMenuOpen);
                setIsSortMenuOpen(false);
              }}
              className="p-2 text-slate-400 hover:text-telegram-500 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-all"
              title={t(lang, "language") as string}
            >
              <Globe className="w-5 h-5" />
            </button>
            {isLangMenuOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-30 py-1 animate-in fade-in zoom-in-95 duration-100 origin-top-right"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => handleLanguageChange("en")}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between"
                >
                  English
                  {lang === "en" && (
                    <Check className="w-4 h-4 text-telegram-500" />
                  )}
                </button>
                <button
                  onClick={() => handleLanguageChange("zh")}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between"
                >
                  中文
                  {lang === "zh" && (
                    <Check className="w-4 h-4 text-telegram-500" />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Theme Dropdown Desktop */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsThemeMenuOpen(!isThemeMenuOpen);
                setIsLangMenuOpen(false);
                setIsSortMenuOpen(false);
              }}
              className="p-2 text-slate-400 hover:text-telegram-500 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-all"
              title={t(lang, "toggle_theme") as string}
            >
              {theme === "light" ? (
                <Sun className="w-5 h-5" />
              ) : theme === "dark" ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Monitor className="w-5 h-5" />
              )}
            </button>
            {isThemeMenuOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-30 py-1 animate-in fade-in zoom-in-95 duration-100 origin-top-right"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {t(lang, "theme")}
                </div>
                <button
                  onClick={() => setTheme("light")}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4" />
                    {t(lang, "theme_light")}
                  </div>
                  {theme === "light" && (
                    <Check className="w-4 h-4 text-telegram-500" />
                  )}
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4" />
                    {t(lang, "theme_dark")}
                  </div>
                  {theme === "dark" && (
                    <Check className="w-4 h-4 text-telegram-500" />
                  )}
                </button>
                <button
                  onClick={() => setTheme("system")}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    {t(lang, "theme_system")}
                  </div>
                  {theme === "system" && (
                    <Check className="w-4 h-4 text-telegram-500" />
                  )}
                </button>
              </div>
            )}
          </div>

          <button
            onClick={fetchFiles}
            className="p-2 text-slate-400 hover:text-telegram-500 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-all"
            title={t(lang, "refresh") as string}
          >
            <RefreshCw
              className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-medium text-sm transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span className="whitespace-nowrap hidden min-[480px]:inline">
              {t(lang, "settings")}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
