
import { GoogleGenAI, Type } from '@google/genai';
import { SelectedSpice, OracleJudgement, Challenge } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const judgeDishSchema = {
  type: Type.OBJECT,
  properties: {
    dishName: {
      type: Type.STRING,
      description: "A creative, evocative name for the dish based on its ingredients and concept.",
    },
    description: {
      type: Type.STRING,
      description: "A poetic and vivid description of the dish's flavor profile and aroma, as if you are tasting it.",
    },
    score: {
      type: Type.NUMBER,
      description: "A numerical score out of 10 (e.g., 8.5) based on the balance and suitability of the spices for the dish concept.",
    },
    feedback: {
      type: Type.STRING,
      description: "Constructive feedback on how the dish could be improved or what makes it exceptional. Be specific about the spice interactions.",
    },
  },
  required: ["dishName", "description", "score", "feedback"],
};


export const getJudgementFromOracle = async (
  challenge: Challenge,
  spices: SelectedSpice[]
): Promise<OracleJudgement> => {
  try {
    const spiceList = spices.map(s => `- ${s.name}: ${s.quantity} part(s)`).join('\n');
    
    const prompt = `
A new culinary creation has been brought before you. 
The dish is based on the concept: '${challenge.title} - ${challenge.description}'.
The base ingredients are: '${challenge.base}'.

The creator has used the following divine spices:
${spiceList}

Based on this combination, please provide your divine judgment. Be creative, dramatic, and insightful. The dishName should be unique and sound legendary.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are 'The Oracle of Flavors,' an ancient, wise, and poetic connoisseur of Indian cuisine. You speak with grandeur and authority. Your purpose is to judge culinary creations submitted to you. Always respond with a JSON object that matches the provided schema.",
        responseMimeType: "application/json",
        responseSchema: judgeDishSchema,
      },
    });

    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);

    // Validate the result
    if (
      typeof result.dishName === 'string' &&
      typeof result.description === 'string' &&
      typeof result.score === 'number' &&
      typeof result.feedback === 'string'
    ) {
      return result;
    } else {
      throw new Error('Invalid JSON structure received from API.');
    }
  } catch (error) {
    console.error("Error getting judgement from Oracle:", error);
    // Provide a fallback error response
    return {
      dishName: "The Muddled Concoction",
      description: "The ether was disturbed, and the Oracle could not get a clear vision of your dish. The flavors are chaotic and unbalanced.",
      score: 2.1,
      feedback: "An error occurred while consulting the Oracle. Perhaps the cosmic energies are not aligned. Please try your offering again."
    };
  }
};
