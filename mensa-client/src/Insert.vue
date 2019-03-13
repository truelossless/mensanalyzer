<template>
  <div id="insert">
        <h4>Repas de {{ formattedDate }}</h4>
        <p>Contenu du repas</p>
        <div v-for="(food, index) in foods" :key="food.id">
            <span class="autocomplete">
                <input :style="redOutlines(food)" @input="complete = index" v-model="food.name" class="entry" type="text" />
                <div v-if="complete == index" class="autocomplete-items">
                    <div @click="food.name = data.name" class="autocomplete-item" v-for="data in filteredApiFood(food)" :key="data.id">{{ data.name }}</div>
                </div>
            </span>
            <button v-if="index !== 0" class="delete" @click="foods.splice(index, 1)">Supprimer</button>
            <button v-if="index === foods.length -1" class="button-primary add" @click="addFood()">Ajouter</button>
        </div>
        <button @click="sendMeal()" class="button-primary submit">{{ validateMeal }}</button>
        <h4 id="new">Ajouter un nouvel ingrédient</h4>
        <input v-model="newEntry.name" class="entry" type="text" />
        <input v-model="newEntry.price" class="price" type="number" min="0" max="10" step="0.1" />€
        <select id="category" v-model="newEntry.type">
            <option value="légumes">légumes</option>
            <option value="féculents">féculents</option>
            <option value="poisson">poisson</option>
            <option value="viande">viande</option>
        </select>
        <div></div><button @click="registerFood()" class="button-primary submit">{{ validateNewFood }}</button>
  
        
    </div>
</template>
<script>
import axios from 'axios';

export default {
    name: 'InsertPage',
    data () {
        return {
            days: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'],
            foodId: 1,
            foods: [{id: 0, name: '', error: false, foodId: 0}],
            apiFood: [],
            newEntry: {name: '', price: 0, type: 'légumes'},
            complete: -1,
            validateMeal: 'Envoyer le repas',
            validateNewFood: 'Enregistrer le nouvel ingrédient'

        }
    },
    created () {
        this.getApiFood();
    },
    computed: {
        formattedDate() {
            let day;
            let zone;
            let date = new Date();
            if(date.getDay() === 0 || date.getDay() === 6) {
                day = this.days[4];
            } else {
                day = this.days[date.getDay()-1];
            }

            if(date.getHours() > 18 || date.getHours() < 11) {
                zone = 'soir'
            } else {
                zone = 'midi'
            }

            return day + ' ' + zone;
        }
    },
    mounted() {
        document.addEventListener('click', this.onClick);
    },
    beforeDestroy() {
        document.removeEventListener('click', this.onClick);
    },
    methods: {
        addFood() {
            this.foods.push({id: this.foodId, name: ''});
            this.foodId ++;
        },
        onClick() {
            this.complete = -1;
        },
        filteredApiFood(food) {
            let res = [];
            this.apiFood.forEach((el) => {
                console.log(el.name);
                if(el.name.indexOf(food.name) !== -1) {
                    res.push(el);
                }
            });
            // don't show more than 3 elements
            return res.slice(0, 3);
        },
        redOutlines(food) {
            if(this.filteredApiFood(food).length === 0 && food.name !== '') {
                return {'border-color': '#ff0000'}
            } else {
                return '';
            }
        },
        sendMeal() {

            for(let i = 0; i < this.foods.length; i++) {
                let error = true;
                for(let j=0; j< this.apiFood.length; j++) {
                    if(this.foods[i].name === this.apiFood[j].name) {
                        error = false;
                        this.foods[i].foodId = this.apiFood[j].id;
                        break;
                    }
                }
                if(error) return;
            }

            this.validateMeal = 'Envoi en cours ...';

            axios.post('/api/menu/submit', {
                foods: this.foods,
                date: Math.floor(Date.now() / 1000)
            }).then((res) => {
                this.validateMeal = 'Repas envoyé !'
            });
        },
        registerFood() {
            if(this.newEntry.name === '' || this.newEntry.price === 0) return;
            this.validateNewFood = 'Envoi en cours ...';
            axios.post('/api/food/register', {
                name: this.newEntry.name,
                price: this.newEntry.price,
                type: this.newEntry.type
            }).then((res) => {
                this.validateNewFood = 'Nouvel ingrédient enregistré !';
                this.getApiFood();
            });
        },
        getApiFood() {
            axios.get('/api/food/all').then((res) => {
                this.apiFood = res.data;
            }).catch((err) => {
                alert('Error: could not query the server');
            });
        }
    }
}
</script>
<style scoped>
    #insert {
        margin-top: 100px;
    }

    input {
        width: 300px;
    }

    .autocomplete {
        position: relative;
        width: 300px;
        height: 38px;
    }

    .autocomplete-items {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        z-index: 2;
    }

    .autocomplete-item {
        margin-top: -1px;
        padding: 5px;
        background: #fff;
        height: 25px;
        border: 1px solid #ccc;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }

    .autocomplete-item:hover {
        background-color: #eee;
    }

    .price {
        width: 60px;
        margin-left: 8px;
        margin-right: 8px;
    }

    .add {
        margin-left: 10px;
    }

    .delete {
        margin-left: 8px;
    }
    
    h4#new {
        margin-top: 100px;
    }

    #category {
        margin-left: 20px;
    }

    .submit {
        margin-top: 10px;
    }

</style>

