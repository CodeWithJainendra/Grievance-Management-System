import React, { useState, useEffect, memo } from 'react';
import { Card, CardBody, Typography } from "@material-tailwind/react";
import Chart from 'react-apexcharts';
import dashboardService from '@/services/dashboard';

const StateDistribution = memo(({ from = "2016-08-01", to = "2016-08-30", ministry = "DOCAF", stateDistData = null }) => {
  // Color mapping system - consistent colors for pie chart and legend
  const colorMapping = [
    { hex: '#3B82F6', tailwind: 'bg-blue-500' },      // Blue
    { hex: '#10B981', tailwind: 'bg-green-500' },     // Green  
    { hex: '#F59E0B', tailwind: 'bg-amber-500' },     // Amber
    { hex: '#EF4444', tailwind: 'bg-red-500' },       // Red
    { hex: '#8B5CF6', tailwind: 'bg-purple-500' },    // Purple
    { hex: '#06B6D4', tailwind: 'bg-cyan-500' },      // Cyan
    { hex: '#84CC16', tailwind: 'bg-lime-500' },      // Lime
    { hex: '#F97316', tailwind: 'bg-orange-500' },    // Orange
    { hex: '#EC4899', tailwind: 'bg-pink-500' },      // Pink
    { hex: '#6366F1', tailwind: 'bg-indigo-500' }     // Indigo
  ];

  // Hardcoded state data in decreasing order - matches heatmap initial data
  const hardcodedStateData = {
    labels: ['Maharashtra', 'Uttar Pradesh', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Rajasthan', 'West Bengal', 'Punjab'],
    data: [28.5, 24.2, 18.7, 12.8, 8.3, 6.2, 4.2, 3.1],
    stateDetails: [
      { name: 'Maharashtra', count: 1250, color: colorMapping[0].tailwind },
      { name: 'Uttar Pradesh', count: 1180, color: colorMapping[1].tailwind },
      { name: 'Karnataka', count: 950, color: colorMapping[2].tailwind },
      { name: 'Tamil Nadu', count: 850, color: colorMapping[3].tailwind },
      { name: 'Gujarat', count: 720, color: colorMapping[4].tailwind },
      { name: 'Rajasthan', count: 680, color: colorMapping[5].tailwind },
      { name: 'West Bengal', count: 620, color: colorMapping[6].tailwind },
      { name: 'Punjab', count: 580, color: colorMapping[7].tailwind }
    ]
  };

  const [chartData, setChartData] = useState({
    series: hardcodedStateData.data, // Using hardcoded data
    options: {
      chart: {
        type: 'donut',
        height: 300
      },
      colors: colorMapping.map(color => color.hex), 
      labels: hardcodedStateData.labels, // Using hardcoded labels
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          return Math.round(val) + "%"
        },
        style: {
          fontSize: '11px',
          fontWeight: 'bold',
          colors: ['#FFFFFF']
        },
        dropShadow: {
          enabled: false
        }
      },
      plotOptions: {
        pie: {
          donut: {
            size: '60%',
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151',
                offsetY: -5
              },
              value: {
                show: true,
                fontSize: '18px',
                fontWeight: 700,
                color: '#1F2937',
                offsetY: 5,
                formatter: function (val) {
                  return val + "%"
                }
              },
              total: {
                show: true,
                showAlways: true,
                label: 'States',
                fontSize: '12px',
                fontWeight: 400,
                color: '#6B7280',
                formatter: function (w) {
                  // Show number of states instead of total value
                  return w.globals.seriesTotals.length;
                }
              }
            }
          }
        }
      },
      legend: {
        show: false // Hide legend to save space
      },
      tooltip: {
        enabled: true,
        style: {
          fontSize: '12px'
        },
        y: {
          formatter: function (val) {
            return val + "%"
          }
        }
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            height: 200
          }
        }
      }]
    }
  });

  const [loading, setLoading] = useState(false);
  const [stateData, setStateData] = useState(hardcodedStateData.stateDetails);

  useEffect(() => {
    const processStateData = () => {
      setLoading(true);
      
      // Check if we have API data from stateDistData prop
      if (stateDistData && stateDistData.stateDetails && Array.isArray(stateDistData.stateDetails) && stateDistData.stateDetails.length > 0) {
        console.log('🗺️ Using API State Distribution data:', stateDistData.stateDetails.length, 'states');
        
        // Get top 10 states (excluding UNKNOWN if present)
        const filteredStates = stateDistData.stateDetails.filter(state => 
          state.name && state.name.toUpperCase() !== 'UNKNOWN'
        );
        
        const top10States = filteredStates.slice(0, 10);
        
        // Calculate total for percentage calculation
        const totalCount = top10States.reduce((sum, state) => sum + (state.count || 0), 0);
        
        // Prepare chart data
        const labels = top10States.map(state => state.name);
        const counts = top10States.map(state => state.count || 0);
        const percentages = top10States.map(state => 
          totalCount > 0 ? ((state.count || 0) / totalCount * 100) : 0
        );
        
        // Use consistent color mapping
        const colors = colorMapping.map(color => color.hex);
        
        // Prepare state details with colors
        const stateDetails = top10States.map((state, index) => ({
          name: state.name,
          count: state.count || 0,
          color: colorMapping[index % colorMapping.length].tailwind
        }));
        
        // Update chart data
        setChartData({
          series: percentages,
          options: {
            chart: {
              type: 'donut',
              height: 300
            },
            colors: colors.slice(0, top10States.length),
            labels: labels,
            dataLabels: {
              enabled: true,
              formatter: function (val) {
                return Math.round(val) + "%"
              },
              style: {
                fontSize: '11px',
                fontWeight: 'bold',
                colors: ['#FFFFFF']
              },
              dropShadow: {
                enabled: false
              }
            },
            plotOptions: {
              pie: {
                donut: {
                  size: '60%',
                  labels: {
                    show: true,
                    name: {
                      show: true,
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#374151',
                      offsetY: -5
                    },
                    value: {
                      show: true,
                      fontSize: '18px',
                      fontWeight: 700,
                      color: '#1F2937',
                      offsetY: 5,
                      formatter: function (val) {
                        return Math.round(val) + "%"
                      }
                    },
                    total: {
                      show: true,
                      showAlways: true,
                      label: 'States',
                      fontSize: '12px',
                      fontWeight: 400,
                      color: '#6B7280',
                      formatter: function (w) {
                        return w.globals.seriesTotals.length;
                      }
                    }
                  }
                }
              }
            },
            legend: {
              show: false
            },
            tooltip: {
              enabled: true,
              style: {
                fontSize: '12px'
              },
              y: {
                formatter: function (val, opts) {
                  const count = counts[opts.dataPointIndex];
                  return count.toLocaleString() + " grievances (" + Math.round(val) + "%)";
                }
              }
            },
            responsive: [{
              breakpoint: 480,
              options: {
                chart: {
                  height: 200
                }
              }
            }]
          }
        });
        
        setStateData(stateDetails);
        console.log('✅ API State Distribution data processed:', top10States.length, 'states');
      } else {
        // Fallback to hardcoded data
        console.log('🗺️ Using hardcoded State Distribution data (no API data available)');
        setChartData({
          series: hardcodedStateData.data,
          options: {
            chart: {
              type: 'donut',
              height: 300
            },
            colors: colorMapping.map(color => color.hex),
            labels: hardcodedStateData.labels,
            dataLabels: {
              enabled: true,
              formatter: function (val) {
                return Math.round(val) + "%"
              },
              style: {
                fontSize: '11px',
                fontWeight: 'bold',
                colors: ['#FFFFFF']
              },
              dropShadow: {
                enabled: false
              }
            },
            plotOptions: {
              pie: {
                donut: {
                  size: '60%',
                  labels: {
                    show: true,
                    name: {
                      show: true,
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#374151',
                      offsetY: -5
                    },
                    value: {
                      show: true,
                      fontSize: '18px',
                      fontWeight: 700,
                      color: '#1F2937',
                      offsetY: 5,
                      formatter: function (val) {
                        return val + "%"
                      }
                    },
                    total: {
                      show: true,
                      showAlways: true,
                      label: 'States',
                      fontSize: '12px',
                      fontWeight: 400,
                      color: '#6B7280',
                      formatter: function (w) {
                        return w.globals.seriesTotals.length;
                      }
                    }
                  }
                }
              }
            },
            legend: {
              show: false
            },
            tooltip: {
              enabled: true,
              style: {
                fontSize: '12px'
              },
              y: {
                formatter: function (val) {
                  return val + "%"
                }
              }
            },
            responsive: [{
              breakpoint: 480,
              options: {
                chart: {
                  height: 200
                }
              }
            }]
          }
        });
        setStateData(hardcodedStateData.stateDetails);
      }
      
      setLoading(false);
    };
    
    processStateData();
  }, [ministry, from, to, stateDistData]);

  return (
    <Card className="shadow-sm h-full">
      <CardBody className="p-3 h-full flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <Typography variant="h6" className="text-gray-700 font-semibold text-sm">
            State Distribution
          </Typography>
          {loading && (
            <div className="text-xs text-gray-500">Loading...</div>
          )}
        </div>
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 -mt-2 min-h-0">
            <Chart
              options={chartData.options}
              series={chartData.series}
              type="donut"
              height="100%"
            />
          </div>
          
          {/* State Summary - Fixed Overflow */}
          <div className="mt-1 space-y-1 flex-shrink-0">
            <div className="max-h-20 overflow-y-auto space-y-1">
              {stateData && stateData.length > 0 && stateData.slice(0, 3).map((state, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <div className="flex items-center min-w-0 flex-1">
                    <div className={`w-2 h-2 ${state.color || 'bg-gray-500'} rounded-full mr-2 flex-shrink-0`}></div>
                    <Typography variant="small" className="text-gray-600 text-xs truncate">
                      {state.name && state.name.length > 10 ? state.name.substring(0, 10) + '..' : state.name}
                    </Typography>
                  </div>
                  <Typography variant="small" className="font-semibold text-gray-700 text-xs ml-1 flex-shrink-0">
                    {state.count || 0}
                  </Typography>
                </div>
              ))}
            </div>
            {stateData && stateData.length > 3 && (
              <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100">
                <Typography variant="small" className="text-gray-500 text-xs truncate">
                  +{stateData.length - 3} others
                </Typography>
                <Typography variant="small" className="font-semibold text-gray-600 text-xs flex-shrink-0">
                  {stateData.slice(3).reduce((sum, state) => sum + (state.count || 0), 0)}
                </Typography>
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
});

export default StateDistribution;