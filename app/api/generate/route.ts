import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

// --- ENV & CONFIG ---
// In a real app, use process.env.GEMINI_API_KEY
// The user provided key (I will use it here for the "ONE GO" requirement, 
// usually we'd keep it in .env.local)
const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyCx_YaWbFdqFYw8C9pbqAEW97yOuqzg2ko";
const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

const genai = new GoogleGenerativeAI(API_KEY);

// --- CACHE (Simple In-Memory) ---
type CacheEntry = {
    data: any;
    timestamp: number;
};
const CACHE = new Map<string, CacheEntry>();
const TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

// --- JSON SCHEMA ---
const responseSchema = {
    type: SchemaType.OBJECT,
    properties: {
        title: { type: SchemaType.STRING },
        total_minutes: { type: SchemaType.INTEGER },
        blocks: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    name: { type: SchemaType.STRING },
                    minutes: { type: SchemaType.INTEGER },
                    objective: { type: SchemaType.STRING },
                },
                required: ["name", "minutes", "objective"],
            },
        },
        practice: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    platform: { type: SchemaType.STRING },
                    problem_title: { type: SchemaType.STRING },
                    difficulty: { type: SchemaType.STRING },
                    why_this: { type: SchemaType.STRING },
                },
                required: ["platform", "problem_title", "difficulty", "why_this"],
            },
        },
        quick_revision: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        common_mistakes: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    },
    required: ["title", "total_minutes", "blocks", "practice", "quick_revision", "common_mistakes"],
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { minutes_available, topic, level } = body;

        // 1. Validation
        if (!minutes_available || !topic || !level) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 2. Cache Check
        const cacheKey = `${minutes_available}-${topic}-${level}-${MODEL_NAME}`;
        if (CACHE.has(cacheKey)) {
            const entry = CACHE.get(cacheKey)!;
            if (Date.now() - entry.timestamp < TTL_MS) {
                console.log(`[Cache Hit] ${cacheKey}`);
                return NextResponse.json(entry.data);
            }
            CACHE.delete(cacheKey); // Expired
        }

        // 3. Prompting
        const systemInstruction = `
      You are a strict DSA coach.
      Generate a practical, logic-focused study plan for today.
      Rules:
      - Total minutes must exactly match ${minutes_available}.
      - Output ONLY valid JSON.
      - No markdown formatting.
    `;

        const prompt = `
      Create a plan for:
      - Topic: ${topic}
      - Level: ${level}
      - Time: ${minutes_available} minutes
    `;

        // 4. Gemini Call
        const model = genai.getGenerativeModel({
            model: MODEL_NAME,
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.3,
            }
        });

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: systemInstruction + "\n" + prompt }] }],
        });

        // Check if result.response exists and get text
        const response = result.response;
        const text = response.text();

        if (!text) {
            throw new Error("No response text from Gemini");
        }

        const planData = JSON.parse(text);

        // 5. Save to Cache
        CACHE.set(cacheKey, {
            data: planData,
            timestamp: Date.now(),
        });

        return NextResponse.json(planData);

    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to generate plan" },
            { status: 500 }
        );
    }
}
