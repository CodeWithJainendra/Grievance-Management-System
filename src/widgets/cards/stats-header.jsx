import { getDefaultDepartment, statisticsCardsData } from "@/data"
import { StatisticsCard } from "."
import SimpleStatsCard from "./SimpleStatsCard"
import React, { useCallback, useMemo, useState, useEffect } from "react"
import { Typography } from "@material-tailwind/react"
import { dateBefore, formatDate } from "@/helpers/date"
import { countDayDuration } from "@/helpers/env"
import { ClipboardDocumentListIcon } from "@heroicons/react/24/solid"
import { cacheable } from "@/helpers/cache"
import dashboardService from "@/services/dashboard"

export function StatsHeader({ ministry = getDefaultDepartment(), from = dateBefore(countDayDuration), to = formatDate() }) {
    const [statsData, setStatsData] = useState({});
    const [loading, setLoading] = useState(true);

    // Load all statistics with a single API call
    useEffect(() => {
        const loadAllStats = async () => {
            console.log('📊 StatsHeader: Loading all statistics with single API call');
            setLoading(true);
            
            // Set all cards to loading state
            const initialLoading = {};
            statisticsCardsData.forEach(card => {
                initialLoading[card.title] = true;
            });
            
            try {
                // Use the optimized getCDISStatistics function that fetches all data at once
                const statistics = await dashboardService.getCDISStatistics(ministry, from, to);
                
                console.log('📈 All statistics loaded:', statistics);
                
                // Map the statistics to card titles
                const mappedStats = {
                    'TOTAL GRIEVANCES': statistics.totalGrievances || 0,
                    'PENDING': statistics.pendingGrievances || 0,
                    'RESOLVED': statistics.resolvedGrievances || 0,
                    'AVG. RESOLUTION TIME': statistics.avgResolutionTime || 0
                };
                
                console.log('✅ Mapped statistics:', mappedStats);
                setStatsData(mappedStats);
                
            } catch (error) {
                console.error('❌ Error loading statistics:', error);
                
                // Set fallback data
                const fallbackStats = {
                    'TOTAL GRIEVANCES': 0,
                    'PENDING': 0,
                    'RESOLVED': 0,
                    'AVG. RESOLUTION TIME': 0
                };
                setStatsData(fallbackStats);
            } finally {
                setLoading(false);
            }
        };

        loadAllStats();
    }, [ministry, from, to]);

    return (
        <div className="mb-8">
            {/* Simple Grid Layout */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {statisticsCardsData.map((card, index) => (
                    <SimpleStatsCard
                        key={card.title}
                        color={card.color}
                        icon={card.icon}
                        title={card.title}
                        value={statsData[card.title] || 0}
                        suffix={card.suffix || ""}
                        tooltip={card.tooltip}
                        loading={loading}
                    />
                ))}
            </div>
        </div>
    )
}