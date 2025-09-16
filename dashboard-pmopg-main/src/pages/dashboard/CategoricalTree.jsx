import { Button, Input } from "@material-tailwind/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Datepicker from "react-tailwindcss-datepicker"
import { getGrievancesUsingRegNos, getCategoryTree } from "@/services/rca";
import ReactApexChart from "react-apexcharts";
import { ChevronRightIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { defaultFrom, defaultTo, pageSize } from "@/helpers/env";
import GrievanceList from "@/widgets/grievance/list";
import { toast } from "react-toastify";
import Autosuggest from "react-autosuggest";
import stateList from "@/data/state-data"

import './css/autosuggest-theme.css'
import './css/categorical-tree.css'
import { departmentData, getDefaultDepartment, getDepartmentList } from "@/data";
import { endOfMonth, endOfQuarter, lastDayOfYear, setDayOfYear, startOfMonth, startOfQuarter, subMonths, subQuarters, subYears } from "date-fns";

export const CategoricalTree = () => {
    const [rca, setRca] = useState({})
    const [appendPath, setAppendPath] = useState(null)
    const [rcaPath, setRcaPath] = useState([])
    const [filters, setFilters] = useState({
        from: defaultFrom,
        to: defaultTo,
        state: 'All',
        district: 'All',
        ministry: getDefaultDepartment(),
        showAll: true
    })
    const [searching, setSearching] = useState(true)

    const currentBranch = (customPath = null) => {
        let path = customPath ?? rcaPath

        return path.reduce(
            (branch, childIndex) => {
                return branch.children[childIndex]
            },
            rca
        )
    }

    const updatePathLength = length => setRcaPath([...rcaPath.splice(0, length)])

    const series = useMemo(() => {
        let branch = currentBranch();
        console.log('Current branch for series:', branch);

        let seriesData = [];

        if (branch && branch.children && branch.children.length > 0) {
            seriesData = branch.children
                .filter(child => child.count > 0) // Only filter out zero counts
                .slice(0, 20) // Increase limit to 20 for better visualization
                .map(child => ({
                    x: child.title?.length > 25 ? child.title.substring(0, 25) + '...' : (child.title || 'Category'),
                    y: child.count || 0
                }));
            
            if (seriesData.length === 0) {
                // If all children are filtered out, use root as single node
                seriesData = [{
                    x: branch.title || 'Grievances',
                    y: branch.count || 0
                }];
            }
            
            console.log('Series data from children:', seriesData);
        } else if (branch && branch.count > 0) {
            seriesData = [{
                x: branch.title || 'Total Grievances',
                y: branch.count
            }];
            console.log('Series data fallback:', seriesData);
        } else {
            seriesData = [{
                x: 'No Data Available',
                y: 0
            }];
            console.log('No data fallback for series');
        }

        const result = [{
            data: seriesData
        }];

        console.log('Final series for treemap:', result);
        return result;
    }, [rcaPath, rca, searching]);

    const breadcrumbs = useMemo(() => getBreadCrumbs(rca, rcaPath), [rca, rcaPath])

    useEffect(() => {
        async function load() {
            try {
                let response = await getCategoryTree(filters);
                console.log('CategoryTree API response:', response.data); // Debug log

                if (response?.data && response.data.grievanceData && response.data.grievanceData.length > 0) {
                    console.log('Building tree from', response.data.grievanceData.length, 'grievances');
                    setRcaPath([])
                    // Build tree from flat grievanceData, grouping by complaintType
                    const treeData = buildTreeFromGrievances(response.data.grievanceData);
                    console.log('Tree data built:', treeData);
                    const tree = generateTreeFromRca(treeData, 'Root');
                    console.log('Final tree:', tree);
                    if (tree && tree.children && tree.children.length > 0) {
                        setRca(tree);
                        toast.success(`Loaded ${response.data.grievanceData.length} grievances into ${tree.children.length} categories`);
                    } else {
                        console.error('Failed to build valid tree structure');
                        toast.error("Failed to process data. Please check the API response format.");
                    }
                }
                else {
                    console.warn('No grievanceData in response:', response.data);
                    toast("No data found!", { type: 'error' })
                }
            } catch (error) {
                console.error('CategoryTree load error:', error);
                toast("Error loading data. Please try again.", { type: 'error' })
            }
            setSearching(false)
        }

        if (searching) {
            load()
        }
    }, [searching])

    useEffect(() => {
        if (appendPath != null) {
            let new_path = [...rcaPath, appendPath]

            if (currentBranch(new_path))
                setRcaPath(new_path)

            setAppendPath(null)
        }
    }, [appendPath])

    return (
        <div>
            <Filters
                filters={filters}
                setFilters={setFilters}
                searching={searching}
                startSearch={() => setSearching(true)}
            />

            <Chart
                series={series}
                pushPath={setAppendPath}
            />

            <BreadCrumbs
                list={breadcrumbs}
                setPathLength={updatePathLength}
            />

            {
                currentBranch()?.reg_nos && currentBranch().reg_nos.length > 0 &&
                <GrievanceListBox reg_nos={currentBranch()?.reg_nos} />
            }
        </div>
    )
}

export const DEFAULT_STATE_DISTRICT = {
    text: '',
    values: {
        state: 'All',
        district: 'All'
    }
}

export const DEFAULT_MINISTRY = {
    text: '',
    value: getDefaultDepartment()
}

export const Filters = ({
    filters,
    setFilters,
    searching,
    startSearch = () => '',
    CustomActionButton = null
}) => {
    const [dateRange, setDateRange] = useState({
        startDate: filters.from,
        endDate: filters.to
    });
    const [stateDistrict, setStateDistrict] = useState(DEFAULT_STATE_DISTRICT)
    const [ministry, setMinistry] = useState(DEFAULT_MINISTRY)

    useEffect(() => {
        setFilters({
            ...filters,
            from: dateRange.startDate,
            to: dateRange.endDate,
            ...(
                stateDistrict?.values ?? DEFAULT_STATE_DISTRICT.values
            ),
            ministry: ministry?.value ?? DEFAULT_MINISTRY.value
        })
    }, [dateRange, stateDistrict, ministry])

    return (
        <div className="grid md:grid-cols-4 xl:grid-cols-7 gap-3">
            <div className="col-span-2">
                <DateRangePicker
                    value={dateRange}
                    onChange={setDateRange}
                />
            </div>

            <div className="col-span-2">
                <MinistryAutocomplete ministry={ministry} setMinistry={setMinistry} />
            </div>

            <div className="col-span-2">
                <StateDistrictAutocomplete stateDistrict={stateDistrict} setStateDistrict={setStateDistrict} />
            </div>

            <div className="col-span-2 xl:col-span-1 flex flex-col md:flex-row md:justify-end">
                {
                    CustomActionButton
                    ?? <Button
                        className="h-[2.6rem] flex justify-center items-center"
                        onClick={startSearch}
                        disabled={searching}
                    >
                        {
                            searching &&
                            <Loader className="mr-2 animate-spin" color="#fff" />
                        }

                        Search
                    </Button>
                }
            </div>

            {/* <AutocompleteField
                label="Test label"
                {...frontendProps}
                name={nameWithMultipleValues}
                allowMultiple={true}
            /> */}
        </div>
    )
}

export const Chart = ({
    series,
    pushPath
}) => {

    const childClick = (e, p, opts) => {
        if (opts.dataPointIndex != -1)
            pushPath(opts.dataPointIndex)
    }

    const options = {
        legend: {
            show: false
        },
        chart: {
            height: 250,
            type: 'treemap',
            toolbar: {
                show: false
            },
            events: {
                click: childClick
            }
        },
        dataLabels: {
            background: {
                padding: 0
            }
        },
        tooltip: {
            fixed: {
                enabled: true,
                position: 'topRight',
                offsetX: 0,
                offsetY: 0,
            }
        }
    }

    return (
        <>
            {
                series[0]?.data?.length > 0 && series[0].data[0].x ?
                <div id="chart" className="border-2 border-black pb-1 rounded-lg border-sky treemap-fitting relative mt-4">
                    <ReactApexChart
                        options={options}
                        series={series}
                        type={options.chart.type}
                        height={options.chart.height}
                        className="test"
                    />
                </div>
                :
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mt-4">
                    <p className="text-gray-500">No categories available for visualization. Try adjusting filters.</p>
                </div>
            }
        </>
    )
}

export const BreadCrumbs = ({
    list,
    setPathLength
}) => {
    return (
        <div className="flex mt-3 justify-between align-center gap-4 mx-4">
            <div className="pathbox">
                <div className="flex flex-wrap">
                    {
                        list.slice(0, list.length - 1).map((step, key) =>
                            <div className="flex cursor-pointer" key={key} onClick={() => setPathLength(key)}>
                                <div className="text-blue-900 text-sm">{step}</div> <ChevronRightIcon color="#2254fa" width={18} />
                            </div>
                        )
                    }
                </div>
                <div className="text-lg font-bold text-blue-900 whitespace-break-spaces">
                    {list[list.length - 1]?.replace(/,/g, ', ')}
                </div>
            </div>
        </div>
    )
}

export const GrievanceListBox = ({
    reg_nos
}) => {
    const [grievances, setGrievances] = useState([])
    const [pageno, setPageno] = useState(1)
    const [first, setFirst] = useState(true)
    const [searching, setSearching] = useState(false)

    const getGrievances = useCallback(() => {
        let from = (pageno - 1) * pageSize
        let to = from + pageSize

        setSearching(true)

        getGrievancesUsingRegNos(reg_nos?.slice(from, to))
            .then(response => {
                setGrievances(Object.values(response.data.data))
            })
            .finally(() => setSearching(false))
    }, [reg_nos, pageno])

    useEffect(() => {
        if (pageno != 1)
            setPageno(1)
        else
            getGrievances()
    }, [reg_nos])

    useEffect(() => {
        if (first)
            setFirst(false)
        else
            getGrievances()
    }, [pageno])

    return (
        <GrievanceList
            titleBarHidden={true}
            grievances={grievances}
            pageno={pageno}
            setPageno={setPageno}
            count={reg_nos.length > pageSize ? pageSize : reg_nos.length}
            total={reg_nos.length}
            scrollH={'80vh'}
            searching={searching}
        />
    )
}

export const StateDistrictAutocomplete = ({
    stateDistrict,
    setStateDistrict
}) => {
    return (
        <Autocomplete
            options={getStateDistrictOptions()}
            value={stateDistrict}
            onChange={setStateDistrict}
            placeholder="Enter State or District"
            title={"State > District"}
        />
    )
}

export const MultipleMinistryAutocomplete = ({
    ministry,
    setMinistry,
    className = ''
}) => {
    const [multipleMinistry, setMultipleMinistry] = useState([])
    // const multipleTitle = useMemo(() => `Ministry${multipleMinistry.length > 0 ? `: ${multipleMinistry.map(({ value }) => value).join(',')}` : ''}`, [multipleMinistry])
    const [value, setValue] = useState(ministry)

    const addMultipleMinistry = (ministry) => {
        if (ministry && ministry.value) {
            if (multipleMinistry.findIndex(({ value }) => value == ministry.value) == -1) {
                if (ministry.value != 'All')
                    setMultipleMinistry([...multipleMinistry, ministry])

                setValue({
                    text: '',
                    value: 'All'
                })
            }
        }
    }

    const removeMinistry = (index) => {
        setMultipleMinistry([...multipleMinistry.slice(0, index), ...multipleMinistry.slice(index + 1)])
    }

    useEffect(() => {
        const ministries = multipleMinistry
            .filter((ministry) => (ministry?.text?.length > 0 && ministry?.value && ministry?.value?.length > 0))
            .map(({ value }) => value).join(',')

        setMinistry({
            text: '',
            value: ministries.length > 0 ? ministries : 'All'
        })
    }, [multipleMinistry])

    // useEffect(() => {
    //     if (ministry.value && ministry.value.length > 0) {
    //         setMultipleMinistry(
    //             ministry.value.split(',').map((minis) => ({
    //                 text: '',
    //                 value: minis
    //             }))
    //         )
    //     }
    // }, [ministry])

    return (
        <div className="relative">
            <div className="absolute -top-6 left-0 flex gap-2 z-10 overflow-scroll w-[100%] scrollbar-none scrollbar-thumb-rounded scrollbar-thumb-gray-500 scrollbar-track-gray-300">
                {
                    multipleMinistry
                        // .filter(({ value, text }) => text.length > 0 && value.length > 0)
                        .map(({ value }, index) =>
                            <div className="bg-red-50 rounded-full text-sm border border-red-300 px-1 group flex gap-1 items-center select-none cursor-default" key={index}>
                                {value}

                                <XMarkIcon height={'1rem'} width={'1rem'} className="hidden group-hover:block cursor-pointer" onClick={() => removeMinistry(index)} />
                            </div>
                        )
                }
            </div>

            <Autocomplete
                options={getMinistryOptions()}
                value={value}
                onChange={addMultipleMinistry}
                placeholder="Enter Ministry"
                title={'Ministry'}
                className={className}
            />
        </div>
    )
}

export const MinistryAutocomplete = ({
    ministry,
    setMinistry,
    className = ''
}) => {
    return (
        <Autocomplete
            options={getMinistryOptions()}
            value={ministry}
            onChange={setMinistry}
            placeholder="Enter Ministry"
            title="Ministry"
            className={className}
        />
    )
}

export const Autocomplete = ({
    options,
    value,
    onChange,
    placeholder,
    title,
    className = '',
    xMarkClassName = ''
}) => {
    const [suggestions, setSuggestions] = useState([])
    const [inputValue, setInputValue] = useState(value)

    const updateSuggestions = async (search) => {
        if (typeof search == 'string') {
            // search = (typeof search == 'string') ? search : search.text
            search = search.toLowerCase().trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

            let new_suggestions = []
            if (options instanceof Function) {
                new_suggestions = await options(search)
            }
            else {
                new_suggestions = options.filter(option => textIncludes(option.text, search))

                const alternate_suggestions = getAlternateSuggestions(options, search)

                new_suggestions = appendNonRepeatingSuggestions(new_suggestions, alternate_suggestions)
            }

            setSuggestions([...new_suggestions])
        }

        // Starts With, Includes Search and exact search for the entire search and then the words in the search
    }

    const clearInput = () => {
        setInputValue('')
        onChange(undefined)
    }

    const shouldRenderSuggestions = value => typeof value != 'object'

    useEffect(() => {
        setInputValue(value ?? '')
    }, [value])

    return (
        <div className={`relative w-full font-autosuggest z-[20] ${className}`}>
            <Autosuggest
                suggestions={suggestions}
                onSuggestionsFetchRequested={async ({ value }) => await updateSuggestions(value)}
                onSuggestionsClearRequested={() => setSuggestions([])}
                getSuggestionValue={suggestion => suggestion}
                renderSuggestion={suggestion => <div>{capitalize(suggestion.text)}</div>}
                shouldRenderSuggestions={shouldRenderSuggestions}
                inputProps={{
                    value: capitalize(((typeof inputValue == 'string') ? inputValue : inputValue?.text) ?? ''),
                    onChange: async (e, { newValue }) => {
                        if (typeof newValue == 'object')
                            onChange(newValue)
                        else if (typeof newValue == 'string')
                            onChange({
                                text: newValue
                            })
                        else
                            onChange(undefined)

                        setInputValue(newValue)
                    },
                    placeholder: placeholder,
                    spellCheck: false,
                    onBlur: () => {
                        if (typeof stateDistrict == 'string')
                            onChange(DEFAULT_STATE_DISTRICT)
                    }
                }}
            />

            {
                title &&
                <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 translate-x-2 border-t-2 border-[#aaa] rounded-full scale-75 top-2 z-1 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1 select-none">
                    {title}
                </label>
            }

            {
                value != '' &&
                <label
                    className="absolute text-sm text-gray-500 duration-300 transform rounded-full top-2 right-1 scale-90 z-1 origin-[0] bg-white px-2 start-1 select-none cursor-pointer"
                    onClick={clearInput}
                >
                    <XMarkIcon height={'1.53rem'} className={xMarkClassName} fill="#ccc" />
                </label>
            }

        </div>
    )
}

export const DateRangePicker = ({
    value,
    onChange,
    shortPopup = false
}) => {
    return (
        <div className="relative w-full">
            <Datepicker
                value={value}
                onChange={onChange}
                placeholder="Select Date Range*"
                inputId="DateRange"
                displayFormat="D MMM, YY"
                showShortcuts={true}
                configs={{
                    shortcuts: dateRangeShortcuts
                }}
                containerClassName={`relative w-full text-gray-700 input-date child-font-bold ${shortPopup && 'short-popup'} z-[100]`}
                readOnly={true}
                maxDate={new Date()}
                useRange={false}
                popoverDirection="down"
            />

            <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 translate-x-2 border-t-2 border-[#aaa] rounded-full scale-75 top-2 z-[101] origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1 select-none">
                Date Range
            </label>
        </div>
    )
}


export const generateTreeFromRca = (rca_object, title) => {
    // Handle both nested API response and flat category map from buildTreeFromGrievances
    let reg_nos = [];
    let children = [];
    
    if (rca_object && typeof rca_object === 'object') {
        // If it's a flat category map from buildTreeFromGrievances
        if (rca_object.registration_no === undefined && !rca_object.children) {
            // Create children from category map
            for (let category in rca_object) {
                if (rca_object.hasOwnProperty(category)) {
                    const categoryData = rca_object[category];
                    if (categoryData && categoryData.registration_no && categoryData.registration_no.length > 0) {
                        const childBranch = {
                            reg_nos: categoryData.registration_no,
                            count: categoryData.count || categoryData.registration_no.length,
                            title: category,
                            children: []
                        };
                        children.push(childBranch);
                        reg_nos = [...reg_nos, ...categoryData.registration_no];
                    }
                }
            }
        } else {
            // Original nested structure
            reg_nos = rca_object?.registration_no ?? [];
            for (let branch_title in rca_object) {
                if (!['count', 'registration_no'].includes(branch_title)) {
                    let child_tree = generateTreeFromRca(rca_object[branch_title], branch_title);
                    reg_nos = [...reg_nos, ...child_tree.reg_nos];
                    children.push(child_tree);
                }
            }
        }
    }
    
    const branch = {
        reg_nos: reg_nos,
        count: reg_nos.length,
        title: title.trim(),
        children: children
    };

    console.log(`Generated tree branch "${title}":`, { count: branch.count, childrenCount: branch.children.length, hasValidChildren: children.every(child => child.count > 0) });
    return branch;
}

// New function to build tree structure from flat grievances list
export const buildTreeFromGrievances = (grievances) => {
    console.log('Raw grievances:', grievances);
    console.log('Grievance count:', grievances.length);
    
    const categoryMap = {};
    let totalRegNos = [];

    grievances.forEach((grievance, index) => {
        console.log(`Processing grievance ${index}:`, {
            id: grievance.id,
            complaintType: grievance.complaintType,
            companyName: grievance.companyName,
            categoryCode: grievance.categoryCode,
            stateName: grievance.stateName,
            CityName: grievance.CityName,
            complaintDetails: grievance.complaintDetails.substring(0, 50) + '...'
        });
        
        // Prioritize categorization hierarchy for better visualization
        let category;
        
        // Use companyName if available and meaningful
        if (grievance.companyName && grievance.companyName !== '' && grievance.companyName !== 'Others' && grievance.companyName !== 'General Inquiry') {
            category = grievance.companyName;
        }
        // Use categoryCode if available
        else if (grievance.categoryCode && grievance.categoryCode !== 172 && grievance.categoryCode !== 200) {
            category = `Category ${grievance.categoryCode}`;
        }
        // Use state + city for location-based categories
        else if (grievance.stateName && grievance.CityName) {
            category = `${grievance.stateName} - ${grievance.CityName}`;
        }
        // Use complaintType only if it's specific
        else if (grievance.complaintType && grievance.complaintType !== 'Complaint' && grievance.complaintType !== 'Query') {
            category = grievance.complaintType;
        }
        // Fallback to first few words of complaint details
        else {
            const detailsWords = grievance.complaintDetails ? grievance.complaintDetails.split(' ').slice(0, 3).join(' ') : 'General';
            category = detailsWords.length > 20 ? detailsWords.substring(0, 20) + '...' : detailsWords;
        }
                      
        const regNo = grievance.id || `grievance_${index}`;
        
        console.log(`Extracted - Category: "${category}", RegNo: "${regNo}"`);

        if (!categoryMap[category]) {
            categoryMap[category] = {
                count: 0,
                registration_no: []
            };
        }

        if (!categoryMap[category].registration_no.includes(regNo)) {
            categoryMap[category].count += 1;
            categoryMap[category].registration_no.push(regNo);
            totalRegNos.push(regNo);
        }
    });

    // Limit to top 15 categories for better visualization, but keep all if fewer
    const sortedCategories = Object.entries(categoryMap)
        .sort(([,a], [,b]) => b.count - a.count)
        .slice(0, 15)
        .reduce((acc, [category, data]) => {
            acc[category] = data;
            return acc;
        }, {});

    // Add 'Others' category only if there are remaining grievances after top categories
    const processedRegNos = Object.values(sortedCategories).reduce((sum, cat) => sum + cat.registration_no.length, 0);
    const remainingCount = totalRegNos.length - processedRegNos;
    if (remainingCount > 0) {
        const remainingRegNos = totalRegNos.filter(regNo =>
            !Object.values(sortedCategories).some(cat => cat.registration_no.includes(regNo))
        ).slice(0, remainingCount);
        sortedCategories['Others'] = {
            count: remainingRegNos.length,
            registration_no: remainingRegNos
        };
        console.log(`Added Others category with ${remainingRegNos.length} grievances`);
    }

    console.log('Final category map:', Object.keys(sortedCategories).length, 'categories');
    console.log('Top categories:', Object.keys(sortedCategories));
    console.log('Total registration nos:', totalRegNos.length);
    
    return sortedCategories;
}

export const getBreadCrumbs = (tree, path = []) => [
    tree.title,
    ...(
        path.length > 0
            ? getBreadCrumbs(tree.children[path[0]], path.slice(1))
            : []
    )
]

export const capitalize = sentence => {
    console.log(sentence)
    return sentence ? sentence.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase() ?? letter) : sentence;
}


const getStateDistrictOptions = () => {
    let states = Object.keys(stateList)

    let state_options = states.map(state => ({
        text: state,
        values: {
            state: state,
            district: 'All'
        }
    }))

    let district_options = states.reduce((options, state) => {
        return [
            ...options,
            ...stateList[state].map(district => ({
                text: `${state} > ${district}`,
                values: {
                    state: state,
                    district: district
                }
            }))
        ]
    }, [])

    return [
        ...state_options,
        ...district_options
    ]
}

const getMinistryOptions = () => getDepartmentList().map(department => ({
    text: department.label,
    value: department.value
}))

export const textIncludes = (text, search) => text.toLowerCase().trim().includes(search)

// Count the occurnace of a search/word in a string
export const countOccurance = (text, search) => text.match(new RegExp(search, 'g'))?.length ?? 0

const getAlternateSuggestions = (options, search) => {
    let alternates = options.reduce((alternates, option) => {
        search.split(' ').forEach(word => {
            let occurances = countOccurance(option.text, word)

            if (occurances > 0) {
                if (alternates[option.text] == undefined)
                    alternates[option.text] = 0
                alternates[option.text] += occurances
            }
        })

        return alternates
    }, {})

    // Sorting from heighest to lowest occurances
    let alternate_texts = Object.keys(alternates)
        .sort((a, b) => alternates[b] - alternates[a])

    return alternate_texts.map(alternate_text =>
        options.find(option => option.text == alternate_text)
    )
}

const appendNonRepeatingSuggestions = (primary_suggestions, secondary_suggestions) => [
    ...primary_suggestions,
    ...secondary_suggestions
        .filter(secondary =>
            primary_suggestions
                .find(primary =>
                    primary.text == secondary.text
                )
            == undefined
        )
]

export const Loader = ({
    color = "#2196f3",
    className = "",
    height = "20px"
}) =>
    <div className={className}>
        <svg width={height} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M12 3C10.22 3 8.47991 3.52784 6.99987 4.51677C5.51983 5.50571 4.36628 6.91131 3.68509 8.55585C3.0039 10.2004 2.82567 12.01 3.17294 13.7558C3.5202 15.5016 4.37737 17.1053 5.63604 18.364C6.89472 19.6226 8.49836 20.4798 10.2442 20.8271C11.99 21.1743 13.7996 20.9961 15.4442 20.3149C17.0887 19.6337 18.4943 18.4802 19.4832 17.0001C20.4722 15.5201 21 13.78 21 12"
                stroke={color} strokeWidth="2" strokeLinecap="round" />
            <path d="M19.7942 7.5C19.8905 7.66673 19.9813 7.83651 20.0667 8.00907" stroke={color} strokeWidth="2"
                strokeLinecap="round" />
        </svg>
    </div>

const dateRangeShortcuts = {
    today: "Today",
    yesterday: "Yesterday",
    past: period => `Last ${period} Days`,
    currentMonth: "This Month",
    pastMonth: "Last Month",
    last2Months: {
        text: "Last 2 Months",
        period: {
            start: startOfMonth(subMonths(new Date(), 2)),
            end: endOfMonth(subMonths(new Date(), 1))
        }
    },
    last3Months: {
        text: "Last 3 Months",
        period: {
            start: startOfMonth(subMonths(new Date(), 3)),
            end: endOfMonth(subMonths(new Date(), 1))
        }
    },
    last4Months: {
        text: "Last 4 Months",
        period: {
            start: startOfMonth(subMonths(new Date(), 4)),
            end: endOfMonth(subMonths(new Date(), 1))
        }
    },
    last6Months: {
        text: "Last 6 Months",
        period: {
            start: startOfMonth(subMonths(new Date(), 6)),
            end: endOfMonth(subMonths(new Date(), 1))
        }
    },
    thisQuarter: {
        text: "This Quarter",
        period: {
            start: startOfQuarter(new Date()),
            end: endOfQuarter(new Date())
        }
    },
    lastQuarter: {
        text: "Last Quarter",
        period: {
            start: startOfQuarter(subQuarters(new Date(), 1)),
            end: endOfQuarter(subQuarters(new Date(), 1))
        }
    },
    thisYear: {
        text: "This Year",
        period: {
            start: setDayOfYear(new Date(), 1),
            end: lastDayOfYear(new Date())
        }
    },
    lastYear: {
        text: "Last Year",
        period: {
            start: setDayOfYear(subYears(new Date(), 1), 1),
            end: lastDayOfYear(subYears(new Date(), 1))
        }
    }
}
