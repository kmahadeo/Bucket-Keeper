export async function generateConflictResolution(
  item1: string,
  item2: string,
  apiKey: string
): Promise<{ optionA: string; optionB: string }> {
  if (!apiKey) {
    throw new Error("No API Key provided");
  }

  const prompt = `
    I have a schedule conflict between two events: "${item1}" and "${item2}".
    Provide two short, distinct compromise options to resolve this for a couple.
    
    Format the response as JSON with keys "optionA" and "optionB".
    Keep the options under 20 words each.
    Focus on time-shifting or shortening.
    
    Example JSON:
    {
      "optionA": "Move Date Night to Saturday at 7 PM.",
      "optionB": "Shorten Poker Night to end by 8 PM."
    }
  `;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to fetch from Gemini");
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("No text returned from Gemini");
    }

    // Attempt to parse JSON from the text (Gemini might wrap it in markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      // Fallback if not valid JSON (shouldn't happen often with good prompt)
      return {
        optionA: "Could not parse AI suggestion.",
        optionB: "Please try again.",
      };
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
