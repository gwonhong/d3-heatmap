import * as d3 from "https://cdn.skypack.dev/d3@7";
import { rectbin } from "./rectbin.js";

const margin = { top: 10, right: 30, bottom: 30, left: 40 },
    width = 800,
    height = 400;

let funcX = d => d[0],
    funcY = d => d[1],
    funcZ = d => d[2];

let heatmap = function () {
    let splitX = 100,
        splitY = 100,
        x = funcX,
        y = funcY,
        z = funcZ;

    function heatmap(data) {
        // create svg element
        const svg = d3.create("svg")
            .attr("viewBox", [0, 0, width, height]);

        let xExtent = d3.extent(data, x),
            yExtent = d3.extent(data, y),
            zExtent = d3.extent(data, z);

        let dx = Math.round((xExtent[1]-xExtent[0])/splitX),
            dy = Math.round((yExtent[1]-yExtent[0])/splitY);

        let xScale = d3.scaleLinear()
            .nice()
            .domain(xExtent)
            .range([margin.left, width - margin.right]);

        let yScale = d3.scaleLinear()
            .nice()
            .domain(yExtent)
            .range([height - margin.bottom, margin.top]);

        let color = d3.scaleSequential(d3.interpolateViridis)
            .domain(zExtent);

        let xAxis = g => g
            .attr("transform", `translate(0, ${height - margin.bottom})`)
            .call(d3.axisBottom(xScale));

        let yAxis = g => g
            .attr("transform", `translate(${margin.left}, 0)`)
            .call(d3.axisLeft(yScale));

        let rectbinData = rectbin()
            .x(x)
            .y(y)
            .z(z)
            .dx(dx)
            .dy(dy)
            (data);

        // size of sqaures
        let widthInPx = xScale(xExtent[0] + dx) - margin.left,
            heightInPx = yScale(yExtent[1] - dy) - margin.top;

        svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        svg.append("g")
            .call(xAxis);

        svg.append("g")
            .call(yAxis);

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
            .attr("x", d => xScale(d.x))
            .attr("y", d => (yScale(d.y) - heightInPx))
            .attr("width", widthInPx)
            .attr("height", heightInPx)
            .attr("fill", d => { return d.length === 0 ? "transparent" : color(d.zMax) }) //make visible only when there is an element
            .attr("stroke", "transparent")
            .attr("stroke-width", "0.4");

        return svg.node();
    };

    heatmap.splitX = function (_) {
        if (!arguments.length) return splitX;
        splitX = _;
        return heatmap;
    };

    heatmap.splitY = function (_) {
        if (!arguments.length) return splitY;
        splitY = _;
        return heatmap;
    };

    heatmap.x = function (_) {
        if (!arguments.length) return x;
        x = _;
        return heatmap;
    };

    heatmap.y = function (_) {
        if (!arguments.length) return y;
        y = _;
        return heatmap;
    };

    heatmap.z = function (_) {
        if (!arguments.length) return z;
        z = _;
        return heatmap;
    };

    return heatmap;
};

export { heatmap };