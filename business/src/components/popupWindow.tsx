import { createPortal } from "react-dom";

export default function PopupWindow({
  closeWindow,
  children,
}: {
  closeWindow: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      {createPortal(
        <div
          className="z-10 w-screen h-screen absolute top-0 left-0 bg-black/50 flex justify-center items-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeWindow();
          }}
        >
          <div className="max-h-[90vh] max-w-[80vw] overflow-y-auto p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            {children}
          </div>
        </div>,
        document.getElementById("myRoot")!
      )}
    </>
  );
}
