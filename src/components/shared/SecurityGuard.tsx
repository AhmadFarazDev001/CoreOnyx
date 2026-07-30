"use client";

import { useEffect } from "react";

export function SecurityGuard() {
  useEffect(() => {
    // 1. Disable Right-Click (Context Menu)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // 2. Disable Common DevTools Keyboard Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent F12
      if (e.key === "F12") {
        e.preventDefault();
        return false;
      }
      
      // Prevent Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j" || e.key === "C" || e.key === "c")) {
        e.preventDefault();
        return false;
      }

      // Prevent Command+Option+I, Command+Option+J, Command+Option+C (Mac)
      if (e.metaKey && e.altKey && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j" || e.key === "C" || e.key === "c")) {
        e.preventDefault();
        return false;
      }

      // Prevent Ctrl+U / Command+Option+U (View Source)
      if ((e.ctrlKey || e.metaKey) && (e.key === "U" || e.key === "u")) {
        e.preventDefault();
        return false;
      }
    };

    // 3. Debugger Trap (Optional but highly effective)
    // If devtools is somehow opened (e.g., from browser menu), this will constantly pause execution.
    const debuggerTrap = setInterval(() => {
      const before = new Date().getTime();
      Function("debugger")();
      const after = new Date().getTime();
      if (after - before > 100) {
        // Devtools is open and paused the execution
      }
    }, 1000);

    // Attach listeners
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      clearInterval(debuggerTrap);
    };
  }, []);

  return null;
}
