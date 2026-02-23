import { create } from "zustand";
import { persist } from "zustand/middleware";

type Location = {
  id: string;
  name: string;
  address?: string;
}

type LocationStore = {
  selectedLocation: Location | null;
  setLocation: (location: Location) => void;
  clearLocation: () => void;
};

export const useLocationStore = create<LocationStore>()(
  persist(
    (set) => ({
      selectedLocation: null,
      setLocation: (location) =>
        set({ selectedLocation: location }),
      clearLocation: () =>
        set({ selectedLocation: null }),
    }),
    { name: "sunshine-location" }
  )
);
