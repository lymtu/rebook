import type { Alert } from "@/lib/context/alert/alertContext";
import { formatTime } from "@/lib/utils/TimeFormatConverter";
import animation from "@/assets/style/alterAnimation.module.css";

export default function AlterContainer({ alertList }: { alertList: Alert[] }) {
  return (
    <>
      {alertList.length > 0 && (
        <div
          className="absolute max-h-screen overflow-y-hidden bottom-0 right-0 flex flex-col-reverse items-end gap-2 p-4 z-100"
          style={{ scrollbarWidth: "none" }}
        >
          {alertList.map((alert) => (
            <div
              key={alert.id + alert.type}
              id={alert.id + alert.type}
              className={
                getColor(alert.type) +
                " " +
                animation["fade-in-from-right-bottom"] +
                " rounded-md p-2 shadow text-white max-w-[300px] duration-150 transition-[flex-basis] basis-0"
              }
              onAnimationStart={(e: React.AnimationEvent<HTMLDivElement>) => {
                const target = e.target as HTMLElement;
                setTimeout(() => {
                  target.classList.remove(
                    animation["fade-in-from-right-bottom"]
                  );
                  target.classList.add(animation["fade-out-to-right-bottom"]);
                  target.onanimationstart = null;
                }, 2750);
              }}
            >
              <div className="indent-8">{alert.message}</div>
              <div className="mt-2 text-xs text-end">
                {formatTime(alert.id)}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function getColor(type: Alert["type"]) {
  switch (type) {
    case "error":
      return "bg-red-500 dark:bg-red-600";
    case "success":
      return "bg-green-500 dark:bg-green-600";
    case "warning":
      return "bg-yellow-500 dark:bg-yellow-600";
    case "info":
      return "bg-blue-500 dark:bg-blue-600";
  }
}
