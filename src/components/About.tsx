import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

const About = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation();
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
    <section id="about" ref={sectionRef as React.RefObject<HTMLElement>} className="w-full py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className={`grid md:grid-cols-2 gap-12 items-center ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
          <div className="relative max-w-[450px] h-[550px] md:h-[650px] mx-auto rounded-3xl overflow-hidden bg-black group order-2 md:order-1">
            <video
              ref={videoRef}
              src="https://dghlytwuslldhogqscho.supabase.co/storage/v1/object/public/videos/intro.mov"
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
          
          <div className="space-y-6 order-1 md:order-2">
            <h2 className="text-3xl md:text-4xl font-bold">About NextGen Media</h2>
            
            <div className="space-y-4 text-muted-foreground">
              <p>
                We're Angel Garcia and Giovanni Cruz, two 21-year-old entrepreneurs from New Jersey who started NextGen Media with one simple mission: to help businesses generate leads, grow their online presence, and thrive using modern marketing strategies.
              </p>
              
              <p>
                We don't come from wealth. Everything we've built has come from hard work, persistence, and a passion for creating results. From a young age, we've both understood that the business world is shifting fast — traditional marketing is losing its grip, and social media has become the new storefront. But we also realized that many businesses, especially small and local ones, struggle to keep up with this change.
              </p>
              
              <p>
                That's why we created NextGen Media — a social media marketing agency built by the new generation, for all generations of business owners to reap the benefits of modern methods.
              </p>
              
              <p>
                We know what it's like to start from nothing, and the process of growing on social media, which is why we're dedicated to helping businesses turn attention into customers using modern, data-driven methods. Whether it's content creation, paid ads, or lead-generation strategies, we specialize in helping brands stand out, connect with their audience, and scale faster than ever before through professional — eye catching content.
              </p>
              
              <p>
                For us, this isn't just a business — it's a movement. We believe that businesses deserve the same tools and strategies that big brands use to dominate online. Our goal is to level the playing field and give every business we work with the chance to win in today's market.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
