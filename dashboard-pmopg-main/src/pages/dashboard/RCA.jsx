import ReactApexChart from "react-apexcharts"
import { useEffect, useState } from "react"
import { getGrievancesUsingRegNos, getRCAData } from "@/services/rca"
import { ChevronRightIcon } from "@heroicons/react/24/solid"
import GrievanceList from "@/widgets/grievance/list"
import { departmentData, getDefaultDepartment, getDepartmentList } from "@/data"
import { Option, Select } from "@material-tailwind/react"
import { toast } from "react-toastify"
import { setLoading, useMaterialTailwindController } from "@/context"


export function RCA() {
  const [tree, setTree] = useState([{ count: 0, topicname: 'root' }])
  const [series, setSeries] = useState([{ data: [] }])
  const emptyTreePath = { text: [], index: [] }
  const [treePath, setTreePath] = useState(emptyTreePath)
  const [grievances, setGrievances] = useState([])
  const defaultDepartment = getDefaultDepartment()
  const [ministry, setMinistry] = useState(defaultDepartment == 'All' ? 'AYUSH' : defaultDepartment)
  const [financialTerm, setFinancialTerm] = useState("2022-II")
  const [activeFilters, setActiveFilters] = useState({
    ministry: null,
    financialTerm: null
  })
  const financialTerms = [
    "2022-I",
    "2022-II"
  ]
  const [pageno, setPageno] = useState(1)
  const [regNos, setRegNos] = useState([])
  const rowsPerPage = 20

  const [, dispatch] = useMaterialTailwindController()

  const filteredDepartmentList = getDepartmentList().filter(item => item.value != 'All')

  const appendToTree = (depth, tree, value, prevTreePath = emptyTreePath) => {
    let indexes = depth.split('.')
    let currentIndex = parseInt(indexes[0])

    if (!tree[currentIndex]) {
      tree[currentIndex] = {}
    }

    if (indexes.length == 1) {
      tree[currentIndex] = {
        ...tree[currentIndex],
        ...value,
        treePath: {
          text: [...prevTreePath.text, value.topicname],
          index: [...prevTreePath.index, currentIndex]
        }
      }
      return [...tree]
    }

    if (!tree[currentIndex]['children'])
      tree[currentIndex]['children'] = []

    tree[currentIndex]['children'] = appendToTree(
      indexes.slice(1).join('.'),
      tree[currentIndex]['children'],
      value,
      tree[currentIndex].treePath
    )

    return [...tree]
  }

  const childClick = (e, p, opts) => {
    if (opts.dataPointIndex != -1) {
      let series = opts.config.series[opts.seriesIndex]
      let child = series.data[opts.dataPointIndex]
      changeChildTo(child)
    }
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
      // style: {
      //   fontSize: '40px'
      // },
      // textAnchor: 'left',
      // offsetX: -30,
      formatter: function (val, opts) {
        return opts.w.config.series[opts.seriesIndex].data[opts.dataPointIndex].topicname.substr(0, 10) + "..."
      },
      background: {
        padding: 0
      }
    },
    tooltip: {
      // x: {
      //   formatter: function (a, b, c) {
      //     console.log(a, b, c)
      //     return 'ad'
      //   }
      // },
      y: {
        formatter: undefined,
        title: {
          formatter: (seriesName, opts) => {
            return opts.w.config.series[opts.seriesIndex].data[opts.dataPointIndex].topicname
          },
        },
      },
      fixed: {
        enabled: true,
        position: 'topRight',
        offsetX: 0,
        offsetY: 0,
      }
    },
    plotOptions: {
      treemap: {
      }
    }
  }

  const setSeriesData = (children) => {
    setSeries([
      {
        data: children.reduce((accumulator, child) => {
          if (child != undefined)
            accumulator.push({
              ...child,
              x: 'test',
              y: child.count
            })

          return accumulator
        }, [])
      }
    ])
  }

  const changeChildTo = child => {
    let children = child.children
    if (!children) {
      children = [child]
    }

    setSeriesData(children)
    setTreePath(child.treePath)
    setRegNos(child.regno)
    if (pageno != 1)
      setPageno(1)
    if (child.regno.length > 0)
      getGrievancesUsingRegNos(child.regno.slice(0, rowsPerPage)).then(response => {
        setGrievances(Object.values(response.data.data))
      })
  }

  const changeToBranchAt = index => {
    // console.log(getChild(treePath.index.slice(0, index + 1)), treePath.index.slice(0, index + 1))
    changeChildTo(getChild(treePath.index.slice(0, index + 1)))
  }

  const getChild = (path = [], branch = tree) => {
    return path.length > 1
      ? getChild(path.slice(1), branch[path[0]].children)
      : branch[path[0]]
  }

  const showData = () => tree[0].count != 0

  useEffect(() => {
    if (pageno != 1)
      setPageno(1)

    setLoading(dispatch, true)

    getRCAData(ministry, financialTerm).then(response => {
      let data = response.data
      if (data.count[0] == 0) {
        toast(`No data found for ${ministry} in ${financialTerm} quarter.`, {
          type: 'error'
        })
        setMinistry(activeFilters.ministry)
        setFinancialTerm(activeFilters.financialTerm)
        return
      }

      // Setting the filters to fetch when reverting to the previous filter
      setActiveFilters({
        ministry: ministry,
        financialTerm: financialTerm
      })

      let treeData = Object.keys(data.topicname).reduce((accumulator, depth) => {
        return appendToTree(depth, accumulator, {
          'topicname': data.topicname[depth],
          'count': data.count[depth],
          'regno': data.regno[depth]
        })
      }, [])
      setTree(treeData)
      // if( treeData[0].children ){
      changeChildTo(treeData[0])
      // }
    })
      .finally(() => setLoading(dispatch, false))
  }, [ministry, financialTerm])

  useEffect(() => {
    if (regNos.length > 0)
      getGrievancesUsingRegNos(regNos.slice((pageno - 1) * rowsPerPage, pageno * rowsPerPage))
        .then(response => {
          setGrievances(Object.values(response.data.data))
        })
  }, [pageno])

  return (
    <div>
      {
        tree.length > 0 &&
        <>
          <div id="chart" className="border-2 border-black pb-1 rounded-lg border-sky treemap-fitting relative">
            <ReactApexChart options={options} series={series} type={options.chart.type} height={showData() ? options.chart.height : 10} className="test" />
          </div>

          <div className="flex mt-3 justify-between align-center gap-4 mx-4">
            <div className="pathbox">
              <div className="flex flex-wrap">
                {
                  treePath.text.slice(0, treePath.text.length - 1).map((step, key) =>
                    <div className="flex cursor-pointer" key={key} onClick={() => changeToBranchAt(key)}>
                      <div className="text-blue-900 text-sm hover:underline">{step}</div> <ChevronRightIcon color="#2254fa" width={18} />
                    </div>
                  )
                }
              </div>
              <div className="text-lg font-bold text-blue-900 whitespace-break-spaces">
                {treePath.text[treePath.text.length - 1]?.replace(/,/g, ', ')}
              </div>
            </div>

            <div className="flex flex-end gap-3 flex-wrap justify-end">
              <div className="w-[20rem]">
                <Select
                  className=""
                  label="Select financial term"
                  value={financialTerm}
                  onChange={value => setFinancialTerm(value)}
                >
                  {financialTerms.map((value, key) => {
                    return (
                      <Option value={value} key={key}>{value}</Option>
                    )
                  })
                  }
                </Select>
              </div>

              <div className="w-[20rem]">
                <Select
                  className=""
                  label="Select Ministry"
                  value={ministry}
                  onChange={value => setMinistry(value)}
                >
                  {
                    filteredDepartmentList.map((item, key) => {
                      return (
                        <Option value={item.value} key={key}>{item.label}</Option>
                      )
                    })
                  }
                </Select>
              </div>
            </div>
          </div>

          <GrievanceList
            titleBarHidden={true}
            grievances={showData() ? grievances : []}
            pageno={pageno}
            setPageno={setPageno}
            count={regNos.length > 0 ? rowsPerPage : null}
            total={regNos.length}
            scrollH={'80vh'}
          />
        </>
      }
    </div>
  )
}

export default RCA  