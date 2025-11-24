import { Type } from "@google/genai";

// MOCK SERVICE - No API Key required as per user request
// This ensures the app works 100% interactively without configuration.

export const generatePinDetails = async (topic: string): Promise<{ title: string; description: string; tags: string[] }> => {
  // Simulate network delay for realism
  await new Promise(resolve => setTimeout(resolve, 600));

  return {
    title: topic.charAt(0).toUpperCase() + topic.slice(1),
    description: `Discover the hidden beauty of ${topic}. This curated piece explores the delicate balance between modern aesthetics and timeless design. Perfect for your inspiration board.`,
    tags: [topic.split(' ')[0], "aesthetic", "design", "inspiration", "trending"]
  };
};

export const generateRelatedComments = async (pinTitle: string): Promise<string[]> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return [
        "This is exactly what I was looking for! 😍", 
        "The colors in this are absolutely stunning.", 
        "Saving this for my future project.",
        "Can anyone tell me where the source is from?",
        "This vibe is everything ✨"
    ];
};

export const getSearchSuggestions = async (query: string): Promise<string[]> => {
    if (!query) return [];
    // Simple mock logic based on query
    return [
        `${query} aesthetic`, 
        `${query} photography`, 
        `${query} design ideas`, 
        `${query} modern`, 
        `best ${query} 2025`
    ];
};

export const getPersonalizedTopics = async (interests: string[]): Promise<string[]> => {
    // Return mock topics that feel personalized
    const baseTopics = ["Eco Architecture", "Neon Portraits", "Sustainable Living", "Cyber Fashion", "Abstract 3D"];
    return baseTopics;
};