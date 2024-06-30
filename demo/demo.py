import asyncio
import os
from dotenv import load_dotenv
from io import BytesIO
from openai import AsyncOpenAI
from soundfile import SoundFile
import sounddevice as sd
import speech_recognition as sr


load_dotenv()

aiclient = AsyncOpenAI(
    api_key=os.environ.get("OPENAI_API_KEY")
)

SYSTEM_PROMPT = """
  You are having a conversation with an AI assistant. The assistant is here to help you with your tasks.
"""


async def listen_mic(recognizer: sr.Recognizer, microphone: sr.Microphone):
    audio_data = recognizer.listen(microphone)
    wav_data = BytesIO(audio_data.get_wav_data())
    wav_data.name = "SpeechRecognition_audio.wav"
    return wav_data


async def say(text: str):
    res = await aiclient.audio.speech.create(
        model="tts-1",
        voice="alloy",
        response_format="opus",
        input=text
    )
    buffer = BytesIO()
    for chunk in res.iter_bytes(chunk_size=4096):
        buffer.write(chunk)
    buffer.seek(0)
    with SoundFile(buffer, 'r') as sound_file:
        data = sound_file.read(dtype='int16')
        sd.play(data, sound_file.samplerate)
        sd.wait()


async def respond(text: str, history):
    history.append({"role": "user", "content": text})
    completion = await aiclient.chat.completions.create(
        model="gpt-4",
        temperature=0.5,
        messages=history,
    )
    response = completion.choices[0].message.content
    await say(response)
    history.append({"role": "assistant", "content": response})


async def main() -> None:
    m = sr.Microphone()
    r = sr.Recognizer()
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    with m as source:
        r.adjust_for_ambient_noise(source)
        while True:
            wav_data = await listen_mic(r, source)
            transcript = await aiclient.audio.transcriptions.create(
                model="whisper-1",
                temperature=0.5,
                file=wav_data,
                response_format="verbose_json",
            )
            if transcript.text == '' or transcript.text is None:
                continue
            await respond(transcript.text, messages)

if __name__ == '__main__':
    asyncio.run(main())
