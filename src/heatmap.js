import * as d3 from "https://cdn.skypack.dev/d3@7";
import { rectbin } from "./rectbin.js";

const margin = { top: 20, right: 40, bottom: 30, left: 60 },
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

        let dx = ((xExtent[1] - xExtent[0]) / splitX),
            dy = ((yExtent[1] - yExtent[0]) / splitY);

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

        // size of squares
        let widthInPx = xScale(xExtent[0] + dx) - margin.left,
            heightInPx = yScale(yExtent[1] - dy) - margin.top;

        // create a tooltip
        const tooltip = d3.create("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "fixed")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px");

        // Three function that change the tooltip when user hover / move / leave a cell
        const mouseover = function (event, d) {
            tooltip.style("opacity", 1)
        }
        const mousemove = function (event, d) {
            tooltip
                .html("The largest z value among this cell is: " + d.zMax)
                .style("top", (event.y) + "px")
                .style("left", (event.x + 10) + "px");
        }
        const mouseleave = function (event, d) {
            tooltip.style("opacity", 0)
        }

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
            .selectAll()
            .data(rectbinData)
            .enter()
            .append("rect")
            .attr("x", d => xScale(d.x))
            .attr("y", d => (yScale(d.y) - heightInPx))
            .attr("width", widthInPx)
            .attr("height", heightInPx)
            .attr("fill", d => { return d.length === 0 ? "transparent" : color(d.zMax) }) //make visible only when there is an element
            .attr("stroke", "black")
            .attr("stroke-width", "0.2")
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave);

        return [svg.node(), tooltip.node()];
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