function buildMetadata(samples) {

    // @TODO: Complete the following function that builds the metadata panel
    // Use d3 to select the panel with id of `#sample-metadata`
     var metadata = d3.select("#sample-metadata")
    // Use `d3.json` to fetch the metadata for a sample
      // var url ="/metadata/<sample>"
      d3.json(`/metadata/${samples}`).then(successHandle).catch(errorHandle)
      function successHandle(result){
        var metadata = d3.select("#sample-metadata")
        console.log(`the result is`,result)
        // Use `.html("") to clear any existing metadata
        metadata.html("")
        for( var key in result){
          metadata.append("h6").text(key + ":" + result[key])
        }
      }
      function errorHandle(error){
        console.log(`error is :`,error)
      }    
      // BONUS: Build the Gauge Chart
      // buildGauge(data.WFREQ);
  }  

function buildCharts(samples){
    d3.json(`/samples/${samples}`).then((data) => {
        console.log(data);
        
        const otu_ids = data.otu_ids;
        const sample_values = data.sample_values;
        const otu_labels = data.otu_labels;

        console.log(otu_ids)
        console.log(sample_values)
        console.log(otu_labels)

        // bubble chart
    var bubblelayout = {
        margin: {t: 0},
        hovermode: "closest",
        xaxis: {title : "OTUID"}
    };
     var bubbleData = [
         {
             x: otu_ids,
             y: sample_values,
             text: otu_labels,
             mode: "markers",
             marker : {
                 size: sample_values,
                 color : otu_ids,
                 colorscale : "Earth"
             }

         }
     ]; 
     
     Plotly.plot("bubble",bubbleData, bubblelayout);
    
      var pieData = [
          {
              values: sample_values.slice(0,10),
            //   labels : otu_labels.slice(0,10),
              hovertext: otu_labels.slice(0,10),
              hoverinfo: "hovertext",
              type: "pie",
              showlegend:false
          }
      ]
      var pielayout = {
          margin: {
              t: 0,
              l: 0
          },
          height:500,
          width: 500

      }

      Plotly.plot("pie",pieData, pielayout);

    });
}

function updatePie(newData) {
    var PIE = document.getElementById('pie');
    Plotly.restyle(PIE, 'labels', [newData[0].otu_id.slice(0, 9)]);
    Plotly.restyle(PIE, 'values', [newData[0].value.slice(0, 9)]);
  }
  
  function updateBubble(newData) {
    var BUBBLE = document.getElementById('bubble');
    Plotly.restyle(BUBBLE, 'x', [newData[0].otu_id]);
    Plotly.restyle(BUBBLE, 'y', [newData[0].value]);
    // im not sure if this is actually updating the size...
    Plotly.restyle(BUBBLE, 'marker{size}', [newData[0].value]);
  
  }
  
  function updateMeta(path) {
    var $AGE = document.getElementById("AGE");
    var $BBTYPE = document.getElementById("BBTYPE");
    var $ETHNICITY = document.getElementById("ETHNICITY");
    var $GENDER = document.getElementById("GENDER");
    var $LOCATION = document.getElementById("LOCATION");
    var $SAMPLEID = document.getElementById("SAMPLEID");
  
    Plotly.d3.json(`/metadata/${path}`, function(error, data) {
      console.log("meta", data);
      $AGE.innerHTML = data[0].AGE
      $BBTYPE.innerHTML = data[0].BBTYPE
      $ETHNICITY.innerHTML = data[0].ETHNICITY
      $GENDER.innerHTML = data[0].GENDER
      $LOCATION.innerHTML = data[0].LOCATION
      $SAMPLEID.innerHTML = data[0].SAMPLEID
    });
  }

function getOptions() {
    // Grab a reference to the dropdown select element
    var selDataset = document.getElementById('selDataset');
    // Use the list of sample names to populate the select options
    Plotly.d3.json('/names', function(error, sampleNames) {
        for (var i = 0; i < sampleNames.length;  i++) {
            var currentOption = document.createElement('option');
            currentOption.text = sampleNames[i];
            currentOption.value = sampleNames[i]
            selDataset.appendChild(currentOption);
        }
    })
}

function init() {
    getOptions();
}

function optionChanged(sample){
    console.log("changing option to ", sample)
    buildCharts(sample)
}
// Initialize the dashboard
init();
buildCharts(940);