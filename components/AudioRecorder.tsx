import React, { useState, useRef } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { transcribeAudio } from '../services/geminiService';

interface AudioRecorderProps {
  onTranscription: (text: string) => void;
  className?: string;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onTranscription, className }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        handleTranscription(blob);
        stream.getTracks().forEach(track => track.stop()); // Stop mic
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleTranscription = async (blob: Blob) => {
    setIsProcessing(true);
    try {
      const text = await transcribeAudio(blob);
      onTranscription(text);
    } catch (error) {
      console.error(error);
      alert("Failed to transcribe audio.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {isProcessing ? (
        <span className="flex items-center gap-2 text-sm text-blue-600">
            <Loader2 className="w-4 h-4 animate-spin" /> Transcribing...
        </span>
      ) : isRecording ? (
        <button
          type="button"
          onClick={stopRecording}
          className="flex items-center justify-center w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors animate-pulse"
          title="Stop Recording"
        >
          <Square size={16} fill="currentColor" />
        </button>
      ) : (
        <button
          type="button"
          onClick={startRecording}
          className="flex items-center justify-center w-10 h-10 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full transition-colors border border-blue-200"
          title="Dictate details"
        >
          <Mic size={20} />
        </button>
      )}
    </div>
  );
};

export default AudioRecorder;
