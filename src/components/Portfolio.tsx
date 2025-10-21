import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

interface VideoPlayerProps {
  src: string;
  projectType: string;
}

const VideoPlayer = ({ src, projectType }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="relative max-w-[450px] h-[550px] md:h-[650px] mx-auto rounded-3xl overflow-hidden bg-black group">
        <video
          ref={videoRef}
          src={src}
          className="w-full h-full object-cover"
          muted={isMuted}
          playsInline
          onClick={togglePlay}
        />

        {/* Video Controls Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
            <Button
              size="lg"
              variant="secondary"
              className="rounded-full w-16 h-16 bg-white/90 hover:bg-white"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 text-black" />
              ) : (
                <Play className="w-8 h-8 text-black ml-1" />
              )}
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-12 left-4 right-4 pointer-events-auto">
            <div className="flex items-center gap-2">
              <span className="text-white text-xs font-medium min-w-[40px]">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <span className="text-white text-xs font-medium min-w-[40px]">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          <div className="absolute bottom-4 right-4 pointer-events-auto">
            <Button
              size="sm"
              variant="secondary"
              className="rounded-full bg-white/90 hover:bg-white"
              onClick={toggleMute}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-black" />
              ) : (
                <Volume2 className="w-4 h-4 text-black" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">{projectType}</p>
      </div>
    </div>
  );
};

const Portfolio = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="portfolio" ref={ref as React.RefObject<HTMLElement>} className="w-full py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className={`max-w-2xl mb-16 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Work</h2>
          <p className="text-muted-foreground text-lg">
            See how we've helped our clients create compelling content that drives real results.
          </p>
        </div>

        <div className={`grid md:grid-cols-2 gap-8 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
          <VideoPlayer src="/client 1.mov" projectType="Social Media Content" />
          <VideoPlayer src="/client 2.mov" projectType="Brand Video Production" />
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
