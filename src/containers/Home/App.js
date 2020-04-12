import React, { createRef } from 'react';
import '../../styles/App.css';
import { Container, Divider } from 'semantic-ui-react';
import { Header, Icon } from 'semantic-ui-react';
import { SideNav } from '../../components/SideNav';
import { AddMicroButton } from '../../components/AddMicroButton';
import { uBitDisconnect } from '../../utils/microbit-api';
import MicrobitGraph from '../../components/MicrobitGraph';
import StickyStatistics from '../../components/StickyStatistics';
import Chart from 'react-apexcharts';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // mirco connections
      devices: {},
      isRunning: false,
      microbitsConnected: 0,
      graphs: [],
      seconds: 0,      
    };

    this.microbitCallBack = this.microbitCallBack.bind(this);
  }

  microbitCallBack(type, device, data) {
    if (type === 'connected') {
      let devices = this.state.devices;
      devices[device.serialNumber] = device;
      this.setState({ devices: devices });
      this.createGraph(device);
    }

    let graphs = this.state.graphs;
    let seriesData = data;

    if (
      graphs[device.serialNumber] !== undefined &&
      graphs[device.serialNumber] !== null &&
      graphs[device.serialNumber].series !== undefined &&
      graphs[device.serialNumber].series !== null &&
      seriesData !== null &&
      seriesData !== undefined &&
      seriesData.data !== undefined &&
      seriesData.data !== undefined
    ) {
      let specificGraph = graphs[device.serialNumber];
      let series = graphs[device.serialNumber].series[0];
      series.data.push(seriesData.data.toString());
      let updatedGraph = [...graphs];
      updatedGraph[device.serialNumber] = {
        ...updatedGraph[device.serialNumber],
        deviceSerial: specificGraph.deviceSerial,
        title: specificGraph.title,
        isRunning: specificGraph.isRunning,
        timeElapsed: specificGraph.timeElapsed,
        series: [series],
        options: specificGraph.options,
        seriesLine: specificGraph.seriesLine,
        optionsLine: specificGraph.optionsLine,
      };
      this.setState({
        graphs: updatedGraph,
      });
    }
  }

  disconnectDevice(device) {
    uBitDisconnect(device);
    let devices = this.state.devices;
    let graphs = this.state.graphs;
    delete devices[device.serialNumber];
    delete graphs[device.serialNumber];
    this.setState({
      graphs: graphs,
      devices: devices,
      microbitsConnected: this.state.microbitsConnected - 1,
    });
  }

  createGraph(device) {
    if (this.state.graphs[device.serialNumber] === undefined) {
      let graphs = this.state.graphs;
      graphs[device.serialNumber] = {
        deviceSerial: device.serialNumber,
        title: 'Micro:bit Graph ' + device.vendorId,
        isRunning: false,
        timeElapsed: 0,
        series: [
          {
            data: [],
          },
        ],
        options: {
          chart: {
            id: 'chart2',
            type: 'line',
            height: 230,
            toolbar: {
              autoSelected: 'pan',
              show: false,
            },
          },
          colors: ['#546E7A'],
          stroke: {
            width: 3,
          },
          dataLabels: {
            enabled: false,
          },
          fill: {
            opacity: 1,
          },
          markers: {
            size: 0,
          },
          xaxis: {
            type: 'date',
            categories: [],
          },
        },

        seriesLine: [
          {
            data: [],
          },
        ],
        optionsLine: {
          chart: {
            id: 'chart1',
            height: 130,
            type: 'area',
            brush: {
              target: 'chart2',
              enabled: true,
            },
            selection: {
              enabled: true,
            },
          },
          colors: ['#008FFB'],
          fill: {
            type: 'gradient',
            gradient: {
              opacityFrom: 0.91,
              opacityTo: 0.1,
            },
          },
          xaxis: {
            type: 'date',
            tooltip: {
              enabled: false,
            },
          },
          yaxis: {
            tickAmount: 2,
          },
        },
      };
      this.setState({
        graphs: graphs,
        microbitsConnected: this.state.microbitsConnected + 1,
      });
    }
  }

  contextRef = createRef();

  render() {
    var arr = [2, 5, 6, 3, 8, 9];

    var csvData = arr.map(function(val, index) {
      return { key: index, value: val * val };
    });

    const graphs = this.state.graphs;

    return (
      <div>
        <Header as="h2" icon inverted textAlign="center">
          <Icon name="line graph" />
          Micro: bit USB Grapher
          <Header.Subheader>
            Collect and graph data on one or more Micro: bits!
          </Header.Subheader>
        </Header>
        <Divider />
        <StickyStatistics
          microbitsConnected={this.state.microbitsConnected}
          timeElapsed={this.state.timeElapsed}
        />
        <Container>
          <AddMicroButton onAddComplete={this.microbitCallBack} />
          {graphs &&
            Object.keys(graphs).map((key, index) => {
              return (
                <div>
                  <MicrobitGraph
                    device={this.state.devices[key]}
                    title={graphs[key].title}
                    csvData={csvData}
                    options={graphs[key].options}
                    series={graphs[key].series}
                    optionsLine={graphs[key].optionsLine}
                    seriesLine={graphs[key].seriesLine}
                    height={graphs[key].height}
                    areaHeight={graphs[key].areaHeight}
                    isRunning={graphs[key].isRunning}
                    playOnClick={() => {
                      graphs[key].isRunning = false ? false : true;
                      this.setState({
                        graphs: graphs,
                      });
                    }}
                    disconnectDevice={this.disconnectDevice.bind(this)}
                  />
                </div>
              );
            })}
        </Container>
      </div>
    );
  }
}

export default App;