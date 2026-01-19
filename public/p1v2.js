const container = document.getElementById("viz1");//.parentElement;
const width = container.clientWidth;

function createRandomString(length) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const svg = d3.select("#viz2")
  .append("svg")
  .attr("viewBox", `0 0 ${width} 250`)
  .attr("preserveAspectRatio", "xMidYMid meet")
  .style("width", "100%")
  .style("height", "auto");

const svga = d3.select("#viz3")
  .append("svg")
  .attr("viewBox", `0 0 ${width} 250`)
  .attr("preserveAspectRatio", "xMidYMid meet")
  .style("width", "100%")
  .style("height", "auto");

const svgi = d3.select("#viz4")
  .append("svg")
  .attr("viewBox", `0 0 ${width} 250`)
  .attr("preserveAspectRatio", "xMidYMid meet")
  .style("width", "100%")
  .style("height", "auto");

const svge = d3.select("#viz5")
  .append("svg")
  .attr("viewBox", `0 0 ${width} 500`)
  .attr("preserveAspectRatio", "xMidYMid meet")
  .style("width", "100%")
  .style("height", "auto");

const svgib = d3.select("#viz6")
      .append("svg")
  .attr("viewBox", `0 0 ${width} 905`)
  .attr("preserveAspectRatio", "xMidYMid meet")
  .style("width", "100%")
  .style("height", "auto");

function plotVectors(
  svg,
  vectors,
  width = 500,
  height = 500,
    xmin = 0,
    ymin = 0,
    xmax = 1,
    ymax = 1,
    margin = 0,
    angle_vec = null
) {

  const xs = vectors.flatMap(v => [v.x, v.x + v.dx]);
  const ys = vectors.flatMap(v => [v.y, v.y + v.dy]);

  const xScale = d3.scaleLinear()
        .domain([xmin, xmax])
    .nice()
    .range([margin, width - margin]);

  const yScale = d3.scaleLinear()
        .domain([ymin, ymax])
        .nice()
        .range([height - margin, margin]); // invert y

  svg.append("g")
    .attr("transform", `translate(0,${yScale(0)})`)
    .call(d3.axisBottom(xScale).ticks(5));

  svg.append("g")
    .attr("transform", `translate(${xScale(0)},0)`)
    .call(d3.axisLeft(yScale).ticks(5));

  const defs = svg.append("defs");

  const rand_vec = d3.range(vectors.length).map(() => {
    return createRandomString(12);
  });

  vectors.forEach((v, i) => {
      console.log(v.color);
    defs.append("marker")
          .attr("id", `arrow-${i}-${rand_vec[i]}`)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 10)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", v.color || "black");
  });

  const tg = svg.append("g")
  tg.selectAll("lt")
    .data(vectors)
    .enter()
    .append("text")
    .attr("x", d => xScale(d.dx+0.01))
    .attr("y", d => yScale(d.dy+0.025))
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .attr("fill", "black")
    .text(d => d.name);

  svg.append("g")
    .selectAll("line")
    .data(vectors)
    .enter()
    .append("line")
    .attr("x1", d => xScale(d.x))
    .attr("y1", d => yScale(d.y))
    .attr("x2", d => xScale(d.x + d.dx))
    .attr("y2", d => yScale(d.y + d.dy))
    .attr("stroke", d => d.color || "black")
    .attr("stroke-width", 2)
        .attr("marker-end", (d, i) => `url(#arrow-${i}-${rand_vec[i]})`);

if (angle_vec != null) {

  // Use vector components, fix inverted y-axis
  let a1 = Math.atan2(angle_vec[0].dy, angle_vec[0].dx);
  let a2 = Math.atan2(angle_vec[1].dy, angle_vec[1].dx);

  // ensure smallest arc
  if (a2 < a1) [a1, a2] = [a2, a1];
  if (a2 - a1 > Math.PI) {
    [a1, a2] = [a2, a1 + 2 * Math.PI];
  }

    console.log(a1)
  const arc = d3.arc()
    .innerRadius(38)
    .outerRadius(40)
    .startAngle(a1-0.14)
    .endAngle(a2-0.14);

  // draw arc at vector origin
  tg.append("path")
    .attr(
      "transform",
      `translate(${xScale(angle_vec[0].x)},${yScale(angle_vec[0].y)})`
    )
    .attr("d", arc)
    .attr("fill", "rgba(0,0,0,1)");

    tg.append("text")
        .attr("x", 105)
        .attr("y", 170)
        .text("\u03B8°");
    tg.append("text")
        .attr("x", 125)
        .attr("y", 130)
        .text("cos(\u03B8)=0.08")

}
}

function heatmap(container, data, options = {}) {
    const {
        width = 500,
        height = 500,
        rowLabels = [],
        colLabels = [],
        margin = { top: 50, right: 50, bottom: 50, left: 50 },
        colorScheme = d3.interpolateBlues,
        colorMin=0,
        colorMax=100,
        title="NA",
        x_title="NA",
        y_title="NA",
        annotate = true,
        rotate_y = true,
        title_style = "normal",
        annot_cut = 0.35,
        abs_cut = false
    } = options;

    const nRows = data.length;
    const nCols = data[0].length;

    const x = d3.scaleBand()
        .domain(d3.range(nCols))
        .range([0, width])
        .padding(0.05);

    const y = d3.scaleBand()
        .domain(d3.range(nRows))
        .range([0, height])
        .padding(0.05);

    const color = d3.scaleSequential()
        .interpolator(colorScheme)
        .domain([colorMin, colorMax]);

    const cells = container.selectAll("rect")
        .data(data.flatMap((row, i) => row.map((value, j) => ({ row: i, col: j, value }))))
        .enter()
        .append("rect")
        .attr("x", d => x(d.col))
        .attr("y", d => y(d.row))
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .attr("fill", d => color(d.value));

    const rowText = container.selectAll("text.row")
          .data(rowLabels)
          .enter()
          .append("text")
          .attr("x", (d, i) => x(i) + x.bandwidth()/2)
          .attr("y", height+20)
          .attr("text-anchor", "middle")
          .attr("alignment-baseline", "middle")
          .attr("fill", "black")
          .style("font-size", "16px")
          .text(d => d);
    if (rotate_y) {
     const colText = container.selectAll("text.col")
          .data(colLabels)
          .enter()
          .append("text")
          .attr("x", -15)
          .attr("y", (d, i) => y(i) + y.bandwidth() / 2 - 5)
          .attr("transform", (d, i) =>
              `rotate(270, -15, ${y(i) + y.bandwidth() / 2 - 5})`
          )
          .attr("text-anchor", "end")
          .attr("dominant-baseline", "middle")
          .attr("fill", "black")
          .style("font-size", "16px")
          .text(d => d);
    } else {
             const colText = container.selectAll("text.col")
          .data(colLabels)
          .enter()
          .append("text")
          .attr("x", -15)
          .attr("y", (d, i) => y(i) + y.bandwidth() / 2)
          .attr("text-anchor", "end")
          .attr("dominant-baseline", "middle")
          .attr("fill", "black")
          .style("font-size", "16px")
          .text(d => d);
    }

    const titleText = container.append("text")
          .attr("x", width/2)
          .attr("y", -10)
          .attr("text-anchor", "middle")
          .attr("alignment-baseline", "middle")
          .text(title)
          .style("font-size", "18px")
          .style("font-weight", title_style);

    const xAxisText = container.append("text")
          .attr("x", width/2)
          .attr("y", height+50)
          .attr("text-anchor", "middle")
          .attr("alignment-baseline", "middle")
          .text(x_title);

    const yAxisText = container.append("text")
    .attr("x", -50)
    .attr("y", height / 2)
    .attr("transform", `rotate(270, -50, ${height / 2})`)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .text(y_title);

    if (annotate) {
        container.selectAll("text.annot")
          .data(data.flatMap((row, i) => row.map((value, j) => ({ row: i, col: j, value }))))
          .enter()
          .append("text")
          .attr("x", d => x(d.col) + x.bandwidth()/2)
          .attr("y", d => y(d.row) + y.bandwidth()/2 + 5)
          .attr("text-anchor", "middle")
          .attr("alignment-baseline", "middle")
            .attr("fill", function(d) {
                if(abs_cut == true) {
                    return(Math.abs(d.value) < annot_cut ? "black": "white");
                } else {
                    return(d.value < annot_cut ? "black": "white");
                }
            })
            .text(d => (d.value).toFixed(2));
    }
}

const hc_c = 0.6;
const enc_A_e = [[ 0.9959, -0.0906],
                 [-0.0442,  0.9990],
                 [-0.2210,  0.9753],
                 [0.9878, -0.1558]]
const enc_B_e = [[0.9928,  0.1201]]
const EVA = svg.append("g")
      .attr("class", "enc")
      .attr("transform", `translate(90, 75)`);
const EVB = svg.append("g")
      .attr("class", "enc")
      .attr("transform", `translate(250, 75)`);
const EV = svg.append("g")
      .attr("class", "encv")
      .attr("transform", `translate(390, -20)`);
const enc_CV = [{x: 0, y: 0, dx: 0.99, dy: -0.09, color: "#1f77b4", name: "A"},
                {x: 0, y: 0, dx: -0.04, dy: 0.99, color: "#1f77b4", name: "B"},
                {x: 0, y: 0, dx: -0.22, dy: 0.98, color: "#1f77b4", name: "C"},
                {x: 0, y: 0, dx: 0.99, dy: -0.16, color: "#1f77b4", name: "D"},
                {x: 0, y: 0, dx: 0.99, dy: 0.12, color: "#d62728", name: "E"}];
const angle_vec = [{x: 0, y: 0, dx: -0.04, dy: 0.99, color: "#1f77b4", name: "B"},
                   {x: 0, y: 0, dx: 0.99, dy: 0.12, color: "#d62728", name: "E"}];
heatmap(EVA, enc_A_e, { width: 100, height: 100, colorMin:-hc_c, colorMax:hc_c,
                        rowLabels: ["0", "1"],
                        title: "Metagenomic",
                        y_title: "Modules",
                        x_title: "",
                        colLabels: ["A", "B", "C", "D"],
                        annot_cut: 0});
heatmap(EVB, enc_B_e, { width: 100, height: 25, colorMin:-hc_c, colorMax:hc_c,
                        rowLabels: ["0", "1"],
                        title: "Blood Serum",
                        y_title: "",
                        x_title: "",
                        colLabels: ["E"],
                        colorScheme: d3.interpolateReds,
                        annot_cut: 0});
plotVectors(EV, enc_CV, 300, 300, -0.25, -0.25, 1, 1, 40, angle_vec);

const attn_a_e = [[0.3663], [0.1487], [0.1244], [0.3606]];
const attn_w_a = [[0.6869, 0.1805]];
const enc_CVW = [{x: 0, y: 0, dx: 0.99, dy: -0.09, color: "#1f77b4", name: "A"},
                 {x: 0, y: 0, dx: -0.04, dy: 0.99, color: "#1f77b4", name: "B"},
                 {x: 0, y: 0, dx: -0.22, dy: 0.98, color: "#1f77b4", name: "C"},
                 {x: 0, y: 0, dx: 0.99, dy: -0.16, color: "#1f77b4", name: "D"},
                 {x: 0, y: 0, dx: 0.99, dy: 0.12, color: "#d62728", name: "E"},
                 {x: 0, y: 0, dx: 0.6869, dy: 0.1805, color: "#9467bd", name: "F"}];
const AHA = svga.append("g")
    .attr("class", "att")
    .attr("transform", `translate(30, 70)`);
const EHA = svga.append("g")
    .attr("class", "enc")
    .attr("transform", `translate(180, 70)`);
const AWA = svga.append("g")
    .attr("class", "att")
    .attr("transform", `translate(350, 105)`);
const WV = svga.append("g")
      .attr("class", "encv")
      .attr("transform", `translate(470, -20)`);
heatmap(AHA, attn_a_e, { width: 100, height: 100, colorMin:0, colorMax:0.4,
                        rowLabels: ["E"],
                        title: "A",
                        colorScheme: d3.interpolateGreys,
                        y_title: "Modules",
                        x_title: "",
                         colLabels: ["A", "B", "C", "D"],
                         title_style: "bold"});
heatmap(EHA, enc_A_e, { width: 100, height: 100, colorMin:-hc_c, colorMax:hc_c,
                        rowLabels: ["0", "1"],
                        title: "M(x)",
                        y_title: "",
                        x_title: "",
                        colLabels: ["A", "B", "C", "D"],
                        title_style: "bold"});
heatmap(AWA, attn_w_a, { width: 100, height: 25, colorMin:-hc_c, colorMax:hc_c,
                         rowLabels: ["0", "1"],
                        title: "T",
                        colorScheme: d3.interpolatePurples,
                        y_title: "",
                        x_title: "",
                         colLabels: ["F"],
                         title_style: "bold",
                        annot_cut: 0});
plotVectors(WV, enc_CVW, 275, 275, -0.25, -0.25, 1, 1, 40);

const i_V = [{x: 0, y: 0, dx: 2.506, dy: -0.405, color: "#000000", name: ""},
             {x: 0, y: 0, dx: 0.99, dy: -0.16, color: "#1f77b4", name: ""},
             {x: 0, y: 0, dx: 2.65, dy: 0.5, color: "#2ca02c", name: ""}];
const j_V = [{x: 0, y: 0, dx: -0.1778, dy: 0.0287, color: "#000000", name: ""},
             {x: 0, y: 0, dx: 0.99, dy: -0.16, color: "#1f77b4", name: ""},
             {x: 0, y: 0, dx: -0.32, dy: -0.86, color: "#2ca02c", name: ""}];
const k_V = [{x: 0, y: 0, dx: 0.99, dy: -0.16, color: "#1f77b4", name: ""},
             {x: 0, y: 0, dx: -0.4322, dy: 0.4694, color: "#2ca02c", name: ""},
             {x: 0, y: 0, dx: -0.4936, dy: 0.0798, color: "#000000", name: ""}];
const EVI = svgi.append("g")
      .attr("class", "vi")
      .attr("transform", `translate(20, 20)`);
const EVJ = svgi.append("g")
      .attr("class", "vi")
      .attr("transform", `translate(250, 20)`);
const EVK = svgi.append("g")
      .attr("class", "vi")
      .attr("transform", `translate(500, 20)`);
plotVectors(EVI, i_V, 200, 200, -1, -1, 3, 3, 0);
plotVectors(EVJ, j_V, 200, 200, -1, -1, 1, 1, 0);
plotVectors(EVK, k_V, 200, 200, -1, -1, 1, 1, 0);
EVI.append("line")
    .attr("x1", 182)
    .attr("y1", 125)
    .attr("x2", 174)
    .attr("y2", 169)
    .attr("stroke", "gray")
    .attr("stroke-width", 2)
    .style("stroke-dasharray", ("3, 3"));
EVJ.append("line")
    .attr("x1", 84)
    .attr("y1", 97)
    .attr("x2", 68)
    .attr("y2", 187)
    .attr("stroke", "gray")
    .attr("stroke-width", 2)
    .style("stroke-dasharray", ("3, 3"));
EVK.append("line")
    .attr("x1", 51)
    .attr("y1", 93)
    .attr("x2", 58)
    .attr("y2", 53)
    .attr("stroke", "gray")
    .attr("stroke-width", 2)
    .style("stroke-dasharray", ("3, 3"));
EVI.append("text")
    .attr("x", 180)
    .attr("y", 200)
    .attr("transform", `rotate(10, 250,200)`)
    .attr("text-anchor", "end")
   .attr("dominant-baseline", "middle")
    .attr("fill", "black")
    .style("font-size", "16px")
    .text("I(i, D)=2.53");
EVI.append("text")
    .attr("x", 172)
    .attr("y", 112)
    .attr("text-anchor", "end")
    .attr("dominant-baseline", "middle")
    .attr("fill", "#2ca02c")
    .style("font-size", "18px")
    .text("i");
EVI.append("text")
    .attr("x", 85)
    .attr("y", 170)
    .attr("text-anchor", "end")
    .attr("dominant-baseline", "middle")
    .attr("fill", "#1f77b4")
    .style("font-size", "18px")
    .text("D");
EVJ.append("text")
    .attr("x", 100)
    .attr("y", 115)
    .attr("transform", `rotate(10, 250,200)`)
    .attr("text-anchor", "end")
   .attr("dominant-baseline", "middle")
    .attr("fill", "black")
    .style("font-size", "16px")
    .text("I(j, D)=−0.18");
EVJ.append("text")
    .attr("x", 90)
    .attr("y", 180)
    .attr("text-anchor", "end")
    .attr("dominant-baseline", "middle")
    .attr("fill", "#2ca02c")
    .style("font-size", "18px")
    .text("j");
EVJ.append("text")
    .attr("x", 190)
    .attr("y", 130)
    .attr("text-anchor", "end")
    .attr("dominant-baseline", "middle")
    .attr("fill", "#1f77b4")
    .style("font-size", "18px")
    .text("D");
EVK.append("text")
    .attr("x", 90)
    .attr("y", 160)
    .attr("transform", `rotate(10, 250,200)`)
    .attr("text-anchor", "end")
   .attr("dominant-baseline", "middle")
    .attr("fill", "black")
    .style("font-size", "16px")
    .text("I(k, D)=−0.5");
EVK.append("text")
    .attr("x", 70)
    .attr("y", 45)
    .attr("text-anchor", "end")
    .attr("dominant-baseline", "middle")
    .attr("fill", "#2ca02c")
    .style("font-size", "18px")
    .text("k");
EVK.append("text")
    .attr("x", 190)
    .attr("y", 130)
    .attr("text-anchor", "end")
    .attr("dominant-baseline", "middle")
    .attr("fill", "#1f77b4")
    .style("font-size", "18px")
    .text("D");

const ECHA = svge.append("g")
      .attr("class", "enc")
      .attr("transform", `translate(70, 70)`);
const ECHB = svge.append("g")
      .attr("class", "enc")
      .attr("transform", `translate(220, 70)`);
const ECV = svg.append("g")
      .attr("class", "encv")
      .attr("transform", `translate(200, -20)`);
const enc_C_a = [[0.94, -0.04],
                 [-0.13, 0.68],
                 [-0.26, 0.63],
                 [0.88, 0.1]];
const enc_C_b = [[0.85, -0.5],
                 [-0.13, 0.07],
                 [0.59, -0.15],
                 [-0.4, 0.15]];
heatmap(ECHA, enc_C_a, { width: 100, height: 100, colorMin:-hc_c, colorMax:hc_c,
                        rowLabels: ["0", "1"],
                        title: "Metagenomic",
                        y_title: "Modules",
                        x_title: "",
                         colLabels: ["A", "B", "C", "D"],
                       annot_cut: 0.2});
heatmap(ECHB, enc_C_b, { width: 100, height: 100, colorMin:-hc_c, colorMax:hc_c,
                        rowLabels: ["0", "1"],
                        title: "Blood Serum",
                        y_title: "",
                        x_title: "",
                        colLabels: ["E", "F", "G", "H"],
                         colorScheme: d3.interpolateReds,
                        annot_cut: 0.2});
const ECDHA = svge.append("g")
      .attr("class", "enc")
      .attr("transform", `translate(440, 70)`);
const ECDHB = svge.append("g")
      .attr("class", "enc")
      .attr("transform", `translate(590, 70)`);
const ECDV = svge.append("g")
      .attr("class", "encv")
      .attr("transform", "translate(500, 75)");
const enc_CD_a = [[0.59, -0.52],
                 [-0.77, 0.28],
                 [-0.77, 0.23],
                 [0.78, -0.41]];
const enc_CD_b = [[0.74, -0.65],
                 [0.81, -0.18],
                 [-0.62, 0.34],
                 [0.55, -0.14]];
heatmap(ECDHA, enc_CD_a, { width: 100, height: 100, colorMin:-hc_c, colorMax:hc_c,
                        rowLabels: ["0", "1"],
                        title: "Metagenomic",
                        y_title: "Modules",
                        x_title: "",
                           colLabels: ["A", "B", "C", "D"],
                         annot_cut: 0.2});
heatmap(ECDHB, enc_CD_b, { width: 100, height: 100, colorMin:-hc_c, colorMax:hc_c,
                        rowLabels: ["0", "1"],
                        title: "Blood Serum",
                        y_title: "",
                        x_title: "",
                        colLabels: ["E", "F", "G", "H"],
                           colorScheme: d3.interpolateReds,
                         annot_cut: 0.2});
//plotVectors(ECDV, enc_CD_av, 250, 250, 0.9, 0.9);
svge.append("text")
    .attr("x", 190)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .attr("fill", "black")
    .style("font-size", "22px")
    .text("Control");
svge.append("text")
    .attr("x", 560)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .attr("fill", "black")
    .style("font-size", "22px")
    .text("T2D");
svge.append("line")
    .attr("x1", 360)
    .attr("y1", 5)
    .attr("x2", 360)
    .attr("y2", 650)
    .attr("stroke", "gray")
    .attr("stroke-opacity", 0.5)
    .attr("stroke-width", 1);
svge.append("line")
    .attr("x1", 150)
    .attr("y1", 25)
    .attr("x2", 233)
    .attr("y2", 25)
    .attr("stroke", "black")
    .attr("stroke-width", 1);
svge.append("line")
    .attr("x1", 537)
    .attr("y1", 25)
    .attr("x2", 584)
    .attr("y2", 25)
    .attr("stroke", "black")
    .attr("stroke-width", 1);

const ACDH = svge.append("g")
               .attr("class", "att")
               .attr("transform", d => `translate(90, 240)`);
d3.csv("/data/p1_attention_matrix_Control.csv", d3.autoType).then(data => {
    const matrix = data.map(row => Object.values(row));
    heatmap(ACDH, matrix, { width: 200, height: 200, colorMin:0, colorMax:0.4,
                            colorScheme: d3.interpolateGreys,
                            colLabels: ["A", "B", "C", "D"],
                            title: "Attention Matrix",
                            y_title: "Metagenomic Modules",
                            x_title: "Blood Serum Modules",
                            rowLabels: ["E", "F", "G", "H"],
                          annot_cut: 0.2});
});
const ACH = svge.append("g")
               .attr("class", "att")
               .attr("transform", d => `translate(460, 240)`);
d3.csv("/data/p1_attention_matrix_CD.csv", d3.autoType).then(data => {
    const matrix = data.map(row => Object.values(row));
    heatmap(ACH, matrix, { width: 200, height: 200, colorMin:0,
                           colorMax:0.4, colLabels: ["A", "B", "C", "D"],
                           colorScheme: d3.interpolateGreys,
                           title: "Attention Matrix",
                           y_title: "Metagenomic Modules",
                           x_title: "Blood Serum Modules",
                           rowLabels: ["E", "F", "G", "H"],
                         annot_cut: 0.2});
});

const ECH = svgib.append("g")
               .attr("class", "att")
               .attr("transform", d => `translate(170, 70)`);
d3.csv("/data/p1_impBS_Control.csv", d3.autoType).then(data => {
    const matrix = data.map(row => Object.values(row));
    heatmap(ECH, matrix, { width: 200, height: 70, colorMin:-0.35,
                           colorMax:0.35, colLabels: ["Glucose", "Glutamine", "Lactic Acid"],
                           colorScheme: d3.interpolateRdBu,
                           title: "Importance",
                           y_title: "",
                           x_title: "Blood Serum Modules",
                           rowLabels: ["E", "F", "G", "H"],
                           rotate_y: false});
});
const ECDH = svgib.append("g")
               .attr("class", "att")
               .attr("transform", d => `translate(440, 70)`);
d3.csv("/data/p1_impBS_CD.csv", d3.autoType).then(data => {
    const matrix = data.map(row => Object.values(row));
    heatmap(ECDH, matrix, { width: 200, height: 70, colorMin:-0.8,
                           colorMax:0.8, colLabels: [],
                           colorScheme: d3.interpolateRdBu,
                           title: "Importance",
                           y_title: "",
                           x_title: "Blood Serum Modules",
                           rowLabels: ["E", "F", "G", "H"],
                           rotate_y: false});
});
svgib.append("text")
    .attr("x", 270)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .attr("fill", "black")
    .style("font-size", "22px")
    .text("Control");
svgib.append("text")
    .attr("x", 540)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .attr("fill", "black")
    .style("font-size", "22px")
    .text("T2D");
svgib.append("line")
    .attr("x1", 230)
    .attr("y1", 25)
    .attr("x2", 315)
    .attr("y2", 25)
    .attr("stroke", "black")
    .attr("stroke-width", 1);
svgib.append("line")
    .attr("x1", 517)
    .attr("y1", 25)
    .attr("x2", 565)
    .attr("y2", 25)
    .attr("stroke", "black")
    .attr("stroke-width", 1);

const ECHM = svgib.append("g")
               .attr("class", "att")
      .attr("transform", d => `translate(170, 230)`);
d3.csv("/data/p1_impM_Control.csv", d3.autoType).then(data => {
    const matrix = data.map(row => Object.values(row));
    heatmap(ECHM, matrix, { width: 200, height: 620, colorMin:-2.5,
                           colorMax:2.5, colLabels: ['Akkermansia', 'Alistipes', 'Bacteroides', 'Bifidobacterium',
       'Bilophila', 'Butyrivibrio', 'Clostridium', 'Collinsella',
       'Coprococcus', 'Dorea', 'Escherichia', 'Eubacterium',
       'Faecalibacterium', 'Haemophilus', 'Holdemania', 'Odoribacter',
       'Parabacteroides', 'Parasutterella', 'Prevotella',
       'Pseudoflavonifractor', 'Roseburia', 'Ruminococcaceae', 'Ruminococcus',
       'Streptococcus', 'Veillonella', '_Clostridium_', '_Ruminococcus_',
       'unclassified'],
                           colorScheme: d3.interpolateRdBu,
                           title: "",
                           y_title: "",
                           x_title: "Metagenomic Modules",
                           rowLabels: ["A", "B", "C", "D"],
                            annot_cut: 1.4,
                            rotate_y: false,
                          abs_cut: true});
});
const ECDHM = svgib.append("g")
               .attr("class", "att")
               .attr("transform", d => `translate(440, 230)`);
d3.csv("/data/p1_impM_CD.csv", d3.autoType).then(data => {
    const matrix = data.map(row => Object.values(row));
    heatmap(ECDHM, matrix, { width: 200, height: 620, colorMin:-2.5,
                           colorMax:2.5, colLabels: [],
                           colorScheme: d3.interpolateRdBu,
                           title: "",
                           y_title: "",
                           x_title: "Metagenomic Modules",
                           rowLabels: ["A", "B", "C", "D"],
                             annot_cut: 1.4,
                             rotate_y: false,
                             abs_cut: true});
});
