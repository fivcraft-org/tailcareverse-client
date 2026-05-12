import React, { useState, useRef, useEffect } from "react";
import { FiChevronDown } from "react-icons/fi";

const CustomSelect = ({
  label,
  options,
  value,
  onChange,
  icon: Icon,
  disabled,
  name,
  required,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.id === value) || options[0];

  const handleSelect = (optId) => {
    if (disabled) return;
    onChange({ target: { name, value: optId } });
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col gap-1.5 w-full relative" ref={containerRef}>
      {label && (
        <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 tracking-wider ml-1">
          {label}{" "}
          {required && <span className="text-red-500 ml-0.5 text-xs">*</span>}
        </label>
      )}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`relative group cursor-pointer w-full pl-11 pr-10 py-3 bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 rounded-2xl transition-all text-gray-700 dark:text-gray-200 shadow-sm shadow-gray-100/20 dark:shadow-none 
          ${isOpen ? "ring-2 ring-emerald-500/20 border-emerald-500" : "hover:border-emerald-500/50"}
          ${disabled ? "opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-800/30" : ""}`}
      >
        <div
          className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isOpen ? "text-emerald-500" : "text-gray-400 group-hover:text-emerald-500/70"}`}
        >
          <Icon size={18} />
        </div>
        <div className="font-medium text-sm truncate">
          {selectedOption?.label || "Select option"}
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
          <FiChevronDown
            size={20}
            className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-2xl z-50 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {options.map((opt) => (
              <div
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                className={`px-5 py-3 text-sm font-medium cursor-pointer transition-colors flex items-center justify-between
                  ${
                    value === opt.id
                      ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
              >
                <span>{opt.label}</span>
                {value === opt.id && (
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
