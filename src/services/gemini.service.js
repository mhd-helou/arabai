class GeminiService {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
        this.baseURL =  'https://generativelanguage.googleapis.com/v1beta';
    }
    async chat (message, options = {}){
        try {
            const response = await fetch(`${this.baseURL}/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
                method:'POST',
                headers:{
                    'Content-Type':'application/json',
                },
                body : JSON.stringify({
                    contents:[{
                        parts:[{text:message}]
                    }],
                    generationConfig: {
                        temperature: options.temperature || 0.7,
                        maxOutputTokens: options.maxTokens || 1000,
                    }
                })
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Gemini API Error ${response.status}:`, errorText);
                throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            return {
                response: data.candidates[0].content.parts[0].text,
                usage:{
                    totalTokens: data.usageMetadata?.totalTokenCount || 0
                }
            };
            } catch (error) {
            throw new Error(`Gemini service error: ${error.message}`);
        }
        }
    }
module.exports = new GeminiService();