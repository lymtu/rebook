import { useEffect } from "react";

export function NotesBox() {
  useEffect(() => {
    fetch(import.meta.env.VITE_SERVER_URL + "/notice-list")
      .then((res) => res.json())
      .then((res) => {
      });
  }, []);

  return (
    <div>
      <h3 className="text-2xl font-bold">公告</h3>
    </div>
  );
}
