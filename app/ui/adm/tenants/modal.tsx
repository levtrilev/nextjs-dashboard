import { createPortal } from "react-dom";

// import "./Modal.css";
import { useRef, useEffect, ReactNode } from "react";

export default function Modal({ children, open }: { children: ReactNode, open: boolean }) {
  const modalDomElement = document.getElementById("modal") as Element;
  const dialog = useRef<any>(null);

  // useEffect(() => {
  //   const handleCancel = (event: KeyboardEvent) => {
  //     if (event.key === "Escape") {
  //       // if (event.key === 'Escape' && preventClosing)
  //       event.preventDefault(); // event.stopPropagation();
  //     }
  //   };
  //   if (dialog.current) {
  //     // console.log(dialog.current?"есть диалог":"нет диалога");
  //     dialog.current.addEventListener("keydown", handleCancel);
  //   }
  // }, [dialog.current]);

  useEffect(() => {
    // if (dialog.current && !open) {
    //   dialog.current.removeEventListener("keydown", handleCancel);
    // }
    if (dialog.current) {
      if (open) {
        dialog.current.showModal();
      }
      if (!open) {
        dialog.current.close();
      }  
    }
  }, [dialog.current, open]);


  const modalElement = document.getElementById("modal");
  if (modalElement) {
    return createPortal(
      <dialog
        ref={dialog}
        // onKeyDown={handleCancel ? handleCancel : null}
        className="w-[400px] mx-auto my-[10rem] p-4 border border-gray-300 rounded-[10px] z-[100]"
      >
        {children}
      </dialog>,
      modalDomElement
    );
  } else {
    return undefined;
  }
}
