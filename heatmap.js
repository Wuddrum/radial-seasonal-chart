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

    var radiusStep = (0.98 - 0.5) / data.years.length;
    for (var i = 0; i < data.years.length; i++) {
        var dataEntry = data.years[i];
        circosHeatmap.heatmap('heatmapYear' + dataEntry.year, dataEntry.segments, {
            min: data.minValue,
            max: data.maxValue,
            outerRadius: 0.98 - (i * radiusStep),
            innerRadius: 0.98 - ((i + 1) * radiusStep),
            logScale: true,
            color: '-Spectral',
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

function formatDate(date) {
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}