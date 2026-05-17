"use client";

import { useEffect } from "react";

/** Used for in-app Back navigation; refresh/close use the browser’s own wording. */
export const UNSAVED_CHANGES_LEAVE_MESSAGE =
  "You have unsaved changes. Leave this page without saving?";

/**
 * Prompts when the user reloads, refreshes, or closes the tab with unsaved data.
 * Browsers show a generic dialog (e.g. “Reload site?” / “Leave site?”); custom text
 * and styling are not allowed for security reasons.
 */
export function useUnsavedChangesWarning(shouldWarn: boolean) {
  useEffect(() => {
    if (!shouldWarn) return;

    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [shouldWarn]);
}
