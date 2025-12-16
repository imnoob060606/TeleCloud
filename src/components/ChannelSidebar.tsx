import React, { useState } from "react";
import {
  Plus,
  Hash,
  PanelLeftClose,
  PanelLeftOpen,
  MessageSquare,
} from "lucide-react";
import { t, Language } from "@/constants";
import { AppConfig, Channel } from "@/types";

interface ChannelSidebarProps {
  config: AppConfig;
  lang: Language;
  activeChatId: string;
  onSelectChannel: (channelId: string) => void;
  onAddChannel: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const ChannelSidebar: React.FC<ChannelSidebarProps> = ({
  config,
  lang,
  activeChatId,
  onSelectChannel,
  onAddChannel,
  isCollapsed,
  onToggleCollapse,
}) => {
  const channels = config.channels || [];

  return (
    <div
      className={`bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 relative ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header / Toggle */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0">
        {!isCollapsed && (
          <span className="font-bold text-white tracking-tight truncate">
            {t(lang, "sidebar_title") || "Channel List"}
          </span>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-auto"
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-5 h-5" />
          ) : (
            <PanelLeftClose className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Channels List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
        {channels.map((channel) => {
          const isActive = channel.chatId === activeChatId;
          return (
            <button
              key={channel.id}
              onClick={() => onSelectChannel(channel.chatId)}
              title={isCollapsed ? channel.name : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all group relative ${
                isActive
                  ? "bg-telegram-600 text-white shadow-lg shadow-telegram-900/50"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <div
                className={`shrink-0 w-8 h-8 rounded-md flex items-center justify-center ${
                  isActive
                    ? "bg-white/20"
                    : "bg-slate-800 group-hover:bg-slate-700"
                }`}
              >
                <span className="text-xs font-bold uppercase">
                  {channel.name.substring(0, 2)}
                </span>
              </div>

              {!isCollapsed && (
                <div className="text-left truncate min-w-0 flex-1">
                  <div className="font-medium text-sm truncate">
                    {channel.name}
                  </div>
                  <div className="text-[10px] opacity-60 truncate">
                    {channel.chatId}
                  </div>
                </div>
              )}

              {/* Active Indicator Line */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/50 rounded-r-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer / Add Channel */}
      <div className="p-2 border-t border-slate-800 shrink-0">
        <button
          onClick={onAddChannel}
          title={
            isCollapsed
              ? (t(lang, "add_channel") as string) || "Add Channel"
              : undefined
          }
          className={`w-full flex items-center justify-center gap-2 rounded-lg transition-all ${
            isCollapsed
              ? "h-10 w-10 mx-auto bg-slate-800 hover:bg-telegram-600 text-slate-400 hover:text-white"
              : "py-2.5 bg-slate-800 hover:bg-telegram-600 text-slate-400 hover:text-white"
          }`}
        >
          <Plus className="w-5 h-5" />
          {!isCollapsed && (
            <span className="font-medium text-sm">
              {t(lang, "add_channel") || "Add Channel"}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
