import axios from "axios";

export interface Question {
    question:string,
    options: string[],
    answer: string,
    explain: string,
}

export interface ChatMessage {
    role: string,
    content: string,
}

export const getPrompt = (topic:string, language:string, numberOfQuestions:number):string=>{
    const prompt_es = `
    Imagina que eres un presentador de un concurso de preguntas. 
    Dime ${numberOfQuestions} preguntas tipo test sobre ${topic} de nivel medio adaptadas para un software de síntesis de voz.
    Con 4 posibles respuestas sin enumerar.
    Dime la correcta.
    Damela en formato json con la siguiente estructura.
    Estructura: """
    [{
        question: "question_text",
        "options": ["first_option", "second_option", "third_option", "other_option"],
        "answer": "correct_answer",
        "explain": "question explanation",
    }]
    """
    `;

    const prompt_en = `Give me ${numberOfQuestions} multiple-choice questions about ${topic} of intermediate level with 4 possible answers, unnumbered, and tell me the correct one.
    Replace any number with its word representation.
    All answers should have a minimum length of 50 characters and start with a word.
    Provide it to me in JSON format with the following structure:
    [{
        question: "question_text",
        "options": ["first_option", "second_option", "third_option", "other_option"],
        "answer": "correct_answer",
        "explain": "question explanation",
    }]
    `;

    const prompt = language==='es' ? prompt_es : prompt_en;
    return prompt;
}

export const replaceNumbers = (text:string):string | null=>{
    const regex = /\d/;
    
    if(regex.test(text)){
        return `Sustituye los números o fechas del texto por su expresión alfabética.
        Texto:
        """
        ${text}
        """`
    }

    return null;
}

export const chatRequest = async (prompt:string, context?: ChatMessage[]):Promise<string>=>{
    const url = 'https://api.openai.com/v1/chat/completions';
    
    const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`
    };
    if(!context){
        context = [];
    }
    
    context.push({role: 'system', "content": prompt })
    console.log("CHAT: ",context);
    const data = JSON.stringify({
        "model": "gpt-3.5-turbo-0613",//"gpt-3.5-turbo",
        "messages": context
    });
    const response = await axios.post(url, data,{headers})
    return response.data.choices[0].message.content;
}


export const getModels = async ()=>{
    const url = 'https://api.openai.com/v1/models';
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`
        };
    const response = await axios.get(url, {headers})
}