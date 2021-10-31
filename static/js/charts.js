function init() {
    var selector = d3.select('#selDataset');

    d3.json('samples.json').then((data) => {
        
        var sampleNames = data.names;

        sampleNames.forEach((sample) => {
            selector
                .append('option')
                .text(sample)
                .property('value', sample);
        });

        buildMetadata(sampleNames[0]);
        buildCharts(sampleNames[0]);
    })

};

init();

function optionChanged(newSample) {
    buildMetadata(newSample);
    buildCharts(newSample);
}

function buildMetadata(sample) {
    d3.json('samples.json').then((data) => {
        let metadata = data.metadata;
        let resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
        let result = resultArray[0];
        let PANEL = d3.select('#sample-metadata');

        PANEL.html('');
        Object.entries(result).forEach(entry => {
            PANEL.append('h6').text(`${entry[0].toUpperCase()}: ${entry[1]}`);
        })
    })
}


function buildCharts(sample) {
    
    let resultDict = [];

    d3.json('samples.json').then((data) => {
        let samples = data.samples;
        let resultArray = samples.filter(sampleObj => sampleObj.id == sample);
        let result = resultArray[0];

        
        let xAll = result.sample_values;
        let yAll = result.otu_ids.map(a => `OTU ${a.toString()}`);
        let textAll = result.otu_labels;

        for (let i=0; i<xAll.length; i++){
            resultDict.push({
                'sample_value': xAll[i], 
                'otu_id': yAll[i], 
                'otu_label': textAll[i]
            })
        }

        sortedResult = resultDict.sort((a, b) => b.sample_value - a.sample_value);
        slicedResult = sortedResult.slice(0, 10);
        reversedResult = slicedResult.reverse();

        let x = [];
        let y = [];
        let text = [];

        for (i=0; i<reversedResult.length; i++) {
            x.push(reversedResult[i].sample_value);
            y.push(reversedResult[i].otu_id);
            text.push(reversedResult[i].otu_label);
        }
        
        // plot bar graph
        let traceBar = {
            x: x,
            y: y,
            text: text,
            type: 'bar',
            orientation: 'h'
        };

        let dataBar = [traceBar];

        let layoutBar = {
            title: 'Top 10 Bacteria Cultures Found'
        }

        Plotly.newPlot('bar', dataBar, layoutBar);

        // plot gauge graph
        let traceGauge =   {
            domain: { x: [0, 1], y: [0, 1] },
            value: data.metadata.filter(sampleObj => sampleObj.id == sample)[0].wfreq,
            title: { text: 'Belly Button Washing Frequency'.bold() + '<br>' + 'Scrubs per Week'},
            type: "indicator",
            mode: "gauge+number",
            gauge: {
                bar: {color: 'black'},
                axis: {
                    range: [null, 10],
                    tickvals: [0, 2, 4, 6, 8, 10]
                },
                steps: [
                    { range: [0, 2], color: "red" },
                    { range: [2, 4], color: "orange" },
                    { range: [4, 6], color: "yellow" },
                    { range: [6, 8], color: "lightgreen" },
                    { range: [8, 10], color: "green" }
                ],
            }
        }

        let dataGauge = [traceGauge];

        Plotly.newPlot('gauge', dataGauge);
        

        // plot bubble graph
        let traceBubble = {
            x: result.otu_ids,
            y: xAll,
            mode: 'markers',
            text: textAll,
            marker: {
                size: xAll,
                color: result.otu_ids,
                colorscale: result.otu_ids
            }
        }

        let dataBubble = [traceBubble];

        let layoutBubble = {
            title: 'Bateria Cultures Per Sample',
            xaxis: {title:'OTU ID'}
        }

        Plotly.newPlot('bubble', dataBubble, layoutBubble);
    })
}