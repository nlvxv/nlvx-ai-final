import Groq from 'groq-sdk';

// You should store your API key in Vercel's environment variables, not here.
// The key should be named GROQ_API_KEY.
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { prompt, history } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // --- Start of the Special Personality Logic ---

        // 1. The "Nasser" Secret Response
        const nasserLoveTriggers = [
            "does nasser love me",
            "هل ناصر يحبني"
        ];

        if (nasserLoveTriggers.some(trigger => prompt.toLowerCase().includes(trigger))) {
            return res.status(200).json({ reply: "First, what is your name? | أولاً، ما هو اسمك؟" });
        }

        const nameTriggers = ["fatima", "sofia", "فاطمة", "صوفيا"];
        const lastUserMessage = history.length > 0 ? history[history.length - 1].content : "";
        
        if (nameTriggers.some(name => prompt.toLowerCase().includes(name)) && nasserLoveTriggers.some(trigger => lastUserMessage.toLowerCase().includes(trigger))) {
            return res.status(200).json({ reply: "Of course he loves you! He is the one who made me, and he told me that he loves you and can do anything for you!! | بالطبع يحبك! هو من صنعني وأخبرني أنه يحبك ويستطيع فعل أي شيء لك!!" });
        }

        // --- End of the Special Personality Logic ---

        const messages = [
            {
                role: "system",
                content: `You are NLVX Ai, a helpful assistant created by a talented developer named NLVX.
                - Your creator's Instagram accounts are @nlvx.v and @nlvxvz. You can provide links: https://www.instagram.com/nlvx.v and https://www.instagram.com/nlvxvz.
                - You must always answer in the same language as the user's question. If they ask in Arabic, you reply in Arabic. If they ask in English, you reply in English.
                - Keep your answers concise and helpful.`
            },
            ...(history || [] ),
            {
                role: "user",
                content: prompt,
            },
        ];

        const chatCompletion = await groq.chat.completions.create({
            messages: messages,
            model: "llama3-8b-8192",
        });

        const reply = chatCompletion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";

        res.status(200).json({ reply: reply });

    } catch (error) {
        // --- CUSTOMIZED ERROR HANDLING ---
        // This log is for you (the developer) to see in the Vercel logs.
        console.error('NLVX Ai Internal Error:', error); 
        
        // This is the generic error message the user will see.
        res.status(500).json({ error: 'An internal error occurred with NLVX Ai. Please try again later.' });
    }
}
