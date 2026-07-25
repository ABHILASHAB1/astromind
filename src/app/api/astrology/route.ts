import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'Missing GEMINI_API_KEY' }, { status: 500 });
    }
    const ai = new GoogleGenAI({ apiKey });
    const { name, birthPlace, birthDate, birthTime, timeZone } = await request.json();

    const systemInstruction = "You are a professional astronomical ephemeris calculator. Calculate the user's astrological birth chart (Sun, Moon, Rising, Mercury, Venus, Mars, Jupiter, Saturn, and house placements) and current important transits based on their precise birth details. Return ONLY a valid JSON object matching this strict structure: { \"sun\": \"Sign\", \"moon\": \"Sign\", \"rising\": \"Sign\", \"mercury\": \"Sign\", \"venus\": \"Sign\", \"mars\": \"Sign\", \"jupiter\": \"Sign\", \"saturn\": \"Sign\", \"houses\": { \"first\": \"Sign\", \"tenth\": \"Sign\" }, \"currentTransits\": [ { \"planet\": \"Planet\", \"status\": \"Transit Name\", \"meaning\": \"Short meaning\" } ] }. Do not include markdown formatting or backticks around the JSON.";
    
    const prompt = `Birth Details:\nName: ${name}\nPlace: ${birthPlace}\nDate: ${birthDate}\nTime: ${birthTime}\nTime Zone: ${timeZone}`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: 'application/json'
        }
    });

    const jsonText = response.text || "{}";
    const chart = JSON.parse(jsonText);

    return NextResponse.json({ success: true, chart, profile: { name, birthPlace } });
  } catch (error: any) {
    console.error(error);
    if (error?.status === 429) {
      return NextResponse.json({ success: false, error: 'The cosmic energies are overwhelmed right now! (Gemini API Rate Limit). Please wait a minute and try again.' }, { status: 429 });
    }
    return NextResponse.json({ success: false, error: 'Failed to generate astrology reading' }, { status: 500 });
  }
}
