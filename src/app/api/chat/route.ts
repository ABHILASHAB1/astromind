import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, response: 'Error: Please create the .env.local file with your GEMINI_API_KEY as instructed.' });
    }
    const ai = new GoogleGenAI({ apiKey });
    const { message, context } = await request.json();

    if (!message) {
      return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 });
    }

    const systemInstruction = `You are AstroMind, an expert, empathetic astrologer and palm reader. Your goal is to synthesize the user's natal astrology chart with their physical palmistry readings to provide holistic, highly accurate, and deeply personalized answers.
    Keep your answers concise, mystical yet practical, and directly address their question.
    
    CRITICAL RULE FOR MISSING PALM DATA: If the user asks a question that requires a palm reading (or a general reading) AND their palmReading data is missing or null, you MUST EXPLICITLY TELL THEM TO TAKE A PHOTO OF THEIR PALM FIRST. Do not just say you don't have the data. You must say: "I need you to take a photo of your palm first. Please navigate to the Palm Analysis screen and tap 'Scan Palm' so I can read your lines."
    
    Here is the exact data for the user you are speaking to:
    === CONTEXT START ===
    ${JSON.stringify(context, null, 2)}
    === CONTEXT END ===
    When the user asks a question, always try to reference specific placements (e.g. 'With your Venus in Taurus...') or specific palm lines ('Your strong Life Line indicates...') to explain your reasoning.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: message,
        config: {
            systemInstruction: systemInstruction,
        }
    });

    return NextResponse.json({ success: true, response: response.text });
  } catch (error: any) {
    console.error(error);
    if (error?.status === 429) {
      return NextResponse.json({ success: false, response: 'The cosmic energies are overwhelmed right now! (You have hit the Gemini API rate limit). Please wait about a minute and try again.' });
    }
    return NextResponse.json({ success: false, error: 'Failed to process chat message' }, { status: 500 });
  }
}
