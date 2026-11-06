import {GoogleGenAI} from '@google/genai';

const aiModel = new GoogleGenAI()

const interaction = await  aiModel.interactions.create({
  model: "gemini-3.8-flash",
  input: "Explain how AI works in a few words",
});
console.log(interaction.output_text);