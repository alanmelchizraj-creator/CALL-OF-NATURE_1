// Web Speech API Narration Engine for Call of Nature
let activeUtterance: SpeechSynthesisUtterance | null = null;
let currentVoice: SpeechSynthesisVoice | null = null;

// Select a caring, elegant female voice for Mother Nature or general organic guide
function selectNarratorVoice(): SpeechSynthesisVoice | null {
  try {
    if (typeof window === "undefined" || !window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    
    // Try to find Google US English (a high quality smooth voice) or another premium English female voice
    const preferred = [
      "Google US English",
      "Microsoft Zira",
      "en-US-SMTLocal",
      "Samantha", 
      "Karen",
      "Moira",
      "Tessa"
    ];

    for (const name of preferred) {
      const match = voices.find((v) => v.name && (v.name.includes(name) || v.voiceURI?.includes(name)));
      if (match) return match;
    }

    // Fallback to any English female voice, or any English voice
    const enFemale = voices.find((v) => v.lang?.startsWith("en") && (v.name?.toLowerCase().includes("female") || v.name?.toLowerCase().includes("girl") || v.name?.toLowerCase().includes("woman") || v.name?.toLowerCase().includes("zira") || v.name?.toLowerCase().includes("samantha") || v.name?.toLowerCase().includes("google")));
    if (enFemale) return enFemale;

    const enVoice = voices.find((v) => v.lang?.startsWith("en"));
    if (enVoice) return enVoice;

    return voices[0] || null;
  } catch (err) {
    console.warn("SpeechSynthesis select voice blocked or unsupported:", err);
    return null;
  }
}

export function speakNarrator(text: string, onStart?: () => void, onEnd?: () => void) {
  try {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      if (onEnd) onEnd();
      return;
    }

    stopNarrator();

    // Clean text from emojis for speech synthesis
    const cleanText = text.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]/g, "");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.9;  // Slightly slower, majestic storyteller pace
    utterance.pitch = 1.05; // Gentle caring pitch
    
    // Choose voice
    if (!currentVoice) {
      currentVoice = selectNarratorVoice();
    }
    if (currentVoice) {
      utterance.voice = currentVoice;
    }

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      activeUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn("Speech synthesis trigger error:", e);
      activeUtterance = null;
      if (onEnd) onEnd();
    };

    activeUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn("Speech synthesis queue failed or blocked by iframe configuration:", err);
    if (onEnd) onEnd();
  }
}

export function stopNarrator() {
  try {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      activeUtterance = null;
    }
  } catch (err) {
    console.warn("SpeechSynthesis cancel execution query failed or was blocked:", err);
  }
}

// Keep voices populated in chrome/firefox where getVoices loaded asynchronously
try {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = () => {
        try {
          currentVoice = selectNarratorVoice();
        } catch (e) {
          console.warn("async voices update failed:", e);
        }
      };
    }
  }
} catch (e) {
  console.warn("SpeechSynthesis hook installation blocked:", e);
}
