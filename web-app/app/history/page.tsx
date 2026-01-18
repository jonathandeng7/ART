"use client";

import { ArtBeyondSightAPI, ImageAnalysisData } from "@/lib/api";
import { Calendar, Home, RefreshCw, Search } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function HistoryPage() {
  const router = useRouter();
  const [analyses, setAnalyses] = useState<ImageAnalysisData[]>([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState<ImageAnalysisData[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadAnalyses();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = analyses.filter(
        (analysis) =>
          analysis.image_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          analysis.descriptions.some((desc) =>
            desc.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
      );
      setFilteredAnalyses(filtered);
    } else {
      setFilteredAnalyses(analyses);
    }
  }, [searchQuery, analyses]);

  const loadAnalyses = async () => {
    try {
      setLoading(true);
      const data = await ArtBeyondSightAPI.getAllAnalyses();
      setAnalyses(data);
      console.log(`📊 Loaded ${data.length} analyses from database`);
    } catch (error) {
      console.error("Failed to load analyses:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalyses();
    setRefreshing(false);
  };

  const viewAnalysisDetails = (item: ImageAnalysisData) => {
    const queryParams = new URLSearchParams({
      imageUri: item.metadata?.imageUri || "",
      title: item.image_name,
      artist: item.metadata?.artist || "Unknown Artist",
      type: item.metadata?.genre || "",
      description: item.descriptions[0] || "",
      historicalPrompt: item.metadata?.historicalPrompt || "",
      immersivePrompt: item.metadata?.immersivePrompt || "",
      emotions: JSON.stringify(item.metadata?.emotions || []),
      audioUri: item.metadata?.audioUri || "",
      mode: item.analysis_type,
    });

    router.push(`/result?${queryParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Analysis History
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                {filteredAnalyses.length}{" "}
                {filteredAnalyses.length === 1 ? "analysis" : "analyses"}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onRefresh}
                disabled={refreshing}
                className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors disabled:opacity-50"
                aria-label="Refresh"
              >
                <RefreshCw
                  className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
                />
              </button>
              <button
                onClick={() => router.push("/")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
              >
                <Home className="w-5 h-5" />
                Home
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white" />
          </div>
        ) : filteredAnalyses.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl">
              {searchQuery
                ? "No analyses found matching your search"
                : "No analyses yet"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => router.push("/")}
                className="mt-6 px-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors"
              >
                Start Analyzing
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAnalyses.map((item) => (
              <div
                key={item.id}
                onClick={() => viewAnalysisDetails(item)}
                className="group cursor-pointer bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700 hover:border-gray-600 transition-all hover:scale-105 hover:shadow-xl"
              >
                {/* Thumbnail */}
                {item.metadata?.imageUri && (
                  <div className="relative w-full aspect-video bg-gray-900">
                    <Image
                      src={item.metadata.imageUri}
                      alt={item.image_name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-white font-semibold text-lg mb-1 line-clamp-1">
                    {item.image_name}
                  </h3>

                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`
                      px-2 py-1 rounded text-xs font-medium
                      ${
                        item.analysis_type === "museum"
                          ? "bg-museum/20 text-blue-300"
                          : item.analysis_type === "monuments"
                            ? "bg-monuments/20 text-amber-300"
                            : "bg-landscape/20 text-green-300"
                      }
                    `}
                    >
                      {item.analysis_type}
                    </span>
                  </div>

                  <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                    {item.descriptions[0]}
                  </p>

                  <div className="flex items-center gap-2 text-gray-500 text-xs">
                    <Calendar className="w-4 h-4" />
                    {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
