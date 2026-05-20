import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import DashboardLayout from "../../components/DashboardLayout"
import axiosInstance from "../../utils/axioInstance"
import moment from "moment"
import { useNavigate } from "react-router-dom"
import RecentTasks from "../../components/RecentTasks"
import CustomPieChart from "../../components/CustomPieChart"
import CustomBarChart from "../../components/CustomBarChart"

const COLORS = ["#FF6384", "#36A2EB", "#FFCE56"]

const Dashboard = () => {
  const navigate = useNavigate()

  const { currentUser } = useSelector((state) => state.user)

  const [dashboardData, setDashboardData] = useState([])
  const [pieChartData, setPieChartData] = useState([])
  const [barChartData, setBarChartData] = useState([])

  // prepare data for pie chart
  const prepareChartData = (data) => {
    const taskDistribution = data?.taskDistribution || {}
    const taskPriorityLevels = data?.taskPriorityLevel || {}

    const taskDistributionData = [
      { status: "To Do", count: taskDistribution?.ToDo || 0 },
      { status: "In Progress", count: taskDistribution?.InProgress || 0 },
      { status: "Done", count: taskDistribution?.Done || 0 },
    ]

    setPieChartData(taskDistributionData)

    const priorityLevelData = [
      { priority: "Low", count: taskPriorityLevels?.Low || 0 },
      { priority: "Medium", count: taskPriorityLevels?.Medium || 0 },
      { priority: "High", count: taskPriorityLevels?.High || 0 },
    ]

    setBarChartData(priorityLevelData)
  }

  const getDashboardData = async () => {
    try {
      const response = await axiosInstance.get("/tasks/dashboard-data")

      if (response.data) {
        setDashboardData(response.data)
        prepareChartData(response.data?.charts || null)
      }
    } catch (error) {
      console.log("Error fetching dashboard data: ", error)
    }
  }

  useEffect(() => {
    getDashboardData()

    return () => {}
  }, [])

  return (
    <DashboardLayout activeMenu={"Dashboard"}>
      <div className="p-6 space-y-6">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 shadow-lg text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">
                Welcome! {currentUser?.name}
              </h2>

              <p className="text-blue-100 mt-1">
                {moment().format("dddd Do MMMM YYYY")}
              </p>
            </div>

            <div className="mt-4 md:mt-0">
              <button
                className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-md"
                onClick={() => navigate("/admin/create-task")}
              >
                Create New Task
              </button>
            </div>
          </div>
        </div>

        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 border-l-4 border-l-blue-500">
              <h3 className="text-slate-400 text-sm font-medium">Total Tasks</h3>

              <p className="text-3xl font-bold text-white mt-2">
                {dashboardData?.charts?.taskDistribution?.All || 0}
              </p>
            </div>

            <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 border-l-4 border-l-orange-500">
              <h3 className="text-slate-400 text-sm font-medium">
                Overdue Tasks
              </h3>

              <p className="text-3xl font-bold text-white mt-2">
                {dashboardData?.statistics?.overdueTasks || 0}
              </p>
            </div>

            <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 border-l-4 border-l-yellow-500">
              <h3 className="text-slate-400 text-sm font-medium">To Do</h3>

              <p className="text-3xl font-bold text-white mt-2">
                {dashboardData?.charts?.taskDistribution?.ToDo || 0}
              </p>
            </div>

            <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 border-l-4 border-l-green-500">
              <h3 className="text-slate-400 text-sm font-medium">
                In Progress Tasks
              </h3>

              <p className="text-3xl font-bold text-white mt-2">
                {dashboardData?.charts?.taskDistribution?.InProgress || 0}
              </p>
            </div>

            <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 border-l-4 border-l-red-500">
              <h3 className="text-slate-400 text-sm font-medium">Done</h3>

              <p className="text-3xl font-bold text-white mt-2">
                {dashboardData?.charts?.taskDistribution?.Done || 0}
              </p>
            </div>
          </div>
        )}

        {dashboardData?.tasksPerUser?.length > 0 && (
          <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              Tasks per member
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-300">
                <thead className="text-slate-400 border-b border-slate-600">
                  <tr>
                    <th className="py-2 pr-4">Member</th>
                    <th className="py-2 pr-4">Total</th>
                    <th className="py-2 pr-4">To Do</th>
                    <th className="py-2 pr-4">In Progress</th>
                    <th className="py-2">Done</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.tasksPerUser.map((u) => (
                    <tr key={u._id} className="border-b border-slate-700/50">
                      <td className="py-3 pr-4 text-white">{u.name}</td>
                      <td className="py-3 pr-4">{u.totalTasks}</td>
                      <td className="py-3 pr-4">{u.todoTasks}</td>
                      <td className="py-3 pr-4">{u.inProgressTasks}</td>
                      <td className="py-3">{u.doneTasks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              Task Distribution
            </h3>

            <div className="h-[330px]">
              <CustomPieChart
                data={pieChartData}
                label="Total Balance"
                colors={COLORS}
              />
            </div>
          </div>

          <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              Task Priority Levels
            </h3>

            <div className="h-[330px]">
              <CustomBarChart data={barChartData} />
            </div>
          </div>
        </div>

        {/* Recent Task Section */}
        <RecentTasks tasks={dashboardData?.recentTasks} />
      </div>
    </DashboardLayout>
  )
}

export default Dashboard
