/*Avvio*/
// $(document).ready(function() {
	
// 	/*PRELOAD CONTENT */
// 	$("#preloader").fadeOut(100);
// 	$("#container").fadeIn(400); 
// });

const params = (new URL(document.location)).searchParams;
const eventoId = params.get("eventoId");

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
					type: 'Two-Level',
					icon: 'fa-lemon',
					show: false,
					categories: [],
					total: 0
				},
				{
					id: 'b4b1cebb-4e15-4d19-99cb-945af47a5986',
					name: 'Beverage',
					type: 'Two-Level',
					icon: 'fa-coffee',
					show: false,
					categories: [],
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
					categories: [],
					total: 0
				},
				{
					id: 'b3efc29c-76cf-4d23-b712-6696186592b0',
					name: 'Vehicles',
					type: 'Two-Level',
					icon: 'fa-truck',
					show: false,
					categories: [],
					total: 0
				}
			]
		}
	},
	template: `
		<div class="app container">
			<div class="instance-picker tabs is-centered">
				<ul>
					<li v-for="instance in instances" :title="instance.name" :class="{'is-active':selectedInstance === instance.name}" :key="instance.id" @click="showInstance(instance)">
						<a>
							<span class="icon is-small"><i class="fas is-large" :class="instance.icon" aria-hidden="true"></i></span>
							<span class="instance-name">{{ instance.name }}</span>
						</a>
					</li>
				</ul>
			</div>
			<keep-alive>
				<instance v-for="instance in instances" v-if="instance.show" :instance="instance" :currency="currency" :key="instance.id"></instance>
			</keep-alive>
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
									item.quantity ? item.quantity= 0 : item.qty= 0;
								}
								itemTotal += item.price ? (item.price * item.quantity) : (item.valore * item.ultimo_prezzo);
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
			this.instances.forEach((instance, index) => {
				if (instance.id === clickedInstance.id) {
					this.selectedInstance = instance.name;
					instance.show = true;
					this.fetchCategories(this.selectedInstance, index);
				} else {
					instance.show = false;
				}
			})
		},
		fetchCategories(instance, index) {
			let instanceParameter;

			if (instance === 'Food') {
				instanceParameter = 'get_food';
			}

			if (instance === 'Beverage') {
				instanceParameter = 'get_beverage';
			}

			if (instance === 'Stewarding') {
				instanceParameter = 'get_stewarding';
			}

			if (instance === 'Vehicles') {
				instanceParameter = 'get_veichels';
			}

			axios.get(`https://stile.condivision.cloud/fl_api/v2.0/?${instanceParameter}&token=1&eventoId=${eventoId}`)
			.then(response => {
				// handle success
				this.instances[index].categories = response.data.dati;
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
		this.fetchCategories(this.selectedInstance, 2);
		eventBus.$on('add-item', newitem => {
			this.instances.forEach(instance => {
				if (instance.type === "Two-Level") {
					instance.categories.forEach(category => {
						category.subcatsList.forEach(subCategory => {
							subCategory.items.forEach(item => {
								
								if (item.id === newitem.id) {
									item.show = true;
									if (item.quantity) {
										item.quantity = newitem.quantity;

									}
									if (item.qty) {
										item.qty = newitem.quantity;
									}
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
					Total: {{ total.toFixed(2) }} {{ currency }}
				</p>
			</header>
			<div class="card-content" v-if="instance.type == 'Two-Level'">
				<div v-if="loading" class="loading-icon-container">
					<i class="fas fa-spinner fa-spin icon is-large"></i>
				</div>

				<div v-show="currentCategory !== ''" class="category-picker tabs">
					<ul>
						<li v-for="category in instance.categories" :class="{'is-active':currentCategory.cat_name === category.cat_name}" @click="selectedCategory(category)"><a>{{ category.cat_name }}</a></li>
					</ul>
				</div>
				<keep-alive>
					<category v-for="category in instance.categories" v-if="currentCategory.cat_name === category.cat_name" :currency="currency" :category="category" @category-update="updateTotal" :key="currentCategory.id"></category>
				</keep-alive>

			</div>

			<div class="card-content" v-else>
				<h1>One-Level Instance - {{ instance.name }}</h1>
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
				<div class="add-category has-text-success" @click="showModal = true">
					<i class="fas fa-plus-circle"></i>
				</div>
				<div class="card-header-title" @click="showCategoryContent">
					<p class="">
						{{ subCategory.subcat_name }}
					</p>
					<p class="">
						Sub-total: {{ total.toFixed(2) }} {{ currency }}
					</p>
				</div>
			</header>
			<transition name="fade">
				<keep-alive>
					<div class="card-content" v-if="showCategory">
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
								<tr v-if="addedItems.length === 0">
									<td>There are no items added</td>
									<td></td>
									<td></td>
									<td></td>
									<td></td>
									<td></td>
								</tr>
								<tr is="added-item" v-else v-for="item in addedItems" @item-update="updateItem" @remove-item="removeItem" :quiverCode="subCategory.quiverCode" :item="item" :currency="currency" :key="item.id"></tr>
							</table>
						</div>
					</div>
				</keep-alive>
			</transition>
			<footer class="card-footer">
				<keep-alive>
					<transition name="fade" v-if="showModal">
						<div class="modal is-active">
							<div class="modal-background"></div>
								<div class="modal-card">
									<header class="modal-card-head">
										<p class="modal-card-title">{{ subCategory.subcat_name}}</p>
										<button @click="closeModal" class="delete" aria-label="close"></button>
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

											<tr is="item-list" v-for="item in filtereditems" @add-item="addItem" :quiverCode="subCategory.quiverCode" :item="item" :currency="currency" :catMinVal="catMinVal" :key="item.id"></tr>

										</table>
									</section>
									<footer class="modal-card-foot">

									</footer>
								</div>
							</div>
						</div>

					</transition>
				</keep-alive>
			</footer>
		</article >
	`,
	data() {
		return {
			showModal: false,
			showCategory: false,
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
			this.addedItems.push(newItem);
			// this.subCategory.items.filter(item => {
			// 	if (item.id === newItem.id) {
			// 		this.addedItems.push(item);
			// 	}
			// });
			this.addedItems.forEach(item => {
				if (item.quantity && item.price) {
					this.total += item.quantity * item.price;
				}

				if (item.quantity && item.ultimo_prezzo) {
					this.total += item.quantity * item.ultimo_prezzo;
				}

				if (item.qty) {	
					this.total += item.qty * item.valore;
				}
			});

			const subCategoryData = {
				id: this.subCategory.subcat_id,
				total: this.total
			};
			this.$emit('subcategory-update', subCategoryData);
		},
		updateItem(updatedItem) {
			this.total = 0;
			// this.addedItems.forEach(item => {
			// 	if (item.id === updatedItem.id) {
			// 		console.log('oldItem', item);
			// 		// item.quantity = updatedItem.quantity;
			// 		// item.price = updatedItem.price;
			// 		// item.option = updatedItem.option;
					console.log('newItem', updatedItem);
			// 	}
			// });
			
			this.addedItems.forEach(item => {
				if (item.quantity && item.price) {
					this.total += item.quantity * item.price;
				}

				if (item.quantity && item.ultimo_prezzo) {
					this.total += item.quantity * item.ultimo_prezzo;
				}

				if (item.qty && item.valore) {	
					this.total += item.qty * item.valore;
				}
			});

			const subCategoryData = {
				id: this.subCategory.subcat_id,
				total: this.total
			};
			this.$emit('subcategory-update', subCategoryData);
		},
		removeItem(itemToRemove) {
			this.total = 0;
			this.addedItems.filter((item, index) => {
				if (item.id === itemToRemove.id) {
					this.addedItems.splice(index, 1);
				}
			});
			this.addedItems.forEach(item => {
				if (item.quantity && item.price) {
					this.total += item.quantity * item.price;
				}

				if (item.quantity && item.ultimo_prezzo) {
					this.total += item.quantity * item.ultimo_prezzo;
				}

				if (item.qty) {	
					this.total += item.qty * item.valore;
				}
			});

			const subCategoryData = {
				id: this.subCategory.subcat_id,
				total: this.total
			};
			this.$emit('subcategory-update', subCategoryData);
		},
		closeModal() {
			this.showModal = false;
		},
		showCategoryContent() {
			this.showCategory = !this.showCategory;
		}
	},
	mounted() {
		this.addedItems = this.subCategory.addedItems;
		this.total = 0;
		this.addedItems.forEach(item => {
			if (item.quantity && item.price) {
				this.total += item.quantity * item.price;
			}
			if (item.qty) {
				this.total += item.qty * item.valore;
			}

			if (item.quantity && item.ultimo_prezzo) {
				this.total += item.quantity * item.ultimo_prezzo;
			}
		});

		const subCategoryData = {
			id: this.subCategory.subcat_id,
			total: this.total
		};
		this.$emit('subcategory-update', subCategoryData);
	}	
});

// ADDED ITEM COMPONENT
Vue.component('added-item', {
	props: ['item', 'currency', 'quiverCode'],
	template: `
		<tr>
			<td>{{ name }}</td>
			<td>{{ quantity }}</td>
			<td>{{ price.toFixed(2) }} {{ currency }}</td>
			<td>{{ itemCached.option }}</td>
			<td>{{ itemTotal.toFixed(2) }} {{ currency }}</td>
			<td>
				<a  class="button is-fullwidth" @click="openItemModal">
					<span class="icon">
						<i class="far fa-edit"></i>
					</span>
					<span>Modify</span>
				</a>
			</td>
			<keep-alive>
				<item-modal v-if="itemModal" @item-update="updateItem" @remove-item="openRemoveModal" @close-item-modal="closeItemModal" :loading="loading" :item="itemCached" :currency="currency"></item-modal>
			</keep-alive>
			<transition name="fade" v-if="removeModal">
				<div class="modal is-active">
					<div class="modal-background"></div>
						<div class="modal-card">
							<header class="modal-card-head">
								<p class="modal-card-title">Do you want to remove {{ name }}?</p>
								<button @click="closeRemoveModal" class="delete" aria-label="close"></button>
							</header>
							<section class="modal-card-body columns is-mobile is-centered">
								<div class="column is-one-quarter">
									<a class="button is-success is-fullwidth" :class="{'is-loading':loading}" @click="removeItem">
										<span class="icon">
											<i class="far fa-check-circle"></i>
										</span>
										<span>Yes</span>
									</a>
								</div>
								<div class="column is-one-quarter">
									<a class="button is-danger is-fullwidth" @click="closeRemoveModal">
										<span class="icon">
											<i class="far fa-times-circle"></i>
										</span>
										<span>No</span>
									</a>
								</div>
							</section>
							<footer class="modal-card-foot">
								
							</footer>
						</div>
					</div>
				</div>
			</transition>
		</tr>
	`,
	data() {
		return {
			itemCached: this.item,
			itemModal: false,
			loading: false,
			removeModal: false
		}
	},
	methods: {
		updateItem(updatedItem) {
			let item = {
				id: updatedItem.id,
				name: updatedItem.name,
				quantity: updatedItem.quantity,
				price: updatedItem.price,
				option: updatedItem.option
			}
			if (item.quantity) {
				var queryQty = `&qty=${item.quantity}`;
			}
			if (item.quantity) {
				var queryValore = `&valore=${item.price}`;
			}
			if (item.note) {
				var queryNote = `&note=${item.note}`;
			}
			this.loading = true;
			axios.get(`https://stile.condivision.cloud/fl_api/v2.0/?updateSynapsy&token=1&eventoId=${eventoId}&quiverCode=${this.quiverCode}&recordId=${item.id}${queryQty}${queryValore}${queryNote}`)
			.then(response => {
				console.log(response.data);
				this.updateItemCached(updatedItem);
				this.itemModal = false;
				eventBus.$emit('item-update', item);
				this.$emit('item-update', item);
				this.loading = false;
				this.show = !this.show;
			})
			.catch(error => {
				// handle error
				console.log(error);
			})
			.then(() => {
				// always executed
			});
						
		},
		removeItem(itemId) {
			let item = {
				id: this.itemCached.id
			}
			this.loading = true;
			axios.get(`https://stile.condivision.cloud/fl_api/v2.0/?removeSynapsy&token=1&eventoId=${eventoId}&quiverCode=${this.quiverCode}&recordId=${item.id}`)
			.then(response => {
				console.log(response.data);
				this.loading = false;
				this.$emit('remove-item', item);
			})
			.catch(error => {
				// handle error
				console.log(error);
			})
			.then(() => {
				// always executed
			});
			

		},
		updateItemCached(newData) {
			if (this.itemCached.qty) {
				this.itemCached.qty = newData.quantity;
			}

			if (this.itemCached.quantity) {
				this.itemCached.quantity = newData.quantity;
			}

			if (this.itemCached.valore) {
				this.itemCached.valore = newData.price;
			}

			if (this.itemCached.price) {
				this.itemCached.price = newData.price;
			}

			if (this.itemCached.ultimo_prezzo) {
				this.itemCached.ultimo_prezzo = newData.price;
			}
		},
		openItemModal() {
			this.itemModal = true;
		},
		closeItemModal() {
			this.itemModal = false;
		},
		openRemoveModal() {
			this.removeModal = true;
		},
		closeRemoveModal() {
			this.removeModal = false;
		}
	},
	computed: {
		name() {
			if (this.item.descrizione) {
				return this.item.descrizione;
			}

			if (this.item.name) {
				return this.item.name;
			}
		},
		quantity() {
			if (this.item.qty) {
				return Number(this.itemCached.qty);
			}

			if (this.item.quantity) {
				return Number(this.itemCached.quantity);
			}
		},
		price() {
			if (this.item.valore) {
				return Number(this.item.valore);
			}

			if (this.item.price) {
				return Number(this.item.price);
			}

			if (this.item.ultimo_prezzo) {
				return Number(this.item.ultimo_prezzo);
			}
			
		},
		itemTotal() {
			if (this.item.qty ) {
				return Number(this.item.qty * this.item.valore);
			}

			if (this.item.quantity && this.item.ultimo_prezzo) {
				return Number(this.item.quantity * this.item.ultimo_prezzo);
			}

			if (this.item.price) {
				return Number(this.item.quantity * this.item.price);
			}
		}
	}
});


Vue.component('item-modal', {
	props: ['item', 'currency', 'loading'],
	template: `
		<transition name="fade">
			<div class="modal is-active">
				<div class="modal-background"></div>
					<div class="modal-card">
						<header class="modal-card-head">
							<p class="modal-card-title">{{ name }}</p>
							<button @click="closeItemModal" class="delete" aria-label="close"></button>
						</header>
						<section class="modal-card-body columns is-mobile is-centered">
							<div class="column is-one-fifth">
								<label class="label" for="quantity">Quantity</label>
								<input class="input" name="quantity" v-model.number="quantityVal" :placeholder="this.quantityPlaceholder">
							</div>
							<div class="column is-one-fifth">
								<label class="label" for="price">Price {{ currency }}</label>
								<input class="input" name="price" v-model.number="priceVal" :placeholder="this.pricePlaceholder">
							</div>
							<div class="column is-one-fifth">
								<label class="label" for="discount">Discount</label>
								<div class="select is-fullwidth" name="discount">
									<select v-model="selected" @change="selectedChanged">
										<option :value="null">None</option>
										<option v-for="discount in discounts" :value="discount.value">{{ discount.option }}</option>
									</select>
								</div>
							</div>
							<div class="column">
								<label class="label" for="option">Option</label>
								<input class="input" name="option" v-model="item.option">
							</div>
						</section>
						<footer class="modal-card-foot columns">
							<div class="column is-one-quarter">
								<a class="button is-success is-fullwidth" :class="{'is-loading':loading}" @click="updateItem">
									<span class="icon">
										<i class="far fa-save"></i>
									</span>
									<span>Save changes</span>
								</a>
							</div>
							<div class="column is-one-quarter">
								<a class="button is-danger is-fullwidth" @click="openRemoveModal">
									<span class="icon">
										<i class="far fa-trash-alt"></i>
									</span>
									<span>Delete</span>
								</a>
							</div>
						</footer>
					</div>
				</div>
			</div>
		</transition>
			

	`,
	data() {
		return {
			priceVal: this.price(),
			pricePlaceholder: this.price(),
			quantityPlaceholder: this.quantity(),
			quantityVal: this.quantity(),
			discounts: [
				{
					value: 0.05,
					option: '5%'
				},
				{
					value: 0.10,
					option: '10%'
				},
				{
					value: 0.20,
					option: '20%'
				}
			],
			cachePriceVal: this.price(),
			selected: null

		}
	},
	methods: {
		updateItem() {
			if (this.quantityVal == null) {
				this.quantityVal = this.quantityPlaceholder;
			}

			if (this.priceVal == null) {
				this.priceVal = this.pricePlaceholder;
			}
			let updatedItem = {
				id: this.item.id,
				name: this.item.descrizione,
				quantity: this.quantityVal,
				price: this.priceVal,
				show: this.item.show,
				option: this.item.option
			}
			console.log('dataSent', updatedItem);
			this.$emit('item-update', updatedItem);
		},
		quantity() {
			if (this.item.qty) {
				return Number(this.item.qty);
			}

			if (this.item.quantity) {
				return Number(this.item.quantity);
			}
		},
		price() {
			if (this.item.valore) {
				return Number(this.item.valore);
			}

			if (this.item.price) {
				return Number(this.item.price);
			}

			if (this.item.ultimo_prezzo) {
				return Number(this.item.ultimo_prezzo);
			}
		},
		openRemoveModal() {
			let itemId = this.item.id;
			this.$emit('remove-item', itemId);
		},
		closeItemModal() {
			this.$emit('close-item-modal');
		},
		selectedChanged(event) {
			if (event.target.value === '') {
				this.priceVal = this.cachePriceVal;
			}
			if (event.target.value !== '') {
				this.priceVal = this.cachePriceVal;
				this.priceVal += this.priceVal * event.target.value;
			}
		}
	},
	computed: {
		name() {
			if (this.item.descrizione) {
				return this.item.descrizione;
			}

			if (this.item.name) {
				return this.item.name;
			}
		},
	
	}
});

// item LIST ITEM COMPONENT
Vue.component('item-list', {
	props: ['item', 'currency', 'catMinVal', 'quiverCode'],
	template: `
		<tr>
			<td>{{ item.descrizione }}</td>
			<td>{{ Number(item.ultimo_prezzo).toFixed(2) }} {{ currency }}</td>
			<td class="small"><input class="input" v-model.number="cacheQuantity"></td>
			<td>
				<a class="button is-success is-fullwidth" :class="{'is-loading':loading}" @click="additem">
					<span class="icon" v-if="addedItem">
						<i class="fas fa-plus-circle"></i>
					</span>
					<span>{{ addMessage }}</span>
				</a>
			</td>
		</tr>
	`,
	data() {
		return {
			added: false,
			cacheQuantity: 1,
			loading: false,
			addMessage: 'Add',
			addedItem: true
		}
	},
	methods: {
		additem() {
			this.loading = true;
			axios.get(`https://stile.condivision.cloud/fl_api/v2.0/?createSynapsy&token=1&eventoId=${eventoId}&quiverCode=${this.quiverCode}&arrowId=${this.item.id}&descrizione=${this.item.descrizione}&qty=${this.cacheQuantity}&valore=${this.item.ultimo_prezzo}&note=${this.item.note}`)
			.then(response => {
				let item = {
					id: response.data.dati,
					name: this.item.descrizione,
					quantity: Number(this.cacheQuantity),
					price: this.item.ultimo_prezzo ? Number(this.item.ultimo_prezzo) : Number(this.item.valore),
					show: this.item.show,
					option: this.item.option
				}
				console.log(item);
				// handle successù
				console.log(response.data);
				this.loading = false;
				eventBus.$emit('add-item', item);
				this.$emit('add-item', item);
				this.addedItem = false;
				this.addMessage = 'Added!';
				setTimeout(() => {
					this.addedItem = true;
					this.addMessage = 'Add'
			}, 2000);
			})
			.catch(error => {
				// handle error
				console.log(error);
			})
			.then(() => {
				// always executed
			});
		}
	}
});

// // item COMPONENT  
// Vue.component('item', {
// 	props: ['item', 'currency'],
// 	template: `
// 		<tr>
// 			<td>{{ item.descrizione }}</td>
// 			<td>{{ item.quantity }}</td>
// 			<td>{{ Number(item.ultimo_prezzo).toFixed(2) }} {{ currency }}</td>
// 			<td>{{ item.option }}</td>
// 			<td>{{ (item.quantity * item.ultimo_prezzo).toFixed(2) }} {{ currency }}</td>
// 			<td>
// 				<button class="button" @click="modalLoad" >Modify</button>
// 			</td>
// 			<transition name="fade">
// 				<div class="modal is-active" v-show="show">
// 					<div class="modal-background"></div>
// 						<div class="modal-card">
// 							<header class="modal-card-head">
// 								<p class="modal-card-title">{{ item.descrizione }}</p>
// 								<button @click="saved" class="delete" aria-label="close"></button>
// 							</header>
// 							<section class="modal-card-body columns">
// 								<div class="column is-one-fifth">
// 									<label class="label" for="quantity">Quantity</label>
// 									<input class="input" name="quantity" v-model.number="item.quantity">
// 								</div>
// 								<div class="column is-one-quarter">
// 									<label class="label" for="price">Price {{ currency }}</label>
// 									<input class="input" name="price" v-model.number="item.ultimo_prezzo">
// 								</div>
// 								<div class="column">
// 									<label class="label" for="option">Option</label>
// 									<input class="input" name="option" v-model="item.option">
// 								</div>
// 							</section>
// 							<footer class="modal-card-foot">
// 								<button @click="saved" class="button is-success">Save changes</button>
// 							</footer>
// 						</div>
// 					</div>
// 				</div>
// 			</transition>
// 		</tr>
// 	`,
// 	data() {
// 		return {
// 			show: false
// 		}
// 	},
// 	methods: {
// 		saved() {
// 			let newitem = {
// 				id: this.item.id,
// 				name: this.item.name,
// 				quantity: this.item.quantity,
// 				price: Number(this.item.ultimo_prezzo),
// 				show: this.item.show,
// 				option: this.item.option
// 			}
// 			eventBus.$emit('item-update', newitem);
// 			this.show = !this.show;			
// 		},
// 		modalLoad() {
// 			this.show = !this.show;
// 		}
// 	}
// });

// VIEW MAIN
let vm = new Vue({
	el: '#app'
});