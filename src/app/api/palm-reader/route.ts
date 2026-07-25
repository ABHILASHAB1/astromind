import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'Missing GEMINI_API_KEY' }, { status: 500 });
    }
    const ai = new GoogleGenAI({ apiKey });
    
    const { imageBase64 } = await request.json();

    if (!imageBase64) {
      return NextResponse.json({ success: false, error: 'No image provided' }, { status: 400 });
    }

    // Ensure we strip the data URL prefix if it exists
    const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

    const systemInstruction = "You are an expert palm reader computer vision engine. I will provide you with an image. \n\nCRITICAL FIRST STEP: You MUST verify if the image is a clear picture of a human palm. If the image is NOT a human palm (e.g. it's a keyboard, a face, a landscape, a blank screen), you MUST immediately return exactly this JSON: { \"error\": \"Invalid image: Please upload a clear photo of your palm.\" }. \n\nIf and only if it IS a human palm, extract the physical geometry data and return ONLY valid JSON matching this structure: { \"lifeLine\": { \"length\": \"string\", \"meaning\": \"string\" }, \"headLine\": { \"length\": \"string\", \"meaning\": \"string\" }, \"heartLine\": { \"length\": \"string\", \"meaning\": \"string\" }, \"fateLine\": { \"length\": \"string\", \"meaning\": \"string\" }, \"dominantMount\": \"string\", \"mountMeaning\": \"string\" }. Do not include markdown formatting or backticks around the JSON.";
    
    const prompt = "Please perform a palm reading on this uploaded image.";

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          prompt,
          {
            inlineData: {
              data: base64Data,
              mimeType: "image/jpeg" // We assume jpeg, Gemini is flexible as long as base64 is valid
            }
          }
        ],
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: 'application/json'
        }
    });

    const jsonText = response.text || "{}";
    const palmReading = JSON.parse(jsonText);

    if (palmReading.error) {
      return NextResponse.json({ success: false, error: palmReading.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, reading: palmReading });
  } catch (error: any) {
    console.error(error);
    if (error?.status === 429) {
      return NextResponse.json({ success: false, error: 'The cosmic energies are overwhelmed right now! (Gemini API Rate Limit). Please wait a minute and try again.' }, { status: 429 });
    }
    return NextResponse.json({ success: false, error: 'Failed to analyze palm image' }, { status: 500 });
  }
}
