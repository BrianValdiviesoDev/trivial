import axios from "axios";

export interface Question {
    question:string,
    options: string[],
    answer: string,
    explain: string,
}


export const getQuestions = async (topic:string, language:string, numberOfQuestions:number):Promise<Question[]>=>{
    const url = 'https://api.openai.com/v1/chat/completions';
    const prompt_es = `Dime ${numberOfQuestions} preguntas tipo test sobre ${topic} de nivel medio con 4 posibles respuestas sin enumerar y dime la correcta.
    No numeres ni marques con letras las respuestas.
    Todas las respuestas deben tener una longitud mínima de 50 caracteres y comenzar por una palabra
    Sustituye cualquier número que pueda aparecer en la pregunta y en las respuestas por letras.
    Damela en formato json con la siguiente estructura:
    [{
        question: "question_text",
        "options": ["first_option", "second_option", "third_option", "other_option"],
        "answer": "correct_answer",
        "explain": "question explanation",
    }]
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
    const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`
    };

    const data = JSON.stringify({
        "model": "gpt-3.5-turbo-0613",//"gpt-3.5-turbo",
        "messages": [
        {
            "role": "user",
            "content": prompt
        }
        ]
    });
    const response = await axios.post(url, data,{headers})
    const responseContent = JSON.parse(response.data.choices[0].message.content);
    const question:Question[] = responseContent.map((q:Question)=> ({
        question: q.question,
        options:q.options,
        answer: q.answer,
        explain: q.explain,
    }));
    return question;

}


export const getModels = async ()=>{
    const url = 'https://api.openai.com/v1/models';
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`
        };
    const response = await axios.get(url, {headers})
    console.log(response)
}