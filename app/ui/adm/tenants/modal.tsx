'use client';
import { createPortal } from "react-dom";
import { useRef, useEffect, useState, ReactNode, ReactPortal } from "react";

export default function Modal({ children, open }: { children: ReactNode, open: boolean }) {
  if (typeof window === 'undefined') {
    // This ensures the component does not render on the server
    return null;
  }
  const modalDomElement = document.getElementById("modal") as Element;
  const dialog = useRef<any>(null);
  const [portal, setPortal] = useState<ReactPortal>();

  // useEffect(() => {
  //   const modalDomElement = document.getElementById("modal") as Element;
  //     if (modalDomElement) {
  //       setPortal(
  //           createPortal(
  //             <dialog
  //               ref={dialog}
  //               className="w-[400px] mx-auto my-[10rem] p-4 border border-gray-300 rounded-[10px] z-[100]"
  //             >
  //               {children}
  //             </dialog>,
  //             modalDomElement
  //           )
  //         );
  //     }
  // }, [document]);


  useEffect(() => {

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
    // return portal;
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
