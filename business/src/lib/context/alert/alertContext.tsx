import { createContext, useContext } from "react";

export interface Alert {
  type: "success" | "error" | "warning" | "info";
  message: string;
  id: number;
}

export const AlertContext = createContext<{
  alertList: Alert[];
  addAlert: (alert: Alert) => void;
}>({
  alertList: [],
  addAlert: () => {},
});

export const useAlertContext = () => useContext(AlertContext);
