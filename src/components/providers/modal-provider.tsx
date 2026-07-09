"use client";

import * as React from "react";

type ModalState = {
  id: string;
  data?: unknown;
} | null;

type ModalContextValue = {
  modal: ModalState;
  openModal: (id: string, data?: unknown) => void;
  closeModal: () => void;
};

const ModalContext = React.createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modal, setModal] = React.useState<ModalState>(null);

  const value = React.useMemo(
    () => ({
      modal,
      openModal: (id: string, data?: unknown) => setModal({ id, data }),
      closeModal: () => setModal(null),
    }),
    [modal],
  );

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}

export function useModalContext() {
  const context = React.useContext(ModalContext);

  if (!context) {
    throw new Error("useModalContext must be used within ModalProvider.");
  }

  return context;
}
