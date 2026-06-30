document.addEventListener("DOMContentLoaded", function () {
const container = document.getElementById("viz1");
const width = container.clientWidth;
const height = 750;
const svg = d3.select("#viz1")
  .append("svg")
  .attr("viewBox", `0 0 ${width} ${height}`)
  .attr("preserveAspectRatio", "xMidYMid meet")
  .style("width", "100%")
  .style("height", "auto");

function cor_heatmap(container, data, labels, margin,
                     cellSize, title) {
	// Blue → White → Red
	const color = d3.scaleLinear()
	  .domain([-1, 0, 1])
	  .range(["blue", "white", "red"]);
	// Heatmap cells
	container.selectAll("rect")
	  .data(data)
	  .join("rect")
	  .attr("x", d => margin.left + d.col * cellSize)
	  .attr("y", d => margin.top + d.row * cellSize)
	  .attr("width", cellSize)
	  .attr("height", cellSize)
	  .attr("fill", d => color(d.value))
	  .attr("stroke", "#ccc")
	  .append("title")
	  .text(d => d.value.toFixed(2));
	// X labels
	container.selectAll(".xlab")
	  .data(labels)
	  .join("text")
	  .attr("class", "xlab")
	  .attr("x", (_, i) => margin.left + i * cellSize + cellSize / 2)
	  .attr("y", labels.length * cellSize + 22)
	  .style("font-size", "14px")
	  .attr("transform", (_, i) => {
	    const x = margin.left + i * cellSize + cellSize / 2 + 15;
	    const y = labels.length * cellSize+ 22;
	    return `rotate(300, ${x}, ${y})`;
	  })
	  .attr("text-anchor", "end")
	  .text(d => d);
	// Y labels
	container.selectAll(".ylab")
	  .data(labels)
	  .join("text")
	  .attr("class", "ylab")
	  .attr("x", margin.left - 10)
	  .attr("y", (_, i) => margin.top + i * cellSize + cellSize / 2)
	  .attr("dominant-baseline", "middle")
	  .attr("text-anchor", "end")
	  .text(d => d);
	// ----- Horizontal color legend -----
	const legendWidth = 200;
	const legendHeight = 15;
	const legendX = margin.left + (labels.length * cellSize - legendWidth) / 2;
	const legendY = margin.top + labels.length * cellSize + 150;
	// Gradient
	const defs = container.append("defs");
	const gradient = defs.append("linearGradient")
		.attr("id", "corr-gradient")
		.attr("x1", "0%")
		.attr("x2", "100%");
	gradient.append("stop")
		.attr("offset", "0%")
		.attr("stop-color", "blue");
	gradient.append("stop")
		.attr("offset", "50%")
		.attr("stop-color", "white");
	gradient.append("stop")
		.attr("offset", "100%")
		.attr("stop-color", "red");
	// Color bar
	container.append("rect")
		.attr("x", legendX)
		.attr("y", legendY)
		.attr("width", legendWidth)
		.attr("height", legendHeight)
		.attr("fill", "url(#corr-gradient)")
		.attr("stroke", "black");
	// Legend axis
	const legendScale = d3.scaleLinear()
		.domain([-1, 1])
		.range([legendX, legendX + legendWidth]);
	const legendAxis = d3.axisBottom(legendScale)
		.tickValues([-1, 0, 1]);
	container.append("g")
		.attr("transform", `translate(0, ${legendY + legendHeight})`)
		.call(legendAxis);
	container.append("text")
		 .attr("x", width/3.5)
	 	 .attr("y", 20)
	  	 .style("font-weight", "bold")
		 .style("font-size", "16px")
		 .text(title);
}


const cellSize = 13.2;
const margin = {top: 30, right: 20, bottom: 20, left: 183};

names = ["Agathobacter", "Agathobaculum", "Akkermansia", "Alistipes", "Anaerobutyricum",
         "Anaerostipes", "Bacteroides", "Barnesiella", "Bifidobacterium", "Bilophila",
	 "Blautia", "Clostridium_IV", "Coprobacter", "Coprococcus", "Desulfovibrio",
	 "Dorea", "Dysosmobacter", "Escherichia/Shigella", "Faecalibacterium",
	 "Fusicatenibacter", "Gemmiger", "Hungatella", "Ihubacter", "Mediterraneibacter",
	 "Methanobrevibacter", "Monoglobus", "Neglecta", "Oscillibacter", "Parabacteroides",
	 "Parasutterella", "Phascolarctobacterium", "Phocaeicola", "Prevotella", "Roseburia",
	 "Ruminococcus", "Ruminococcus2", "Streptococcus", "Sutterella", "unclassified", "other"];

d3.text("/data/p2_abs_cor.csv").then(text => {
	const data = d3.csvParseRows(text, row => row.map(Number));
	var n = data[0].length;
	var corr_data = [];
	for (let i = 0; i < n; i++) {
		for (let j = 0; j < n; j++) {
			corr_data.push({
				row: i,
				col: j,
				value: data[i][j]
			});
		}
	}
	cor_heatmap(svg, corr_data, names, margin, cellSize, "Vandeputte Healthy Cohort: Absolute Abundance Correlation");
});

});
