import React from 'react';
import { Tooltip } from 'react-tooltip';

const RectangularPieChart = ({ data, width = 600, height = 400, onClick }) => {
    // Calculate total value for percentage distribution
    const totalValue = data.reduce((sum, item) => sum + (typeof (item.value) == 'number' ? item.value : 0), 0);

    // Parameters for layout
    const maxColumns = 4; // Maximum number of columns in the staggered layout
    const padding = 8; // Padding between rectangles
    const minRectHeight = 50; // Minimum height for each rectangle

    // Calculate the width of each column
    const columnWidth = (width - padding * (maxColumns - 1)) / maxColumns;

    // Sort data by value in descending order to place larger rectangles first
    const sortedData = [...data].map((value, index) => ({ ...value, index })).sort((a, b) => b.value - a.value);

    // Calculate positions and dimensions for each rectangle
    const rectangles = [];
    let currentY = 0;
    let currentColumn = 0;
    let columnHeights = Array(maxColumns).fill(0);

    sortedData.forEach((item, index) => {
        const proportion = item.value / totalValue;
        // Calculate rectangle height based on proportion
        const rectHeight = Math.min(Math.max(minRectHeight, proportion * height * 2), height);
        const rectWidth = columnWidth;

        // Find the column with the minimum height to place the next rectangle
        const minHeightColumn = columnHeights.indexOf(Math.min(...columnHeights) > height ? height : Math.min(...columnHeights));
        currentColumn = minHeightColumn;
        currentY = columnHeights[currentColumn];

        const xPosition = currentColumn * (columnWidth + padding);
        const yPosition = currentY;

        // Generate a gradient of blue shades based on data length
        const lightnessStart = 30; // Darker blue
        const lightnessEnd = 70; // Lighter blue
        const lightnessStep = data.length > 1 ? (lightnessEnd - lightnessStart) / (data.length - 1) : 0;
        const lightness = lightnessStart + index * lightnessStep;
        const color = `hsl(200, 70%, ${lightness}%)`; // Hue 200 for blue, saturation 70%

        // Update the height of the current column
        columnHeights[currentColumn] += rectHeight + padding;

        // Split the title into words
        const words = [
            ...item.title.replace(/,/g, ', ').split(' '),
            ...((item.description && proportion > 0.3)
                ? [":", ...item.description.replace(/,/g, ', ').split(' ')]
                : [])

        ];
        const fontSize = rectHeight < 60 ? 10 : 12; // Font size in pixels
        const avgCharWidth = fontSize * 0.7; // Approximate width per character (in pixels)
        const spaceWidth = fontSize * 0.3; // Approximate width of a space
        const maxLineWidth = rectWidth - 10; // Maximum line width (with some padding)

        // Group words into lines based on text length
        const lines = [];
        let currentLine = [];
        let currentLineWidth = 0;

        words.forEach(word => {
            const wordWidth = word.length * avgCharWidth;
            const additionalWidth = currentLine.length > 0 ? spaceWidth : 0; // Add space width if not the first word

            if (currentLineWidth + wordWidth + additionalWidth > maxLineWidth && currentLine.length > 0) {
                // Start a new line
                lines.push(currentLine.join(' '));
                currentLine = [word];
                currentLineWidth = wordWidth;
            } else {
                // Add word to current line
                currentLine.push(word);
                currentLineWidth += wordWidth + additionalWidth;
            }
        });

        // Add the last line if it exists
        if (currentLine.length > 0) {
            lines.push(currentLine.join(' '));
        }

        const lineHeight = 1.2; // Line height in em
        const lineHeightPx = fontSize * lineHeight; // Convert line height to pixels
        const totalTextHeight = lines.length * lineHeightPx; // Total height of the text block

        // Calculate the starting y position to vertically center the text block
        const textYStart = yPosition + (rectHeight - totalTextHeight) / 2 + fontSize / 2;

        rectangles.push(
            <g key={item.title}
                data-tooltip-id={`rect-tooltip-${item.index}`}
                title={item.description}>
                <rect
                    x={xPosition}
                    y={yPosition}
                    width={rectWidth}
                    height={rectHeight}
                    fill={color}
                    className="transition-all duration-300 cursor-pointer"
                    rx="4"
                    onClick={() => onClick && onClick(item.index)}
                    title={item.description}
                />
                <text
                    x={xPosition + rectWidth / 2}
                    y={textYStart}
                    textAnchor="middle"
                    className="fill-white font-medium select-none cursor-pointer"
                    style={{ fontSize: `${fontSize}px` }}
                    onClick={() => onClick && onClick(item.index)}
                    title={item.description}
                >
                    {lines.map((line, i) => (
                        <tspan
                            key={i}
                            x={xPosition + rectWidth / 2}
                            dy={i === 0 ? '0' : `${lineHeight}em`}
                        >
                            {line}
                        </tspan>
                    ))}
                </text>
            </g>
        );
    });

    // Adjust the SVG height to fit all rectangles
    const totalHeight = Math.max(...columnHeights);

    return (
        <div className={`w-full max-w-[${width}px] mx-auto mt-3`}>
            <svg width={width} height={height} className="w-full">
                {rectangles}
            </svg>

            {
                sortedData.length > 0 && sortedData.map((item, index) => (
                    <Tooltip
                        key={`rect-tooltip-${item.index}`}
                        id={`rect-tooltip-${item.index}`}
                        place="top"
                        className="bg-gray-800 text-white p-2 rounded shadow-lg z-[10000] w-[200px]"
                    >
                        {item.description}
                    </Tooltip>
                ))
            }

            <div className="mt-6 flex flex-wrap justify-center gap-3">
                {sortedData.filter(item => typeof item.value == 'number').map((item, index) => {
                    const lightnessStart = 30;
                    const lightnessEnd = 70;
                    const lightnessStep = data.length > 1 ? (lightnessEnd - lightnessStart) / (data.length - 1) : 0;
                    const lightness = lightnessStart + index * lightnessStep;
                    const color = `hsl(200, 70%, ${lightness}%)`;
                    return (
                        <div key={item.index} className="flex items-center gap-2 cursor-pointer" onClick={() => onClick && onClick(item.index)} title={item.description}>
                            <div
                                className="w-5 h-5 rounded"
                                style={{ backgroundColor: color }}
                            />
                            <span className="text-sm font-medium">
                                {item.title}: {((item.value / totalValue) * 100).toFixed(1)}%
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RectangularPieChart;