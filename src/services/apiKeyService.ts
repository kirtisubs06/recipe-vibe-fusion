
import { supabase } from '@/integrations/supabase/client';

/**
 * Fetches the Claude API key from the Supabase database
 * @returns The Claude API key as a string or null if not found
 */
export const getClaudeApiKey = async (): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('API KEY')
      .select('key')
      .single();
    
    if (error) {
      console.error("Error fetching Claude API key:", error);
      return null;
    }
    
    return data?.key || null;
  } catch (error) {
    console.error("Exception fetching Claude API key:", error);
    return null;
  }
};
