// script.js

// x,y,width,height, setup
var width = 1000;
//var height = 500;
var height = 500;
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
  "#FEC8F1", 
  "#FEC8C9",
  "#FEE3C8", 
  "#D6FEC8", 
  "#6FC9B4", 
  "#C8F1FE", 
  "#C8D6FE",
  "#CCC8FE",
  "#E8C8FE",
  "#C8FEEA",
  "#FF925B",
  "#5BC8FF",
  "#925BFF",
  "#5BFF92",
  "#E45BFF",
  "#FFE45B",
  "#5BFFE4",
  "#FF5BE9"
];

var tooltip = d3.select(".chart")
                .append("div")
                .attr("id", "tooltip")
                .style("opacity", 0);

// http://www.d3noob.org/2013/03/a-simple-d3js-map-explained.html
// https://stackoverflow.com/questions/16739712/topojson-object-in-topojson-v1
// https://stackoverflow.com/questions/70629019/how-to-load-two-external-files-in-d3// for map paths

// get data from json
d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json").then(d => {  
     
     // set root of data, set each leaf (value in json data)
     //https://dev.to/hajarnasr/treemaps-with-d3-js-55p7
     //https://d3-graph-gallery.com/graph/treemap_custom.html
     var root = d3.hierarchy(d).sum(function(d) {return d.value}).sort((a,b) => b.value - a.value);
     var consoles = d.children.map(d => {
       return d.name;
     });
  console.log("consoles");
     // tree map 
     d3.treemap()
       .size([width,height])
       (root);
     console.log("treemap");
      
     // color scale
     var color = d3.scaleOrdinal()
                   .domain(consoles)
                   .range(colorSpectrum);
  //https://stackoverflow.com/questions/56623476/how-to-get-d3-treemap-cell-text-to-wrap-and-not-overflow-other-cells
  // tiles
  const cell = svg.selectAll("g")
                    .data(root.leaves())
                    .enter()
                    .append("g")
                    .attr("class", "cell")
                    .attr("transform", d=> `translate(${d.x0},${d.y0})`)
                    .on("mouseover", function (e,d) {
                      return tooltip.style("opacity", 1)
                                    .html(`${d.data.name}<br><strong>Platform:</strong> ${d.data.category}<br><strong>Sales:</strong> ${d.data.value} mil`)
                                    .attr("data-value", d.data.value)
                                    .style("left", `${event.pageX}px`)
                                    .style("top", `${event.pageY}px`);
                    })
                    .on("mouseout", function (e,d) {
                      return tooltip.style("opacity", 0);
                    });
  
     cell.append("rect")
         .attr("class", "tile")
         .attr("data-name", d => d.data.name)
         .attr("data-value", d => d.data.value)
         .attr("data-category", d => d.data.category)
         .attr('width', d => d.x1-d.x0)
         .attr('height', d => d.y1-d.y0)
         .attr('fill',  d => color(d.data.category))
         .attr("stroke", "#FFFFFF94");
     
     cell.append("text")
         .attr("class", "tile-text")
         .selectAll("tspan")
         .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g))
         .enter()
         .append("tspan")
         .attr("x", 6) 
         .attr("y", (d,i) => 15+10*i)
         .text(d => d);
    
  var lw = 8*margin.left;
  var lh = 10*margin.top;
   
  var legendSVG = svg.append("g")
     .attr("id", "legend")
     .attr("width", lw)
     .attr("height", lh)
     .attr("transform", "translate(" + ((width)+0.2*margin.left) + "," + (0) + ")");
  
  legendSVG.append("g")
           .selectAll("rect")
           .data(colorSpectrum)
           .enter()
           .append("rect")
           .attr("class", "legend-item")
           .attr("x", (d, i) => {
                if(i%2 === 1) {
                  return lw/18;
                }
                else {
                  return 0;
                }
           })
           .attr("y", (d, i) => {
                if(i%2 === 1) {
                  return ((lw/30) + ((i-1)*(lw/24))); 
                }
                else {
                  return ((lw/30) + (i*(lw/24)));
                }
           })
           .attr("height", (lw/32))
           .attr("width", (lw/32))
           .attr("fill", (d, i) => d);
    legendSVG.append("g")
             .selectAll("text")
             .data(consoles)
             .enter()
             .append("text")
             .attr("class", "legend-text")
             .attr("x", (d,i) => {
                  var tmp = 0;
                  if (d.length ===3) {
                    tmp = 0;
                  }
                  else if(d.length === 2) {
                    tmp = -1;
                  }
                  else {
                    tmp = 1;
                  }
                  if(i%2 === 1) {
                    return lw/(18+tmp);
                  }
                  else {
                    if(d.length===4) {
                      tmp = -2.5;
                    }
                    else if(d.length === 2) {
                      tmp = 1.5;
                    }
                    return (0+tmp);
                  }
    })
             .attr("y", (d,i) => {
                  if(i%2 === 1) {
                    return ((lw/35) + ((i-1)*(lw/24))); 
                  }
                  else {
                    return ((lw/35) + (i*(lw/24)));
                  }
    })
             .text(d => d);
  });
