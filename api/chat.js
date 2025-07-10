// This is a Vercel Serverless Function
// It runs on the server, not in the user's browser.

export default async function handler(request, response) {
    // 1. Check if the request method is POST
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    // 2. Get the API Key from Vercel Environment Variables
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        return response.status(500).json({ error: 'API key is not configured on the server.' });
    }

    try {
        // 3. Get the user's prompt and history from the request body
        const { prompt, history } = request.body;

        if (!prompt) {
            return response.status(400).json({ error: 'Prompt is required.' });
        }

        // 4. Prepare the messages for the Groq API
        // We add a system message to define the AI's personality
        const messages = [
            {
                role: "system",
                content: "You are NLVX Ai, a helpful assistant created by nlvxvz. You are friendly, intelligent, and always ready to help shape the future."
            },
            // Add previous messages from the conversation history
            ...(history || []),
            // Add the user's new prompt
            {
                role: "user",
                content: prompt
            }
        ];

        // 5. Call the Groq API
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: messages,
                model: 'llama3-8b-8192' // A fast and capable model
            } )
        });

        if (!groqResponse.ok) {
            const errorData = await groqResponse.json();
            console.error('Groq API Error:', errorData);
            throw new Error(errorData.error.message || 'Failed to get response from Groq API');
        }

        const data = await groqResponse.json();
        const aiReply = data.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

        // 6. Send the AI's reply back to the user's browser
        return response.status(200).json({ reply: aiReply });

    } catch (error) {
        console.error('Server Error:', error);
        return response.status(500).json({ error: error.message });
    }
}
