import { motion, AnimatePresence } from "framer-motion";

interface AnswerFeedbackProps {
  show: boolean;
  correct: boolean;
}

export default function AnswerFeedback({ show, correct }: AnswerFeedbackProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
        >
          {/* Full screen color flash */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`absolute inset-0 ${correct ? "bg-green-500" : "bg-red-500"}`}
          />
          {/* Emoji + text */}
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
            className="relative flex flex-col items-center gap-2"
          >
            <span className="text-7xl sm:text-8xl drop-shadow-lg">
              {correct ? "✅" : "❌"}
            </span>
            <span className={`text-2xl sm:text-3xl font-black tracking-wide drop-shadow-lg ${correct ? "text-green-400" : "text-red-400"}`}>
              {correct ? "CERTO!" : "ERROU!"}
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Optional sound effects
const correctSound = typeof Audio !== "undefined" ? new Audio("data:audio/wav;base64,UklGRl9vT19teleVBQQEAgABAAEARKwAAIhYAQACABAAZGF0YQ==") : null;
const wrongSound = typeof Audio !== "undefined" ? new Audio("data:audio/wav;base64,UklGRl9vT19teleVBQQEAgABAAEARKwAAIhYAQACABAAZGF0YQ==") : null;

export function playFeedbackSound(correct: boolean) {
  try {
    // Use Web Audio API for a quick beep
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.value = 0.15;
    
    if (correct) {
      // Happy ascending tone
      osc.frequency.setValueAtTime(523, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1); // E5
      osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2); // G5
    } else {
      // Sad descending tone
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.setValueAtTime(300, ctx.currentTime + 0.15);
    }
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
    
    // Cleanup
    setTimeout(() => ctx.close(), 500);
  } catch {
    // Silently fail if audio not available
  }
}
