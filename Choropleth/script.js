// script.js

// x,y,width,height, setup
var width = 1000;
//var height = 500;
var height = 400;
var margin = {
  top: 40,
  bottom: 40,
  left: 80,
  right: 80
};

const svg = d3.select(".chart")
                  .append("svg")
                  .attr("width", (width + margin.left + margin.right))
                  .attr("height", (height + margin.top + margin.bottom))
                  .attr("id", "chart-svg")
                  .append("g")
                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
//colors (11)
var colorSpectrum = [
  "#E1ECE8", //light 
  "#C3D9D0",
  "#86B3A1", 
  "#4A8D72", 
  "#2B7A5B", 
  "#0D6743", 
  "#0A4D32" //dark
];

var tooltip = d3.select(".chart")
                .append("div")
                .attr("id", "tooltip")
                .style("opacity", 0);

// http://www.d3noob.org/2013/03/a-simple-d3js-map-explained.html
// https://stackoverflow.com/questions/16739712/topojson-object-in-topojson-v1
// https://stackoverflow.com/questions/70629019/how-to-load-two-external-files-in-d3// for map paths
var g = svg.append("g");

// get data from json
Promise.all([
  d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"),
  d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json")
]).then(function ([cdata, edata]) {  
     var countyData = topojson.feature(cdata, cdata.objects.counties);
     var eduId = edata.map(d => d['fips']);
      // fips int (edata[0].fips) === countyData.features[0].id
      // state str initials
      // area_name str full county name
      // bachelorsOrHigher float/decimal/number
     var eduRate = edata.map(d => d['bachelorsOrHigher']);
  
     var minRate = d3.min(eduRate, d=> d);
     var maxRate = d3.max(eduRate, d=> d);
  
     // color scale
     // https://observablehq.com/@d3/quantile-quantize-and-threshold-scales
     var colorScale = d3.scaleQuantize()
                        .domain([minRate, maxRate])
                        .range(colorSpectrum);
  
     //https://stackoverflow.com/questions/42430361/scaling-d3-v4-map-to-fit-svg-or-at-all
     var projection = d3.geoIdentity()
                        .fitExtent([[0,0],[width,height]], countyData);
  
     var path = d3.geoPath().projection(projection);
    //counties
     g.selectAll("path")
      .data(countyData.features)
      .enter()
      .append("path")
      .attr("class", "county")
      .attr("data-fips", d => d.id)
      .attr("data-education", (d,i) => {
         return eduRate[eduId.indexOf(d.id)];
     })
      .attr("fill", (d,i) => {
       return colorScale(eduRate[eduId.indexOf(d.id)]);
     })
      .on("mouseover", function(e,d) {
       var tmp = d.id;
       console.log(edata[eduId.indexOf(tmp)]);
       return tooltip.style("opacity", 1) 
                     .html(edata[eduId.indexOf(tmp)]['area_name'] + ", <strong>" + edata[eduId.indexOf(tmp)]['state'] + "</strong><br>" + eduRate[eduId.indexOf(tmp)] + "%")
                     .attr("data-education", eduRate[eduId.indexOf(tmp)])
                     .style("left", (event.pageX) + "px")
                     .style("top", (event.pageY) + "px");
     })
      .on("mouseout", function(e, d) {
        return tooltip.style("opacity", 0);
  })
      .attr("d", path);

    //state lines
    // https://observablehq.com/@neocartocnrs/cheat-sheet-topojson
    svg.append("g")
       .datum(topojson.mesh(cdata,cdata.objects.states, (a,b) => a != b))
       .append("path")
       .attr("class", "state")
       .attr("d", path);
    
  var lw = (width/3.5);
  var lh = (width/10);
   
  var legendSVG = svg.append("g")
     .attr("id", "legend")
     .attr("width", lw)
     .attr("height", lh)
     .attr("transform", "translate(" + ((width)*(3/4)) + "," + (-margin.top/1.5) + ")");
  
  legendSVG.append("g")
           .selectAll("rect")
           .data(colorSpectrum)
           .enter()
           .append("rect")
           .attr("x", (d, i) => i*(lw/colorSpectrum.length))
           .attr("y", 0)
           .attr("height", (lh/colorSpectrum.length))
           .attr("width", (lw/colorSpectrum.length))
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
  var legendScale = d3.scaleLinear()
                     .domain([legendThresholds[0], legendThresholds[7]])
                      .range([0,lw])
  const lAxis = d3.axisBottom(legendScale)
                  .tickValues(legendThresholds)
                  .tickSize(1.7*(lh/colorSpectrum.length))
                  .tickFormat(d => `${d.toFixed(1)}%`);
  
  //https://observablehq.com/@d3/styled-axes
  legendSVG.append("g")
           .attr("id", "legend-axis")
           .attr("transform", "translate(0," + (-lh/colorSpectrum.length)/3 + ")")
           .call(lAxis)
           .call(g => g.select(".domain").remove())
           .call(g => g.selectAll(".tick line").attr("stroke", "#031A11AA"))
           .call(g => g.selectAll(".tick text").attr("color", "#031A11DD"));  
  });
