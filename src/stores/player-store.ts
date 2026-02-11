import { create } from "zustand";

interface PlayerState {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setIsPlaying: (playing: boolean) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentTime: 0,
  duration: 0,
  isPlaying: false,
  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
}));
