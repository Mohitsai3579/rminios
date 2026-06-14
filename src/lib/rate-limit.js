export class RateLimiter {
  constructor(limit = 10, windowMs = 60000) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  /**
   * Check if the user/IP has exceeded the rate limit
   * @param {string} identifier - User ID or IP address
   * @returns {boolean} - True if allowed, false if rate limited
   */
  check(identifier) {
    const now = Date.now();
    
    // Clean up expired entries
    for (const [key, timestamp] of this.requests.entries()) {
      if (now - timestamp > this.windowMs) {
        this.requests.delete(key);
      }
    }

    // Count current requests for this identifier within the window
    let count = 0;
    const identifierPrefix = `${identifier}_`;
    for (const [key, timestamp] of this.requests.entries()) {
      if (key.startsWith(identifierPrefix) && now - timestamp < this.windowMs) {
        count++;
      }
    }

    if (count >= this.limit) {
      return false; // Rate limited
    }

    // Add new request
    const uniqueKey = `${identifierPrefix}${now}_${Math.random()}`;
    this.requests.set(uniqueKey, now);
    return true; // Allowed
  }
}

// Global instances for different endpoints
export const aiRateLimiter = new RateLimiter(5, 60000); // 5 requests per minute for AI
export const defaultRateLimiter = new RateLimiter(30, 60000); // 30 requests per minute for generic API
