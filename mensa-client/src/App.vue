<template>
  <div id="app">
    <div class="container">
      <header>
        <h2>Mensanalyzer</h2>
        <p>Un diable de programme pour analyser les repas *variés* de notre self adoré</p>
        <button class="button-primary" v-html="btnText" @click="btnClicked"></button>
      </header>
      <transition name="component-slide" mode="out-in">
        <component :is="currentPage"></component>
      </transition>
      <div id="credits">
        <hr>
        <p>Créé par <a href="https://github.com/truelossless/">Esteban Gressard</a></p>
        <p>Code disponible sous licence MIT sur <a href="https://github.com/truelossless/mensanalyzer/">Github</a></p>
        <p>Propulsé fièrement par  <a href="https://nodejs.org/en/">Node.js</a>, <a href="https://vuejs.org/">Vue</a>, <a href="https://www.chartjs.org/">Chart.js</a>, <a href="http://getskeleton.com/">Skeleton</a></p>
      </div>
    </div>
  </div>
</template>

<script>
import ChartPage from '@/Chart.vue';
import InsertPage from '@/Insert.vue';

export default {
  name: 'app',
  data () {
    return {
      currentPage: 'ChartPage',
      btnText: 'Ajouter un repas &nbsp;→'
    }
  },
  components: {
    ChartPage,
    InsertPage
  },
  methods: {
    btnClicked() {
      if(this.currentPage == 'ChartPage') {
        this.btnText = '← &nbsp;Revenir aux graphes';
        this.currentPage = 'InsertPage';
      } else {
        this.btnText = 'Ajouter un repas &nbsp;→';
        this.currentPage = 'ChartPage';

      }
    }
  }
}
</script>

<style>
  .component-slide-enter-active, .component-slide-leave-active {
    transition: all 0.7s ease;
  }
  .component-slide-enter, .component-slide-leave-to {
    transform: translateX(2000px);
    opacity: 0;
  }

  header {
    text-align: center;
  }

  header h2 {
    padding-top: 20px;
  }

  header h5 {
    margin: 30px;
  }

  #credits {
    margin-top: 100px;
    margin-bottom: 10px;
  }

  #credits hr {
    margin-bottom: 20px;
  }

  #credits p {
    margin-bottom: 0;
  }
  
</style>
