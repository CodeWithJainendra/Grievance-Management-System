import { useFilter } from "@/context/FilterContext"
import { SearchFilters } from "."
import { basicQueryTypes, isValidBasicQueryType, isValidSpatialFilterType, onlySemanticQueryType } from "@/widgets/layout"
import { HeatMap2 } from "@/widgets/maps/heatmap/HeatMap2"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "react-toastify"
import mapService from "@/services/maps"
import grievanceService from "@/services/grievances"
import GrievanceList from "@/widgets/grievance/list"
import { pageSize } from "@/helpers/env"
import { json2csv } from "json-2-csv"
import district_lat_long from "@/data/json/district_lat_long.json"
import { downloadData } from "@/helpers/download"
import { GlobeAltIcon } from "@heroicons/react/24/solid"
import { formatDate } from "@/helpers/date"

export const SpatialSearch = () => {
    const { filters, searching, startSearch, stopSearch, setFilters, setPageno } = useFilter()
    const [grievanceLength, setGrievanceLength] = useState(0)

    const initiateSearch = () => {
        setPageno(1)
        startSearch()
    }

    return <div className="flex flex-col justify-center min-h-[90vh] bg-[url('../img/spatial_bg.png')] bg-center">
        <div className={`${grievanceLength == 0 ? 'max-w-4xl self-center' : 'px-3 pt-2'}`}>
            <SearchFilters
                startSearch={initiateSearch}
                // types={basicQueryTypes}
                types={basicQueryTypes}
                searchButtonColor="green"
                buttonIcon={
                    <GlobeAltIcon height={'1.5rem'} className="mr-1" />
                }
                disabled={!isValidBasicQueryType(filters.type)}
            />
        </div>

        <SpatialDataDisplay updateGrievanceLength={setGrievanceLength} />
    </div>
}

export const SpatialDataDisplay = ({
    updateGrievanceLength = () => ''
}) => {
    const { filters, searching, startSearch, tempFilters, stopSearch, setFilters, pageno, setPageno } = useFilter()
    const listingRef = useRef(null)
    const [stateWiseGrievances, setStateWiseGrievances] = useState([])
    const [grievances, setGrievances] = useState([])
    const [count, setCount] = useState(0)
    const [total, setTotal] = useState(0)
    const [noDataFound, setNoDataFound] = useState(true)
    const [downloading, setDownloading] = useState(false)
    const [isLocallySearching, setIsLocallySearching] = useState(false) // Creating a local search state to prevent multiple calls at initial load
    const [selectedState, setSelectedState] = useState(undefined)
    const [preventHeatmapUpdate, setPreventHeatmapUpdate] = useState(false)
    const [focusedDistrict, setFocusedDistrict] = useState(undefined)

    const getDistrictStats = stateName =>
        new Promise(async resolve => {
            const filtersWithState = {
                ...filters,
                state: stateName,
                district: filters.district == focusedDistrict ? 'All' : filters.district
            }

            // setFilters(filtersWithState)

            setPreventHeatmapUpdate(true)

            setSelectedState(stateName)

            setPageno(1)

            startSearch(filtersWithState)

            const districts = (await mapService.districtWiseCounts(filtersWithState, pageno))
                ?.data?.district_wise_distribution
                ?? {}

            resolve(
                Object.entries(districts)
                    .map(([district, count]) => ({
                        district,
                        count,
                        ...getDistrictLatLong(district, stateName)
                    }))
                ?? []
            )
        })

    const focusDistrict = newDistrict => {
        if (searching)
            return false

        setFocusedDistrict(newDistrict)

        setPageno(1)

        setPreventHeatmapUpdate(true)

        // setFilters({
        //     ...filters,
        //     district: newDistrict
        // })

        startSearch({
            ...filters,
            state: selectedState,
            district: newDistrict
        })

        return true
    }

    const listingTitle = useMemo(() => `Searched Grievances ${selectedState ? `for ${selectedState}` : ''} ${focusedDistrict ? ` -> ${focusedDistrict}` : ''}`, [selectedState, focusedDistrict])

    const download = async () => {
        setDownloading(true)

        const data = (await grievanceService.queryGrievances({
            ...filters,
            download_req: 1,
            size: 10000
        }, pageno)).data

        downloadData(data?.filename)


        setDownloading(false)
    }

    const getGrievances = async (temp = null) => {
        try {
            const data = (await grievanceService.queryGrievances(temp ?? tempFilters ?? filters, pageno)).data
            let list = data.data[0] == '{}' ? [] : data.data

            if (!preventHeatmapUpdate) {
                setStateWiseGrievances(
                    data.count > 0
                        ? createStateWiseArray(
                            (await mapService.stateWiseCounts(filters, pageno))
                                .data?.state_wise_distribution
                        )
                        : []
                )

                setSelectedState(undefined)
            }
            else
                setPreventHeatmapUpdate(false)

            stopSearch()

            if (!list || list.length == 0) {
                toast.warn("No data found!")
            }

            setGrievances(list)
            setCount(data.count)
            setTotal(data.total_count?.total_count)
            setNoDataFound(data.count == 0)

            listingRef.current.scrollIntoView({
                behavior: 'smooth'
            })
        } catch {
            toast("There was an error. Please try again.", { type: "error" })
            stopSearch()
        }
    }

    useEffect(() => {
        if (isLocallySearching) {
            if (filters.query.length == 0) {
                toast.warn("Enter the text to search")
                stopSearch()
            }
            else
                getGrievances()

        }
    }, [isLocallySearching])

    // Updating local search state to prevent multiple calls at initial load
    useEffect(() => {
        setIsLocallySearching(searching)
    }, [searching])

    useEffect(() => {
        startSearch()
    }, [pageno])

    useEffect(() => {
        updateGrievanceLength(grievances.length)
    }, [grievances])

    return <div
        className="grid md:grid-cols-5 gap-2 gap-y-5 items-center overflow-x-scroll md:overflow-visible"
        ref={listingRef}
    >
        {
            stateWiseGrievances.length != 0 &&
            <div className={`md:col-span-2 h-[96vh] ${grievances.length == 0 && 'md:col-span-5'}`}>
                <HeatMap2
                    grievances={stateWiseGrievances}
                    className={''}
                    getDistricts={getDistrictStats}
                    focusDistrict={focusDistrict}
                />
            </div>
        }

        <div className={`md:col-span-3 ${grievances.length == 0 && 'hidden'}`}>
            <GrievanceList
                compactTitle={true}
                title={listingTitle}
                grievances={grievances}
                count={count}
                pageno={pageno}
                setPageno={setPageno}
                total={total}
                noDataFound={noDataFound}
                download={download}
                downloading={downloading}
                scrollH={"85vh"}
                searching={searching}
            />
        </div>
    </div>
}

export const createStateWiseArray = object => Object.keys(object)
    .map(state => ({
        state: state?.toLowerCase(),
        count: object[state]
    }))

const createStateDistrictTree = grievances => grievances.reduce((states, grievance) => {
    let stateIndex = states.findIndex(state => state.name == grievance.state)

    if (stateIndex == -1) {
        stateIndex = states.length
        states.push({
            name: grievance.state,
            grievances: [],
            districts: []
        })
    }

    let districtIndex = states[stateIndex].districts.findIndex(district => district.name == grievance.district)

    if (districtIndex == -1) {
        districtIndex = states[stateIndex].districts.length
        states[stateIndex].districts.push({
            name: grievance.district,
            grievances: []
        })
    }

    states[stateIndex].grievances.push(grievance)
    states[stateIndex].districts[districtIndex].grievances.push(grievance)

    return states
}, [])

const csvColumnNames = [
    {
        field: 'registration_no',
        title: "Registration No."
    },
    {
        field: 'state',
        title: "State"
    },
    {
        field: 'district',
        title: "District"
    },
    {
        field: 'recvd_date',
        title: "Received Date"
    },
    {
        field: 'closing_date',
        title: "Closing Date"
    },
    {
        field: 'name',
        title: "Name"
    },
    {
        field: 'ministry',
        title: "Ministry"
    }
]

export const downloadCSV = async (data, columns = [], filters = {}, additionalData = null, title = "Grievances") => {
    const csvText = json2csv(data, { keys: columns.length == 0 ? undefined : columns })

    const blob = new Blob([csvText], { type: 'text/csv' })

    const url = window.URL.createObjectURL(blob)

    const filterValues = Object.values(filters)

    const filename = 'IGMS2_' +
        title + '_' +
        formatDate(new Date(), 'd_MMM_yyyy') +
        (additionalData ? '_' + additionalData : '') +
        (filterValues.length > 0 ? '_' : '') +
        filterValues.join('_') +
        '.csv'

    const a = document.createElement('a')

    a.setAttribute('href', url)

    a.setAttribute('download', filename)

    a.click()
}

const getDistrictLatLong = (district, state = null) => {
    district = district.toLowerCase().trim()
    state = state.toLowerCase().trim()

    let latLongData =
        district_lat_long
            .find(districtObject => // Checking for simillarity in district and state
                districtObject.district == district
                && districtObject.state == state
            )
        ?? district_lat_long
            .find(districtObject => // Checking for simillarity in district name only if the above condition fails
                districtObject.district == district
            )

    return {
        latitude: latLongData?.latitude,
        longitude: latLongData?.longitude
    }
}