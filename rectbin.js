(function () {

    let rectbinX = d => d[0],
        rectbinY = d => d[1],
        rectbinZ = d => d[2];

    d3.rectbin = function () {
        let dx = 0.1,
            dy = 0.1,
            x = rectbinX,
            y = rectbinY,
            z = rectbinZ;

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

        function rectbin(points) {
            let binsById = {};
            let xExtent = d3.extent(points, (d, i) => x.call(rectbin, d, i));
            let yExtent = d3.extent(points, (d, i) => y.call(rectbin, d, i));

            let id = 0;
            d3.range(yExtent[0], yExtent[1] + dy, dy).forEach(Y => {
                d3.range(xExtent[0], xExtent[1] + dx, dx).forEach(X => {
                    let pj = trunc(Y / dy);
                    let pi = trunc(X / dx);
                    let id = pi + '-' + pj;
                    let bin = binsById[id] = [];
                    bin.i = pi;
                    bin.j = pj;
                    bin.x = pi * dx;
                    bin.y = pj * dy;
                });
            });
            points.forEach((point, i) => {
                let py = y.call(rectbin, point, i) / dy;
                let pj = trunc(py);
                let px = x.call(rectbin, point, i) / dx;
                let pi = trunc(px);

                let id = pi + '-' + pj;
                let bin = binsById[id];
                bin.push(point);
            });
            // let values = [];
            // for (let key in binsById) values.push(values[key]);
            // return values;
            return d3.values(binsById);
        }

        return rectbin;
    };

})();

function trunc(x) {
    return x < 0 ? Math.ceil(x) : Math.floor(x);
}