/**
 * Console filtering system for [Test] and [Cheat] messages
 * 
 * Intercepts console.log and console.table calls to conditionally suppress
 * messages based on environment flags:
 * - UI_CUBE_SHOW_TESTS: Show/hide [Test] messages
 * - UI_CUBE_SHOW_CHEAT: Show/hide [Cheat] messages
 * 
 * Default: Both false (suppressed)
 * Runtime control: window.consoleFilter.update(showTests, showCheat)
 */

class ConsoleFilter {
  private originalConsoleLog: typeof console.log;
  private originalConsoleTable: typeof console.table;
  private showTests: boolean;
  private showCheat: boolean;

  constructor() {
    this.originalConsoleLog = console.log.bind(console);
    this.originalConsoleTable = console.table.bind(console);
    
    // Read environment variables (default to false)
    this.showTests = this.getEnvFlag('UI_CUBE_SHOW_TESTS');
    this.showCheat = this.getEnvFlag('UI_CUBE_SHOW_CHEAT');
    
    this.setupInterception();
    
    // Log initial status using original console to avoid interception
    this.originalConsoleLog(
      `[ConsoleFilter] Initialized - SHOW_TESTS=${this.showTests}, SHOW_CHEAT=${this.showCheat}`
    );
  }

  private getEnvFlag(key: string): boolean {
    if (typeof window === 'undefined') return false; // Default to false
    
    // Check both import.meta.env and window object
    const value = 
      (import.meta as any).env?.[key] ||
      (window as any)[`__${key}__`];
    
    // Explicitly check for 'true' string
    return value === 'true' || value === true;
  }

  private setupInterception(): void {
    const self = this;
    
    // Intercept console.log
    console.log = function(...args: any[]) {
      const message = args.join(' ');
      
      // Check if this is a [Test] or [Cheat] message
      const isTest = message.includes('[Test]');
      const isCheat = message.includes('[Cheat]');
      
      // Decide whether to show based on flags
      if (isTest && !self.showTests) {
        return; // Suppress [Test] logs
      }
      if (isCheat && !self.showCheat) {
        return; // Suppress [Cheat] logs
      }
      
      // Call original console.log for all other messages
      self.originalConsoleLog.apply(console, args);
    };
    
    // Intercept console.table
    // Note: console.table is typically preceded by console.log with a [Cheat] marker
    // We'll suppress it when cheat is disabled
    console.table = function(data?: any, columns?: string[]): void {
      // Console.table is almost exclusively used for [Cheat] displays
      // So we suppress it when showCheat is false
      if (!self.showCheat) {
        return; // Suppress table when cheat is disabled
      }
      
      self.originalConsoleTable.call(console, data, columns);
    };
  }

  /**
   * Update flags at runtime
   * Usage from browser console: window.consoleFilter.update(true, false)
   */
  updateFlags(showTests?: boolean, showCheat?: boolean): void {
    if (showTests !== undefined) this.showTests = showTests;
    if (showCheat !== undefined) this.showCheat = showCheat;
    this.originalConsoleLog(
      `[ConsoleFilter] Updated - SHOW_TESTS=${this.showTests}, SHOW_CHEAT=${this.showCheat}`
    );
  }

  /**
   * Get current flag values
   */
  getFlags(): { showTests: boolean; showCheat: boolean } {
    return {
      showTests: this.showTests,
      showCheat: this.showCheat
    };
  }
}

// Singleton instance
let consoleFilterInstance: ConsoleFilter | null = null;

/**
 * Initialize console filter (call once at app startup)
 */
export function initConsoleFilter(): void {
  if (!consoleFilterInstance) {
    consoleFilterInstance = new ConsoleFilter();
  }
}

/**
 * Update console filter flags at runtime
 */
export function updateConsoleFilter(showTests?: boolean, showCheat?: boolean): void {
  if (consoleFilterInstance) {
    consoleFilterInstance.updateFlags(showTests, showCheat);
  }
}

/**
 * Get current filter flags
 */
export function getConsoleFilterFlags(): { showTests: boolean; showCheat: boolean } | null {
  return consoleFilterInstance ? consoleFilterInstance.getFlags() : null;
}

// Expose to window for runtime control from browser console
if (typeof window !== 'undefined') {
  (window as any).consoleFilter = {
    update: updateConsoleFilter,
    getFlags: getConsoleFilterFlags,
    help: () => {
      console.log('Console Filter Controls:');
      console.log('  window.consoleFilter.update(showTests, showCheat)');
      console.log('  window.consoleFilter.getFlags()');
      console.log('Examples:');
      console.log('  window.consoleFilter.update(true, false)  // Show tests, hide cheat');
      console.log('  window.consoleFilter.update(true, true)   // Show both');
      console.log('  window.consoleFilter.update(false, false) // Hide both');
    }
  };
}

