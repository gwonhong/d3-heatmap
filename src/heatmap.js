import * as d3 from "https://cdn.skypack.dev/d3@7";

const margin = { top: 30, right: 60, bottom: 30, left: 60 },
    width = 700,
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
        const graph = d3.create("svg")
            .attr("viewBox", [0, 0, width, height]);

        let xExtent = [0, d3.max(data, x)],
            yExtent = [0, d3.max(data, y)];

        let xScale = d3.scaleLinear()
            .domain(xExtent)
            .range([margin.left, width - margin.right])
            .nice();

        xExtent = xScale.domain();

        let yScale = d3.scaleLinear()
            .domain(yExtent)
            .range([height - margin.bottom, margin.top])
            .nice();

        yExtent = yScale.domain();

        let dx = xExtent[1] / splitX,
            dy = yExtent[1] / splitY;

        let xAxis = g => g
            .attr("transform", `translate(0, ${height - margin.bottom})`)
            .call(d3.axisBottom(xScale));

        let yAxis = g => g
            .attr("transform", `translate(${margin.left}, 0)`)
            .call(d3.axisLeft(yScale));

        // generate rectbin
        let binsById = {};
        let xRange = d3.range(xExtent[0], xExtent[1] + dx, dx),
            yRange = d3.range(yExtent[0], yExtent[1] + dy, dy);
        yRange.forEach(Y => {
            xRange.forEach(X => {
                let pi = Math.floor(X / dx);
                let pj = Math.floor(Y / dy);

                let bin = [];
                bin.i = pi;
                bin.j = pj;
                bin.x = pi * dx;
                bin.y = pj * dy;
                bin.zMax = 0;

                let id = pi + '-' + pj;
                binsById[id] = bin;
            });
        });

        //push each points to the bins
        data.forEach(point => {
            let pi = Math.floor(x(point) / dx);
            let pj = Math.floor(y(point) / dy);
            let zCur = z(point);

            let id = pi + '-' + pj;
            binsById[id].push(point);
            if (zCur > binsById[id].zMax) {
                binsById[id].zMax = zCur;
                binsById[id].hash = point.unique_hash; //hash of max point for each bins
            }
        });

        let rectbinData = Object.values(binsById);

        let zExtent = d3.extent(rectbinData.map(d => d.zMax).filter(d => d !== 0));
        let color = d3.scaleSequential(d3.interpolateViridis)
            .domain(zExtent);

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
            .style("padding", "5px")
            .style("font-size", "10px");

        // Three function that change the tooltip when user hover / move / leave a cell
        const mouseover = function (event, d) {
            tooltip.style("opacity", 1);
        };
        const mousemove = function (event, d) {
            tooltip
                .html("bin.i: " + d.i + " bin.x: " + d.x + "<br>bin.j: " + d.j + " bin.y: " + d.y)
                .style("top", (event.y) + "px")
                .style("left", (event.x + 10) + "px");
        };
        const mouseleave = function (event, d) {
            tooltip.style("opacity", 0);
        };
        const click = function (event, d) {
            console.log("unique hash: " + d.hash);
        }

        graph.append("g")
            .call(xAxis);

        graph.append("g")
            .call(yAxis);

        graph.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        graph.append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width - margin.right)
            .attr("height", height - margin.bottom);

        graph.append("g")
            .attr("clip-path", "url(#clip)")
            .selectAll()
            .data(rectbinData)
            .enter()
            .append("rect")
            .attr("x", d => xScale(d.x))
            .attr("y", d => yScale(d.y))
            .attr("width", widthInPx)
            .attr("height", heightInPx)
            .attr("fill", d => { return d.length === 0 ? "transparent" : color(d.zMax) }) //make visible only when there is an element
            .attr("stroke", "grey")
            .attr("stroke-width", "0.2")
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
            .on("click", click);

        return [graph.node(), tooltip.node()];
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