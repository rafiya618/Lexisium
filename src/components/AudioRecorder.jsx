import { useState, useRef } from "react";
import { Mic, Square, RotateCcw, Trash2 } from "lucide-react";

export default function AudioRecorder({ onAudioRecorded, maxDuration = 6 }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      streamRef.current = stream;
      chunksRef.current = [];

      // Create MediaRecorder with optimal settings for mobile
      const options = { 
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000
      };
      
      // Fallback for browsers that don't support webm
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'audio/mp4';
      }
      
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // Create a proper File object with extension
        const audioFile = new File([blob], `audio_${Date.now()}.webm`, {
          type: mediaRecorder.mimeType,
          lastModified: Date.now()
        });
        
        onAudioRecorded(audioFile);
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= maxDuration) {
            stopRecording();
          }
          return newTime;
        });
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please allow microphone permissions and try again.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const clearRecording = () => {
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setRecordingTime(0);
    onAudioRecorded(null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="border-2 border-gray-200 rounded-lg p-4 bg-[var(--color-background)]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-700">Audio Recording</span>
        <span className="text-xs text-gray-500">Max {maxDuration}s</span>
      </div>

      {/* Recording Controls */}
      <div className="flex items-center gap-2 mb-2">
        {!isRecording && !audioBlob && (
          <button
            onClick={startRecording}
            className="flex items-center gap-2 bg-[var(--color-coral)] text-white px-4 py-3 rounded-lg hover:bg-[var(--color-coral-dark)] text-sm md:text-base min-h-[44px] touch-manipulation transition-all shadow-sm"
          >
            <Mic size={18} /> Start Recording
          </button>
        )}

        {isRecording && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 bg-[var(--color-paynesgray)] text-white px-4 py-3 rounded-lg hover:bg-[var(--color-paynesgray-dark)] text-sm md:text-base min-h-[44px] touch-manipulation transition-all shadow-sm"
            >
              <Square size={18} /> Stop
            </button>
            <div className="flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-red-600 font-mono">
                {formatTime(recordingTime)} / {formatTime(maxDuration)}
              </span>
            </div>
          </div>
        )}

        {audioBlob && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={startRecording}
              className="flex items-center gap-2 bg-[var(--color-gunmetal)] text-white px-4 py-2 rounded-lg text-sm hover:bg-[var(--color-gunmetal-dark)] min-h-[40px] touch-manipulation transition-all shadow-sm"
            >
              <RotateCcw size={16} /> Re-record
            </button>
            <button
              onClick={clearRecording}
              className="flex items-center gap-2 bg-[var(--color-coral-dark)] text-white px-4 py-2 rounded-lg text-sm hover:bg-[var(--color-coral-darker)] min-h-[40px] touch-manipulation transition-all shadow-sm"
            >
              <Trash2 size={16} /> Clear
            </button>
          </div>
        )}
      </div>

      {/* Audio Player */}
      {audioUrl && (
        <div className="mt-3">
          <audio 
            controls 
            src={audioUrl} 
            className="w-full rounded-lg"
            style={{ height: '40px' }}
          >
            Your browser does not support the audio element.
          </audio>
          <div className="text-xs text-green-600 mt-2 font-lato">
            Recording complete ({formatTime(recordingTime)})
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="text-xs text-gray-500 mt-3 font-lato">
        {!navigator.mediaDevices ? (
          <div className="text-red-500">
            Audio recording not supported in this browser
          </div>
        ) : (
          <div>
            Click microphone to record audio. Works on mobile and desktop.
            <br />
            On mobile: Allow microphone access when prompted.
          </div>
        )}
      </div>
    </div>
  );
}