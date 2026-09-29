const { GoogleGenAI } = require("@google/genai");
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Latest working model helper - Google Sep 2026
async function getGeminiResponse(prompt) {
  const modelsToTry = [
    'gemini-3.8-flash', // Google latest recommended
    'gemini-3.5-flash-lite',
    'gemini-3.7-flash',
    'gemini-flash-latest'
  ];

  let lastError = null;
  for (const modelName of modelsToTry) {
    try {
      console.log(`Trying model: ${modelName}`);
      const result = await genAI.models.generateContent({
        model: modelName,
        contents: prompt,
      });
      console.log(`SUCCESS with ${modelName}`);
      return result.text;
    } catch (e) {
      console.log(`Model ${modelName} FAILED: ${e.message}`);
      lastError = e;
    }
  }
  throw lastError;
}

// 1. WORKOUT RECOMMENDATION
exports.generateWorkoutRecommendation = async (data) => {
  const prompt = `
  Create workout plan Age:${data.age} Goal:${data.fitnessGoal} Exp:${data.experience}
  Return ONLY valid JSON: {"workoutName":"...","duration":"...","exercises":[...],"tips":"..."}
  `;
  const text = await getGeminiResponse(prompt);
  const m = text.match(/\{[\s\S]*\}/);
  return m? JSON.parse(m[0]) : { response: text };
};

// 2. FITNESS INSIGHTS - ITHU THAN UN ERROR FIX
exports.generateFitnessInsights = async (data) => {
  const prompt = `
  You are a fitness analyst. User data: workouts ${data.workoutCount || data.totalWorkouts}, avg duration ${data.averageDuration}, calories ${data.totalCaloriesBurned || data.totalCalories}.
  Give motivational fitness insights, progress analysis, next steps.
  Return ONLY valid JSON: {"insight":"...","progress":"...","suggestion":"...","motivation":"..."}
  `;
  const text = await getGeminiResponse(prompt);
  const m = text.match(/\{[\s\S]*\}/);
  return m? JSON.parse(m[0]) : { insight: text };
}