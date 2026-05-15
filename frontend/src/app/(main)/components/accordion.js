"use client";

import { useRef } from "react";
import { Plus } from "lucide-react";

export default function AccordionItem({ isOpen, onToggle, faq }) {
  const contentRef = useRef(null);
  return (
    <section>
      <div className={`border-2 border-(--accent) px-6 rounded-lg`}>
        <button
          onClick={onToggle}
          className=" w-full flex items-center justify-between py-4"
        >
          <p
            className={`font-semibold text-[15.5px] md:text-xl text-left w-[80%]`}
          >
            {faq.question}
          </p>

          <Plus
            className={`transition-transform duration-300 ease-in-out ${isOpen ? "rotate-45" : "rotate-0"}`}
          />
        </button>

        <div
          ref={contentRef}
          className="overflow-hidden transition-[maxHeight, opacity] duration-300 ease-in-out will-change-[maxHeight]"
          style={{
            maxHeight: isOpen ? `${contentRef.current?.scrollHeight}px` : "0px",
            opacity: isOpen ? 1 : 0,
          }}
        >
          <p className="pb-4 text-[14px] md:text-[17px]">{faq.answer}</p>
        </div>
      </div>
    </section>
  );
}
