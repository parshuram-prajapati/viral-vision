import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface CreatorContext {
  goal: string;
  niche: string;
  targetAudience: string;
  emotion: string;
  platform: string;
}

export interface AnalysisResult {
  videoAnalysis: {
    hookStrength: string;
    engagement: string;
    visuals: string;
    pacing: string;
  };
  scriptAnalysis: {
    clarity: string;
    storytelling: string;
    retentionPoints: string;
    cta: string;
  };
  contentStrategy: {
    uniqueness: string;
    viralityPotential: string;
    audienceMatch: string;
  };
  audiencePsychology: {
    scrollStopping: string;
    relatability: string;
    curiosity: string;
    valueDelivery: string;
  };
  improvementSuggestions: {
    hookRewrites: string[];
    scriptImprovements: string;
    technicalSuggestions: string;
  };
  viralityBoost: {
    titles: string[];
    thumbnailIdeas: string[];
    openingLines: string[];
    emotionalTriggers: string[];
  };
  honestFeedback: string;
}

export interface InstagramInsights {
  retention: number;
  skipRate: number;
  averageWatchTime: number;
  totalViews: number;
  engagementRate: number;
  recentPosts: any[];
}

export interface InstagramAnalysis {
  overallScore: number;
  keyInsights: string[];
  retentionAdvice: string;
  skipRateAdvice: string;
  contentSuggestions: string[];
  viralPotential: string;
}

export interface CompetitorData {
  title: string;
  views: string;
  uploadDate: string;
  duration: string;
  description: string;
  tags: string[];
  thumbnailUrl: string;
}

export interface CompetitorAnalysis {
  viralTechniques: string[];
  hookAnalysis: string;
  pacingSecrets: string;
  audienceRetentionStrategy: string;
  howToReplicate: string;
  estimatedEffort: string;
}

export interface RoadmapStep {
  title: string;
  description: string;
  tasks: string[];
  milestone: string;
}

export interface BeginnerRoadmap {
  mindsetShift: string;
  phases: RoadmapStep[];
  essentialTools: string[];
  commonPitfalls: string[];
  first30DaysGoal: string;
}

export async function analyzeCompetitor(data: CompetitorData, context: CreatorContext): Promise<CompetitorAnalysis> {
  const prompt = `
    You are a world-class Viral Growth Engineer. Analyze this competitor's video to find the "secret sauce".
    
    COMPETITOR VIDEO DATA:
    - Title: ${data.title}
    - Views: ${data.views}
    - Duration: ${data.duration}
    - Description: ${data.description}
    - Tags: ${data.tags.join(", ")}
    
    MY CONTEXT:
    - Niche: ${context.niche}
    - Target Audience: ${context.targetAudience}
    
    Provide a deep technical analysis of why this video worked and how I can replicate its success without copying it.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          viralTechniques: { type: Type.ARRAY, items: { type: Type.STRING } },
          hookAnalysis: { type: Type.STRING },
          pacingSecrets: { type: Type.STRING },
          audienceRetentionStrategy: { type: Type.STRING },
          howToReplicate: { type: Type.STRING },
          estimatedEffort: { type: Type.STRING },
        },
        required: ["viralTechniques", "hookAnalysis", "pacingSecrets", "audienceRetentionStrategy", "howToReplicate", "estimatedEffort"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}

export async function generateBeginnerRoadmap(context: CreatorContext): Promise<BeginnerRoadmap> {
  const prompt = `
    You are a mentor for a beginner content creator who is starting from ABSOLUTE ZERO.
    They know nothing about editing, cameras, or algorithms.
    
    CREATOR CONTEXT:
    - Niche: ${context.niche}
    - Target Audience: ${context.targetAudience}
    - Goal: ${context.goal}
    
    Create a step-by-step roadmap for their first 90 days. 
    Be encouraging but realistic. Focus on "Mindset First".
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          mindsetShift: { type: Type.STRING },
          phases: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                tasks: { type: Type.ARRAY, items: { type: Type.STRING } },
                milestone: { type: Type.STRING },
              },
              required: ["title", "description", "tasks", "milestone"],
            },
          },
          essentialTools: { type: Type.ARRAY, items: { type: Type.STRING } },
          commonPitfalls: { type: Type.ARRAY, items: { type: Type.STRING } },
          first30DaysGoal: { type: Type.STRING },
        },
        required: ["mindsetShift", "phases", "essentialTools", "commonPitfalls", "first30DaysGoal"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}

export async function analyzeInstagramMetrics(insights: InstagramInsights, context: CreatorContext): Promise<InstagramAnalysis> {
  const prompt = `
    You are an expert Instagram Growth Strategist and Data Analyst.
    Analyze the following Instagram insights for a creator.
    
    CREATOR CONTEXT:
    - Niche: ${context.niche}
    - Target Audience: ${context.targetAudience}
    - Goal: ${context.goal}
    
    INSTAGRAM INSIGHTS:
    - Average Retention: ${insights.retention}%
    - Skip Rate: ${insights.skipRate}%
    - Average Watch Time: ${insights.averageWatchTime}s
    - Total Views: ${insights.totalViews}
    - Engagement Rate: ${insights.engagementRate}%
    
    Provide a data-driven analysis with specific improvements.
    Be brutally honest about why people are skipping or dropping off.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallScore: { type: Type.NUMBER },
          keyInsights: { type: Type.ARRAY, items: { type: Type.STRING } },
          retentionAdvice: { type: Type.STRING },
          skipRateAdvice: { type: Type.STRING },
          contentSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          viralPotential: { type: Type.STRING },
        },
        required: ["overallScore", "keyInsights", "retentionAdvice", "skipRateAdvice", "contentSuggestions", "viralPotential"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}

export async function analyzeContent(context: CreatorContext, content: string): Promise<AnalysisResult> {
  const prompt = `
    You are an expert YouTube content strategist, video editor, storytelling coach, and viral growth analyst.
    Analyze the following creator's content based on their context.
    
    CREATOR CONTEXT:
    - Goal: ${context.goal}
    - Niche: ${context.niche}
    - Target Audience: ${context.targetAudience}
    - Emotion: ${context.emotion}
    - Platform: ${context.platform}
    
    CONTENT (Script or Description):
    ${content}
    
    Provide a brutally honest, high-value analysis. Do not be polite for the sake of it.
    Explain WHY something is weak and give better alternatives.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          videoAnalysis: {
            type: Type.OBJECT,
            properties: {
              hookStrength: { type: Type.STRING },
              engagement: { type: Type.STRING },
              visuals: { type: Type.STRING },
              pacing: { type: Type.STRING },
            },
            required: ["hookStrength", "engagement", "visuals", "pacing"],
          },
          scriptAnalysis: {
            type: Type.OBJECT,
            properties: {
              clarity: { type: Type.STRING },
              storytelling: { type: Type.STRING },
              retentionPoints: { type: Type.STRING },
              cta: { type: Type.STRING },
            },
            required: ["clarity", "storytelling", "retentionPoints", "cta"],
          },
          contentStrategy: {
            type: Type.OBJECT,
            properties: {
              uniqueness: { type: Type.STRING },
              viralityPotential: { type: Type.STRING },
              audienceMatch: { type: Type.STRING },
            },
            required: ["uniqueness", "viralityPotential", "audienceMatch"],
          },
          audiencePsychology: {
            type: Type.OBJECT,
            properties: {
              scrollStopping: { type: Type.STRING },
              relatability: { type: Type.STRING },
              curiosity: { type: Type.STRING },
              valueDelivery: { type: Type.STRING },
            },
            required: ["scrollStopping", "relatability", "curiosity", "valueDelivery"],
          },
          improvementSuggestions: {
            type: Type.OBJECT,
            properties: {
              hookRewrites: { type: Type.ARRAY, items: { type: Type.STRING } },
              scriptImprovements: { type: Type.STRING },
              technicalSuggestions: { type: Type.STRING },
            },
            required: ["hookRewrites", "scriptImprovements", "technicalSuggestions"],
          },
          viralityBoost: {
            type: Type.OBJECT,
            properties: {
              titles: { type: Type.ARRAY, items: { type: Type.STRING } },
              thumbnailIdeas: { type: Type.ARRAY, items: { type: Type.STRING } },
              openingLines: { type: Type.ARRAY, items: { type: Type.STRING } },
              emotionalTriggers: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["titles", "thumbnailIdeas", "openingLines", "emotionalTriggers"],
          },
          honestFeedback: { type: Type.STRING },
        },
        required: [
          "videoAnalysis",
          "scriptAnalysis",
          "contentStrategy",
          "audiencePsychology",
          "improvementSuggestions",
          "viralityBoost",
          "honestFeedback",
        ],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}
