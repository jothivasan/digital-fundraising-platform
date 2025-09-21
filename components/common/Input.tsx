import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input: React.FC<InputProps> = ({ className, ...props }) => {
    const baseClasses = "mt-1 block w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-neutral-dark placeholder-gray-400 shadow-sm transition focus:border-primary-focus focus:outline-none focus:ring-1 focus:ring-primary-focus sm:text-sm";
    
    return (
        <input className={`${baseClasses} ${className}`} {...props} />
    );
};

export default Input;