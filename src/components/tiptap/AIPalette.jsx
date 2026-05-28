// src/components/tiptap/AIPalette.jsx
// Floating AI Command Palette — appears when user types /ai in the editor.

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Sparkles,
  Wand2,
  Shrink,
  Expand,
  PenLine,
  Briefcase,
  Coffee,
  SmilePlus,
  Loader2,
  Check,
  X,
  ChevronRight,
} from "lucide-react";
import { streamAIResponse } from "./aiService";

const COMMANDS = [
  {
    id: "autocomplete",
    label: "Autocomplete",
    description: "Continue writing naturally",
    icon: Wand2,
  },
  {
    id: "expand",
    label: "Expand",
    description: "Make it longer and richer",
    icon: Expand,
  },
  {
    id: "shorten",
    label: "Shorten",
    description: "Cut it down to the essentials",
    icon: Shrink,
  },
  {
    id: "rewrite",
    label: "Rewrite Tone",
    description: "Change the voice",
    icon: PenLine,
    submenu: [
      {
        id: "rewrite_professional",
        label: "Professional",
        icon: Briefcase,
      },
      {
        id: "rewrite_casual",
        label: "Casual",
        icon: Coffee,
      },
      {
        id: "rewrite_witty",
        label: "Witty",
        icon: SmilePlus,
      },
    ],
  },
];

export default function AIPalette({
  isOpen,
  coords,
  paragraphText,
  editor,
  onClose,
  insertPos,
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showSubmenu, setShowSubmenu] = useState(false);
  const [subIndex, setSubIndex] = useState(0);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const [showDiff, setShowDiff] = useState(false);
  const [originalText, setOriginalText] = useState("");
  const [rewrittenText, setRewrittenText] = useState("");
  const [activeCommand, setActiveCommand] = useState("");
  const paletteRef = useRef(null);
  const abortRef = useRef(null);

  // Reset state when palette opens
  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0);
      setShowSubmenu(false);
      setSubIndex(0);
      setIsStreaming(false);
      setStreamedText("");
      setShowDiff(false);
      setOriginalText("");
      setRewrittenText("");
      setActiveCommand("");
    }
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (paletteRef.current && !paletteRef.current.contains(e.target)) {
        handleClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleClose = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    onClose();
  }, [onClose]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen || isStreaming || showDiff) return;

    const handleKeyDown = (e) => {
      const items = showSubmenu
        ? COMMANDS[selectedIndex].submenu
        : COMMANDS;
      const currentIndex = showSubmenu ? subIndex : selectedIndex;
      const setIndex = showSubmenu ? setSubIndex : setSelectedIndex;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setIndex((prev) => (prev + 1) % items.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setIndex((prev) => (prev - 1 + items.length) % items.length);
          break;
        case "Enter":
          e.preventDefault();
          if (showSubmenu) {
            executeCommand(items[currentIndex].id);
          } else if (items[currentIndex].submenu) {
            setShowSubmenu(true);
            setSubIndex(0);
          } else {
            executeCommand(items[currentIndex].id);
          }
          break;
        case "ArrowRight":
          if (!showSubmenu && items[currentIndex].submenu) {
            e.preventDefault();
            setShowSubmenu(true);
            setSubIndex(0);
          }
          break;
        case "ArrowLeft":
          if (showSubmenu) {
            e.preventDefault();
            setShowSubmenu(false);
          }
          break;
        case "Escape":
          e.preventDefault();
          if (showSubmenu) {
            setShowSubmenu(false);
          } else {
            handleClose();
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isStreaming, showDiff, showSubmenu, selectedIndex, subIndex, handleClose]);

  const executeCommand = async (commandId) => {
    if (!paragraphText.trim()) {
      handleClose();
      return;
    }

    const isRewrite = commandId.startsWith("rewrite_");
    setActiveCommand(commandId);
    setIsStreaming(true);
    setStreamedText("");

    if (isRewrite) {
      setOriginalText(paragraphText);
    }

    const abortController = new AbortController();
    abortRef.current = abortController;

    try {
      let fullText = "";

      if (!isRewrite) {
        // For autocomplete/expand/shorten — stream directly into editor
        await streamAIResponse(
          commandId,
          paragraphText,
          (chunk) => {
            fullText += chunk;
            setStreamedText(fullText);
            // Insert at cursor position
            editor.chain().focus().insertContent(chunk).run();
          },
          abortController.signal
        );
      } else {
        // For rewrites — collect the full text first, then show diff
        await streamAIResponse(
          commandId,
          paragraphText,
          (chunk) => {
            fullText += chunk;
            setStreamedText(fullText);
          },
          abortController.signal
        );
        setRewrittenText(fullText);
        setShowDiff(true);
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("AI Copilot error:", error);
      }
    } finally {
      setIsStreaming(false);
    }
  };

  const handleAcceptRewrite = () => {
    // Replace the current paragraph content with the rewritten text
    const { state } = editor;

    // Find the paragraph node boundaries
    const $pos = state.doc.resolve(insertPos);
    const start = $pos.start();
    const end = $pos.end();

    editor
      .chain()
      .focus()
      .deleteRange({ from: start, to: end })
      .insertContentAt(start, rewrittenText)
      .run();

    handleClose();
  };

  const handleRejectRewrite = () => {
    handleClose();
  };

  if (!isOpen) return null;

  // Calculate position — ensure palette stays within viewport
  const top = (coords?.bottom || 0) + 8;
  const left = coords?.left || 0;

  // Diff view for rewrites
  if (showDiff && rewrittenText) {
    return (
      <div
        ref={paletteRef}
        className="fixed z-[9999] w-[420px] max-w-[90vw] bg-white dark:bg-[#1c1c1f] border border-[#e8e8ec] dark:border-[#2a2a2e] rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
        style={{ top: `${top}px`, left: `${left}px` }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#e8e8ec] dark:border-[#2a2a2e] bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30">
          <Sparkles size={16} className="text-indigo-500" />
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            AI Rewrite
          </span>
        </div>

        {/* Diff content */}
        <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto">
          {/* Original */}
          <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-3 border border-red-100 dark:border-red-900/30">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 mb-1 block">
              Original
            </span>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-through leading-relaxed">
              {originalText}
            </p>
          </div>

          {/* Rewritten */}
          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/20 p-3 border border-emerald-100 dark:border-emerald-900/30">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1 block">
              Rewritten
            </span>
            <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
              {rewrittenText}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 p-3 border-t border-[#e8e8ec] dark:border-[#2a2a2e]">
          <button
            onClick={handleAcceptRewrite}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors cursor-pointer"
          >
            <Check size={14} />
            Accept
          </button>
          <button
            onClick={handleRejectRewrite}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-[#2a2a2e] hover:bg-gray-200 dark:hover:bg-[#353538] rounded-lg transition-colors cursor-pointer"
          >
            <X size={14} />
            Discard
          </button>
        </div>
      </div>
    );
  }

  // Streaming indicator
  if (isStreaming) {
    return (
      <div
        ref={paletteRef}
        className="fixed z-[9999] w-[280px] bg-white dark:bg-[#1c1c1f] border border-[#e8e8ec] dark:border-[#2a2a2e] rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
        style={{ top: `${top}px`, left: `${left}px` }}
      >
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="relative">
            <Loader2
              size={18}
              className="text-indigo-500 animate-spin"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
              AI is writing...
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {activeCommand.replace("_", " ")}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="ml-auto p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-[#2a2a2e] transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        {/* Mini progress bar */}
        <div className="h-0.5 bg-gray-100 dark:bg-[#2a2a2e]">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 animate-pulse rounded-full w-2/3" />
        </div>
      </div>
    );
  }

  // Command palette
  return (
    <div
      ref={paletteRef}
      className="fixed z-[9999] w-[260px] bg-white dark:bg-[#1c1c1f] border border-[#e8e8ec] dark:border-[#2a2a2e] rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
      style={{ top: `${top}px`, left: `${left}px` }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[#e8e8ec] dark:border-[#2a2a2e] bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30">
        <Sparkles size={14} className="text-indigo-500" />
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 tracking-wide">
          AI COPILOT
        </span>
      </div>

      {/* Commands list */}
      <div className="py-1">
        {COMMANDS.map((cmd, index) => {
          const Icon = cmd.icon;
          const isSelected = selectedIndex === index && !showSubmenu;

          return (
            <div key={cmd.id} className="relative">
              <button
                onClick={() => {
                  if (cmd.submenu) {
                    setSelectedIndex(index);
                    setShowSubmenu(true);
                    setSubIndex(0);
                  } else {
                    executeCommand(cmd.id);
                  }
                }}
                onMouseEnter={() => {
                  setSelectedIndex(index);
                  if (!cmd.submenu) setShowSubmenu(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-indigo-50 dark:bg-indigo-950/30"
                    : "hover:bg-gray-50 dark:hover:bg-[#252528]"
                }`}
              >
                <Icon
                  size={16}
                  className={
                    isSelected
                      ? "text-indigo-500"
                      : "text-gray-400"
                  }
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      isSelected
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {cmd.label}
                  </p>
                  <p className="text-[11px] text-gray-400 truncate">
                    {cmd.description}
                  </p>
                </div>
                {cmd.submenu && (
                  <ChevronRight size={14} className="text-gray-400" />
                )}
              </button>

              {/* Submenu */}
              {cmd.submenu &&
                showSubmenu &&
                selectedIndex === index && (
                  <div className="absolute left-full top-0 ml-1 w-[180px] bg-white dark:bg-[#1c1c1f] border border-[#e8e8ec] dark:border-[#2a2a2e] rounded-xl shadow-xl overflow-hidden animate-scale-in z-10">
                    {cmd.submenu.map((sub, sIdx) => {
                      const SubIcon = sub.icon;
                      const isSubSelected = subIndex === sIdx;

                      return (
                        <button
                          key={sub.id}
                          onClick={() => executeCommand(sub.id)}
                          onMouseEnter={() => setSubIndex(sIdx)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors cursor-pointer ${
                            isSubSelected
                              ? "bg-indigo-50 dark:bg-indigo-950/30"
                              : "hover:bg-gray-50 dark:hover:bg-[#252528]"
                          }`}
                        >
                          <SubIcon
                            size={14}
                            className={
                              isSubSelected
                                ? "text-indigo-500"
                                : "text-gray-400"
                            }
                          />
                          <span
                            className={`text-sm font-medium ${
                              isSubSelected
                                ? "text-indigo-600 dark:text-indigo-400"
                                : "text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {sub.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
            </div>
          );
        })}
      </div>

      {/* Footer hint */}
      <div className="px-3 py-2 border-t border-[#e8e8ec] dark:border-[#2a2a2e]">
        <p className="text-[10px] text-gray-400 text-center">
          ↑↓ navigate · Enter select · Esc close
        </p>
      </div>
    </div>
  );
}
