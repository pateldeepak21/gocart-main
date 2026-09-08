import authSeller from "@/middlewear/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { openai } from "@/configs/openai";

async function main(base64Image, mimeType) {
  const messages = [
    {
      role: "user",
      content: `
You are a product listing assistant for an e-commerce store.

Your job is to analyze an image of a product and generate structured data.

Respond ONLY with raw JSON (no code block, no markdown, no explanations).

The JSON must strictly follow this schema:

{
  "name": "string",
  "description": "string"
}
      `,
    },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: "Analyze this image and return name and description.",
        },
        {
          type: "image_url",
          image_url: {
            url: `data:${mimeType};base64,${base64Image}`,
          },
        },
      ],
    },
  ];

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages,
  });

  const raw = response.choices?.[0]?.message?.content;

  if (!raw) {
    throw new Error("Empty response from OpenAI");
  }

  const cleaned = raw
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("OpenAI Response:", raw);
    throw new Error("Failed to parse JSON response from OpenAI");
  }
}

export async function POST(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const isSeller = await authSeller(userId);

    if (!isSeller) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { base64Image, mimeType } = await request.json();

    if (!base64Image || !mimeType) {
      return NextResponse.json(
        { error: "Image data is required" },
        { status: 400 }
      );
    }

    const result = await main(base64Image, mimeType);

    return NextResponse.json(result);
  } catch (error) {
    console.error("AI Generate Error:", error);

    return NextResponse.json(
      {
        error: error.message || "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}
