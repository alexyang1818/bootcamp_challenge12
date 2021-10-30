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
        
        let trace = {
            x: x,
            y: y,
            text: text,
            type: 'bar',
            orientation: 'h'
        };

        let barData = [trace];

        let layout = {
            title: 'Top 10 Bacteria Cultures Found'
        }

        Plotly.newPlot('bar', barData, layout);
    })
}