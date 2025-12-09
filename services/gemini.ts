import { GoogleGenAI, Type } from "@google/genai";
import { Note, AIActionType } from '../types';

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key not found in environment variables");
    throw new Error("API Key is missing. Please ensure process.env.API_KEY is available.");
  }
  return new GoogleGenAI({ apiKey });
};

const MODEL_NAME = 'gemini-2.5-flash';

export const generateNoteTitle = async (content: string): Promise<string> => {
  if (!content.trim()) return "Untitled Note";
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Generate a short, concise, and descriptive title (max 6 words) for the following note content. Do not include quotes or labels. Content: ${content.substring(0, 1000)}`,
    });
    return response.text?.trim() || "Untitled Note";
  } catch (error) {
    console.error("Error generating title:", error);
    return "Untitled Note";
  }
};

export const generateNoteTags = async (content: string): Promise<string[]> => {
  if (!content.trim()) return [];
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Analyze the following note content and generate up to 5 relevant tags. Return the result as a JSON array of strings. Content: ${content.substring(0, 2000)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        }
      }
    });
    
    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating tags:", error);
    return [];
  }
};

export const processAIAction = async (action: AIActionType, content: string, selectedText?: string): Promise<string> => {
  const ai = getAIClient();
  const textToProcess = selectedText || content;

  if (!textToProcess.trim()) throw new Error("No text to process");

  let prompt = "";
  
  switch (action) {
    case 'summarize':
      prompt = `Summarize the following text concisely in a few bullet points:\n\n${textToProcess}`;
      break;
    case 'fix_grammar':
      prompt = `Correct the grammar and spelling of the following text. Preserve the original meaning and tone. Return only the corrected text:\n\n${textToProcess}`;
      break;
    case 'elaborate':
      prompt = `Expand upon the following text, adding more detail and depth. Maintain a professional but creative tone:\n\n${textToProcess}`;
      break;
    default:
      throw new Error("Unknown action");
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    return response.text || "";
  } catch (error) {
    console.error(`Error processing ${action}:`, error);
    throw error;
  }
};
