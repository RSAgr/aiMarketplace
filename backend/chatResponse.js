// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();

// Enable CORS for your React app (running on port 5173)
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Initialize GoogleGenerativeAI with API key
const client = new GoogleGenerativeAI("AIzaSyDr4E-qLuYvOUemP5mjyCPmp8TCY05iguQ");

// POST endpoint for AI response
app.post('/api/getAIResponse', async (req, res) => {
  try {
    const { userInput } = req.body;
    
    console.log('=== New Request ===');
    console.log('User Input:', userInput);
    
    if (!userInput) {
      return res.status(400).json({ reply: 'Missing user input.' });
    }

    // Get the model
    const model = client.getGenerativeModel({ model: 'gemini-2.5-pro' });
    
    console.log('Model initialized, generating content...');
    
    // Create the prompt
    const prompt = `You are an AI agent ecosystem specializing in hotel booking, flight booking, restaurant booking, car rental, translation, etc. give answer in points not paragraph to: "${userInput}"`;
    
    // Generate content with simple string prompt
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const reply = response.text();

    console.log('AI Reply:', reply);
    console.log('=== End Request ===\n');

    res.json({ reply });
  } catch (err) {
    console.error('=== ERROR ===');
    console.error('Error Name:', err.name);
    console.error('Error Message:', err.message);
    console.error('Full Error:', err);
    console.error('=== END ERROR ===\n');
    
    res.status(500).json({ 
      reply: 'Error generating AI response',
      error: err.message 
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Accepting requests from http://localhost:5173`);
  console.log(`✅ Ready to receive requests\n`);
});
