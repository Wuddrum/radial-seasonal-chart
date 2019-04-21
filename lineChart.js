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

        var previousColor = undefined;
        for (var id in segmentGroups) {
            var segments = segmentGroups[id];
            var averageValue = segments.reduce(function(sum, entry) { return sum + entry.value || 0 }, null) / segments.length;
            var color = getColor(averageValue, data.minValue, data.maxValue);
            var gradientUrl = appendGradient(defs, previousColor, color, 'gradient' + id + dataEntry.year);
            previousColor = color;

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
                      opacity: 0.2
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

function appendGradient(defs, previousColor, currentColor, id) {
    if (previousColor === undefined) {
        previousColor = currentColor;
    }

    var gradient = defs.append('linearGradient')
        .attr('id', id)
        .attr('x1', '0%')
        .attr('x2', '100%')
        .attr('y1', '0%')
        .attr('x2', '100%');

    gradient.append('stop')
        .attr('class', 'start')
        .attr('offset', '0%')
        .attr('stop-color', previousColor)
        .attr('stop-opacity', 1);

    gradient.append('stop')
        .attr('class', 'end')
        .attr('offset', '100%')
        .attr('stop-color', currentColor)
        .attr('stop-opacity', 1);

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