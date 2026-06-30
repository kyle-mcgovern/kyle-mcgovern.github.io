document.addEventListener("DOMContentLoaded", function () {
const container = document.getElementById("viz3");
const width = container.clientWidth;
const height = 700;
const svg = d3.select("#viz3")
  .append("svg")
  .attr("viewBox", `0 0 ${width} ${height}`)
  .attr("preserveAspectRatio", "xMidYMid meet")
  .style("width", "100%")
  .style("height", "auto");

const margin = {top: 20, right: 20, bottom: 50, left: 160};

function cred_plot(container, data, margin, height, width, y_text, title, offset_title, min_x, max_x) {
  // X scale
  const x = d3.scaleLinear()
      .domain([min_x, max_x])
      .nice()
      .range([margin.left, width - margin.right]);
  // Y scale
  const y = d3.scaleBand()
      .domain(data.map(d => d.taxon))
      .range([margin.top, height - margin.bottom])
      .padding(0.35);
  // Zero reference line
  container.append("line")
      .attr("x1", x(0))
      .attr("x2", x(0))
      .attr("y1", margin.top)
      .attr("y2", height - margin.bottom)
      .attr("stroke", "#999")
      .attr("stroke-dasharray", "4,4");
  //title
  container.append("text")
	   .attr("x", width/2-offset_title)
	   .attr("y", 5)
	   .style("font-weight", "bold")
           .style("font-size", "18px")
	   .text(title);
  // Credible intervals
  container.selectAll(".ci")
      .data(data)
      .join("line")
      .attr("class", "ci")
      .attr("x1", d => x(d.lower))
      .attr("x2", d => x(d.upper))
      .attr("y1", d => y(d.taxon) + y.bandwidth()/2)
      .attr("y2", d => y(d.taxon) + y.bandwidth()/2)
      .attr("stroke", "black")
      .attr("stroke-width", 2.2);
  // Median estimate
  container.selectAll(".median")
      .data(data)
      .join("circle")
      .attr("class", "median")
      .attr("cx", d => x(d.median))
      .attr("cy", d => y(d.taxon) + y.bandwidth()/2)
      .attr("r", 4)
      .attr("fill", "black");
  // True value
  container.selectAll(".truth")
      .data(data)
      .join("circle")
      .attr("class", "truth")
      .attr("cx", d => x(d.true))
      .attr("cy", d => y(d.taxon) + y.bandwidth()/2)
      .attr("r", 4)
      .attr("fill", "red");
  // Y axis
  if (y_text) {
  container.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .style("font-size", "14px");
  } else {
  container.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).tickFormat(() => ""));
  }
  // X axis
  container.append("g")
      .attr("transform", `translate(0,${height-margin.bottom})`)
      .call(d3.axisBottom(x));
  // X label
  container.append("text")
      .attr("x", (margin.left + width - margin.right)/2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .text("Correlation");
}

const g1 = svg.append("g")
         .attr("transform", "translate(0,10)")
const g2 = svg.append("g")
         .attr("transform", "translate(280,10)")
d3.csv("/data/sparcc_oscillibacter.csv", d3.autoType).then(data => {
	cred_plot(g1, data, margin, 650, 430, true, "SparCC: Oscillibacter", 25, -0.4, 0.6);
});
d3.csv("/data/sparcc_prevotella.csv", d3.autoType).then(data => {
	cred_plot(g2, data, margin, 650, 430, false, "SparCC: Prevotella", 0, -0.4, 0.5);
});

// Legend
const g3 = svg.append("g")
              .attr("transform", `translate(${width/4}, ${height-20})`);
g3.append("circle")
  .attr("cx", 7)
  .attr("cy", 10)
  .attr("r", 4)
  .attr("fill", "red");
g3.append("text")
  .attr("x", 20)
  .attr("y", 15)
  .text("True Correlation");
g3.append("circle")
  .attr("cx", 210)
  .attr("cy", 10)
  .attr("r", 4)
  .attr("fill", "black");
g3.append("line")
  .attr("x1", 180)
  .attr("x2", 240)
  .attr("y1", 10)
  .attr("y2", 10)
  .attr("stroke", "black")
  .attr("stroke-width", 2.2);
g3.append("text")
  .attr("x", 250)
  .attr("y", 15)
  .text("95% Credible Interval");

});
