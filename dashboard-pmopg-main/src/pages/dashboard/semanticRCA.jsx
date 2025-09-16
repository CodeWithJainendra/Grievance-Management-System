import React, { useState } from 'react';
import { getGrievancesUsingRegNos, getSemanticRca } from '@/services/rca';
import { BreadCrumbs, Chart } from './CategoricalTree';
import { AILoader, Filters, GrievanceListBox } from '@/widgets/grievance/RCA/semantic';
import { getDefaultDepartmentOrFiller } from '@/widgets/grievance/RCA/dynamic';
import ProgressBar from '@/widgets/others/ApiProgressBar';

const SemanticRCA = () => {
    const [data, setData] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [parameters, setParameters] = useState({ level: 2, threshold: 1.3, ministry: getDefaultDepartmentOrFiller() });
    const [transactionIds, setTransactionIds] = useState([]);
    const [currentBatchIndex, setCurrentBatchIndex] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [emptyResult, setEmptyResult] = useState(false)
    const batchSize = 20;
    const rowsPerPage = 20;
    const [breadcrumbs, setBreadcrumbs] = useState([])
    const [isTableLoading, setIsTableLoading] = useState(false)
    const [durationFactor, setDurationFactor] = useState(5_000) // In Milli seconds

    const fetchData = async (params) => {
        setLoading(true);
        setError(null);
        try {
            if (params.startDate && params.endDate) {
                setDurationFactor(
                    (
                        (new Date(params.endDate) - new Date(params.startDate))
                        / (1_000 * 60 * 60 * 24 * 28)
                    )
                    * 60 * 1_000 * 2 // Considering, 1 months takes 2 minutes
                )
            }
            const response = await getSemanticRca({
                ...params,
                registration_no_list: transactionIds.length > 0 ? transactionIds : ["NA"]
            })
            const treeData = response.data;
            console.log(treeData)
            if (treeData === 'No More Level') {
                setData([]);
                alert('No more Levels');
                return;
            }
            if (treeData.registration_no_list !== 'NA') {
                setEmptyResult(treeData.registration_no_list.length == 0)

                setTransactionIds(treeData.registration_no_list);
                setCurrentBatchIndex(0);
                fetchBatch(treeData.registration_no_list.slice(0, batchSize));

                setBreadcrumbs([
                    ...breadcrumbs.slice(0, (params.level - 2)),
                    {
                        params,
                        ...treeData
                    }
                ])
            }
            console.log(treeData.category_with_count)
            const formattedData = Object.keys(treeData.category_with_count).map(key => ({
                x: key,
                y: treeData.category_with_count[key],
            }));

            console.log(formattedData, 'a')

            setData([{ data: formattedData }]);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchBatch = async (ids) => {
        const formattedTransactionIds = ids.map(id => `"${id}"`).join(',');
        const encodedTransactionIds = encodeURIComponent(formattedTransactionIds);
        const apiUrl = `http://172.30.0.186:5002/get_userdata/?transaction_ids=${encodedTransactionIds}&startDate=2024-07-01&endDate=2024-07-13`;

        try {
            // const response = await fetch(apiUrl, { method: 'GET' });

            setIsTableLoading(true)

            const response = await getGrievancesUsingRegNos(ids)

            setIsTableLoading(false)
            // if (!response.ok) {
            //     throw new Error('Network response was not ok');
            // }
            const data = response.data //await response.json();

            setTableData(Object.values(data.data));
            return data;
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    };

    const handleTileClick = (dataPointIndex) => {
        if (dataPointIndex === undefined || dataPointIndex < 0) return;
        const clickedCategory = data[0].data[dataPointIndex];
        const newParams = {
            ...parameters,
            ministry: clickedCategory.x,
            level: parseInt(parameters.level, 10) + 1,
        };
        setParameters(newParams);
        fetchData(newParams);
    };

    const handleBatchChange = (direction) => {
        let newBatchIndex = currentBatchIndex;
        if (direction === 'next') {
            newBatchIndex += batchSize;
        } else if (direction === 'prev') {
            newBatchIndex -= batchSize;
        }

        newBatchIndex = Math.max(newBatchIndex, 0);
        newBatchIndex = Math.min(newBatchIndex, transactionIds.length - batchSize);

        if (newBatchIndex !== currentBatchIndex) {
            setCurrentBatchIndex(newBatchIndex);
            fetchBatch(transactionIds.slice(newBatchIndex, newBatchIndex + batchSize));
        }
    };

    const goTo = (pageno) => {
        setCurrentBatchIndex(pageno - 1)
        fetchBatch(transactionIds.slice((pageno - 1) * batchSize, pageno * batchSize))
    }

    const handleFormSubmit = (params) => {
        setParameters(params);
        fetchData(params);
    };

    const startIndex = (currentPage - 1) * rowsPerPage;
    const paginatedData = tableData.slice(startIndex, startIndex + rowsPerPage);

    const updatePathLength = (length) => {
        const newBreadcrumbs = breadcrumbs.slice(0, length + 1)

        const currentBreadcrumb = newBreadcrumbs[newBreadcrumbs.length - 1]
        const previousBreadcrumb = newBreadcrumbs[newBreadcrumbs.length - 1 - 1]

        setTransactionIds(previousBreadcrumb?.registration_no_list ?? ['NA'])

        setParameters({
            ...currentBreadcrumb?.params
        })

        setTimeout(() => {
            fetchData(currentBreadcrumb?.params)
        }, 200)
    }

    return (
        <div className="p-4">
            {/* <ParameterForm onSubmit={handleFormSubmit} /> */}
            <Filters filters={parameters} setFilters={handleFormSubmit} />

            {loading && <ProgressBar totalDuration={durationFactor} />}

            {/* {loading && <AILoader />} */}

            {emptyResult && !loading && <p className="text-red-900">No data found.</p>}

            {
                !loading && !emptyResult &&
                <>
                    <Chart
                        series={data}
                        pushPath={handleTileClick}
                    />

                    <BreadCrumbs
                        list={breadcrumbs.map(({ params: { ministry } }) => ministry)}
                        setPathLength={updatePathLength}
                    />

                    {
                        !loading && !emptyResult && paginatedData.length > 0 &&
                        <GrievanceListBox
                            list={paginatedData}
                            total={transactionIds.length}
                            pageno={currentBatchIndex + 1}
                            goTo={goTo}
                            searching={isTableLoading}
                        />
                    }
                </>
            }
        </div>
    );
};


export default SemanticRCA;
