import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Card, CardBody, Typography, IconButton } from '@material-tailwind/react';

const StatePopup = ({ 
    isOpen, 
    onClose, 
    stateData, 
    position = { x: 0, y: 0 } 
}) => {
    if (!isOpen || !stateData) return null;

    const { 
        stateName, 
        grievanceCount, 
        percentage, 
        totalGrievances,
        cities = {} 
    } = stateData;

    // Convert cities object to array and sort by count
    const citiesArray = Object.entries(cities)
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Show top 5 cities

    return (
        <div 
            className="fixed z-[2000] pointer-events-none"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                transform: 'translate(-50%, -100%)'
            }}
        >
            <Card className="w-80 shadow-xl border pointer-events-auto state-popup">
                <CardBody className="p-4">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                        <Typography variant="h6" color="blue-gray" className="font-bold">
                            {stateName}
                        </Typography>
                        <IconButton
                            variant="text"
                            size="sm"
                            onClick={onClose}
                            className="!absolute !top-2 !right-2"
                        >
                            <XMarkIcon className="h-4 w-4" />
                        </IconButton>
                    </div>

                    {/* Main Stats */}
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between items-center">
                            <Typography variant="small" color="gray" className="font-medium">
                                Total Grievances:
                            </Typography>
                            <Typography variant="small" color="blue-gray" className="font-bold text-lg">
                                {grievanceCount?.toLocaleString('en-US') || 0}
                            </Typography>
                        </div>
                        
                        {percentage && (
                            <div className="flex justify-between items-center">
                                <Typography variant="small" color="gray" className="font-medium">
                                    Percentage of Total:
                                </Typography>
                                <Typography variant="small" color="blue-gray" className="font-bold">
                                    {percentage.toFixed(1)}%
                                </Typography>
                            </div>
                        )}

                        {totalGrievances && (
                            <div className="flex justify-between items-center">
                                <Typography variant="small" color="gray" className="font-medium">
                                    National Total:
                                </Typography>
                                <Typography variant="small" color="gray">
                                    {totalGrievances.toLocaleString('en-US')}
                                </Typography>
                            </div>
                        )}
                    </div>

                    {/* Top Cities */}
                    {citiesArray.length > 0 && (
                        <div>
                            <Typography variant="small" color="gray" className="font-medium mb-2">
                                Top Cities:
                            </Typography>
                            <div className="space-y-1">
                                {citiesArray.map(({ city, count }, index) => (
                                    <div key={city} className="flex justify-between items-center text-xs">
                                        <span className="text-gray-600 capitalize">
                                            {index + 1}. {city}
                                        </span>
                                        <span className="font-medium text-blue-gray-800">
                                            {count.toLocaleString('en-US')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Color Indicator */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <Typography variant="small" color="gray" className="font-medium">
                                Intensity Level:
                            </Typography>
                            <div className="flex items-center space-x-2">
                                <div 
                                    className="w-4 h-4 rounded border"
                                    style={{ 
                                        backgroundColor: stateData.color || '#E6F3FF' 
                                    }}
                                ></div>
                                <Typography variant="small" color="gray">
                                    {grievanceCount > 750 ? 'Very High' : 
                                     grievanceCount > 500 ? 'High' : 
                                     grievanceCount > 250 ? 'Medium' : 'Low'}
                                </Typography>
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default StatePopup;