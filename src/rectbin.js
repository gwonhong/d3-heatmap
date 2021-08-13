import * as d3 from "https://cdn.skypack.dev/d3@7";

let funcX = d => d[0],
    funcY = d => d[1],
    funcZ = d => d[2];

let rectbin = function () {
    let dx = 0.1,
        dy = 0.1,
        x = funcX,
        y = funcY,
        z = funcZ;

    function rectbin(points) {
        let binsById = {};

        let xExtent = d3.extent(points, x);
        let yExtent = d3.extent(points, y);

        let xRange = d3.range(xExtent[0], xExtent[1] + dx, dx);
        let yRange = d3.range(yExtent[0], yExtent[1] + dy, dy);

        //generate rectbins
        //order of yRange and xRange matters as it changes the x-y axis
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
        points.forEach(point => {
            let pi = Math.floor(x.call(rectbin, point) / dx);
            let pj = Math.floor(y.call(rectbin, point) / dy);
            let zCur = z.call(rectbin, point);

            let id = pi + '-' + pj;
            binsById[id].push(point);
            if (zCur > binsById[id].zMax)
                binsById[id].zMax = zCur;
        });
        return Object.values(binsById);
    };

    rectbin.dx = function (_) {
        if (!arguments.length) return dx;
        dx = _;
        return rectbin;
    };

    rectbin.dy = function (_) {
        if (!arguments.length) return dy;
        dy = _;
        return rectbin;
    };

    rectbin.x = function (_) {
        if (!arguments.length) return x;
        x = _;
        return rectbin;
    };

    rectbin.y = function (_) {
        if (!arguments.length) return y;
        y = _;
        return rectbin;
    };

    rectbin.z = function (_) {
        if (!arguments.length) return z;
        z = _;
        return rectbin;
    };

    return rectbin;
};

export { rectbin };