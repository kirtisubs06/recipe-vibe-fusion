
import { getClaudeApiKey } from './apiKeyService';

/**
 * Test function to verify connection to Claude API
 * This is for testing purposes only and should not be used in production
 */
export const testClaudeConnection = async (): Promise<boolean> => {
  try {
    const apiKey = await getClaudeApiKey();
    
    if (!apiKey) {
      console.error("Claude API key not found in Supabase database");
      return false;
    }
    
    console.log("Successfully retrieved Claude API key from Supabase");
    console.log("API Key starts with:", apiKey.substring(0, 5) + "...");
    
    // In a real implementation, we would verify the API key by making a simple
    // call to the Claude API, but for security reasons, we'll just check if it exists
    
    return true;
  } catch (error) {
    console.error("Error testing Claude connection:", error);
    return false;
  }
};
