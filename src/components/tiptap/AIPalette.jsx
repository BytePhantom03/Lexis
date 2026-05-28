// src/components/tiptap/AIPalette.jsx
// Floating AI Command Palette and Inline Diff UI

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Sparkles,
  Shrink,
  Expand,
  RefreshCcw,
  Briefcase,
  Coffee,
  SmilePlus,
  Loader2,
  Check,
  X,
  Play,
  CornerDownLeft,
} from "lucide-react";
import { streamAIResponse } from "./aiService";
import supabase from "../../config/supabaseClient";

const COMMANDS = [
  {
    id: "autocomplete",
    label: "Autocomplete",
    description: "Continue writing from here",
    icon: Sparkles,
    shortcutIcon: CornerDownLeft,
  },
  {
    id: "expand",
    label: "Expand",
    description: "Elaborate this paragraph",
    icon: Expand,
    shortcutText: "E",
  },
  {
    id: "shorten",
    label: "Shorten",
    description: "Make it more concise",
    icon: Shrink,
    shortcutText: "S",
  },
  {
    id: "rewrite",
    label: "Rewrite Tone",
    description: "Change the voice",
    icon: RefreshCcw,
    shortcutIcon: Play,
    submenu: [
      { id: "rewrite_professional", label: "Professional", icon: Briefcase },
      { id: "rewrite_casual", label: "Casual", icon: Coffee },
      { id: "rewrite_witty", label: "Witty", icon: SmilePlus },
    ],
  },
];

export default function AIPalette({
  isOpen,
  coords,
  paragraphText,
  contextWindow,
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

  const handleClose = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen || isStreaming || showDiff) return;

    const handleKeyDown = (e) => {
      const items = showSubmenu ? COMMANDS[selectedIndex].submenu : COMMANDS;
      const currentIndex = showSubmenu ? subIndex : selectedIndex;
      const setIndex = showSubmenu ? setSubIndex : setSelectedIndex;

      if (!showSubmenu) {
        if (e.key.toLowerCase() === "e") {
          e.preventDefault();
          executeCommand("expand");
          return;
        }
        if (e.key.toLowerCase() === "s") {
          e.preventDefault();
          executeCommand("shorten");
          return;
        }
      }

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

  const logAIUsage = async (status) => {
    try {
      // 1. Log usage (mocking token count using text length as proxy)
      await supabase.from("ai_usage_logs").insert({
        command: activeCommand,
        status: status,
        token_estimate: rewrittenText.length,
        created_at: new Date().toISOString(),
      });

      // Note: ai_used and ai_commands_used would typically be updated on the ArticleTable here.
      // This requires the current article ID to be passed as a prop.
      // Example:
      // await supabase.from('ArticleTable').update({ ai_used: true }).eq('id', currentArticleId);
    } catch (e) {
      console.error("Failed to log AI usage", e);
    }
  };

  const executeCommand = async (commandId) => {
    if (!paragraphText.trim()) {
      handleClose();
      return;
    }

    const isRewrite = commandId.startsWith("rewrite_") || commandId === "shorten";
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
        await streamAIResponse(
          commandId,
          paragraphText,
          contextWindow,
          (chunk) => {
            fullText += chunk;
            setStreamedText(fullText);
            editor.chain().focus().insertContent(chunk).run();
          },
          abortController.signal
        );
        
        // Autocomplete/Expand are done, close the palette!
        handleClose();
      } else {
        await streamAIResponse(
          commandId,
          paragraphText,
          contextWindow,
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

  const handleAcceptRewrite = async () => {
    const { state } = editor;
    const $pos = state.doc.resolve(insertPos);
    const start = $pos.start();
    const end = $pos.end();

    editor
      .chain()
      .focus()
      .deleteRange({ from: start, to: end })
      .insertContentAt(start, rewrittenText)
      .run();

    await logAIUsage("accepted");
    handleClose();
  };

  const handleRejectRewrite = async () => {
    await logAIUsage("rejected");
    handleClose();
  };

  if (!isOpen) return null;

  // Use the DOM node bounding rect for overlay positioning, fallback to cursor coords
  const overlayStyle = coords?.width 
    ? { top: `${coords.top - 10}px`, left: `${coords.left - 10}px`, width: `${coords.width + 20}px` } 
    : { top: `${(coords?.bottom || 0) + 8}px`, left: `${coords?.left || 0}px` };

  // 1. Diff View (Pending State)
  if (showDiff && rewrittenText) {
    return createPortal(
      <div
        className="fixed z-[9999] bg-[#1a1b23] border border-[#2d2e3d] rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
        style={overlayStyle}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2d2e3d] bg-[#15151c]">
          <Sparkles size={16} className="text-[#9d7cf7]" />
          <span className="text-xs font-semibold text-gray-300 tracking-wider">
            AI REWRITE — Review Changes
          </span>
        </div>

        <div className="flex flex-row gap-3 p-3">
          {/* Dimmed original with strikethrough */}
          <div className="flex-1 rounded-xl bg-[#1a1b23] p-4 border border-[#2d2e3d]/50 opacity-60 overflow-y-auto max-h-[300px]">
            <p className="text-sm text-[#7a7a8f] line-through leading-relaxed">
              {originalText}
            </p>
          </div>

          {/* Highlighted new version */}
          <div className="flex-1 rounded-xl bg-[#28243d] p-4 border border-[#483d8b] shadow-inner overflow-y-auto max-h-[300px]">
            <p className="text-sm text-[#e2d9ff] leading-relaxed">
              {rewrittenText}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 border-t border-[#2d2e3d] bg-[#15151c]">
          <button
            type="button"
            onClick={handleAcceptRewrite}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-white bg-[#6b4cde] hover:bg-[#7a5ce0] rounded-xl transition-colors cursor-pointer"
          >
            <Check size={16} />
            Accept
          </button>
          <button
            type="button"
            onClick={handleRejectRewrite}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-300 bg-[#2d2e3d] hover:bg-[#3d3e52] rounded-xl transition-colors cursor-pointer"
          >
            <X size={16} />
            Discard
          </button>
        </div>
      </div>,
      document.body
    );
  }

  // 2. Inline Shimmer (Streaming State for Rewrites)
  if (isStreaming && activeCommand.startsWith("rewrite")) {
    return createPortal(
      <div
        className="fixed z-[9999] rounded-lg bg-[#1a1b23]/90 backdrop-blur-sm border border-[#3b3461] p-4 overflow-hidden"
        style={{ ...overlayStyle, height: coords?.height ? `${coords.height + 20}px` : '100px' }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#b395ff]/10 to-transparent animate-[shimmer_1.5s_infinite] -skew-x-12" style={{ backgroundSize: '200% 100%' }} />
        <div className="relative z-10 flex items-center gap-3">
          <Loader2 size={16} className="text-[#9d7cf7] animate-spin" />
          <span className="text-sm text-[#b395ff] font-medium tracking-wide">Rewriting paragraph...</span>
        </div>
        <p className="relative z-10 text-sm text-[#7a7a8f] mt-2 opacity-50 blur-[2px] select-none">
          {originalText.slice(0, 100)}...
        </p>
      </div>,
      document.body
    );
  }

  // 3. Floating Loader (Streaming State for Autocomplete/Expand)
  if (isStreaming) {
    return createPortal(
      <div
        className="fixed z-[9999] w-[300px] bg-[#1a1b23] border border-[#2d2e3d] rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
        style={{ top: `${(coords?.bottom || 0) + 8}px`, left: `${coords?.left || 0}px` }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4 px-5 py-5">
          <Loader2 size={20} className="text-[#9d7cf7] animate-spin" />
          <div>
            <p className="text-sm font-medium text-gray-200">AI is writing...</p>
            <p className="text-xs text-gray-500 mt-0.5 capitalize">{activeCommand.replace("_", " ")}</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="ml-auto p-1.5 text-gray-500 hover:text-gray-300 rounded-full hover:bg-[#2d2e3d] transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      </div>,
      document.body
    );
  }

  // 4. Command Palette (Initial State)
  return createPortal(
    <div
      ref={paletteRef}
      className="fixed z-[9999] w-[320px] bg-[#1a1b23] border border-[#2d2e3d] rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
      style={{ top: `${(coords?.bottom || 0) + 8}px`, left: `${coords?.left || 0}px` }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-2 px-4 py-3">
        <Sparkles size={14} className="text-[#5b5b6b]" />
        <span className="text-[11px] font-semibold text-[#5b5b6b] tracking-widest uppercase">AI Commands</span>
      </div>

      <div className="px-2 pb-2">
        {COMMANDS.map((cmd, index) => {
          const Icon = cmd.icon;
          const isSelected = selectedIndex === index && !showSubmenu;
          const ShortcutIcon = cmd.shortcutIcon;

          return (
            <div key={cmd.id} className="relative mb-1 last:mb-0">
              <button
                type="button"
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
                className={`w-full flex items-center gap-3.5 px-3 py-3 text-left transition-colors cursor-pointer rounded-xl ${
                  isSelected ? "bg-[#28243d]" : "hover:bg-[#22222d]"
                }`}
              >
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-[#3b3461] text-[#b395ff]' : 'bg-[#252630] text-[#717185]'}`}>
                  <Icon size={18} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold tracking-wide ${isSelected ? "text-white" : "text-gray-200"}`}>
                    {cmd.label}
                  </p>
                  <p className="text-[12px] text-[#7a7a8f] mt-0.5 truncate">{cmd.description}</p>
                </div>

                <div className={`flex items-center justify-center w-5 h-5 rounded ${isSelected ? 'bg-[#1e1a30] text-[#7a7a8f]' : 'bg-[#1e1e26] text-[#5b5b6b]'}`}>
                  {ShortcutIcon ? <ShortcutIcon size={12} /> : <span className="text-[10px] font-bold">{cmd.shortcutText}</span>}
                </div>
              </button>

              {cmd.submenu && showSubmenu && selectedIndex === index && (
                <div className="absolute left-full top-0 ml-2 w-[180px] bg-[#1a1b23] border border-[#2d2e3d] rounded-xl shadow-xl p-1.5 animate-scale-in z-10">
                  {cmd.submenu.map((sub, sIdx) => {
                    const SubIcon = sub.icon;
                    const isSubSelected = subIndex === sIdx;

                    return (
                      <button
                        type="button"
                        key={sub.id}
                        onClick={() => executeCommand(sub.id)}
                        onMouseEnter={() => setSubIndex(sIdx)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors cursor-pointer rounded-lg ${
                          isSubSelected ? "bg-[#28243d] text-white" : "hover:bg-[#22222d] text-gray-300"
                        }`}
                      >
                        <SubIcon size={16} className={isSubSelected ? "text-[#b395ff]" : "text-[#717185]"} />
                        <span className="text-sm font-medium tracking-wide">{sub.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="px-4 py-2.5 border-t border-[#2d2e3d] bg-[#15151c]">
        <div className="flex items-center justify-between text-[11px] text-[#5b5b6b] font-mono">
          <span className="flex items-center gap-1"><span className="text-[#7a7a8f]">↑↓</span> navigate</span>
          <span className="flex items-center gap-1"><span className="text-[#7a7a8f]">↵</span> select</span>
          <span className="flex items-center gap-1"><span className="text-[#7a7a8f]">esc</span> close</span>
        </div>
      </div>
    </div>,
    document.body
  );
}
