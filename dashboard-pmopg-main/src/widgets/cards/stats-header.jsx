import { getDefaultDepartment, statisticsCardsData } from "@/data"
import { StatisticsCard } from "."
import React, { useCallback, useMemo, useState } from "react"
import { Typography } from "@material-tailwind/react"
import { dateBefore, formatDate } from "@/helpers/date"
import { countDayDuration } from "@/helpers/env"
import { ClipboardDocumentListIcon } from "@heroicons/react/24/solid"

export function StatsHeader({ ministry = getDefaultDepartment(), from = dateBefore(countDayDuration), to = formatDate() }) {
    // const [stats, setStats] = useState({})

    // const totalCount = useMemo(() => {
    //     console.log(Object.values(stats), stats)
    //     return Object.values(stats).reduce((sum, count) => sum + (parseInt(count?.replace(',', '')) ?? 0), 0).toLocaleString()
    // }, [stats])

    // const updateCount = useCallback((count, title) => {
    //     console.log(title, count, stats);

    //     setTimeout(() => setStats({
    //         ...stats,
    //         [title]: count
    //     }), 100)

    // }, [stats])
    // const updateCount = (count, title) => {
    //     setTimeout(() => setStats({
    //         ...stats,
    //         [title]: count
    //     }), 100)
    // }

    // const addToStats = 

    return (
        <div className="mb-12 grid gap-y-10 gap-x-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xxl:grid-cols-6" >
            {
                statisticsCardsData.map(({ icon, title, footer, getCount, tooltip, ...rest }, index) => (
                    <StatisticsCard
                        key={title}
                        getCount={(ministry, from, to) => getCount(ministry, from, to)}
                        {...rest}
                        title={title}
                        icon={React.createElement(icon, {
                            className: "w-6 h-6 text-white",
                        })}
                        // footer={
                        //     <Typography className="font-normal text-blue-gray-600">
                        //         <strong className={footer.color}>{footer.value}</strong>
                        //         &nbsp;{footer.label}
                        //     </Typography>
                        // }
                        ministry={ministry}
                        from={from}
                        to={to}
                        tooltip={tooltip}
                    // updateCount={updateCount}
                    />
                ))
            }

            {/* <StatisticsCard
                // key={title}
                // getCount={(ministry, from, to) => { total_countObject.values(stats).reduce((sum, count) => sum + count, 0)}
                value={totalCount}
                // {...rest}
                title={"Total"}
                icon={React.createElement(ClipboardDocumentListIcon, {
                    className: "w-6 h-6 text-white",
                })}
                // footer={
                //     <Typography className="font-normal text-blue-gray-600">
                //         <strong className={footer.color}>{footer.value}</strong>
                //         &nbsp;{footer.label}
                //     </Typography>
                // }
                ministry={ministry}
                from={from}
                to={to}
                tooltip={"Total Grievances"}
            /> */}
        </div>
    )
}