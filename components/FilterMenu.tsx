import React from "react";
import { Filter, Check, Calendar } from "lucide-react";
import { FilterType, TimeFilter } from "../types";
import { t } from "../constants";

interface FilterMenuProps {
  filterType: FilterType;
  setFilterType: (type: FilterType) => void;
  timeFilter: TimeFilter;
  setTimeFilter: (filter: TimeFilter) => void;
  customStartDate: string;
  setCustomStartDate: (date: string) => void;
  customEndDate: string;
  setCustomEndDate: (date: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  lang: string;
  // Generic handler to close other menus (like Sort) if needed,
  // or just handle outside clicks in parent.
  // For simplicity, we just toggle ourselves here.
}

export const FilterMenu: React.FC<FilterMenuProps> = ({
  filterType,
  setFilterType,
  timeFilter,
  setTimeFilter,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  isOpen,
  setIsOpen,
  lang,
}) => {
  const getTypeFilterLabel = (type: FilterType) => {
    switch (type) {
      case "all":
        return t(lang, "filter_type_all");
      case "photo":
        return t(lang, "filter_type_photo");
      case "video":
        return t(lang, "filter_type_video");
      case "document":
        return t(lang, "filter_type_document");
      case "audio":
        return t(lang, "filter_type_audio");
      case "folder":
        return t(lang, "filter_type_folder");
    }
  };

  const getTimeFilterLabel = (filter: TimeFilter) => {
    switch (filter) {
      case "all":
        return t(lang, "filter_time_all");
      case "24h":
        return t(lang, "filter_time_24h");
      case "7d":
        return t(lang, "filter_time_7d");
      case "30d":
        return t(lang, "filter_time_30d");
      case "custom":
        return t(lang, "filter_time_custom");
    }
  };

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`whitespace-nowrap flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border ${
          filterType !== "all" || timeFilter !== "all"
            ? "border-telegram-500 text-telegram-600 dark:text-telegram-400 bg-telegram-50 dark:bg-telegram-900/20"
            : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
        } hover:border-telegram-200 dark:hover:border-telegram-700 rounded-lg text-sm font-medium transition-all shadow-sm`}
      >
        <Filter className="w-4 h-4" />
        <span className="hidden min-[480px]:inline">
          {filterType !== "all"
            ? getTypeFilterLabel(filterType)
            : t(lang, "filter_button_default")}
        </span>
        {(filterType !== "all" || timeFilter !== "all") && (
          <div className="w-2 h-2 rounded-full bg-telegram-500 absolute top-1 right-1 sm:top-0.5 sm:right-0.5"></div>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute min-[480px]:right-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-30 py-1 animate-in fade-in zoom-in-95 duration-100 origin-top-right overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* File Type Section */}
          <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/50">
            {t(lang, "filter_section_fileType")}
          </div>
          <div className="grid grid-cols-2 gap-1 p-2">
            {(
              [
                "all",
                "photo",
                "video",
                "document",
                "audio",
                "folder",
              ] as FilterType[]
            ).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2 py-1.5 text-sm rounded-lg text-left truncate transition-colors ${
                  filterType === type
                    ? "bg-telegram-50 dark:bg-telegram-900/30 text-telegram-600 dark:text-telegram-400 font-medium"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                {getTypeFilterLabel(type)}
              </button>
            ))}
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>

          {/* Time Section */}
          <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/50">
            {t(lang, "filter_section_timeRange")}
          </div>
          <div className="p-2 space-y-1">
            {(["all", "24h", "7d", "30d"] as TimeFilter[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeFilter(tf)}
                className={`w-full px-2 py-1.5 text-sm rounded-lg text-left transition-colors flex items-center justify-between ${
                  timeFilter === tf
                    ? "bg-telegram-50 dark:bg-telegram-900/30 text-telegram-600 dark:text-telegram-400 font-medium"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                <span>{getTimeFilterLabel(tf)}</span>
                {timeFilter === tf && <Check className="w-4 h-4" />}
              </button>
            ))}
            <button
              onClick={() => setTimeFilter("custom")}
              className={`w-full px-2 py-1.5 text-sm rounded-lg text-left transition-colors flex items-center justify-between ${
                timeFilter === "custom"
                  ? "bg-telegram-50 dark:bg-telegram-900/30 text-telegram-600 dark:text-telegram-400 font-medium"
                  : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
            >
              <span>{t(lang, "filter_time_custom")}</span>
              {timeFilter === "custom" && <Calendar className="w-4 h-4" />}
            </button>

            {/* Custom Range Inputs */}
            {timeFilter === "custom" && (
              <div className="pt-2 pl-2 space-y-2 animate-in slide-in-from-top-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 w-8">
                    {t(lang, "filter_custom_from")}
                  </span>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-telegram-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 w-8">
                    {t(lang, "filter_custom_to")}
                  </span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-telegram-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
