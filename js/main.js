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
					icon: 'fa-lemon',
					show: false,
					total: 0
				},
				{
					id: 'b4b1cebb-4e15-4d19-99cb-945af47a5986',
					name: 'Beverage',
					type: 'One-Level',
					icon: 'fa-coffee',
					show: false,
					total: 0
				},
				{
					id: '7d8d2889-deaf-45fc-8800-be0395a11b67',
					name: 'Stewarding',
					type: 'Two-Level',
					icon: 'fa-utensils',
					total: 0,
					show: true,
					categories: []
				},
				{
					id: '9b3c9421-4ab6-4c4e-91d7-aae8d83f72b9',
					name: 'Staff',
					type: 'One-Level',
					icon: 'fa-address-card',
					show: false,
					total: 0
				},
				{
					id: 'b3efc29c-76cf-4d23-b712-6696186592b0',
					name: 'Vehicles',
					type: 'One-Level',
					icon: 'fa-truck',
					show: false,
					total: 0
				}
			]
		}
	},
	template: `
		<div class="app container">
			<div class="instance-picker tabs">
				<ul>
					<li v-for="instance in instances" :title="instance.name" :class="{'is-active':selectedInstance === instance.name}" :key="instance.id" @click="showInstance(instance)">
						<a>
							<span class="icon is-small"><i class="fas is-large" :class="instance.icon" aria-hidden="true"></i></span>
							<span class="instance-name">{{ instance.name }}</span>
						</a>
					</li>
				</ul>
			</div>
			<instance v-for="instance in instances" v-show="instance.show" :instance="instance" :currency="currency" :key="instance.id"></instance>

			
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
					this.selectedInstance = instance.name;
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
			})
			.catch(error => {
				// handle error
				console.log(error);
			})
			.then(() => {
				// always executed
				console.log('Data fetched')
			});
		}
	},
	mounted() {
		this.selectedInstance = 'Stewarding';
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
	props: ['instance', 'currency'],
	template: `
		<div class="card instance">
			<header class="card-header has-background-brown">
				<h2 class="card-header-title has-text-white is-uppercase">
					{{ instance.name }}
				</h2>
				<p class="card-header-title is-block has-text-white has-text-right is-uppercase">
					Total: {{ total }} {{ currency }}
				</p>
			</header>
			<div class="card-content">
			<div v-if="loading" class="loading-icon-container">
				<i class="fas fa-spinner fa-spin icon is-large"></i>
			</div>

			<div v-show="currentCategory !== ''" class="category-picker tabs">
				<ul>
					<li v-for="category in instance.categories" :class="{'is-active':currentCategory.cat_name === category.cat_name}" @click="selectedCategory(category)"><a>{{ category.cat_name }}</a></li>
				</ul>
			</div>
			
			<category v-for="category in instance.categories" v-show="currentCategory.cat_name === category.cat_name" :currency="currency" :category="category" @category-update="updateTotal" :key="currentCategory.id"></category>

			</div>
		</div>
	`,
	data() {
		return {
			currentCategory: '',
			loading: true,
			totalCategories: [],
			total: 0
		}
	},
	methods: {
		selectedCategory(category) {
			if (this.currentCategory.id !== category.cat_id) {	
				this.currentCategory = category;
			}

		},
		updateTotal(categoryData) {
			this.total = 0;
			const index = this.totalCategories.findIndex(element => {
				return element.id === categoryData.id;
			});

			if (index > -1) {
				this.totalCategories.splice(index, 1, categoryData);
			} else {
				this.totalCategories.push(categoryData);	
			}
			this.totalCategories.forEach(categoryTotal => {
				this.total += categoryTotal.total;
			});
		}
	},
	mounted() {
		// 
	},
	updated() {
		if (this.currentCategory === '') {
			this.currentCategory = this.instance.categories[0];
			this.loading = !this.loading;
		}
	}
});

// CATEGORY COMPONENT
Vue.component('category', {
	props: ['category', 'currency'],
	template: `
		<div class="content">
			<sub-category v-for="subCategory in category.subcatsList" :catMinVal="category.cat_minVal" :subCategory="subCategory" :currency="currency" @subcategory-update="updateTotal" :key="subCategory.subcat_id"></sub-category>
		</div>
	`,
	data() {
		return {
			totalSubCategories: [],
			total: 0
		}
	},
	methods: {
		updateTotal(subCategoryData) {
			this.total = 0;
			let index = this.totalSubCategories.findIndex(element => {
				return element.id === subCategoryData.id;
			});

			if (index > -1) {
				this.totalSubCategories.splice(index, 1, subCategoryData);
			} else {
				this.totalSubCategories.push(subCategoryData);	
			}
			this.totalSubCategories.forEach(subCategoryTotal => {
				this.total += subCategoryTotal.total;
			});

			const categoryTotal = {
				id: this.category.cat_id,
				total: this.total
			}
			this.$emit('category-update', categoryTotal);
		}
	}
});

// SUB-CATEGORY COMPONENT
Vue.component('sub-category', {
	props: ['subCategory', 'currency', 'catMinVal'],
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
						Sub-total: {{ total }} {{ currency }}
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
							<tr v-show="selectedItems.length == 0 && addedItems.length == 0">
								<td>There are no items added</td>
								<td></td>
								<td></td>
								<td></td>
								<td></td>
								<td></td>
							</tr>
							<tr is="added-item" v-show="addedItems.length > 0"  v-for="item in addedItems" :item="item" :currency="currency" :key="item.id"></tr>
							<tr is="item" v-show="selectedItems.length > 0"  v-for="item in selectedItems" :item="item" :currency="currency" :key="item.id"></tr>
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
									<p class="modal-card-title">{{ subCategory.subcat_name}}</p>
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

										<tr is="item-list" v-for="item in filtereditems" @add-item="addItem" @remove-item="removeItem" :item="item" :currency="currency" :catMinVal="catMinVal" :key="item.id"></tr>

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
			selectedItems: [],
			addedItems: [],
			total: 0
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
			this.total = 0;
			if (this.show == false) {
				this.show = true;
			}
			this.subCategory.items.filter(item => {
				if (item.id === newItem.id) {
					this.selectedItems.push(item);
				}
			});
			this.selectedItems.forEach(item => {
				this.total += item.quantity * item.ultimo_prezzo;
			});

			this.addedItems.forEach(item => {
				this.total += item.qty * item.valore;
			});

			const subCategoryData = {
				id: this.subCategory.subcat_id,
				total: this.total
			};
			this.$emit('subcategory-update', subCategoryData);
		},
		removeItem(itemToRemove) {
			this.total = 0;
			this.selectedItems.filter((item, index) => {
				if (item.id === itemToRemove.id) {
					this.selectedItems.splice(index, 1);
				}
			});
			this.selectedItems.forEach(item => {
				this.total += item.quantity * item.ultimo_prezzo;
			});

			this.addedItems.forEach(item => {
				this.total += item.qty * item.valore;
			});

			const subCategoryData = {
				id: this.subCategory.subcat_id,
				total: this.total
			};
			this.$emit('subcategory-update', subCategoryData);
		},
		modalLoad() {
			this.showModal = !this.showModal;
		},
		showCategory() {
			this.show = !this.show;
		}
	},
	mounted() {
		this.addedItems = this.subCategory.addedItems;
		this.total = 0;
		this.addedItems.forEach(item => {
			this.total += item.qty * item.valore;
		});

		const subCategoryData = {
			id: this.subCategory.subcat_id,
			total: this.total
		};
		this.$emit('subcategory-update', subCategoryData);
	},
	updated() {
		
	}
	
});

// ADDED ITEM COMPONENT
Vue.component('added-item', {
	props: ['item', 'currency'],
	template: `
		<tr>
			<td>{{ item.descrizione }}</td>
			<td>{{ item.qty }}</td>
			<td>{{ item.valore }} {{ currency }}</td>
			<td>{{ item.option }}</td>
			<td>{{ item.qty * item.valore }} {{ currency }}</td>
			<td>
				<button class="button" @click="modalLoad" >Modify</button>
			</td>
			<transition name="fade">
				<div class="modal is-active" v-show="show">
					<div class="modal-background"></div>
						<div class="modal-card">
							<header class="modal-card-head">
								<p class="modal-card-title">{{ item.descrizione }}</p>
								<button @click="saved" class="delete" aria-label="close"></button>
							</header>
							<section class="modal-card-body columns">
								<div class="column is-one-fifth">
									<label class="label" for="quantity">Quantity</label>
									<input class="input" name="quantity" v-model.number="item.qty">
								</div>
								<div class="column is-one-quarter">
									<label class="label" for="price">Price {{ currency }}</label>
									<input class="input" name="price" v-model.number="item.valore">
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
				name: this.item.descrizione,
				quantity: this.item.qty,
				price: this.item.valore,
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

// item LIST ITEM COMPONENT
Vue.component('item-list', {
	props: ['item', 'currency', 'catMinVal'],
	template: `
		<tr>
			<td>{{ item.descrizione }}</td>
			<td>{{ item.ultimo_prezzo }} {{ currency }}</td>
			<td class="small"><input class="input" v-model.number="cacheQuantity"></td>
			<td>
				<button v-if="added" @click="removeitem" class="button is-danger">Remove</button>
				<button v-else @click="additem" class="button is-success">Add</button>
			</td>
		</tr>
	`,
	data() {
		return {
			added: false,
			cacheQuantity: this.item.quantity ? this.item.quantity : this.catMinVal
		}
	},
	methods: {
		additem() {
			this.added = !this.added;
			let item = {
				id: this.item.id,
				name: this.item.name,
				quantity: this.cacheQuantity,
				price: this.item.ultimo_prezzo,
				show: this.item.show,
				option: this.item.option
			}
			eventBus.$emit('item-update', item);
			this.$emit('add-item', item);
		},
		removeitem() {
			this.added = !this.added;
			this.cacheQuantity = this.catMinVal;
			let item = {
				id: this.item.id,
				name: this.item.name,
				quantity: this.cacheQuantity,
				price: this.item.ultimo_prezzo,
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
								<p class="modal-card-title">{{ item.descrizione }}</p>
								<button @click="saved" class="delete" aria-label="close"></button>
							</header>
							<section class="modal-card-body columns">
								<div class="column is-one-fifth">
									<label class="label" for="quantity">Quantity</label>
									<input class="input" name="quantity" v-model.number="item.quantity">
								</div>
								<div class="column is-one-quarter">
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
				price: Number(this.item.ultimo_prezzo),
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