// src/components/tiptap/AICopilotExtension.js
// Custom Tiptap extension that intercepts /ai and opens the command palette.

import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

export const AI_COPILOT_PLUGIN_KEY = new PluginKey("aiCopilot");

const AICopilotExtension = Extension.create({
  name: "aiCopilot",

  addOptions() {
    return {
      onActivate: () => {},   // Called when /ai is detected — opens the palette
      onDeactivate: () => {}, // Called when palette should close
    };
  },

  addProseMirrorPlugins() {
    const extension = this;

    return [
      new Plugin({
        key: AI_COPILOT_PLUGIN_KEY,
        props: {
          handleTextInput(view, from, to, text) {
            // Build the current text being typed by looking at the last few chars
            const { state } = view;
            const $from = state.doc.resolve(from);
            const textBefore = $from.parent.textBetween(
              Math.max(0, $from.parentOffset - 3),
              $from.parentOffset,
              null,
              "\ufffc"
            ) + text;

            // Check if the user just finished typing "/ai"
            if (textBefore.endsWith("/ai")) {
              // Schedule the action after the current transaction
              setTimeout(() => {
                // Delete the "/ai" text from the document
                const tr = view.state.tr;
                const deleteFrom = from - 2; // "/ai" is 3 chars: '/', 'a', 'i' — but 'i' hasn't been inserted yet at this point, so we go back 2 for "/" and "a"
                const deleteTo = from + 1; // Include the current char being inserted ("i")

                // Clamp to valid range
                const safeFrom = Math.max(0, deleteFrom);
                tr.delete(safeFrom, Math.min(deleteTo, tr.doc.content.size));
                view.dispatch(tr);

                // Prepare variables for payload
                let paragraphText = "";
                let contextWindow = "";
                let nodeRect = { top: 0, left: 0, bottom: 0, width: 400, height: 100 };
                
                try {
                  const coords = view.coordsAtPos(safeFrom) || { top: 0, left: 0, bottom: 0 };
                  nodeRect = { top: coords.top, left: coords.left, bottom: coords.bottom, width: 400, height: 100 };

                  const doc = view.state.doc;
                  const resolvedPos = doc.resolve(Math.min(safeFrom, doc.content.size));
                  paragraphText = resolvedPos.parent.textContent || "";
                  
                  if (resolvedPos.depth > 0) {
                    const parentPos = resolvedPos.before(resolvedPos.depth);
                    const parentEnd = resolvedPos.after(resolvedPos.depth);
                    
                    // Try to get actual DOM rect for perfect overlay
                    const nodeDOM = view.nodeDOM(parentPos);
                    if (nodeDOM && nodeDOM.getBoundingClientRect) {
                      nodeRect = nodeDOM.getBoundingClientRect();
                    }
                    
                    // Extract context text safely
                    const prevNodeStart = Math.max(0, parentPos - 500);
                    const nextNodeEnd = Math.min(doc.content.size, parentEnd + 500);
                    const contextBefore = doc.textBetween(prevNodeStart, parentPos, " ", "\ufffc");
                    const contextAfter = doc.textBetween(parentEnd, nextNodeEnd, " ", "\ufffc");
                    contextWindow = `Previous text: ${contextBefore}\n\nFollowing text: ${contextAfter}`;
                  }
                } catch (e) {
                  console.warn("Failed to extract full AI context window", e);
                }

                extension.options.onActivate({
                  coords: nodeRect,
                  paragraphText,
                  contextWindow,
                  from: safeFrom,
                });
              }, 0);

              return false;
            }

            return false;
          },
        },
      }),
    ];
  },
});

export default AICopilotExtension;
