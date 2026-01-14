// Add this as a separate utility file: src/utils/apiThrottling.ts

/**
 * A utility class to manage API rate limiting across your application
 */
export class ApiRateLimiter {
    private requestTimestamps: number[] = [];
    private maxRequestsPerMinute: number;
    private timeWindow: number;
    private minTimeBetweenRequests: number;
    private apiName: string;
  
    constructor(
      apiName: string,
      maxRequestsPerMinute = 10,
      minTimeBetweenRequests = 5000,
      timeWindow = 60 * 1000
    ) {
      this.apiName = apiName;
      this.maxRequestsPerMinute = maxRequestsPerMinute;
      this.timeWindow = timeWindow;
      this.minTimeBetweenRequests = minTimeBetweenRequests;
    }
  
    /**
     * Calculates how long to wait before making the next API request
     */
    public getThrottleTime(): number {
      const now = Date.now();
      
      // Remove timestamps older than our time window
      this.requestTimestamps = this.requestTimestamps.filter(
        timestamp => now - timestamp < this.timeWindow
      );
      
      // Check if we've made too many requests in our time window
      if (this.requestTimestamps.length >= this.maxRequestsPerMinute) {
        // Wait until the oldest request falls out of our window
        const oldestTimestamp = this.requestTimestamps[0];
        const timeToWait = oldestTimestamp + this.timeWindow - now;
        return Math.max(timeToWait, this.minTimeBetweenRequests);
      }
      
      // Check if we need to wait between requests
      if (this.requestTimestamps.length > 0) {
        const lastRequestTime = this.requestTimestamps[this.requestTimestamps.length - 1];
        const timeSinceLastRequest = now - lastRequestTime;
        if (timeSinceLastRequest < this.minTimeBetweenRequests) {
          return this.minTimeBetweenRequests - timeSinceLastRequest;
        }
      }
      
      return 0;
    }
  
    /**
     * Records that a request was made
     */
    public recordRequest(): void {
      this.requestTimestamps.push(Date.now());
    }
  
    /**
     * Wrapper function that handles throttling before making an API request
     */
    public async throttledRequest<T>(
      requestFn: () => Promise<T>,
      options: {
        maxRetries?: number;
        retryDelay?: number;
        retryMultiplier?: number;
        shouldRetry?: (error: any) => boolean;
      } = {}
    ): Promise<T> {
      const {
        maxRetries = 5,
        retryDelay = 10000,
        retryMultiplier = 1.5,
        shouldRetry = (error) => {
          // Default retry condition for rate limits
          return error?.response?.status === 429 || 
                 (error?.message && error.message.includes('429'));
        }
      } = options;
  
      // Apply pre-emptive rate limiting
      const throttleTime = this.getThrottleTime();
      if (throttleTime > 0) {
        console.log(`[${this.apiName}] Throttling request for ${throttleTime}ms before sending`);
        await new Promise(resolve => setTimeout(resolve, throttleTime));
      }
      
      // Track this request timestamp
      this.recordRequest();
      
      let attempts = 0;
      let currentDelay = retryDelay;
  
      while (attempts < maxRetries) {
        try {
          attempts++;
          return await requestFn();
        } catch (error: any) {
          if (shouldRetry(error) && attempts < maxRetries) {
            // Extract retry-after header if available
            const retryAfter = error?.response?.headers?.['retry-after'];
            const waitTime = retryAfter ? 
              Math.max(parseInt(retryAfter) * 1000, currentDelay) : 
              currentDelay;
            
            console.log(`[${this.apiName}] Rate limit hit, attempt ${attempts}/${maxRetries}, waiting ${waitTime/1000}s`);
            
            await new Promise(resolve => setTimeout(resolve, waitTime));
            
            // Increase delay for next retry with some jitter
            currentDelay = Math.min(300000, currentDelay * (retryMultiplier + Math.random() * 0.3));
            continue;
          }
          
          // Either not a rate limit error or we've exhausted retries
          throw error;
        }
      }
  
      throw new Error(`[${this.apiName}] Maximum retry attempts (${maxRetries}) reached`);
    }
  }
  
  // Create a singleton instance for TwelveLabs
  export const twelveLabsLimiter = new ApiRateLimiter(
    'TwelveLabs',
    5,       // Max 5 requests per minute (adjust based on actual limits)
    10000    // Min 10 seconds between requests
  );
  
  // Example usage
  export async function callTwelveLabsApi<T>(
    apiFunction: () => Promise<T>
  ): Promise<T> {
    return twelveLabsLimiter.throttledRequest(apiFunction, {
      maxRetries: 5,
      retryDelay: 15000,  // Start with 15 seconds
      retryMultiplier: 2,  // Double the delay on each retry
      shouldRetry: (error) => {
        // Comprehensive check for rate limit errors
        return error?.status === 429 || 
               error?.response?.status === 429 || 
               error?.errordata?.status === 429 || 
               (error?.message && error.message.includes('429')) ||
               (error?.config?.status === 429);
      }
    });
  }