"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePlayerStore } from "@/stores/player-store";

interface YouTubePlayerProps {
  videoId: string;
  onTimeUpdate?: (time: number) => void;
}

declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: () => void;
  }
}

export function YouTubePlayer({ videoId, onTimeUpdate }: YouTubePlayerProps) {
  const playerRef = useRef<YT.Player | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { setCurrentTime, setDuration, setIsPlaying } = usePlayerStore();

  const initPlayer = useCallback(() => {
    if (!containerRef.current || playerRef.current) return;

    playerRef.current = new window.YT.Player(containerRef.current, {
      videoId,
      playerVars: {
        autoplay: 0,
        modestbranding: 1,
        rel: 0,
      },
      events: {
        onReady: (event) => {
          setDuration(event.target.getDuration());
        },
        onStateChange: (event) => {
          const isPlaying = event.data === window.YT.PlayerState.PLAYING;
          setIsPlaying(isPlaying);

          if (isPlaying) {
            intervalRef.current = setInterval(() => {
              const time = playerRef.current?.getCurrentTime() || 0;
              setCurrentTime(time);
              onTimeUpdate?.(time);
            }, 1000);
          } else {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
          }
        },
      },
    });
  }, [videoId, setCurrentTime, setDuration, setIsPlaying, onTimeUpdate]);

  useEffect(() => {
    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [initPlayer]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
      <div ref={containerRef} className="absolute inset-0" />
    </div>
  );
}

export function seekTo(time: number) {
  // This would need to be connected to the player instance
  // For now, this is a placeholder for the seek functionality
}
