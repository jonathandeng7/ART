import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ImageAnalysisData {
  id: string;
  image_name: string;
  analysis_type: string;
  descriptions: string[];
  metadata: {
    imageUri?: string;
    artist?: string;
    genre?: string;
    historicalPrompt?: string;
    immersivePrompt?: string;
    emotions?: string[];
    audioUri?: string | null;
  };
  image_url?: string;
  image_base64?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAnalysisRequest {
  image_url?: string;
  image_base64?: string;
  image_name: string;
  analysis_type: string;
  descriptions: string[];
  metadata?: Record<string, any>;
}

export class ArtBeyondSightAPI {
  // Create or update image analysis
  static async createAnalysis(
    data: CreateAnalysisRequest,
  ): Promise<ImageAnalysisData> {
    try {
      console.log("📤 Sending to API:", {
        ...data,
        image_base64: data.image_base64
          ? `${data.image_base64.substring(0, 50)}... (${data.image_base64.length} chars)`
          : "none",
      });
      const response = await axios.post(`${API_URL}/api/image-analysis`, data);
      console.log("✅ API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ API Error:", error);
      if (axios.isAxiosError(error)) {
        console.error("Response status:", error.response?.status);
        console.error("Response data:", error.response?.data);
      }
      throw error;
    }
  }

  // Get all analyses
  static async getAllAnalyses(
    analysisType?: string,
    limit: number = 50,
  ): Promise<ImageAnalysisData[]> {
    const params = new URLSearchParams();
    if (analysisType) params.append("analysis_type", analysisType);
    params.append("limit", limit.toString());

    const response = await axios.get(`${API_URL}/api/image-analysis?${params}`);
    return response.data;
  }

  // Get analysis by ID
  static async getAnalysisById(id: string): Promise<ImageAnalysisData> {
    const response = await axios.get(`${API_URL}/api/image-analysis/${id}`);
    return response.data;
  }

  // Search analyses by name
  static async searchAnalysesByName(
    name: string,
  ): Promise<ImageAnalysisData[]> {
    const response = await axios.get(
      `${API_URL}/api/image-analysis/search/${encodeURIComponent(name)}`,
    );
    return response.data;
  }

  // Find by painting name
  static async findByPaintingName(
    paintingName: string,
  ): Promise<ImageAnalysisData | null> {
    try {
      const analyses = await this.searchAnalysesByName(paintingName);
      return (
        analyses.find(
          (a) => a.image_name.toLowerCase() === paintingName.toLowerCase(),
        ) || null
      );
    } catch {
      return null;
    }
  }

  // Find by image URI
  static async findByImageUri(
    imageUri: string,
  ): Promise<ImageAnalysisData | null> {
    try {
      const analyses = await this.getAllAnalyses();
      return analyses.find((a) => a.metadata?.imageUri === imageUri) || null;
    } catch {
      return null;
    }
  }

  // Health check
  static async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await axios.get(`${API_URL}/api/health`);
    return response.data;
  }
}
