// A pool of API keys for the application.
const API_KEYS: string[] = [
  "AIzaSyDX3UPwaM11izKZyevMMzggJ6l0ug1MhLo",
  "AIzaSyBoz8WhcxsU-i239Oz3Syx0MshAhuTTNfI",
  "AIzaSyBHbPU7FYxN_4i-3MGZ7cCQgIAPPRzJqq4",
  "AIzaSyDrrM9MTkFjs7BChVkU4SxyZnf1Xu5Xhhs",
  "AIzaSyANGG0wzP0ITzPhqsxrdLl_lUMnYYipp1c",
  "AIzaSyD3TipoUWjPPoPPYBMDtqI2u3gpkL4rjAY",
  "AIzaSyB1hONrY0VZGR7GnqiObwV5o2Sbj5KEABc",
  "AIzaSyBwzVuPWWQnFu8YHdywXdhRFNSzwHne3FU",
  "AIzaSyBdCYps0Q2RdhQNC3uZ0By_OhmG6n-ojAI",
  "AIzaSyAi9t0GQT3xG3BGeea0dcdPc5WhvV5u1HY",
  "AIzaSyA_3Hm5RNM18wwGOq0yYNIxzl4gt_Xjbaw",
  "AIzaSyAu7b7qTB8UK_s6zV4DeE2bbYr0ACxyHbs",
  "AIzaSyBabAY1FFEWcNMs0p4KE_lQb4jo1ttq2CM",
  "AIzaSyCS6BelDTp-2z5ijR0ty9YAPggMR5ZTkaY",
];

// Filter out any placeholder or empty keys to prevent unnecessary API calls.
const availableKeys = API_KEYS.filter(key => key && !key.startsWith('PASTE_YOUR_API_KEY'));

if (availableKeys.length === 0) {
    // This will be surfaced as an error in the geminiService.
    console.error("No valid API keys found in services/apiKeyManager.ts. Please add your keys to the `API_KEYS` array.");
}


let currentIndex = 0;
// Tracks the starting point of a rotation cycle for a single logical request (e.g., one click of "Consult Oracle").
let startRotationIndex = 0; 

const apiKeyManager = {
  /**
   * Initializes the manager by setting a random starting key index to distribute load.
   */
  initialize() {
    if (availableKeys.length > 0) {
      currentIndex = Math.floor(Math.random() * availableKeys.length);
      startRotationIndex = currentIndex;
    }
  },

  /**
   * Gets the current API key.
   * @returns The current key string, or null if no keys are available.
   */
  getCurrentKey(): string | null {
    if (availableKeys.length === 0) return null;
    return availableKeys[currentIndex];
  },

  /**
   * Rotates to the next key in the list.
   * @returns `true` if a new, untried key is now active for the current cycle, 
   * or `false` if all available keys have been tried in this rotation cycle.
   */
  rotateKey(): boolean {
    if (availableKeys.length <= 1) return false; // Cannot rotate if only one or zero keys.
    
    // Move to the next index
    currentIndex = (currentIndex + 1) % availableKeys.length;

    // If we've looped back to where this request cycle started, we've tried all available keys.
    if (currentIndex === startRotationIndex) {
      return false;
    }
    
    return true;
  },

  /**
   * Resets the rotation tracking for a new top-level API request.
   * This ensures that each user action (like 'Consult Oracle') gets a full cycle of keys to try.
   */
  resetRotationCycle() {
      if (availableKeys.length > 0) {
        startRotationIndex = currentIndex;
      }
  }
};

apiKeyManager.initialize();

export default apiKeyManager;
