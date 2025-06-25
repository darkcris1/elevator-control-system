import type React from "react";


// Button component definition, now typed with ButtonProps
export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...rest }) => {
    return (
      <button
        {...rest}
        className={`
          mb-4 cursor-pointer px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors w-full
          ${rest.className || ''}
        `}
      >
        {children}
      </button>
    );
  };