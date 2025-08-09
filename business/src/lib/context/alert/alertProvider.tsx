import { useCallback, useState } from "react";
import { AlertContext, type Alert } from "./alertContext";

import AlertContainer from "@/components/alterContainer";

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alertList, setAlert] = useState<Alert[]>([]);

  const addAlert = useCallback((alert: Alert) => {
    setAlert((prevAlerts) => [alert, ...prevAlerts]);
    setTimeout(() => {
      setAlert((prevAlerts) => prevAlerts.filter((a) => a.id !== alert.id));
    }, 3000);
  }, []);

  return (
    <AlertContext.Provider value={{ alertList, addAlert }}>
      {children}
      <AlertContainer alertList={alertList} />
    </AlertContext.Provider>
  );
}
