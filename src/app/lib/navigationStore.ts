import { create } from "zustand";

export type NavigationSection =
  | "Home"
  | "About"
  | "Services"
  | "People"
  | "Contact"
  | "Client-Portal";
export type NavigationDirection = "forward" | "backward";

interface NavigationState {
  activeSection: NavigationSection;
  navigationDirection: NavigationDirection;
  isContactFormOpen: boolean;
  hoveredSection: string | null;
  isMenuOpen: boolean;
}

interface NavigationActions {
  setActiveSection: (section: NavigationSection) => void;
  setNavigationDirection: (direction: NavigationDirection) => void;
  setContactFormOpen: (open: boolean) => void;
  setHoveredSection: (section: string | null) => void;
  setMenuOpen: (open: boolean) => void;
  navigateToSection: (
    section: NavigationSection,
    sections: NavigationSection[]
  ) => void;
  closeContactForm: () => void;
}

const initialState: NavigationState = {
  activeSection: "Home",
  navigationDirection: "forward",
  isContactFormOpen: false,
  hoveredSection: null,
  isMenuOpen: false,
};

export const useNavigationStore = create<NavigationState & NavigationActions>(
  (set, get) => ({
    ...initialState,

    setActiveSection: (section) => set({ activeSection: section }),
    setNavigationDirection: (direction) =>
      set({ navigationDirection: direction }),
    setContactFormOpen: (open) =>
      set({
        isContactFormOpen: open,
        activeSection: open ? "Contact" : "Home",
      }),
    setHoveredSection: (section) => set({ hoveredSection: section }),
    setMenuOpen: (open) => set({ isMenuOpen: open }),

    navigateToSection: (section, sections) => {
      const currentState = get();
      const currentIndex = sections.indexOf(currentState.activeSection);
      const nextIndex = sections.indexOf(section);

      set({
        activeSection: section,
        navigationDirection: nextIndex > currentIndex ? "forward" : "backward",
        isContactFormOpen: section === "Contact",
      });
    },

    closeContactForm: () =>
      set({
        isContactFormOpen: false,
        activeSection: "Home",
      }),
  })
);
