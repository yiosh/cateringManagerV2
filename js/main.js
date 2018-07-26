/*Avvio*/
// $(document).ready(function() {
	
// 	/*PRELOAD CONTENT */
// 	$("#preloader").fadeOut(100);
// 	$("#container").fadeIn(400); 
// });

var eventBus = new Vue();

// MAIN COMPONENT
Vue.component('content-container', {
	data() {
		return {
			currency: '€',
			show: false,
			selectedInstance: '',
			instances: [
				{
					id: '91488f20-8751-4dfd-8a58-0ca6187ca690',
					name: 'Food',
					type: 'One-Level',
					icon: '',
					show: false,
					total: 0
				},
				{
					id: 'b4b1cebb-4e15-4d19-99cb-945af47a5986',
					name: 'Beverage',
					type: 'One-Level',
					icon: '',
					show: false,
					total: 0
				},
				{
					id: '7d8d2889-deaf-45fc-8800-be0395a11b67',
					name: 'Stewarding',
					type: 'Two-Level',
					icon: '',
					total: 0,
					show: true,
					categories: []
				},
				{
					id: '9b3c9421-4ab6-4c4e-91d7-aae8d83f72b9',
					name: 'Staff',
					type: 'One-Level',
					icon: '',
					show: false,
					total: 0
				},
				{
					id: 'b3efc29c-76cf-4d23-b712-6696186592b0',
					name: 'Vehicles',
					type: 'One-Level',
					icon: '',
					show: false,
					total: 0
				}
			]
		}
	},
	template: `
		<div class="app container">
			<instance v-for="instance in instances" v-show="instance.show" :instance="instance" :currency="currency" :key="instance.id"></instance>

			<div class="instance-picker">
				<div v-for="instance in instances" class="button" :key="instance.id" @click="showInstance(instance)">{{ instance.name }}</div>
			</div>
		</div>
	`,
	methods: {
		updateData(type, newitem) {
			this.instances.forEach(instance => {
				if (instance.type === "Two-Level") {
					instance.categories.forEach(category => {
						category.total = 0;
						let subCategoryTotal = 0;
						category.subcatsList.forEach(subCategory => {
							subCategory.total = 0;
							let itemTotal = 0;
							subCategory.items.forEach(item => {
								if (type === '-' && item.id === newitem.id) {
									item.quantity = 0;
								}
								itemTotal += item.price * item.quantity;
							});
							subCategory.total = itemTotal;
							subCategoryTotal += subCategory.total
						});
						category.total = subCategoryTotal;
					});
				}
			});
		},
		showInstance(clickedInstance) {
			this.instances.forEach(instance => {
				if (instance.id === clickedInstance.id) {
					instance.show = true;
				} else {
					instance.show = false;
				}
			})
		},
		fetchCategories(endpoint) {

			axios.get('https://stile.condivision.cloud/fl_api/v2.0/?get_stewarding&token=1')
			.then(response => {
				// handle success
				this.instances[2].categories = response.data.dati;
				console.log(response);
			})
			.catch(error => {
				// handle error
				console.log(error);
			})
			.then(function () {
				// always executed
			});
		}
	},
	mounted() {
		this.fetchCategories();
		eventBus.$on('item-update', newitem => {
			this.instances.forEach(instance => {
				if (instance.type === "Two-Level") {
					instance.categories.forEach(category => {
						category.subcatsList.forEach(subCategory => {
							subCategory.items.forEach(item => {
								
								if (item.id === newitem.id) {
									item.show = true;
									item.quantity = newitem.quantity;
									this.updateData('+', newitem);
								}
							});
						});
					});
				}
			});
    });

		eventBus.$on('remove-item', newitem => {
			this.instances.forEach(instance => {
				if (instance.type === "Two-Level") {
					instance.categories.forEach(category => {
						category.subcatsList.forEach(subCategory => {
							subCategory.items.forEach(item => {
								if (item.id === newitem.id) {
									item.show = false;
									item.quantity = newitem.quantity;
									this.updateData('-', newitem);
								}
							});
						});
					});
				}
			});
		});
  }	
});

// INSTANCE COMPONENT
Vue.component('instance', {
	props:['instance', 'currency'],
	template: `
		<div class="card instance">
			<header class="card-header has-background-brown">
				<h2 class="card-header-title has-text-white is-uppercase">
					{{ instance.name }}
				</h2>
				<p class="card-header-title is-block has-text-white has-text-right is-uppercase">
					Total: {{ instance.total }} {{ currency }}
				</p>
			</header>
			<div class="card-content">
				<div class="category-picker tabs">
					<ul>
						<li v-for="category in instance.categories" :class="{'is-active':currentCategory.cat_name === category.cat_name}" @click="selectedCategory(category)"><a>{{ category.cat_name }}</a></li>
					</ul>
				</div>
				<category v-for="category in instance.categories" v-show="currentCategory.cat_name === category.cat_name" :currency="currency" :category="category" :key="currentCategory.id"></category>
			</div>
		</div>
	`,
	data() {
		return {
			currentCategory: ''
		}
	},
	computed: {
		instanceTotal() {
			let total = 0;
			if (this.instance.categories) {
				this.instance.categories.forEach(category => {
					total += category.total;
				});
				return total;
			}
			return this.instance.total;
		}
	},
	methods: {
		selectedCategory(category) {
			if (this.currentCategory.id !== category.cat_id) {	
				this.currentCategory = category;
			}

		}
	},
	updated() {
		if (this.currentCategory === '') {	
			this.currentCategory = this.instance.categories[0];
		}
	}
});

// CATEGORY COMPONENT
Vue.component('category', {
	props: ['category', 'currency'],
	template: `
		<div class="content">
			<sub-category v-for="subCategory in category.subcatsList" :subCategory="subCategory" :currency="currency" :key="subCategory.subcat_id"></sub-category>
		</div>
	`,
	data() {
		return {
			
		}
	},
	computed: {

	}
});

// SUB-CATEGORY COMPONENT
Vue.component('sub-category', {
	props: ['subCategory', 'currency'],
	template: `
		<article class="card category">
			<header class="card-header">
				<div class="add-category has-text-success" @click="showModal = !showModal">
					<i class="fas fa-plus-circle"></i>
				</div>
				<div class="card-header-title" @click="showCategory">
					<p class="">
						{{ subCategory.subcat_name }}
					</p>
					<p class="">
						Sub-total: {{ subCategory.total=0 }} {{ currency }}
					</p>
				</div>
			</header>
			<transition name="fade">
				<div class="card-content" v-show="show">
					<div class="content">
						<table class="table is-responsive">
							<tr>
								<th>Item</th>
								<th>Quantity</th>
								<th>Price</th>
								<th>Option</th>
								<th>Total</th>
								<th></th>
							</tr>
							<tr v-show="selecteditems.length == 0">
								<td>There are no items added</td>
								<td></td>
								<td></td>
								<td></td>
								<td></td>
								<td></td>
							</tr>
							<tr v-show="selecteditems.length > 0" is="item" v-for="item in selecteditems" :item="item" :currency="currency" :key="item.id"></tr>
						</table>
					</div>
				</div>
			</transition>
			<footer class="card-footer">
				<transition name="fade">
					<div class="modal is-active" v-show="showModal">
						<div class="modal-background"></div>
							<div class="modal-card">
								<header class="modal-card-head">
									<p class="modal-card-title">{{ subCategory.title}}</p>
									<button @click="modalLoad" class="delete" aria-label="close"></button>
								</header>
								<section class="modal-card-body">
									<div class="level">
										<div class="level-left">
											<p>Total items: {{subCategory.items.length}}</p>
										</div>
										<div class="control level-right has-icons-right">
											<input class="input" placeholder="Search" v-model="search">
											<span class="icon is-small is-right">
												<i class="fas fa-search"></i>
											</span>
										</div>
									</div>

									<table class="table is-responsive" >
										<tr>
											<th>Item</th>
											<th>Price</th>
											<th class="small">Quantity</th>
											<th></th>
										</tr>

										<tr is="item-list-item" v-for="item in filtereditems" @add-item="addItem" @remove-item="removeItem" :item="item" :currency="currency" :key="item.id"></tr>

									</table>
								</section>
								<footer class="modal-card-foot">
									<button @click="modalLoad" class="button is-success">Save changes</button>
								</footer>
							</div>
						</div>
					</div>
				</transition>
			</footer>
		</article >
	`,
	data() {
		return {
			showModal: false,
			show: false,
			search: '',
			selecteditems: []
		}
	},
	computed: {
		filtereditems() {
			if (this.search == '') {
				return this.subCategory.items;
			}
			let items = [];
			this.subCategory.items.filter(item => {
				if (item.descrizione.toLowerCase().includes(this.search.toLowerCase())) {
					items.push(item);
				}
			})
			return items;
		}
	},
	methods: {
		addItem(newItem) {
			if (this.show == false) {
				this.show = true;
			}
			this.subCategory.items.filter(item => {
				if (item.id === newItem.id) {
					this.selecteditems.push(item);
				}
			})
		},
		removeItem(itemToRemove) {
			this.selecteditems.filter((item, index) => {
				if (item.id === itemToRemove.id) {
					this.selecteditems.splice(index, 1);
				}
			})
		},
		modalLoad() {
			this.showModal = !this.showModal;
		},
		showCategory() {
			this.show = !this.show;
		}
	},
});

// item LIST ITEM COMPONENT
Vue.component('item-list-item', {
	props: ['item', 'currency'],
	template: `
		<tr>
			<td>{{ item.descrizione }}</td>
			<td>{{ item.ultimo_prezzo }} {{ currency }}</td>
			<td><input class="input" placeholder="0" v-model.number="cacheQuantity"></td>
			<td>
				<button v-if="added" @click="removeitem" class="button is-danger">Remove</button>
				<button v-else @click="additem" class="button is-success">Add</button>
			</td>
		</tr>
	`,
	data() {
		return {
			added: false,
			cacheQuantity: this.item.quantity
		}
	},
	methods: {
		additem() {
			this.added = !this.added;
			let item = {
				id: this.item.id,
				name: this.item.name,
				quantity: this.cacheQuantity,
				price: this.item.price,
				show: this.item.show,
				option: this.item.option
			}
			eventBus.$emit('item-update', item);
			this.$emit('add-item', item);
		},
		removeitem() {
			this.added = !this.added;
			this.cacheQuantity = 0;
			let item = {
				id: this.item.id,
				name: this.item.name,
				quantity: this.cacheQuantity,
				price: this.item.price,
				show: this.item.show,
				option: this.item.option
			}
			
			eventBus.$emit('remove-item', item);
			this.$emit('remove-item', item);

		}
	}
});

// item COMPONENT  
Vue.component('item', {
	props: ['item', 'currency'],
	template: `
		<tr>
			<td>{{ item.descrizione }}</td>
			<td>{{ item.quantity }}</td>
			<td>{{ item.ultimo_prezzo }} {{ currency }}</td>
			<td>{{ item.option }}</td>
			<td>{{ item.quantity * item.ultimo_prezzo }} {{ currency }}</td>
			<td>
				<button class="button" @click="modalLoad" >Modify</button>
			</td>
			<transition name="fade">
				<div class="modal is-active" v-show="show">
					<div class="modal-background"></div>
						<div class="modal-card">
							<header class="modal-card-head">
								<p class="modal-card-title">{{ item.name }}</p>
								<button @click="saved" class="delete" aria-label="close"></button>
							</header>
							<section class="modal-card-body columns">
								<div class="column">
									<label class="label" for="quantity">Quantity</label>
									<input class="input" name="quantity" v-model.number="item.quantity">
								</div>
								<div class="column">
									<label class="label" for="price">Price {{ currency }}</label>
									<input class="input" name="price" v-model.number="item.ultimo_prezzo">
								</div>
								<div class="column">
									<label class="label" for="option">Option</label>
									<input class="input" name="option" v-model="item.option">
								</div>
							</section>
							<footer class="modal-card-foot">
								<button @click="saved" class="button is-success">Save changes</button>
							</footer>
						</div>
					</div>
				</div>
			</transition>
		</tr>
	`,
	data() {
		return {
			show: false
		}
	},
	methods: {
		saved() {
			let newitem = {
				id: this.item.id,
				name: this.item.name,
				quantity: this.item.quantity,
				price: this.item.price,
				show: this.item.show,
				option: this.item.option
			}
			eventBus.$emit('item-update', newitem);
			this.show = !this.show;			
		},
		modalLoad() {
			this.show = !this.show;
		}
	}
});

// VIEW MAIN
let vm = new Vue({
	el: '#app'
});