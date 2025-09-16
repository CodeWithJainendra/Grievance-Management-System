import React, { useState, useEffect, useRef, useCallback } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  Button,
  IconButton,
  Switch,
  Typography,
  Chip,
  Input,
  Select,
  Option,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem
} from "@material-tailwind/react";
import {
  useMaterialTailwindController,
  setOpenConfigurator,
  setSidenavColor,
  setSidenavType,
  setFixedNavbar,
} from "@/context";

import { departmentData, getDepartmentList, stateData } from "@/data";

import { useNavigate } from "react-router-dom";

import { useFilter } from "@/context/FilterContext";
import GrievancesRoutes from "@/services/grievances";
import { redirect } from "react-router-dom";
import stateObj from "@/data/state-data"
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { DEFAULT_STATE_DISTRICT, DateRangePicker, MinistryAutocomplete, MultipleMinistryAutocomplete, StateDistrictAutocomplete } from "@/pages/dashboard/CategoricalTree";
import { toast } from "react-toastify";
import { GlobeAltIcon } from "@heroicons/react/24/solid";

function formatNumber(number, decPlaces) {
  decPlaces = Math.pow(10, decPlaces);

  const abbrev = ["K", "M", "B", "T"];

  for (let i = abbrev.length - 1; i >= 0; i--) {
    var size = Math.pow(10, (i + 1) * 3);

    if (size <= number) {
      number = Math.round((number * decPlaces) / size) / decPlaces;

      if (number == 1000 && i < abbrev.length - 1) {
        number = 1;
        i++;
      }

      number += abbrev[i];

      break;
    }
  }

  return number;
}

export const onlySemanticQueryType = {
  '1': {
    name: "Semantic",
    placeholder: "Enter Natural Language Query..."
  }
}

export const basicQueryTypes = {
  '1': {
    name: "Semantic",
    placeholder: "Enter Natural Language Query..."
  },
  '2': {
    name: "Keyword",
    placeholder: "Enter Keyword To Search..."
  },
}

export const queryTypes = {
  ...basicQueryTypes,
  '3': {
    name: "Registration No",
    placeholder: "Search By Registration No....."
  },
  '4': {
    name: "Name",
    placeholder: "Search By Name....."
  },
  '5': {
    name: "Find Children",
    placeholder: "Enter Registration No...."
  }
}

export function Configurator() {
  const { filters, setFilters, searching, startSearch } = useFilter();
  const navigate = useNavigate();
  const [controller, dispatch] = useMaterialTailwindController();
  const { openConfigurator, } = controller;

  const [dateRange, setDateRange] = useState(getDefaultDateRange(filters))
  const [stateDistrict, setStateDistrict] = useState(getDefaultStateDistrict(filters))
  const [selectedMinistry, setSelectedMinistry] = useState(getDefaultMinistry(filters))

  const updateDateRange = range => {
    setFilters({
      ...filters,
      startDate: range.startDate,
      endDate: range.endDate
    })

    setDateRange(range)
  }

  const updateStateDistrict = newStateDistrict => {
    setFilters({
      ...filters,
      state: newStateDistrict?.values.state,
      district: newStateDistrict?.values.district
    })

    setStateDistrict(newStateDistrict)
  }

  const updateSelectedMinistry = selection => {
    setFilters({
      ...filters,
      ministry: selection?.value
    })

    setSelectedMinistry(selection)
  }

  const searchGrievances = () => {
    if (initiateSearch())
      navigate('/dashboard/search-grievances')
  }

  const spatiallySearchGrievances = () => {
    if (initiateSearch())
      navigate('/dashboard/spatial-analysis')
  }

  const initiateSearch = async () => {
    if (filters.query?.length == 0) {
      toast("Enter the query to search", { type: 'error' })
      return
    }
    if (filters.type == null) {
      toast("Select the type to search", { type: 'error' })
      return
    }

    startSearch()

    setOpenConfigurator(dispatch, false)
  }

  const handlequeryChange = (value) => {
    setFilters({ ...filters, query: value });
  };

  const handletypeChange = (value) => {
    setFilters({ ...filters, type: value });
  };

  const setThreshold = value => {
    setFilters({ ...filters, threshold: value });
  }

  const setShowClosed = value => {
    setFilters({ ...filters, all_record: (value ? 1 : 0) });
  }

  useEffect(() => {
    setDateRange(getDefaultDateRange(filters))
    setSelectedMinistry(getDefaultMinistry(filters))
    setStateDistrict(getDefaultStateDistrict(filters))
  }, [filters])

  return (
    <aside
      className={`fixed top-0 right-0 z-50 h-screen w-[20rem] sm:w-[30rem] bg-white px-2.5 shadow-lg transition-transform duration-300 z-[1100] ${openConfigurator ? "translate-x-0" : "translate-x-[20rem] sm:translate-x-[30rem]"} overflow-x-visible`}
    >
      <div className="flex items-start justify-between px-6 pt-8 pb-0">
        <div>
          <Typography variant="h5" color="blue-gray">
            Search Grievances
          </Typography>
        </div>
        <IconButton
          variant="text"
          color="blue-gray"
          onClick={() => setOpenConfigurator(dispatch, false)}
        >
          <XMarkIcon strokeWidth={2.5} className="h-5 w-5" />
        </IconButton>
      </div>


      <div className="py-1 px-6">
        <div className="mb-6">
          <SearchInput
            types={queryTypes}
            type={filters.type}
            setType={handletypeChange}
            query={filters.query}
            setQuery={handlequeryChange}
          />
        </div>

        <div className="mb-6 z-[100]">
          <DateRangePicker
            value={dateRange}
            onChange={updateDateRange}
          />
        </div>

        <div className="mb-6">
          <MultipleMinistryAutocomplete
            ministry={selectedMinistry}
            setMinistry={updateSelectedMinistry}
          />
        </div>

        <div className="mb-6">
          <StateDistrictAutocomplete
            stateDistrict={stateDistrict}
            setStateDistrict={updateStateDistrict}
          />
        </div>

        <div className="mt-4">
          <ThresholdSlider
            type={filters.type}
            threshold={filters.threshold}
            setThreshold={setThreshold}
          />
        </div>

        <div className="mb3">
          <ShowClosedCheckbox
            showClosed={filters.all_record}
            setShowClosed={setShowClosed}
          />
        </div>

        <div className="">
          <div className="my-3 flex flex-col gap-4">
            <Button variant="gradient" fullWidth onClick={searchGrievances} disabled={searching}>
              Category Search
            </Button>

            <Button
              variant="gradient"
              color="green"
              fullWidth
              onClick={spatiallySearchGrievances}
              disabled={searching || !isValidSpatialFilterType(filters.type)}
              className="flex justify-center items-center"
            >
              <GlobeAltIcon height={'1.5rem'} className="mr-1" />

              Spatial Search
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}

Configurator.displayName = "/src/widgets/layout/configurator.jsx";

export default Configurator;

export const SearchInput = ({
  types = queryTypes,
  type,
  setType,
  query,
  setQuery,
  onEnterPress
}) => {
  return (
    <div>
      <Typography variant="h6" color="blue-gray" className="flex gap-1">
        <Menu>
          <MenuHandler>
            <div className="flex cursor-pointer">
              {types[type] ? types[type].name : types[1].name}
              <ChevronDownIcon width={25} className="ml-[0.1rem] w-4" />
            </div>
          </MenuHandler>
          <MenuList className="max-h-[20rem] max-w-[18rem] z-[1200]">
            {
              Object.keys(types).map(key => {
                return <MenuItem onClick={() => setType(key)} key={key}>{types[key].name}</MenuItem>
              })
            }
          </MenuList>
        </Menu>
        <div className="font-normal">based search</div>
      </Typography>

      <div className="mt-1 flex-col items-center gap-2 bg-white rounded">
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          type="text"
          label={Object.keys(types).includes(type) ? types[type].placeholder : "Enter Natural Language Query..."}
          size="md"
          autoFocus={true}
          className="font-bold"
          onKeyDownCapture={({ key }) => key == 'Enter' && onEnterPress()}
        />
      </div>
    </div>
  )
}

export const ThresholdSlider = ({
  type,
  threshold,
  setThreshold
}) => {
  const ThresholdableTypes = ['1', '5']

  const isThresholdable = useCallback(() => ThresholdableTypes.includes(type), [type])

  return isThresholdable() &&
    <div>
      <Typography variant="h6" color="blue-gray">
        Relevance: {threshold}
      </Typography>

      <input
        type="range"
        value={threshold}
        min={1.2}
        max={2}
        step={0.1}
        onChange={e => setThreshold(e.target.value)}
        className="cursor-pointer border-t-0 shadow-none w-full"
      />
    </div>
}

export const ShowClosedCheckbox = ({
  showClosed,
  setShowClosed
}) => {
  return (
    <div className="flex">
      <div className="w-[1.5rem] mr-2">
        <Input
          type="checkbox"
          checked={showClosed}
          onChange={e => setShowClosed(e.target.checked ? 1 : 0)}
          className="w-[1.5rem] h-[1.5rem] hide-before-after"
          name="showClosed"
        />
      </div>

      <label htmlFor="showClosed">
        <Typography variant="h6" color="blue-gray">
          Show closed grievances
        </Typography>
      </label>
    </div>
  )
}

export const getDefaultStateDistrict = filters => (
  filters.state && filters.district && {
    ...(
      (filters.state != 'All')
        ? {
          text: `${filters.state} > ${filters.district}`,
          values: {
            state: filters.state,
            district: filters.district
          }
        }
        : DEFAULT_STATE_DISTRICT
    )
  })

export const getDefaultMinistry = filters => (
  filters.ministry &&
  {
    text: filters.ministry == 'All' ? '' : filters.ministry,
    value: filters.ministry
  }
)

export const getDefaultDateRange = filters => ({
  startDate: filters.startDate,
  endDate: filters.endDate
})

export const isValidSpatialFilterType = type => Object.keys(onlySemanticQueryType).includes(type)

export const isValidBasicQueryType = type => Object.keys(basicQueryTypes).includes(type)
