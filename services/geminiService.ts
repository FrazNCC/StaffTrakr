import { GoogleGenAI } from "@google/genai";
import { Staff, EventLog, EventType } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const generateStaffReport = async (
  staff: Staff,
  logs: EventLog[],
  eventTypes: EventType[]
): Promise<string> => {
  const client = getClient();
  if (!client) {
    return "API Key not found. Please ensure the API_KEY environment variable is set.";
  }

  // Enrich logs with type names
  const enrichedLogs = logs.map(log => {
    const type = eventTypes.find(t => t.id === log.eventTypeId);
    return {
      date: log.date,
      type: type ? type.name : 'Unknown',
      impact: log.value,
      notes: log.notes
    };
  });

  const totalScore = enrichedLogs.reduce((acc, curr) => acc + curr.impact, 0);

  const prompt = `
    You are a professional HR assistant. Please analyze the following event log for a staff member named ${staff.name}.
    
    Context:
    - Positive values represent "usage" or "burden" (e.g., Sick Leave, Lateness).
    - Negative values represent "contribution" or "credit" (e.g., Covering classes).
    - A lower total score suggests higher contribution.
    - A higher total score suggests higher absence or usage.

    Data:
    Total Score: ${totalScore}
    Events:
    ${JSON.stringify(enrichedLogs, null, 2)}

    Please provide a concise, professional summary of their recent activity. Highlight patterns in their attendance or contributions. 
    Be constructive. If the score is negative, praise their extra effort. If high positive, suggest support.
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to generate report due to an API error.";
  }
};