
import React, { useEffect } from 'react';
import { XIcon } from './Icons';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-lg shadow-xl transform transition-all sm:max-w-md w-full"
                onClick={e => e.stopPropagation()}
                role="document"
            >
                <div className="p-6 relative">
                     <button 
                        type="button" 
                        className="absolute top-3 right-3 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 inline-flex items-center z-10" 
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
