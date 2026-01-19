document.addEventListener("DOMContentLoaded", function () {
const container = document.getElementById("viz1");
const width = container.clientWidth;
const height = 320;
const svg = d3.select("#viz1")
  .append("svg")
  .attr("viewBox", `0 0 ${width} ${height}`)
  .attr("preserveAspectRatio", "xMidYMid meet")
  .style("width", "100%")
  .style("height", "auto");

const colorA = d3.scaleSequential()
  .domain([-2, 4])
  .clamp(true)
  .interpolator(d3.interpolateGreens);

const colorB = d3.scaleSequential()
   .domain([-2, 4])
  .clamp(true)
  .interpolator(d3.interpolateOranges);

const colorAm = d3.scaleSequential()
   .domain([-1, 1])
   .clamp(true)
   .interpolator(d3.interpolateBlues);

const colorBm = d3.scaleSequential()
   .domain([-1, 1])
   .clamp(true)
   .interpolator(d3.interpolateReds);

const attnColor = d3.scaleSequential()
   .domain([-1, 1])
   .clamp(true)
   .interpolator(d3.interpolateGreys);

const attnMColor = d3.scaleSequential()
   .domain([0, 1])
   .clamp(true)
   .interpolator(d3.interpolateGreys);

const finalColor = d3.scaleSequential()
      .domain([-1, 1])
      .clamp(true)
      .interpolator(d3.interpolatePurples);

const squareSize = 20;
const padding = 0;
const strokeWidth = 1;

const inputA = [0.1, -2, 3.2, 0, 1, 1.5, -1.2];
const inputB = [-1, 0.4, -2, -0.8, 3.4, -0.7, 0.8];

const stacks = [
  { data: inputA, color: colorA, y: 1 },
  { data: inputB, color: colorB, y: 170 }
];

const g = svg.selectAll("g.stack")
  .data(stacks)
  .enter()
  .append("g")
  .attr("class", "stack")
  .attr("transform", d => `translate(20, ${d.y})`);

g.each(function (stack) {
  d3.select(this)
    .selectAll("rect")
    .data(stack.data)
    .enter()
    .append("rect")
    .attr("rx", 0)
    .attr("ry", 0)
    .attr("stroke", "black")
    .attr("stroke-width", strokeWidth)
    .attr("y", (d, i) => i * (squareSize + padding))
    .attr("width", squareSize)
    .attr("height", squareSize)
    .attr("fill", d => stack.color(d));
});

textData = ["Metagenomics", "Blood Serum"]
const git = svg.selectAll("g.git")
  .data([null])               // single group
  .enter()
  .append("g")
  .attr("class", "git")
  .attr("transform", "translate(15, 125)");

git.selectAll("text")
  .data(textData)
  .enter()
  .append("text")
  .attr("x", (d, i) => -i * 164)
  .attr("y", 0)
  .attr("transform", "rotate(270)")
  .text(d => d);

const moduleA = [[0.9, 0.3], [-0.5, 0.7], [0.75, 0.9]];
const moduleB = [[-0.9, -0.1], [1, 0.25], [-0.6, -0.5]];
const stacksM = [
  { data: moduleA, color: colorAm, y: 0 },
  { data: moduleB, color: colorBm, y: 170 },
];

const gM = svg.selectAll("g.stackm")
  .data(stacksM)
  .enter()
  .append("g")
  .attr("class", "stack")
  .attr("transform", d => `translate(80, ${d.y+40})`);

gM.each(function (stack) {
  const g = d3.select(this);

  const rows = g.selectAll("g.row")
    .data(stack.data)
    .enter()
    .append("g")
    .attr("class", "row")
    .attr("transform", (d, i) =>
      `translate(0, ${i * (squareSize + padding)})`
    );

  rows.selectAll("rect")
    .data(d => d) // <-- cells in each row
    .enter()
    .append("rect")
    .attr("x", (d, j) => j * (squareSize + padding))
    .attr("y", 0)
    .attr("width", squareSize)
    .attr("height", squareSize)
    .attr("rx", 0)
    .attr("ry", 0)
    .attr("stroke", "black")
    .attr("stroke-width", strokeWidth)
    .attr("fill", d => stack.color(d));
});

svg.append("text")
   .text("Modules")
   .attr("x", 70)
   .attr("y", 20);

const cosineStart = 240;

const cosg = svg.append("g")
                .attr("transform", `translate(${cosineStart-140}, 100)`)
cosg.append("line")
    .attr("x1", 0)
    .attr("y1", 50)
    .attr("x2", 65)
    .attr("y2", 50)
    .attr("stroke", "black")
    .attr("stroke-width", 2)
    .attr("stroke-opacity", 1);
cosg.append("line")
    .attr("x1", 0)
    .attr("y1", 50)
    .attr("x2", 0)
    .attr("y2", 10)
    .attr("stroke", "black")
    .attr("stroke-width", 2)
    .attr("stroke-opacity", 1);
cosg.append("line")
    .attr("x1", 0)
    .attr("y1", 50)
    .attr("x2", 0)
    .attr("y2", 100)
    .attr("stroke", "black")
    .attr("stroke-width", 2)
    .attr("stroke-opacity", 1);
cosg.append("text")
    .text("▶")
    .attr("x", 55)
    .attr("y", 55);

const softg = svg.append("g")
  .attr("class", "sd")
  .attr("transform", `translate(${cosineStart+60}, 100)`);

softg.append("line")
     .attr("x1", 10)
     .attr("y1", 50)
     .attr("x2", 85)
     .attr("y2", 50)
     .attr("stroke", "black")
     .attr("stroke-width", 2)
     .attr("stroke-opacity", 1);
softg.append("text")
     .text("▶")
     .attr("x", 75.5)
     .attr("y", 54)
softg.append("text")
     .text("Column")
     .attr("x", 14)
     .attr("y", 45);
softg.append("text")
     .text("Softmax")
     .attr("x", 12)
     .attr("y", 65);

svg.append("text")
    .attr("x", 100)           // Horizontal center point
    .attr("y", 60)            // Vertical start point
    .attr("text-anchor", "middle") // Centers all tspans
    .selectAll("tspan")
    .data(["Cosine Similarity", "Attention Matrix"])
    .enter()
    .append("tspan")
    .attr("x", cosineStart)           // Must repeat the x coordinate
    .attr("dy", (d, i) => i === 0 ? 0 : "1.2em") // Offset for new lines
    .text(d => d);

const stacksA = [
  { data: moduleA, color: colorAm, y: 100, r: 0 },
  { data: moduleB, color: colorBm, y: 200, r: 1 },
];

const gA = svg.selectAll("g.stacka")
  .data(stacksA)
  .enter()
  .append("g")
  .attr("class", "stack")
  .attr("transform", d => `translate(${cosineStart-60}, ${d.y})`);

gA.each(function (stack) {
  const g = d3.select(this);

  const rows = g.selectAll("g.row")
    .data(stack.data)
    .enter()
    .append("g")
    .attr("class", "row")
    .attr("transform", (d, i) =>
      `translate(${stack.r * (i * (squareSize + padding) + 60) },
                 ${-(stack.r-1) * (i * (squareSize + padding) + 20)})`
    );

  rows.selectAll("rect")
    .data(d => d) // <-- cells in each row
    .enter()
    .append("rect")
    .attr("x", (d, j) => -(stack.r-1) * j * (squareSize + padding))
    .attr("y", (d, j) => stack.r * j * (squareSize + padding))
    .attr("width", squareSize)
    .attr("height", squareSize)
    .attr("rx", 0)
    .attr("ry", 0)
    .attr("stroke", "black")
    .attr("stroke-width", strokeWidth)
    .attr("fill", d => stack.color(d));
});

// const moduleA = [[0.9, 0.3], [-0.5, 0.7], [0.75, 0.9]];
// const moduleB = [[-0.9, -0.1], [1, 0.25], [-0.6, -0.5]];
const AM = [{"d": -0.98, "r": 0, "c": 0}, {"d": 0.99, "r": 0, "c": 1},
            {"d": -0.5, "r": 0, "c": 2}, {"d": 0.49, "r": 1, "c": 0},
            {"d": -0.37, "r": 1, "c": 1}, {"d": -0.07, "r": 1, "c": 2},
            {"d": -0.93, "r": 2, "c": 0}, {"d": 0.75, "r": 2, "c": 1},
            {"d": -0.98, "r": 2, "c": 2}];
const gAM = svg.append("g")
               .attr("class", "att")
               .attr("transform", d => `translate(${cosineStart}, 120)`);
gAM.selectAll("rect")
   .data(AM)
   .enter()
   .append("rect")
   .attr("fill", d => attnColor(d.d))
   .attr("x", (d, i) => d.c * (squareSize + padding))
   .attr("y", (d, i) => d.r * (squareSize + padding))
   .attr("stroke", "black")
   .attr("stroke-width", strokeWidth)
   .attr("width", squareSize)
   .attr("height", squareSize);

const links = [];
const al = [0,1,2,3,4,5,6];
const bl = [0,1,2];
const rng = d3.randomLcg(452);
const randUniform = d3.randomUniform.source(rng)(0, 2.5);
al.forEach((a, i) => {
  bl.forEach((b, j) => {
    links.push({
      x1: 40,
      x2: 80,
      y1: 10 + (i * squareSize),
      y2: 50 + (j * squareSize),
      sa: randUniform(),
      sb: randUniform()
    })
  })
})

svg.insert("g", ":first-child")
  .attr("class", "links")
  .selectAll("line")
  .data(links)
  .enter()
  .append("line")
  .attr("x1", d => d.x1)
  .attr("y1", d => d.y1)
  .attr("x2", d => d.x2)
  .attr("y2", d => d.y2)
  .attr("stroke", "#888")
  .attr("stroke-width", d => d.sa)
  .attr("stroke-opacity", 0.75);

svg.insert("g", ":first-child")
  .attr("class", "links")
  .selectAll("line")
  .data(links)
  .enter()
  .append("line")
  .attr("x1", d => d.x1)
  .attr("y1", d => d.y1 + 170)
  .attr("x2", d => d.x2)
  .attr("y2", d => d.y2 + 170)
  .attr("stroke", "#888")
  .attr("stroke-width", d => d.sb)
  .attr("stroke-opacity", 0.75);

const weightStart = 325;

// Right Most Attention Module
const AMR = [{"d": 0.16, "r": 0, "c": 0}, {"d": 0.49, "r": 0, "c": 1},
            {"d": 0.32, "r": 0, "c": 2}, {"d": 0.68, "r": 1, "c": 0},
            {"d": 0.13, "r": 1, "c": 1}, {"d": 0.49, "r": 1, "c": 2},
            {"d": 0.16, "r": 2, "c": 0}, {"d": 0.38, "r": 2, "c": 1},
            {"d": 0.20, "r": 2, "c": 2}];
const gAMR = svg.append("g")
               .attr("class", "att")
               .attr("transform", d => `translate(${weightStart+70}, 120)`);
gAMR.selectAll("rect")
   .data(AMR)
   .enter()
   .append("rect")
   .attr("fill", d => attnMColor(d.d))
   .attr("x", (d, i) => d.c * (squareSize + padding))
   .attr("y", (d, i) => d.r * (squareSize + padding))
   .attr("stroke", "black")
   .attr("stroke-width", strokeWidth)
   .attr("width", squareSize)
   .attr("height", squareSize);

svg.append("text")
    .attr("x", 100)           // Horizontal center point
    .attr("y", 60)            // Vertical start point
    .attr("text-anchor", "middle") // Centers all tspans
    .selectAll("tspan")
    .data(["Attention-Weighted", "Module"])
    .enter()
    .append("tspan")
    .attr("x", weightStart+165)           // Must repeat the x coordinate
    .attr("dy", (d, i) => i === 0 ? 0 : "1.2em") // Offset for new lines
    .text(d => d);
svg.append("text").text("×").attr("x", weightStart+135).attr("y", 159).attr("font-size", 30);
svg.append("text").text("=").attr("x", weightStart+200).attr("y", 159).attr("font-size", 30);

// Right Most Attention Module
const MMR = [{"d": 0.9, "r": 0, "c": 0}, {"d": 0.3, "r": 0, "c": 1},
            {"d": -0.5, "r": 1, "c": 0}, {"d": 0.7, "r": 1, "c": 1},
            {"d": 0.75, "r": 2, "c": 0}, {"d": 0.9, "r": 2, "c": 1}];
const MMRG = svg.append("g")
               .attr("class", "att")
               .attr("transform", d => `translate(${weightStart+155}, 120)`);

MMRG.selectAll("rect")
   .data(MMR)
   .enter()
   .append("rect")
   .attr("fill", d => colorAm(d.d))
   .attr("x", (d, i) => d.c * (squareSize + padding))
   .attr("y", (d, i) => d.r * (squareSize + padding))
   .attr("stroke", "black")
   .attr("stroke-width", strokeWidth)
   .attr("width", squareSize)
   .attr("height", squareSize);

// Right Most Attention Module
const MMA = [{"d": 0.13, "r": 0, "c": 0}, {"d": 0.67, "r": 0, "c": 1},
            {"d": 0.91, "r": 1, "c": 0}, {"d": 0.73, "r": 1, "c": 1},
            {"d": 0.10, "r": 2, "c": 0}, {"d": 0.50, "r": 2, "c": 1}];
const MMAG = svg.append("g")
               .attr("class", "attm")
               .attr("transform", d => `translate(${weightStart+222}, 120)`);

MMAG.selectAll("rect")
   .data(MMA)
   .enter()
   .append("rect")
   .attr("fill", d => finalColor(d.d))
   .attr("x", (d, i) => d.c * (squareSize + padding))
   .attr("y", (d, i) => d.r * (squareSize + padding))
   .attr("stroke", "black")
   .attr("stroke-width", strokeWidth)
   .attr("width", squareSize)
   .attr("height", squareSize);

const gdata = [-0.5, 0.5, -1, 0.1, 1, -0.4];
const gL = svg.append("g")
              .attr("transform", `translate(630, 90)`)
gL.selectAll("rectL")
  .data(gdata)
  .enter()
  .append("rect")
  .attr("x", 0)
  .attr("y", (d, i) => i * (squareSize + padding))
  .attr("width", squareSize)
  .attr("height", squareSize)
  .attr("stroke", "black")
  .attr("stroke-width", strokeWidth)
  .attr("fill", d => attnColor(d));

const flinks = [];
const af = [0,1,2,3,4,5];
const bf = [0];
af.forEach((a, i) => {
  bf.forEach((b, j) => {
    flinks.push({
      x1: 645,
      x2: 690,
      y1: 100 + (i * (squareSize)),
      y2: 150 + (j * (squareSize)),
      sa: randUniform()
    })
  })
});

svg.insert("g", ":first-child")
  .attr("class", "flinks")
  .selectAll("fline")
  .data(flinks)
  .enter()
  .append("line")
  .attr("x1", d => d.x1)
  .attr("y1", d => d.y1)
  .attr("x2", d => d.x2)
  .attr("y2", d => d.y2)
  .attr("stroke", "#888")
  .attr("stroke-width", d => d.sa)
  .attr("stroke-opacity", 0.75);

const alinks = [];
const aaf = [0,1,2];
const baf = [0,1,2,3,4,5];
aaf.forEach((a, i) => {
  baf.forEach((b, j) => {
    alinks.push({
      x1: 585,
      x2: 630,
      y1: 130 + (i * (squareSize)),
      y2: 100 + (j * (squareSize)),
      sa: randUniform()
    })
  })
});

svg.insert("g", ":first-child")
  .attr("class", "alinks")
  .selectAll("aline")
  .data(alinks)
  .enter()
  .append("line")
  .attr("x1", d => d.x1)
  .attr("y1", d => d.y1)
  .attr("x2", d => d.x2)
  .attr("y2", d => d.y2)
  .attr("stroke", "#888")
  .attr("stroke-width", d => d.sa)
  .attr("stroke-opacity", 0.5);

svg.append("rect")
  .attr("x", 690)
  .attr("y", 140)
  .attr("width", squareSize)
  .attr("height", squareSize)
  .attr("stroke", "black")
  .attr("stroke-width", strokeWidth)
  .attr("fill", "#4A4A4A");

svg.append("text")
   .text("Prediction")
   .attr("x", 600)
   .attr("y", 60);
});
