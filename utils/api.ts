import { Platform } from "react-native";
import { AnalysisResult } from "./analyzeImageWithNavigator";

// Automatically detect the correct URL based on platform
const getApiBaseUrl = () => {
  const PRODUCTION_URL = "https://your-backend-url.com"; // TODO: Update for production

  if (__DEV__) {
    if (Platform.OS === "android") {
      return "http://10.0.2.2:8000";
    }
    return "http://172.20.10.4:8000";
  }

  return PRODUCTION_URL;
};

const API_BASE_URL = getApiBaseUrl();

console.log(`🔗 API Base URL: ${API_BASE_URL}`);

export interface ImageAnalysisData {
  id?: string;
  image_name: string;
  analysis_type: string;
  descriptions: string[];
  metadata: {
    creator?: string;
    category?: string;
    imageUri?: string;
    audioUri?: string;
    historicalPrompt?: string;
    immersivePrompt?: string;
    type?: string;
    emotions?: string[];
    mode?: string;
    [key: string]: any;
  };
  created_at?: string;
  updated_at?: string;
}

export class ARTapi {
  /**
   * Save analysis to database (works for all modes)
   */
  static async saveAnalysis(data: AnalysisResult): Promise<ImageAnalysisData> {
    try {
      const payload: ImageAnalysisData = {
        image_name: data.name,
        analysis_type: data.mode,
        descriptions: [data.historicalPrompt, data.immersivePrompt],
        metadata: {
          creator: data.creator,
          category: data.category,
          imageUri: data.imageUri,
          audioUri: data.audioUri || undefined,
          historicalPrompt: data.historicalPrompt,
          immersivePrompt: data.immersivePrompt,
          mode: data.mode,
          type:
            data.mode === "museum"
              ? "painting"
              : data.mode === "monuments"
                ? "monument"
                : "landscape",
        },
      };

      console.log(`📤 Saving ${data.mode} analysis to database:`, payload);

      const response = await fetch(`${API_BASE_URL}/api/image-analysis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log("✅ Saved to database with ID:", result.id);
      return result;
    } catch (error) {
      console.error("❌ Failed to save analysis:", error);
      throw error;
    }
  }

  /**
   * Legacy method for backwards compatibility
   */
  static async saveMuseumAnalysis(data: {
    paintingName: string;
    artist: string;
    genre: string;
    historicalPrompt: string;
    immersivePrompt: string;
    audioUri: string | null;
    imageUri: string;
  }): Promise<ImageAnalysisData> {
    const analysisResult: AnalysisResult = {
      name: data.paintingName,
      creator: data.artist,
      category: data.genre,
      historicalPrompt: data.historicalPrompt,
      immersivePrompt: data.immersivePrompt,
      audioUri: data.audioUri,
      imageUri: data.imageUri,
      mode: "museum",
    };
    return this.saveAnalysis(analysisResult);
  }

  /**
   * Get all analyses (with optional filter by type)
   */
  static async getAllAnalyses(
    analysisType?: string,
  ): Promise<ImageAnalysisData[]> {
    try {
      const url = analysisType
        ? `${API_BASE_URL}/api/image-analysis?analysis_type=${analysisType}`
        : `${API_BASE_URL}/api/image-analysis`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch analyses: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("❌ Failed to fetch analyses:", error);
      throw error;
    }
  }

  /**
   * Get specific analysis by ID
   */
  static async getAnalysisById(id: string): Promise<ImageAnalysisData> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/image-analysis/${id}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch analysis: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("❌ Failed to fetch analysis:", error);
      throw error;
    }
  }

  /**
   * Search analyses by name
   */
  static async searchAnalysesByName(
    name: string,
  ): Promise<ImageAnalysisData[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/image-analysis/search/${encodeURIComponent(name)}`,
      );

      if (!response.ok) {
        throw new Error(`Failed to search analyses: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("❌ Failed to search analyses:", error);
      throw error;
    }
  }

  /**
   * Find cached analysis by name and mode (for caching)
   * Returns the first match or null if not found
   */
  static async findByName(
    name: string,
    mode: "museum" | "monuments" | "landscape",
  ): Promise<ImageAnalysisData | null> {
    try {
      const results = await this.searchAnalysesByName(name);

      // Filter by mode and return first match
      const match = results.find((item) => item.analysis_type === mode);
      return match || null;
    } catch (error) {
      console.warn("⚠️  Cache lookup by name failed:", error);
      return null;
    }
  }

  /**
   * Find cached analysis by image URI (for caching)
   * Returns the first match or null if not found
   */
  static async findByImageUri(
    imageUri: string,
  ): Promise<ImageAnalysisData | null> {
    try {
      // Get all analyses and search through metadata
      const allAnalyses = await this.getAllAnalyses();

      const match = allAnalyses.find(
        (item) => item.metadata?.imageUri === imageUri,
      );

      return match || null;
    } catch (error) {
      console.warn("⚠️  Cache lookup by URI failed:", error);
      return null;
    }
  }

  /**
   * Update existing analysis
   */
  static async updateAnalysis(
    id: string,
    updates: {
      descriptions?: string[];
      metadata?: any;
    },
  ): Promise<ImageAnalysisData> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/image-analysis/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Failed to update analysis: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("❌ Failed to update analysis:", error);
      throw error;
    }
  }

  /**
   * Delete analysis
   */
  static async deleteAnalysis(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/image-analysis/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete analysis: ${response.status}`);
      }

      console.log("✅ Analysis deleted");
    } catch (error) {
      console.error("❌ Failed to delete analysis:", error);
      throw error;
    }
  }
}

export default ARTapi;
