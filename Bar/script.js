// script.js

// x,y,width,height setup
var width = 1000;
var height = 500;
var padding = 50;


var tooltip = d3.select(".chart")
                .append("div")
                .attr("id", "tooltip")
                .style("opacity", 0);

// get data from json
d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json")
  .then(data => {
    var dataset=data.data;
    var dates = dataset.map(function(val) {
      return new Date(val[0]+'T00:00');
    })
    
    //console.log(dates);
    var values = dataset.map(function(val) {
      return val[1];
    })
    
    // scales
    var xMin = new Date(dates[0]);
    var xMax = new Date(d3.max(dates, d => d));
    // x-axis too short bc width of each bar
    // add an extra quarter to max
    xMax.setMonth(xMax.getMonth() + 3);
    var yMin = d3.min(values, d => d);
    var yMax = d3.max(values, d => d);
    
  
    // https://d3-wiki.readthedocs.io/zh_CN/master/Time-Scales/
    const xScale = d3.scaleTime()
                     .domain([xMin, xMax])
                     .range([padding, width - padding]);
    const yScale = d3.scaleLinear()
                     .domain([0, yMax])
                     .range([height - padding, padding]);
  
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);  
  
    const svg = d3.select(".chart")
                  .append("svg")
                  .attr("width", width)
                  .attr("height", height);
  
  svg.selectAll("rect")
     .data(dataset)
     .enter()
     .append("rect")
     .attr("x", (d,i) => xScale(dates[i]))
     .attr("y", (d,i) => yScale(values[i]))
     .attr("width", ((width - padding)/(dates.length)))
     .attr("height", (d,i) => (height - padding - yScale(values[i])))
     .attr("class", "bar")
     .attr("data-date", (d, i) => dataset[i][0])
     .attr("data-gdp", (d, i) => dataset[i][1])
     .on("mouseover", function(e, d) {
            var tmp = new Date(d[0]+'T00:00');
            console.log("tmp = " + tmp);
            var tmpQ;
            switch(tmp.getMonth()) {
              case 0:
                tmpQ = "Q1";
                break;
              case 3:
                tmpQ = "Q2";
                break;
              case 6: 
                tmpQ = "Q3";
                break;
              case 9:
                tmpQ = "Q4";
                break;
            }
    //https://observablehq.com/@bsaienko/animated-bar-chart-with-tooltip
    // https://gramener.github.io/d3js-playbook/tooltips.html
    return tooltip.style("opacity", 1)
                  .html(tmp.getFullYear() + " " + tmpQ + "</br>$" + d[1] + " Billion")
                  .attr("data-date", d[0])
                  .style("left", (event.pageX) + "px")
                  .style("top", (event.pageY) + "px");
  })
     .on("mouseout", function(e, d) {
        return tooltip.style("opacity", 0);
  })
  
  
  svg.append("g")
     .attr("id", "x-axis")
     .attr("transform", "translate(" + 0 + " ," + (height - padding) + ")")
     .attr("class", "tick")
     .call(xAxis);
      
  svg.append("g")
     .attr("id", "y-axis")
     .attr("transform", "translate(" + padding + "," + 0 +")")
     .attr("class", "tick")
     .call(yAxis);
  });
