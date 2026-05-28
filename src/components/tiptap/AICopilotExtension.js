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

                // Get cursor coordinates for positioning the palette
                const coords = view.coordsAtPos(safeFrom);

                // Get the current paragraph and some previous context
                const resolvedPos = view.state.doc.resolve(
                  Math.min(safeFrom, view.state.doc.content.size)
                );
                
                // Get up to 500 characters of preceding text across paragraphs for context
                const contextStart = Math.max(0, safeFrom - 500);
                const paragraphText = view.state.doc.textBetween(contextStart, safeFrom, "\n", "\ufffc");

                extension.options.onActivate({
                  coords: {
                    top: coords.top,
                    left: coords.left,
                    bottom: coords.bottom,
                  },
                  paragraphText,
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
