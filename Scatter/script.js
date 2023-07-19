// script.js

// x,y,width,height setup
var width = 1000;
var height = 500;
var padding = 50;

var dopingColor = '#C3DCFFCC';
var noDopingColor = '#FFC3EECC';

var tooltip = d3.select(".chart")
                .append("div")
                .attr("id", "tooltip")
                .style("opacity", 0);

// get data from json
d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json")
  .then(data => {
    var dataset=data;
    //console.log(dataset[0]);
    var times = dataset.map(d => {
      return d3.utcParse("%M:%S")(d["Time"]);
    });
    var places = dataset.map(d => d["Place"]);
    var time_in_seconds = dataset.map(d => d["Seconds"]);
    var name = dataset.map(d => d["Name"]);
    var years = dataset.map(d => d["Year"]);
  
    var nationalities = dataset.map(d => d["Nationality"]);
    var doping = dataset.map(d => d["Doping"]);
    
    var xMin = d3.min(years, d=> d);
    var xMax = d3.max(years, d=> d);
    var yMin = d3.min(times, d => d);
    var yMax = d3.max(times, d => d);
    xMin = xMin - 1;
    xMax = xMax + 1;
    // https://d3-wiki.readthedocs.io/zh_CN/master/Time-Scales/
    const xScale = d3.scaleLinear()
                     .domain([xMin, xMax])
                     .range([padding, width - padding]);
    const yScale = d3.scaleTime()
                     .domain([yMin, yMax])
                     .range([padding, height - padding]);
  
    const xAxis = d3.axisBottom(xScale)
                    .tickFormat(d3.format("d"));
    const yAxis = d3.axisLeft(yScale)
                    .tickFormat(function (d, i) {
                      return d3.utcFormat("%M:%S")(d);
                    });  
  
    const svg = d3.select(".chart")
                  .append("svg")
                  .attr("width", width)
                  .attr("height", height);
  
  svg.selectAll("circle")
     .data(dataset)
     .enter()
     .append("circle")
     .attr("cx", (d,i) => xScale(years[i]))
     .attr("cy", (d,i) => (yScale(times[i])))
     .attr("r", 5)
     .attr("class", "dot")
     .attr("fill", d => {
    if(d["Doping"] === "") {
      return noDopingColor;
    }
    else {
      return dopingColor;
    }
    
  })
     .attr("data-xvalue", (d, i) => years[i])
     .attr("data-yvalue", (d, i) => times[i])
     .on("mouseover", function(e, d) {
            var tmp = d;
   //https://observablehq.com/@bsaienko/animated-bar-chart-with-tooltip
    // https://gramener.github.io/d3js-playbook/tooltips.html
      var tmpStr = "<strong>Time:</strong> " + tmp["Time"] + ", <strong>Year:</strong> " + tmp["Year"] + "</br>" + tmp["Name"] + ": " + tmp["Nationality"];
      if(tmp["Doping"] !== "") {
        tmpStr = tmpStr + "<br><br>" + tmp["Doping"];
      }
    
    
    return tooltip.style("opacity", 1)
                  .html(tmpStr)
                  .attr("data-year", d["Year"])
                  .style("left", (event.pageX) + "px")
                  .style("top", (event.pageY) + "px");
  })
     .on("mouseout", function(e, d) {
        return tooltip.style("opacity", 0);
  })
  
  // legend
  svg.append("circle")
     .attr("id", "legend")
     .attr("cx", (width - (4* padding)))
     .attr("cy", ((height - padding)/2))
     .attr("r", 5)
     .attr("fill", dopingColor)
     .attr("stroke", "#46209466");
  svg.append("text")
     .attr("x", (width - (3.8 * padding)))
     .attr("y", ((height - padding)/2))
     .text("Has Doping Allegations")
     .style("font-size", 0.8 + "rem")
     .attr("alignment-baseline", "middle");
  svg.append("circle")
     .attr("id", "legend")
     .attr("cx", (width - (4* padding)))
     .attr("cy", (((height - padding)/2)+20))
     .attr("r", 5)
     .attr("fill", noDopingColor)
     .attr("stroke", "#46209466");
  svg.append("text")
     .attr("x", (width - (3.8 * padding)))
     .attr("y", (((height - padding)/2)+20))
     .text("No Doping Allegations")
     .style("font-size", 0.8 + "rem")
     .attr("alignment-baseline", "middle");
  
  //axes
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
  
  svg.append("g")
     .attr("class", "axis-label")
     .attr("id", "y-axis-label")
     .attr("transform", "translate(" + (1.3*padding) + "," + ((height-padding)/3) + ")")
     .append("text")
     .attr("text-anchor", "middle")
     .attr("transform", "rotate(-90)")
     .text("Finish Time (minutes)");
  
  svg.append("g")
     .attr("class", "axis-label")
     .attr("id", "x-axis-label")
     .attr("transform", "translate(" + ((width - padding)/2) + "," + ((height - (padding/3))) + ")")
     .append("text")
     .attr("text-anchor", "middle")
     .text("Years");
  });
