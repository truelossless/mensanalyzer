<template>
  <div id="charts">
      <div id="chart-container">
      <p>Prix moyen du plat principal</p>
      <canvas id="chart1"></canvas>
      <p>Aliments principaux pour un repas</p>
      <canvas id="chart2"></canvas>
      <p>Aliments les plus courants</p>
      <canvas id="chart3"></canvas>
    </div>
    <h1 class="stats"><span>Statistiques sur</span> {{ meals }} <span>repas</span></h1>
  </div>
</template>
<script>
import Chart from 'chart.js';
import axios from 'axios';

export default {
  name: 'ChartPage',
  data () {
    return {
      meals: 0
    }
  },
  mounted() {

    axios.get('/api/menu/all').then((res) => {
      this.meals = res.data.length;

    // clone the array
    let priceData = JSON.parse(JSON.stringify(res.data));

      // transform all dates to a format understandable by chart.jss
      priceData.forEach((el) => {
        el.x = new Date(el.date * 1000);
      });
      
      Chart.defaults.global.defaultFontFamily = 'Raleway';

      new Chart('chart1', {
        type: 'line',
        data: {
          datasets: [{
            label: "Prix estimé du plat principal (en €)",
            data: priceData,
            borderColor: 'rgba(96, 145, 245, 0.5)',
            backgroundColor: 'rgba(100, 200, 255, 0.2)',
            borderWidth: 1
          }]
        },
        options: {
          tooltips: {
            callbacks: {
              label: function(tooltipItem, data) {
                return tooltipItem.yLabel + '€';
              },
              title: function(tooltipItem, data) {
                let i = tooltipItem[0].index;
                let date = new Date(data.datasets[0].data[i].date * 1000);
                
                let day = ("0" + date.getDate()).slice(-2);
                let month = ("0" + (date.getMonth() + 1)).slice(-2);
                let year = date.getFullYear().toString().slice(-2);
                let zone = date.getHours() === 12 ? 'midi' : 'soir';

                return day + '/' + month + '/' + year + ', repas du ' + zone;
              }
            }
          },
          legend: {
            display: false
          },
          scales: {
            xAxes: [{
                type: 'time',
                time: {
                    isoWeekday: true,
                    minUnit: 'day',
                    displayFormats: {
                        hour: 'H[h]',
                        day: 'DD[/]MM',
                        month: 'MMM',
                        year: 'Y'
                    }
                },
            }],
            yAxes: [{
              ticks: {
                beginAtZero:true,
                callback: function(value, index, values) {
                  return value + '€';
                }
              }
            }]
          }
        }
      });

      let typeData = JSON.parse(JSON.stringify(res.data));
      let typeLabels = ['légumes', 'féculents', 'poisson', 'viande'];
      let typeDataset = [0, 0, 0, 0];

      typeData.forEach((el) => {
        el.types = el.types.split(',');
        el.types.forEach((type) => {
          for(let i=0; i<typeLabels.length; i++) {
            if(typeLabels[i] === type) {
              typeDataset[i]++;
            }
          }
        });
      });

      new Chart('chart2', {
        type: 'pie',
        data: {
          labels: typeLabels,
          datasets: [{
            data: typeDataset,
            backgroundColor: [
              'rgba(69, 255, 86, 0.2)',
              'rgba(225, 167, 0, 0.2)',
              'rgba(100, 200, 255, 0.2)',
              'rgba(255, 45, 0, 0.2)',
            ],
            borderColor: '#ccc',
            borderWidth: 1
          }]
        },
        options: {
          tooltips: {
            callbacks: {
              // used to display values in percentages
              // as per usual, thx stack overflow
              label: function(tooltipItem, data) {
                var dataset = data.datasets[tooltipItem.datasetIndex];
                var meta = dataset._meta[Object.keys(dataset._meta)[0]];
                var total = meta.total;
                var currentValue = dataset.data[tooltipItem.index];
                var percentage = parseFloat((currentValue/total*100).toFixed(1));
                return currentValue + ' (' + percentage + '%)';
              },
              title: function(tooltipItem, data) {
                return data.labels[tooltipItem[0].index];
              }
            }
          },
          legend: {
            position: 'bottom'
          }
        }
      });

      let foodData = JSON.parse(JSON.stringify(res.data));
      let foodLabels = [];
      let foodTypes = [];
      let foodDataset = [];

      foodData.forEach((el) => {
        el.foods = el.foods.split(',');
        el.types = el.types.split(',');
        el.foods.forEach((food, index) => {
          let found = false;
          for(let i=0; i<foodLabels.length; i++) {
            if(foodLabels[i] === food) {
              foodDataset[i]++;
              found = true;
              break;
            }
          }

          if(!found) {
            foodLabels.push(food);
            switch(el.types[index]) {
              case 'légumes':
                foodTypes.push('rgba(69, 255, 86, 0.2)');
                break;
              case 'féculents':
                foodTypes.push('rgba(225, 167, 0, 0.2)');
                break;
              case 'poisson':
                foodTypes.push('rgba(100, 200, 255, 0.2)');
                break;
              case 'viande':
                foodTypes.push('rgba(255, 45, 0, 0.2)');
                break;
              default:
                foodTypes.push('rgba(100, 100, 100, 0.2)');
            }
            foodDataset.push(1);
          }
        });
      });

      // sort the shit outta this
      let foodMap = foodLabels.map((el, i) => {
        return {
          label: el,
          data: foodDataset[i],
          type: foodTypes[i]
        }
      });

      let sortedFoodMap = foodMap.sort((a, b) => {
        // desc sort
        return b - a;
      });

      foodLabels = [];
      foodTypes = [];
      foodDataset = [];

      sortedFoodMap.forEach((el) => {
        foodLabels.push(el.label);
        foodTypes.push(el.type);
        foodDataset.push(el.data);
      });

      new Chart('chart3', {
        type: 'bar',
        data: {
          labels: foodLabels,
          datasets: [{
            data: foodDataset,
            backgroundColor: foodTypes,
            borderColor: '#ccc',
            borderWidth: 1
          }]
        },
        options: {
          legend: {
            display: false
          },
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true,
                callback: function(value, index, values) {
                  if (Math.floor(value) === value) {
                  return value;
                }
              }
              }
            }]
          }
        }
      });
    });
  }
}
</script>
<style scoped>
    #chart-container {
    margin: 100px auto 50px auto;
    text-align: center;
  }

  canvas {
    margin-bottom: 150px;
  }

  .stats span {
    font-size: initial;
  }

  .stats {
    text-align: center;
  }
</style>
