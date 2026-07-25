import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'Missing GEMINI_API_KEY' }, { status: 500 });
    }
    const ai = new GoogleGenAI({ apiKey });
    
    const { profile, astrologyData } = await request.json();

    const systemInstruction = `You are a professional astrologer. Generate a highly personalized daily horoscope for the user based on their profile and current transits. 
    Return ONLY a valid JSON object matching this exact structure: 
    { 
      "score": number (between 0 and 100 representing the energy score for today),
      "summary": "Short 3-5 word summary (e.g. 'Favorable for new beginnings')",
      "readingTitle": "Title of the reading (e.g. 'Moon in Taurus')",
      "readingBody": "A 3-4 sentence detailed reading for today based on their transits and sun sign."
    }
    Do not include markdown formatting or backticks around the JSON.`;
    
    const prompt = `Please generate today's energy reading.\n\nUser Profile: ${JSON.stringify(profile)}\n\nAstrology Transits: ${JSON.stringify(astrologyData)}`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: 'application/json'
        }
    });

    const jsonText = response.text || "{}";
    const dailyReading = JSON.parse(jsonText);

    return NextResponse.json({ success: true, daily: dailyReading });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to generate daily reading' }, { status: 500 });
  }
}
