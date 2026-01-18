// Example of how your teammate can send image analysis data to your API
// This would be in their TSX/TypeScript code

interface ImageAnalysisData {
  image_name: string;
  analysis_type: string;
  descriptions: string[];
  metadata?: any;
  image_url?: string;
  image_base64?: string;
}

export async function submitImageAnalysis(analysisData: ImageAnalysisData) {
  try {
    const response = await fetch('http://localhost:8000/api/image-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(analysisData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Analysis saved successfully:', result);
    return result;
  } catch (error) {
    console.error('Error submitting analysis:', error);
    throw error;
  }
}

// Example usage:
/*
const analysisData = {
  image_name: "mona_lisa.jpg",
  analysis_type: "museum",
  descriptions: [
    "A portrait painting of a woman with an enigmatic smile",
    "The subject has dark hair and is wearing Renaissance-era clothing",
    "The background shows a distant landscape with winding paths"
  ],
  metadata: {
    artist: "Leonardo da Vinci",
    location: "Louvre Museum",
    year: "1503-1519",
    tags: ["portrait", "renaissance", "famous"]
  }
};

submitImageAnalysis(analysisData);
*/