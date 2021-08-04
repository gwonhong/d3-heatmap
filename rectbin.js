let rectbinX = d => d[0],
    rectbinY = d => d[1],
    rectbinZ = d => d[2];

export default function () {
    let dx = 0.1,
        dy = 0.1,
        x = rectbinX,
        y = rectbinY,
        z = rectbinZ;

    function rectbin(points) {
        let binsById = {};

        let xExtent = d3.extent(points, (d, i) => x.call(rectbin, d, i));
        let yExtent = d3.extent(points, (d, i) => y.call(rectbin, d, i));

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
        points.forEach((point, i) => {
            let pi = Math.floor(x.call(rectbin, point, i) / dx);
            let pj = Math.floor(y.call(rectbin, point, i) / dy);
            let zCur = z.call(rectbin, point, i);

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
        return rectbin; //chaining을 위한 return
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