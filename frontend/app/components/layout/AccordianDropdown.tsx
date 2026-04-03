"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

const options = [
  {
    id: 1,
    title: "HTTP / website monitoring",
    desc: "Monitor your website or API endpoint using HTTP(S).",
  },
  {
    id: 2,
    title: "Keyword monitoring",
    desc: "Check for specific text in response body.",
  },
  {
    id: 3,
    title: "Ping monitoring",
    desc: "Ensure your server is always reachable.",
  },
];

export default function MonitorDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(options[0]);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // close on outside click
  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (!dropdownRef.current?.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="w-full max-w-2xl ">

      {/* Selected Item */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-5 bg-[#0f172a] border border-gray-800 rounded-xl hover:bg-[#1e293b] transition"
      >
        <div>
          <h3 className="text-white font-medium">{selected.title}</h3>
          <p className="text-gray-400 text-sm">{selected.desc}</p>
        </div>

        <ChevronDown
          className={`transition-transform ${isOpen ? "rotate-180" : ""
            }`}
        />
      </button>

      {/* Dropdown List */}
      {isOpen && (
        <div className="mt-2  bg-[#020617] border border-gray-800 rounded-xl overflow-hidden">
          {options.map((item, index) => (
            <div
              key={index}
              onClick={() => {

                if (index + 1 === 1) {
                  router.push('/http')
                } else if (index + 1 === 2) {
                  router.push('/keyword');
                } else if (index + 1 === 3) {
                  router.push('/ping');
                }
                setSelected(item);
                setIsOpen(false);
              }}
              className="p-4 hover:bg-[#0f172a] cursor-pointer border-b border-gray-800 last:border-none"
            >
              <h3 className="text-white">{item.title}</h3>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}