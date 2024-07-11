"use strict"
$(document).ready(function () {
    function generateData(baseval, count, yrange) {
        var i = 0
        var series = []
        while (i < count) {
            var x = Math.floor(Math.random() * (750 - 1 + 1)) + 1
            var y =
                Math.floor(Math.random() * (yrange.max - yrange.min + 1)) +
                yrange.min
            var z = Math.floor(Math.random() * (75 - 15 + 1)) + 15
            series.push([x, y, z])
            baseval += 86400000
            i++
        }
        return series
    }
    if ($("#sales_chart").length > 0) {
        var columnCtx = document.getElementById("sales_chart"),
            columnConfig = {
                colors: ["#7638ff", "#fda600"],
                series: [
                    {
                        name: "Received",
                        type: "column",
                        data: [
                            70, 150, 80, 180, 150, 175, 201, 60, 200, 120, 190,
                            160, 50,
                        ],
                    },
                    {
                        name: "Pending",
                        type: "column",
                        data: [
                            23, 42, 35, 27, 43, 22, 17, 31, 22, 22, 12, 16, 80,
                        ],
                    },
                ],
                chart: {
                    type: "bar",
                    fontFamily: "Poppins, sans-serif",
                    height: 350,
                    toolbar: { show: false },
                },
                plotOptions: {
                    bar: {
                        horizontal: false,
                        columnWidth: "60%",
                        endingShape: "rounded",
                    },
                },
                dataLabels: { enabled: false },
                stroke: { show: true, width: 2, colors: ["transparent"] },
                xaxis: {
                    categories: [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                    ],
                },
                yaxis: { title: { text: "$ (thousands)" } },
                fill: { opacity: 1 },
                tooltip: {
                    y: {
                        formatter: function (val) {
                            return "$ " + val + " thousands"
                        },
                    },
                },
            }
        var columnChart = new ApexCharts(columnCtx, columnConfig)
        columnChart.render()
    }
    if ($("#invoice_chart").length > 0) {
        var pieCtx = document.getElementById("invoice_chart"),
            pieConfig = {
                colors: ["#7638ff", "#ff737b", "#fda600", "#1ec1b0"],
                series: [55, 40, 20, 10],
                chart: {
                    fontFamily: "Poppins, sans-serif",
                    height: 350,
                    type: "donut",
                },
                labels: ["Paid", "Unpaid", "Overdue", "Draft"],
                legend: { show: false },
                responsive: [
                    {
                        breakpoint: 480,
                        options: {
                            chart: { width: 200 },
                            legend: { position: "bottom" },
                        },
                    },
                ],
            }
        var pieChart = new ApexCharts(pieCtx, pieConfig)
        pieChart.render()
    }
   
    if ($("#s-line-area").length > 0) {
        var sLineArea = {
            chart: { height: 350, type: "area", toolbar: { show: false } },
            dataLabels: { enabled: false },
            stroke: { curve: "smooth" },
            series: [
                { name: "series1", data: [31, 40, 28, 51, 42, 109, 100] },
                { name: "series2", data: [11, 32, 45, 32, 34, 52, 41] },
            ],
            xaxis: {
                type: "datetime",
                categories: [
                    "2018-09-19T00:00:00",
                    "2018-09-19T01:30:00",
                    "2018-09-19T02:30:00",
                    "2018-09-19T03:30:00",
                    "2018-09-19T04:30:00",
                    "2018-09-19T05:30:00",
                    "2018-09-19T06:30:00",
                ],
            },
            tooltip: { x: { format: "dd/MM/yy HH:mm" } },
        }
        var chart = new ApexCharts(
            document.querySelector("#s-line-area"),
            sLineArea
        )
        chart.render()
    }
    if ($("#s-col").length > 0) {
        var sCol = {
            chart: { height: 350, type: "bar", toolbar: { show: false } },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: "55%",
                    endingShape: "rounded",
                },
            },
            dataLabels: { enabled: false },
            stroke: { show: true, width: 2, colors: ["transparent"] },
            series: [
                {
                    name: "Net Profit",
                    data: [44, 55, 57, 56, 61, 58, 63, 60, 66],
                },
                {
                    name: "Revenue",
                    data: [76, 85, 101, 98, 87, 105, 91, 114, 94],
                },
            ],
            xaxis: {
                categories: [
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                ],
            },
            yaxis: { title: { text: "$ (thousands)" } },
            fill: { opacity: 1 },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return "$ " + val + " thousands"
                    },
                },
            },
        }
        var chart = new ApexCharts(document.querySelector("#s-col"), sCol)
        chart.render()
    }
    if ($("#s-col-stacked").length > 0) {
        var sColStacked = {
            chart: {
                height: 350,
                type: "bar",
                stacked: true,
                toolbar: { show: false },
            },
            responsive: [
                {
                    breakpoint: 480,
                    options: {
                        legend: {
                            position: "bottom",
                            offsetX: -10,
                            offsetY: 0,
                        },
                    },
                },
            ],
            plotOptions: { bar: { horizontal: false } },
            series: [
                { name: "PRODUCT A", data: [44, 55, 41, 67, 22, 43] },
                { name: "PRODUCT B", data: [13, 23, 20, 8, 13, 27] },
                { name: "PRODUCT C", data: [11, 17, 15, 15, 21, 14] },
                { name: "PRODUCT D", data: [21, 7, 25, 13, 22, 8] },
            ],
            xaxis: {
                type: "datetime",
                categories: [
                    "01/01/2011 GMT",
                    "01/02/2011 GMT",
                    "01/03/2011 GMT",
                    "01/04/2011 GMT",
                    "01/05/2011 GMT",
                    "01/06/2011 GMT",
                ],
            },
            legend: { position: "right", offsetY: 40 },
            fill: { opacity: 1 },
        }
        var chart = new ApexCharts(
            document.querySelector("#s-col-stacked"),
            sColStacked
        )
        chart.render()
    }
    if ($("#s-bar").length > 0) {
        var sBar = {
            chart: { height: 350, type: "bar", toolbar: { show: false } },
            plotOptions: { bar: { horizontal: true } },
            dataLabels: { enabled: false },
            series: [
                { data: [400, 430, 448, 470, 540, 580, 690, 1100, 1200, 1380] },
            ],
            xaxis: {
                categories: [
                    "South Korea",
                    "Canada",
                    "United Kingdom",
                    "Netherlands",
                    "Italy",
                    "France",
                    "Japan",
                    "United States",
                    "China",
                    "Germany",
                ],
            },
        }
        var chart = new ApexCharts(document.querySelector("#s-bar"), sBar)
        chart.render()
    }
    if ($("#mixed-chart").length > 0) {
        var options = {
            chart: { height: 350, type: "line", toolbar: { show: false } },
            series: [
                {
                    name: "Website Blog",
                    type: "column",
                    data: [
                        440, 505, 414, 671, 227, 413, 201, 352, 752, 320, 257,
                        160,
                    ],
                },
                {
                    name: "Social Media",
                    type: "line",
                    data: [23, 42, 35, 27, 43, 22, 17, 31, 22, 22, 12, 16],
                },
            ],
            stroke: { width: [0, 4] },
            title: { text: "Traffic Sources" },
            labels: [
                "01 Jan 2001",
                "02 Jan 2001",
                "03 Jan 2001",
                "04 Jan 2001",
                "05 Jan 2001",
                "06 Jan 2001",
                "07 Jan 2001",
                "08 Jan 2001",
                "09 Jan 2001",
                "10 Jan 2001",
                "11 Jan 2001",
                "12 Jan 2001",
            ],
            xaxis: { type: "datetime" },
            yaxis: [
                { title: { text: "Website Blog" } },
                { opposite: true, title: { text: "Social Media" } },
            ],
        }
        var chart = new ApexCharts(
            document.querySelector("#mixed-chart"),
            options
        )
        chart.render()
    }
    if ($("#donut-chart").length > 0) {
        var donutChart = {
            chart: { height: 350, type: "donut", toolbar: { show: false } },
            series: [44, 55, 41, 17],
            responsive: [
                {
                    breakpoint: 480,
                    options: {
                        chart: { width: 200 },
                        legend: { position: "bottom" },
                    },
                },
            ],
        }
        var donut = new ApexCharts(
            document.querySelector("#donut-chart"),
            donutChart
        )
        donut.render()
    }
    if ($("#radial-chart").length > 0) {
        var radialChart = {
            chart: { height: 350, type: "radialBar", toolbar: { show: false } },
            plotOptions: {
                radialBar: {
                    dataLabels: {
                        name: { fontSize: "22px" },
                        value: { fontSize: "16px" },
                        total: {
                            show: true,
                            label: "Total",
                            formatter: function (w) {
                                return 249
                            },
                        },
                    },
                },
            },
            series: [44, 55, 67, 83],
            labels: ["Apples", "Oranges", "Bananas", "Berries"],
        }
        var chart = new ApexCharts(
            document.querySelector("#radial-chart"),
            radialChart
        )
        chart.render()
    }
    if ($("#sales_charts").length > 0) {
        var options = {
            series: [
                { name: "Sales", data: [50, 45, 60, 70, 50, 45, 60, 70] },
                {
                    name: "Purchase",
                    data: [-21, -54, -45, -35, -21, -54, -45, -35],
                },
            ],
            colors: ["#28C76F", "#EA5455"],
            chart: {
                type: "bar",
                height: 300,
                stacked: true,
                zoom: { enabled: true },
            },
            responsive: [
                {
                    breakpoint: 280,
                    options: { legend: { position: "bottom", offsetY: 0 } },
                },
            ],
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: "20%",
                    endingShape: "rounded",
                },
            },
            xaxis: {
                categories: [
                    " Jan ",
                    "feb",
                    "march",
                    "april",
                    "may",
                    "june",
                    "july",
                    "auguest",
                ],
            },
            legend: { position: "right", offsetY: 40 },
            fill: { opacity: 1 },
        }
        var chart = new ApexCharts(
            document.querySelector("#sales_charts"),
            options
        )
        chart.render()
    }
   function generateDateRanges() {
       const today = new Date()
       const days = []
       const weeks = []
       const months = []
       const years = []

       // Generate last 10 days
       for (let i = 9; i >= 0; i--) {
           const date = new Date(today)
           date.setDate(today.getDate() - i)
           days.push(date.toLocaleDateString())
       }

       // Generate last 10 weeks
       for (let i = 9; i >= 0; i--) {
           const endDate = new Date(today)
           endDate.setDate(today.getDate() - i * 7)
           const startDate = new Date(endDate)
           startDate.setDate(endDate.getDate() - 6)
           weeks.push(
               `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
           )
       }

       // Generate last 10 months
       for (let i = 9; i >= 0; i--) {
           const date = new Date(today)
           date.setMonth(today.getMonth() - i)
           months.push(date.toLocaleString("default", { month: "short" }))
       }

       // Generate last 4 years
       for (let i = 3; i >= 0; i--) {
           const date = new Date(today)
           date.setFullYear(today.getFullYear() - i)
           years.push(date.getFullYear().toString())
       }

       return { days, weeks, months, years }
   }

   if ($("#s-line").length > 0) {
       const dateRanges = generateDateRanges()

       var sline = {
           chart: {
               height: 350,
               type: "line",
               zoom: { enabled: false },
               toolbar: { show: false },
           },
           dataLabels: { enabled: false },
           stroke: { curve: "straight" },
           series: [
               {
                   name: "Total Orders",
                   data: [10, 20, 15, 30, 25, 40, 35, 50, 45, 60],
               },
               {
                   name: "Total Sales Amount",
                   data: [
                       1000, 2000, 1500, 3000, 2500, 4000, 3500, 5000, 4500,
                       6000,
                   ],
               },
           ],
           title: { text: "Product Trends", align: "left" },
           grid: { row: { colors: ["#f1f2f3", "transparent"], opacity: 0.5 } },
           xaxis: {
               categories: dateRanges.days,
           },
       }

       var chart = new ApexCharts(document.querySelector("#s-line"), sline)
       chart.render()

       const data = {
           daily: {
               categories: dateRanges.days,
               series: [
                   {
                       name: "Total Orders",
                       data: [10, 20, 15, 30, 25, 40, 35, 50, 45, 60],
                   },
                   {
                       name: "Total Sales Amount",
                       data: [
                           80, 100, 50, 75, 40, 200, 400, 100, 50,
                           10,
                       ],
                   },
               ],
           },
           weekly: {
               categories: dateRanges.weeks,
               series: [
                   {
                       name: "Total Orders",
                       data: [70, 60, 80, 70, 90, 85, 95, 100, 110, 105],
                   },
                   {
                       name: "Total Sales Amount",
                       data: [
                           7000, 6000, 8000, 7000, 9000, 8500, 9500, 10000,
                           11000, 10500,
                       ],
                   },
               ],
           },
           monthly: {
               categories: dateRanges.months,
               series: [
                   {
                       name: "Total Orders",
                       data: [200, 250, 300, 350, 400, 450, 500, 550, 600, 650],
                   },
                   {
                       name: "Total Sales Amount",
                       data: [
                           20000, 25000, 30000, 35000, 40000, 45000, 50000,
                           55000, 60000, 65000,
                       ],
                   },
               ],
           },
           yearly: {
               categories: dateRanges.years,
               series: [
                   {
                       name: "Total Orders",
                       data: [
                           1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000,
                           2100,
                       ],
                   },
                   {
                       name: "Total Sales Amount",
                       data: [
                           120000, 130000, 140000, 150000, 160000, 170000,
                           180000, 190000, 200000, 210000,
                       ],
                   },
               ],
           },
       }

       document
           .getElementById("timeInterval")
           .addEventListener("change", function () {
               const selectedInterval = this.value
               chart.updateOptions({
                   xaxis: {
                       categories: data[selectedInterval].categories,
                   },
                   series: data[selectedInterval].series,
               })
           })
   }


})
