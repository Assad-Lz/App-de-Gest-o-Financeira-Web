import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function test() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("API KEY NOT FOUND");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const models = ['gemini-1.5-flash', 'gemini-flash-latest', 'gemini-pro-latest', 'gemini-1.5-pro'];

  const modelName = 'gemini-flash-latest';
  console.log(`\n--- Testing startChat with: ${modelName} ---`);
  try {
    const model = genAI.getGenerativeModel({ model: modelName, systemInstruction: "Você é a FinIA." });
    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: "Meu nome é Yssaky." }] },
        { role: 'model', parts: [{ text: "Prazer, Yssaky!" }] },
      ],
    });
    const result = await chat.sendMessage("Como você pode me ajudar?");
    console.log(`Chat Result: ${result.response.text()}`);
  } catch (error: any) {
    console.error(`Chat Error with ${modelName}: ${error.message}`);
  }
}

test();
