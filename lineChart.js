function renderChart(containerSelector, width, height, months, data) {
    var circosHeatmap = new Circos({
        container: containerSelector,
        width: width,
        height: height
    });

    circosHeatmap.layout(
        months, 
        {
            innerRadius: width / 2 - 80,
            outerRadius: width / 2 - 30,
            ticks: { display: false },
            cornerRadius: 4,
            gap: 0.02,
            labels: {
                position: 'center',
                display: true,
                size: 14,
                color: '#fff',
                radialOffset: 20
            }
        }
    );

    var svg = d3.select(containerSelector + ' svg');
    var defs = svg.append('defs');
    var radiusStep = (1 - 0.5) / data.years.length;

    for (var i = 0; i < data.years.length; i++) {
        var dataEntry = data.years[i];

        var segmentGroups = data.years[i].segments.reduce(function(prev, curr) {
            prev[curr.block_id] = prev[curr.block_id] || [];
            prev[curr.block_id].push(curr);
            return prev;
        }, {});

        for (var id in segmentGroups) {
            var segments = segmentGroups[id];
            var gradientUrl = appendGradient(defs, 'gradient' + id + dataEntry.year, segments, data.minValue, data.maxValue, true);

            circosHeatmap.line('line' + segments[0].block_id + dataEntry.year, segments, {
                min: data.minValue,
                max: data.maxValue,
                outerRadius: 1 - (i * radiusStep) - 0.02,
                innerRadius: 1 - ((i + 1) * radiusStep),
                logScale: true,
                color: gradientUrl,
                fill: true,
                fillColor: gradientUrl,
                backgrounds: [
                    {
                      start: 0,
                      color: gradientUrl,
                      opacity: 0.3
                    }
                  ]
            });
        }

        circosHeatmap.heatmap('heatmapYear' + dataEntry.year, dataEntry.segments, {
            min: data.minValue,
            max: data.maxValue,
            outerRadius: 1 - (i * radiusStep) - 0.02,
            innerRadius: 1 - ((i + 1) * radiusStep),
            color: '#fff',
            tooltipContent: function(d, i) {
                var periodStartStr = formatDate(d.startDate);
                var periodEndStr = formatDate(d.endDate);
                var totalCases = formatNumber(d.totalCases);
                var numDiagnosed = formatNumber(d.numDiagnosed);

                return '<h5>' + periodStartStr + ' - ' + periodEndStr + '</h5>'
                     + '<h6>Total Cases: <i>' + totalCases + '</i></h6>'
                     + '<h6>Diagnosed: <i>' + numDiagnosed + ' (' + d.value + '%)</i></h6>';
            }
        });
    }

    circosHeatmap.render();
}

function appendGradient(defs, id, segments, minValue, maxValue, scale) {
    var startValue = segments[0].value;
    var endValue = segments[segments.length - 1].value;
    if (scale) {
        startValue = d3.scaleLog(Math.E)(startValue);
        endValue = d3.scaleLog(Math.E)(endValue);
        maxValue = d3.scaleLog(Math.E)(maxValue);
        minValue = d3.scaleLog(Math.E)(minValue);
    }

    var startColor = getColor(startValue, minValue, maxValue);
    var endColor = getColor(endValue, minValue, maxValue);

    var gradient = defs.append('linearGradient')
        .attr('id', id)
        .attr('x1', '0%')
        .attr('y1', '41%')
        .attr('x2', '100%')
        .attr('y2', '59%');

    gradient.append('stop')
        .attr('class', 'start')
        .attr('offset', '0%')
        .attr('stop-color', startColor);

    gradient.append('stop')
        .attr('class', 'end')
        .attr('offset', '100%')
        .attr('stop-color', endColor);

    return 'url(#' + id + ')';
}

function getColor(value, minValue, maxValue) {
    var pct = 1 - ((value - minValue) * 100) / (maxValue - minValue) / 100;
    return d3.interpolateSpectral(pct);
}

function formatDate(date) {
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}