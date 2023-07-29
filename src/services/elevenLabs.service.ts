import axios from 'axios';

const LanguageModels = [
    {
        languageCodes: ['en'],
        model_id: 'eleven_monolingual_v1'
    },
    {
        languageCodes: ['es'],
        model_id: 'eleven_multilingual_v1'
    }
];

const base_url = 'https://api.elevenlabs.io/v1';
const headers = {
  'Accept': 'audio/mpeg',
  'xi-api-key': process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY,
  'Content-Type': 'application/json'
};

export const tts = async (text:string, languageCode:string, voiceId:string):Promise<AudioBuffer> => {
    const url = `${base_url}/text-to-speech/${voiceId}`;
    const data = {
      text: text,
      model_id: LanguageModels.find((l)=>l.languageCodes.includes(languageCode))?.model_id,
      voice_settings: {
        stability: 1,
        similarity_boost:1
      }
    };
    const response = await axios.post(url, data, {headers, responseType: 'arraybuffer'});
    const audioContext = new window.AudioContext();
    const decodedAudioData = await audioContext.decodeAudioData(response.data);
    return decodedAudioData;
  }

export const getVoices = async ()=>{
  const url = `${base_url}/voices`;
  const response = await axios.get(url, {headers});
  return response.data?.voices;
}
    