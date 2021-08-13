import * as d3 from "https://cdn.skypack.dev/d3@7";
import { rectbin } from "./rectbin.js";

const margin = { top: 10, right: 30, bottom: 30, left: 40 },
    width = 800,
    height = 400;

function heatmap(data, stepX, stepY) {
    let funcX = d => d.trainable_parameters,
        funcY = d => d.training_time,
        funcZ = d => d.test_accuracy;

    let xExtent = d3.extent(data, funcX),
        yExtent = d3.extent(data, funcY),
        zExtent = d3.extent(data, funcZ);

    // create svg element
    const svg = d3.create("svg")
        .attr("viewBox", [0, 0, width, height]);

    // make space for axis
    svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    let x = d3.scaleLinear()
        .nice()
        .domain(xExtent)
        .range([margin.left, width - margin.right]);

    let y = d3.scaleLinear()
        .nice()
        .domain(yExtent)
        .range([height - margin.bottom, margin.top]);

    let color = d3.scaleSequential(d3.interpolateViridis)
        .domain(zExtent);

    let xAxis = g => g
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(x));

    let yAxis = g => g
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(y));

    svg.append("g")
        .call(xAxis);

    svg.append("g")
        .call(yAxis);

    let rectbinData = rectbin()
        .x(funcX)
        .y(funcY)
        .z(funcZ)
        .dx(stepX)
        .dy(stepY)
        (data);

    // size of sqaures
    let widthInPx = x(xExtent[0] + stepX) - margin.left,
        heightInPx = y(yExtent[1] - stepY) - margin.top;

    svg.append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height);

    svg.append("g")
        .attr("clip-path", "url(#clip)")
        .selectAll("myRect")
        .data(rectbinData)
        .enter().append("rect")
        .attr("x", d => x(d.x))
        .attr("y", d => (y(d.y) - heightInPx))
        .attr("width", widthInPx)
        .attr("height", heightInPx)
        .attr("fill", d => { return d.length === 0 ? "transparent" : color(d.zMax) }) //make visible only when there is an element
        .attr("stroke", "transparent")
        .attr("stroke-width", "0.4");

    return svg.node();
}

export { heatmap };