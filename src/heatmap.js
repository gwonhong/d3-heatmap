import * as d3 from "https://cdn.skypack.dev/d3@7";
import { rectbin } from "./rectbin.js";

// set the dimensions and margins of the graph
const margin = { top: 10, right: 30, bottom: 30, left: 40 },
    width = 660 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

function drawHeatmap(svg, data, stepX, stepY) {
    svg.attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            `translate(${margin.left},${margin.top})`);

    let funcX = d => d.trainable_parameters,
        funcY = d => d.training_time,
        funcZ = d => d.test_accuracy;

    let xExtent = d3.extent(data, funcX),
        yExtent = d3.extent(data, funcY),
        zExtent = d3.extent(data, funcZ);

    //X axis
    let x = d3.scaleLinear()
        .nice()
        .domain(xExtent)
        .range([0, width]);

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

    //Y axis
    let y = d3.scaleLinear()
        .nice()
        .domain(yExtent)
        .range([height, 0]);

    svg.append("g")
        .call(d3.axisLeft(y));

    // Compute the rectbin
    let rectbinData = rectbin()
        .x(funcX)
        .y(funcY)
        .z(funcZ)
        .dx(stepX)
        .dy(stepY)
        (data);

    // Prepare a color palette
    let color = d3.scaleSequential(d3.interpolateViridis)
        .domain(zExtent); // find maximum amount of the rect.

    // What is the width of a square in px?
    let widthInPx = x(xExtent[0] + stepX);

    // What is the height of a square in px?
    let heightInPx = y(yExtent[1] - stepY);

    // Now we can add the squares
    svg.append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height)
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
}

export { drawHeatmap };