// script.js

// x,y,width,height, setup
var width = 1000;
//var height = 500;
var height = 400;
var margin = 80;

//var dopingColor = '#C3DCFFCC';
//var noDopingColor = '#FFC3EECC';

const svg = d3.select(".chart")
                  .append("svg")
                  .attr("width", (width + 2* margin))
                  .attr("height", (height + 2*margin))
                  .attr("id", "chart-svg")
                  .append("g")
                  .attr("transform", "translate(" + margin + "," + margin + ")");

//colors (11)
var colorSpectrum = [
  "#020367", //dkblue
  "#055EA6",
  "#217CC6",
  "#9EE6FB",
  "#E5F8FD",
  "#FDFDE5", // yellow
  "#FFDE95", //orange
  "#FDB457",
  "#F9752D",
  "#F42826", // red
  "#9D0403"
];

var tooltip = d3.select(".chart")
                .append("div")
                .attr("id", "tooltip")
                .style("opacity", 0);

// get data from json
d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json")
  .then(data => {
    var dataset=data.monthlyVariance;
    // variables/values needed
    var baseTmp = data.baseTemperature;
    var years = dataset.map(d => d['year']);
  
    var months = dataset.map(d => d['month']);
  /*
    var months = dataset.map(d => {
      return (d3.utcParse("%m")(d['month']));
    });
 */
    var variance = dataset.map(d => d['variance']);
    // checking variable values
    //console.log(d3.utcFormat("%B")(months[3]));
    ///
    var temp = variance.map(d => {
      return Math.round((d + baseTmp) * 10) / 10;
    });
  
    //filter out unique values to use as axes
    var uniqueYears = years.filter((d, i) => {
      return years.indexOf(d) === i;
    });
    var uniqueMonths = months.filter((d, i) => {
        return months.indexOf(d) === i;
      });
/*
    var tmpA = [];
    var uniqueMonths = months.filter((d, i) => {
      var tmp = d.getMonth() + 1;
      //console.log(typeof tmp);
      if (tmpA.indexOf(tmp) === -1 && d !== "") {
        tmpA.push(tmp);
        //console.log(tmpA);
      }
      //console.log(tmpA);
      return (tmpA.indexOf(tmp) === i);
    });
 */
   /* //testing values for months/console outputs/formatting differences due to timezones
    console.log(uniqueMonths[0]);
    console.log(d3.utcFormat("%B")(uniqueMonths[0]));
    console.log(uniqueMonths[0].getUTCMonth());
    //*/
    var xMin = d3.min(uniqueYears, d=> d);
    var xMax = d3.max(uniqueYears, d=> d);
    var yMin = d3.min(uniqueMonths, d => d);
    var yMax = d3.max(uniqueMonths, d => d);
    xMax = xMax + 1;
  
    var maxTmp = baseTmp + d3.max(variance, d=> d);
    var minTmp = baseTmp + d3.min(variance, d=> d);
   
    // color scale
    // https://observablehq.com/@d3/quantile-quantize-and-threshold-scales
    var colorScale = d3.scaleQuantize()
                       .domain([minTmp, maxTmp])
                       .range(colorSpectrum);
   /* //checking variable values
    console.log("xMin = " + xMin);
    console.log("xMax = " + xMax);
    console.log("yMin = " + d3.utcFormat("%B")(yMin));
    console.log("yMax = " + d3.utcFormat("%B")(yMax));
    //*/
    // https://d3-wiki.readthedocs.io/zh_CN/master/Time-Scales/
    const xScale = d3.scaleBand()
                     .domain(uniqueYears)
                     .range([0, width])
                     .padding(0.01);
    const yScale = d3.scaleBand()
                     .domain(uniqueMonths)
                     .range([0, height])
                     .padding(0.01);
    //https://stackoverflow.com/questions/40199108/d3-v4-scaleband-ticks
    const xAxis = d3.axisBottom(xScale)
                    .tickFormat(d3.format("d"))
                    .tickValues(xScale.domain().filter((d,i) => !(d%10)));
    const yAxis = d3.axisLeft(yScale)
                    .tickFormat(function (d, i) {
                      return d3.utcFormat("%B")((d3.utcParse("%m")(d)))
                    });  
                    
    //axes
    svg.append("g")
       .attr("id", "x-axis")
       .attr("transform", "translate(" + 0 + " ," + height + ")")
       .attr("class", "tick")
       .call(xAxis);

    svg.append("g")
       .attr("id", "y-axis")
       //.attr("transform", "translate(" + padding + "," + 0 +")")
       .attr("class", "tick")
       .call(yAxis);

    svg.append("g")
       .attr("class", "axis-label")
       .attr("id", "y-axis-label")
       .attr("transform", "translate(" + (-margin/2) + "," + (0) + ")")
       .append("text")
       .attr("text-anchor", "middle")
       .text("Months");

    svg.append("g")
       .attr("class", "axis-label")
       .attr("id", "x-axis-label")
       .attr("transform", "translate(" + ((width)/2) + "," + (height+margin/2) + ")")
       .append("text")
       .attr("text-anchor", "middle")
       .text("Years");
  //legend  
  /*
  svg.append("g")
     .attr("transform", "translate(" + ((width)/5) + "," + (height+margin/1.7) + ")")
     .append("text")
     .attr("text-anchor", "middle")
     .text("HI TEST LEGEND PLACEMENT");
     */
  
  var lw = (width/3.5);
  var lh = (width/4);
  /*
  svg.append("rect")
     .attr("x", ((width)/12))
     .attr("y", (height+margin/2.2))
     .attr("height", ((width/4)/colorSpectrum.length))
     .attr("width", lw)
     .attr("fill", colorSpectrum[9]);
     */
  var legendSVG = svg.append("g")
     .attr("id", "legend")
     .attr("width", lw)
     .attr("height", lh)
     .attr("transform", "translate(" + ((width)/12) + "," + (height+margin/2) + ")");
  
  legendSVG.append("g")
           .selectAll("rect")
           .data(colorSpectrum)
           .enter()
           .append("rect")
           .attr("x", (d, i) => i*(lw/colorSpectrum.length))
           .attr("y", 0)
           .attr("height", (lh/colorSpectrum.length))
           .attr("width", (lw/colorSpectrum.length))
           .attr("stroke", "#46209466")
           .attr("fill", (d, i) => d);
  
  var legendThresholds = colorSpectrum.map((d, i) => {
    if(i !== colorSpectrum.length - 1) {
      return colorScale.invertExtent(d)[0]
    }
    else {
      return colorScale.invertExtent(d);
    }
  });
  legendThresholds = legendThresholds.flat();
  console.log(legendThresholds)
  var legendScale = d3.scaleLinear()
                      .domain([legendThresholds[0], legendThresholds[11]])
                      .range([0,lw])
  const lAxis = d3.axisBottom(legendScale)
                  .tickValues(legendThresholds)
                  .tickFormat(d3.format(".1f"));
  legendSVG.append("g")
           .attr("id", "legend-axis")
           .attr("transform", "translate(0," + (lh/colorSpectrum.length) + ")")
           .call(lAxis);
    /*      
           .selectAll("rect")
           .data(colorSpectrum) 
           .enter()
           .append("rect")
           .attr("x", (d, i) => i*lw)
           .attr("y", 550)
           .attr("width", lw)
           .attr("height", lh)
           .attr("fill", (d, i) => colorSpectrum[i]);
   */
  console.log(typeof months[0]);
  svg.selectAll("rect")
     .data(dataset)
     .enter()
     .append("rect")
     .attr("x", (d,i) => xScale(years[i]))
     .attr("y", (d,i) => yScale(months[i]))
     .attr("width", xScale.bandwidth())
     .attr("height", yScale.bandwidth())
     .attr("class", "cell")
     .attr("fill", (d, i) => colorScale(baseTmp+variance[i]))
     .attr("data-year", (d, i) => d['year'])
     .attr("data-month", (d) => (d['month'] - 1))
     //.attr("data-month", (d, i) => d3.utcFormat("%B")((d3.utcParse("%m")(months[i]))))
     .attr("data-temp", (d,i) => variance[i]+baseTmp)
     .on("mouseover", function(e, d) {
            var tmp = d;
            console.log(tmp);
            //https://observablehq.com/@bsaienko/animated-bar-chart-with-tooltip
            // https://gramener.github.io/d3js-playbook/tooltips.html
    
            var tmpStr =  "<h3>" + d3.utcFormat("%B")(d3.utcParse("%m")(tmp["month"])) + " " + tmp["year"] + "</br></h3>" + "<strong>Temperature:</strong> " + (Math.round((baseTmp + tmp["variance"])*10)/10) + "℃</br></br> " + "<strong>Variance:</strong> " + (Math.round(tmp["variance"]*10)/10) + "℃";
            return tooltip.style("opacity", 1)
              .html(tmpStr)
              .attr("data-year", d["year"])
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
  //legend stuff
  
  
  });
