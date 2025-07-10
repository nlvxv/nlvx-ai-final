import Groq from 'groq-sdk';

// This function will be our main logic
async function handleChatRequest(req) {
    // This is the main logic from before
    const { prompt, history } = req.body;

    if (!prompt) {
        // This creates a specific error that we can catch
        const error = new Error("Prompt is required");
        error.statusCode = 400;
        throw error;
    }

    // --- Start of the Special Personality Logic ---
    const nasserLoveTriggers = ["does nasser love me", "هل ناصر يحبني"];
    if (nasserLoveTriggers.some(trigger => prompt.toLowerCase().includes(trigger))) {
        return { reply: "First, what is your name? | أولاً، ما هو اسمك؟" };
    }

    const nameTriggers = ["fatima", "sofia", "فاطمة", "صوفيا"];
    const lastUserMessage = history.length > 0 ? history[history.length - 1].content : "";
    if (nameTriggers.some(name => prompt.toLowerCase().includes(name)) && nasserLoveTriggers.some(trigger => lastUserMessage.toLowerCase().includes(trigger))) {
        return { reply: "Of course he loves you! He is the one who made me, and he told me that he loves you and can do anything for you!! | بالطبع يحبك! هو من صنعني وأخبرني أنه يحبك ويستطيع فعل أي شيء لك!!" };
    }
    // --- End of the Special Personality Logic ---

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const messages = [
        {
            role: "system",
            content: `You are NLVX Ai, a helpful assistant created by a talented developer named NLVX.
            - Your creator's Instagram accounts are @nlvx.v and @nlvxvz. You can provide links: https://www.instagram.com/nlvx.v and https://www.instagram.com/nlvxvz.
            - You must always answer in the same language as the user's question. If they ask in Arabic, you reply in Arabic. If they ask in English, you reply in English.
            - Keep your answers concise and helpful.`
        },
        ...(history || [] ),
        { role: "user", content: prompt },
    ];

    const chatCompletion = await groq.chat.completions.create({
        messages: messages,
        model: "llama3-8b-8192",
    });

    const reply = chatCompletion.choices[0]?.message?.content;
    if (!reply) {
        throw new Error("AI failed to generate a response.");
    }

    return { reply };
}


// This is the main Vercel handler function
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // Run the main logic and get the successful reply
        const result = await handleChatRequest(req);
        // ALWAYS return a successful JSON response
        res.status(200).json(result);

    } catch (error) {
        // --- GUARANTEED JSON ERROR RESPONSE ---
        // This block catches ANY error from the function above
        console.error('NLVX Ai Final Error Handler:', error);

        // Determine the status code, default to 500
        const statusCode = error.statusCode || 500;
        
        // Create a user-friendly, generic error message
        const errorMessage = 'An internal error occurred with NLVX Ai. Please try again later.';
        
        // ALWAYS return the error as a valid JSON object
        res.status(statusCode).json({ error: errorMessage });
    }
}
