export default function VoiceInput({ onText }) {
  const startVoice = () => {
    const rec = new window.webkitSpeechRecognition();
    rec.lang = "en-US";
    rec.onresult = (e) => {
      onText(e.results[0][0].transcript);
    };
    rec.start();
  };

  return (
    <button onClick={startVoice} className="bg-indigo-700 text-white px-3 py-1 rounded">
      🎤
    </button>
  );
}
