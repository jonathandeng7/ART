/**
 * Navigator API (GPT-4 Vision) Integration
 * Provides AI-powered image analysis for artworks, monuments, and landscapes
 */

const NAVIGATOR_API_KEY = process.env.NEXT_PUBLIC_NAVIGATOR_API_KEY;
const NAVIGATOR_BASE_URL =
  process.env.NEXT_PUBLIC_NAVIGATOR_BASE_URL || "https://api.ai.it.ufl.edu/v1";

export interface NavigatorAnalysisResult {
  title: string;
  artist: string;
  year?: string;
  type: string;
  description: string;
  historicalContext?: string;
  styleAnalysis?: string;
  emotions: string[];
}

/**
 * Analyze artwork using Navigator API (GPT-4 Vision)
 */
export async function analyzeArtwork(
  imageDataUrl: string,
  mode: "museum" | "monuments" | "landscape",
): Promise<NavigatorAnalysisResult> {
  if (
    !NAVIGATOR_API_KEY ||
    NAVIGATOR_API_KEY === "your-navigator-api-key-here"
  ) {
    console.warn("Navigator API key not configured");
    throw new Error("Navigator API key not configured");
  }

  const prompts = {
    museum: `Analyze this artwork in detail. Provide:
1. Title (if recognizable, otherwise describe it)
2. Artist name (if known, otherwise "Unknown Artist")
3. Approximate year or period
4. Art type/medium (Painting, Sculpture, etc.)
5. Detailed description of what you see
6. Historical context and significance
7. Style analysis (art movement, techniques, etc.)
8. Emotional themes (list 3-5 emotions the artwork evokes)

Format your response as JSON with keys: title, artist, year, type, description, historicalContext, styleAnalysis, emotions (array)`,

    monuments: `Analyze this monument or landmark. Provide:
1. Name of the monument
2. Architect or builder (if known)
3. Year built or time period
4. Type (Building, Monument, Memorial, etc.)
5. Detailed description of the structure
6. Historical significance and context
7. Architectural style and features
8. Cultural/emotional significance (3-5 themes)

Format your response as JSON with keys: title, artist, year, type, description, historicalContext, styleAnalysis, emotions (array)`,

    landscape: `Analyze this natural landscape or scene. Provide:
1. Title/description of the location (if identifiable)
2. Geographic location (if recognizable, otherwise "Natural Scene")
3. Approximate time of day or season (if visible)
4. Type (Mountain, Forest, Beach, etc.)
5. Detailed description of the scene
6. Natural features and characteristics
7. Atmospheric and visual qualities
8. Emotional themes (list 3-5 emotions evoked)

Format your response as JSON with keys: title, artist (use "Nature" or location), year (use season/time), type, description, historicalContext, styleAnalysis, emotions (array)`,
  };

  try {
    const response = await fetch(`${NAVIGATOR_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${NAVIGATOR_API_KEY}`,
      },
      body: JSON.stringify({
        model: "mistral-small-3.1",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompts[mode] },
              { type: "image_url", image_url: { url: imageDataUrl } },
            ],
          },
        ],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Navigator API error: ${error.error?.message || response.statusText}`,
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No response from Navigator API");
    }

    // Try to parse JSON response
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          title: parsed.title || "Untitled",
          artist: parsed.artist || "Unknown",
          year: parsed.year,
          type: parsed.type || "Artwork",
          description: parsed.description || content,
          historicalContext: parsed.historicalContext,
          styleAnalysis: parsed.styleAnalysis,
          emotions: parsed.emotions || ["contemplative"],
        };
      }
    } catch (parseError) {
      console.warn("Failed to parse JSON, using raw content");
    }

    // Fallback: use raw content
    return {
      title: "Analyzed Artwork",
      artist: "Unknown",
      type:
        mode === "museum"
          ? "Artwork"
          : mode === "monuments"
            ? "Monument"
            : "Landscape",
      description: content,
      emotions: ["contemplative", "inspiring"],
    };
  } catch (error) {
    console.error("Navigator API analysis failed:", error);
    throw error;
  }
}

/**
 * Quick metadata extraction for faster initial response
 */
export async function getQuickMetadata(
  imageDataUrl: string,
): Promise<{ title: string; artist: string; year?: string }> {
  if (!NAVIGATOR_API_KEY) {
    throw new Error("Navigator API key not configured");
  }

  try {
    const response = await fetch(`${NAVIGATOR_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${NAVIGATOR_API_KEY}`,
      },
      body: JSON.stringify({
        model: "mistral-small-3.1",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Quickly identify: title, artist, and year. Respond in JSON format only: {title, artist, year}",
              },
              {
                type: "image_url",
                image_url: {
                  url: imageDataUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 100,
      }),
    });

    if (!response.ok) throw new Error("Quick metadata failed");

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    const jsonMatch = content?.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return { title: "Artwork", artist: "Unknown" };
  } catch (error) {
    console.error("Quick metadata failed:", error);
    return { title: "Artwork", artist: "Unknown" };
  }
}
