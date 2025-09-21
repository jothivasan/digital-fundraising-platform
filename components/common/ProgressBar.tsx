
import React from 'react';

interface ProgressBarProps {
    percentage: number;
    height?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ percentage, height = 'h-2' }) => {
    const clampedPercentage = Math.max(0, Math.min(100, percentage));
    
    return (
        <div className={`w-full bg-gray-200 rounded-full ${height} overflow-hidden`}>
            <div 
                className="bg-accent h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${clampedPercentage}%` }}
            ></div>
        </div>
    );
};

export default ProgressBar;
