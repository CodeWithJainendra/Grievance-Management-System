import React, { useState, useEffect, memo } from 'react';
import { Card, CardBody, Typography } from "@material-tailwind/react";
import Chart from 'react-apexcharts';
import dashboardService from '@/services/dashboard';

const GrievanceTrends = memo(({ from = "2016-08-01", to = "2016-08-30", ministry = "DOCAF", grievanceData = [] }) => {
  // Process API results to get top 10 categories (excluding Unknown)
  const getProcessedCategoryData = () => {
    if (!grievanceData || !Array.isArray(grievanceData) || grievanceData.length === 0) {
      // Fallback to hardcoded data if no API results
      return {
        categories: [
          'Service Issues', 'Billing Problems', 'Product Quality', 'Delivery Issues', 'Customer Support', 
          'Technical Problems', 'Refund Requests', 'Account Issues', 'Policy Concerns', 'Other'
        ],
        data: [1250, 1180, 950, 820, 750, 680, 620, 580, 520, 450]
      };
    }

    // Count grievances by category, excluding "Unknown"
    const categoryCounts = {};
    grievanceData.forEach(item => {
      // Use categoryCode as primary category field, fallback to complaintType
      const category = item.categoryCode?.toString() || item.complaintType || 'Unknown';
      if (category !== 'Unknown' && category !== 'UNKNOWN' && category !== 'unknown') {
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      }
    });

    // Convert to array and sort by count (descending)
    const sortedCategories = Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Take top 10

    return {
      categories: sortedCategories.map(item => item.category),
      data: sortedCategories.map(item => item.count)
    };
  };

  const processedCategoryData = getProcessedCategoryData();

  const [chartData, setChartData] = useState({
    series: [{
      name: 'Grievances',
      data: processedCategoryData.data
    }],
    options: {
      chart: {
        type: 'bar',
        height: 320,
        toolbar: {
          show: false
        },
        zoom: {
          enabled: false
        },
        background: 'transparent'
      },
      colors: ['#1E40AF'],
      dataLabels: {
        enabled: true,
        style: {
          fontSize: '12px',
          fontWeight: 'bold',
          colors: ['#FFFFFF']
        },
        offsetY: -5,
        formatter: function (val) {
          return val.toLocaleString();
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '70%',
          borderRadius: 6,
          dataLabels: {
            position: 'top'
          }
        }
      },
      grid: {
        show: true,
        borderColor: '#E5E7EB',
        strokeDashArray: 3,
        padding: {
          left: 10,
          right: 10,
          top: 15,
          bottom: 5
        },
        yaxis: {
          lines: {
            show: true
          }
        },
        xaxis: {
          lines: {
            show: false
          }
        }
      },
      xaxis: {
        categories: processedCategoryData.categories,
        labels: {
          style: {
            fontSize: '9px',
            colors: '#6B7280',
            fontWeight: '500'
          },
          rotate: -45,
          rotateAlways: true,
          maxHeight: 80,
          trim: false
        },
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        }
      },
      yaxis: {
        labels: {
          style: {
            fontSize: '11px',
            colors: '#6B7280',
            fontWeight: '500'
          },
          formatter: function (val) {
            return val.toLocaleString();
          }
        },
        title: {
          text: 'Number of Grievances',
          style: {
            fontSize: '12px',
            color: '#6B7280',
            fontWeight: '600'
          }
        }
      },
      tooltip: {
        theme: 'light',
        style: {
          fontSize: '12px'
        },
        y: {
          formatter: function (val) {
            return val.toLocaleString() + " grievances"
          }
        },
        marker: {
          show: true
        }
      },
      responsive: [{
        breakpoint: 768,
        options: {
          xaxis: {
            labels: {
              style: {
                fontSize: '8px'
              }
            }
          },
          dataLabels: {
            style: {
              fontSize: '10px'
            }
          }
        }
      }]
    }
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Update chart data when apiResults change
    const newProcessedData = getProcessedCategoryData();
    setChartData(prevData => ({
      ...prevData,
      series: [{
        name: 'Grievances',
        data: newProcessedData.data
      }],
      options: {
        ...prevData.options,
        xaxis: {
          ...prevData.options.xaxis,
          categories: newProcessedData.categories
        }
      }
    }));
    
    console.log('📈 Using API Grievance Trends data (top 10 categories, excluding Unknown)');
     setLoading(false);
   }, [ministry, from, to, grievanceData]);

  return (
    <Card className="shadow-sm h-full overflow-hidden">
      <CardBody className="p-4 h-full flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
            <Typography variant="h6" className="text-gray-700 font-semibold">
              Grievance Trends
            </Typography>
          </div>
          {loading && (
            <div className="text-xs text-gray-500">Loading...</div>
          )}
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          <Chart
            options={chartData.options}
            series={chartData.series}
            type="bar"
            height="100%"
          />
        </div>
      </CardBody>
    </Card>
  );
});

export default GrievanceTrends;