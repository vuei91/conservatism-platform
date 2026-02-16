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
  const onTimeUpdateRef = useRef(onTimeUpdate);

  // Keep the ref in sync without triggering re-init
  useEffect(() => {
    onTimeUpdateRef.current = onTimeUpdate;
  }, [onTimeUpdate]);

  const initPlayer = useCallback(() => {
    if (!containerRef.current || playerRef.current) return;

    const { setCurrentTime, setDuration, setIsPlaying } =
      usePlayerStore.getState();

    playerRef.current = new window.YT.Player(containerRef.current, {
      videoId,
      width: "100%",
      height: "100%",
      playerVars: {
        autoplay: 0,
        modestbranding: 1,
        rel: 0,
      },
      events: {
        onReady: (event) => {
          usePlayerStore.getState().setDuration(event.target.getDuration());
        },
        onStateChange: (event) => {
          const isPlaying = event.data === window.YT.PlayerState.PLAYING;
          usePlayerStore.getState().setIsPlaying(isPlaying);

          // 항상 기존 interval 정리
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }

          if (isPlaying) {
            intervalRef.current = setInterval(() => {
              const time = playerRef.current?.getCurrentTime() || 0;
              usePlayerStore.getState().setCurrentTime(time);
              onTimeUpdateRef.current?.(time);
            }, 1000);
          }
        },
      },
    });
  }, [videoId]);

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
    <div
      className="relative w-full overflow-hidden rounded-lg bg-black"
      style={{ paddingBottom: "56.25%" }}
    >
      <div ref={containerRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}

export function seekTo(time: number) {
  // This would need to be connected to the player instance
  // For now, this is a placeholder for the seek functionality
}
