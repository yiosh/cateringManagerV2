/*Avvio*/
// $(document).ready(function() {
	
// 	/*PRELOAD CONTENT */
// 	$("#preloader").fadeOut(100);
// 	$("#container").fadeIn(400); 
// });

Vue.component('content-container', {
	data() {
		return {
			currency: '€',
			sectionTitle: 'Stewarding',
			show: false,
			categories: [
				{
					id: 0,
					title: 'Chairs',
					total: 0,
					show: false,
					selectedCategory: false,
					products: [
						{
							id: 0,
							name: 'White chair',
							quantity: 0,
							price: 4,
							show: true,
							option: ''
						},
						{
							id: 1,
							name: 'Brown chair',
							quantity: 0,
							price: 3,
							show: true,
							option: ''
						}
					]
				},
				{
					id: 1,
					title: 'Table',
					total: 0,
					show: false,
					selectedCategory: false,
					products: [
						{
							id: 0,
							name: 'White table',
							quantity: 0,
							price: 9,
							show: true,
							option: ''
						},
						{
							id: 1,
							name: 'Brown table',
							quantity: 0,
							price: 10,
							show: true,
							option: ''
						}
					]
				},
				{
					id: 2,
					title: 'Napkins',
					total: 0,
					show: false,
					selectedCategory: false,
					products: [
						{
							id: 0,
							name: 'White napkin',
							quantity: 0,
							price: 4,
							show: true,
							option: ''
						},
						{
							id: 1,
							name: 'Brown napkin',
							quantity: 0,
							price: 5,
							show: true,
							option: ''
						}
					]
				}
			]
		}
	},
	template: `
		<div class="container">
			<div class="card">
				<header class="card-header has-background-brown">
					<h2 class="card-header-title has-text-white is-uppercase">
						{{ sectionTitle }}
					</h2>
					<p class="card-header-title is-block has-text-white has-text-right is-uppercase">
						Total: {{ sectionTotal }} {{ currency }}
					</p>
				</header>
				<div class="card-content">
					<div class="content">
						<category v-for="category in categories" @data-update="categoryTotal" @data-update-remove="updateItem" :category="category" :currency="currency" :key="category.id"></category>
					</div>
				</div>
				<footer class="card-footer">
					
				</footer>
			</div>
			
		</div>
	`,
	computed: {
		sectionTotal() {
			let total = 0;
			this.categories.forEach(category => {
				total += category.total;
			});
			return total;
		}
	},
	methods: {
		showCategory(category) {
			if (category.selectedCategory === false) {
				category.selectedCategory = true;
			}
			category.show = !category.show;
		},
		categoryTotal(object) {
			this.categories.forEach((category, index) => {
				if (category.id == object.id) {
					object.products.forEach(newProduct => {
						category.products.forEach(product => {
							if (newProduct.id == product.id) {
								product.quantity = newProduct.quantity;
								product.price = newProduct.price;
								product.show = newProduct.show;
								product.option = newProduct.option;
							}
						})
					})
					let productsArray = [];
					let total = 0;
					category.products.forEach(product => {
						productsArray.push(product.quantity * product.price);
					});
					productsArray.forEach(amount => {
						total += amount;
					});
					this.categories[index].total = total;
				}
			});
		},
		updateItem(object) {
			this.categories.forEach((category, index) => {
				if (category.id == object.id) {
					category.products.forEach(product => {
						if (object.product.id == product.id) {
							product.quantity = object.product.quantity;
							product.price = object.product.price;
							product.show = object.product.show;
							product.option = '';
						}
					});

					let productsArray = [];
					let total = 0;
					category.products.forEach(product => {
						productsArray.push(product.quantity * product.price);
					});
					productsArray.forEach(amount => {
						total += amount;
					});
					this.categories[index].total = total;
				}
			});
		}
	},
	created() {
		this.categories.forEach((category, index) => {
			let productsArray = [];
			let total = 0;
			category.products.forEach(product => {
				productsArray.push(product.quantity * product.price);
			});
			productsArray.forEach(amount => {
				total += amount;
			});
			this.categories[index].total = total;
		});
	}
});

Vue.component('category', {
	props: ['category', 'currency'],
	template: `
		<article class="card category">
			<header class="card-header">
				<div class="add-category has-text-success" @click="showModal = !showModal">
					<i class="fas fa-plus-circle"></i>
				</div>
				<div class="card-header-title" @click="showCategory">
					<p class="">
						{{ category.title }}
					</p>
					<p class="">
						Sub-total: {{ category.total }} {{ currency }}
					</p>
				</div>
			</header>
			<transition name="fade">
				<div class="card-content" v-show="show">
					<div class="content">
						<table class="table is-responsive">
							<tr>
								<th>Product</th>
								<th>Quantity</th>
								<th>Price</th>
								<th>Option</th>
								<th>Total</th>
								<th></th>
							</tr>
							<tr v-if="selectedProducts.length == 0">
								<td>There are no products added</td>
								<td></td>
								<td></td>
								<td></td>
								<td></td>
								<td></td>
							</tr>
							<tr v-else is="product" v-for="product in selectedProducts" @saved-product="sendUp()" :product="product" :currency="currency" :key="product.id"></tr>
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
									<p class="modal-card-title">{{ category.title}}</p>
									<button @click="sendUp()" class="delete" aria-label="close"></button>
								</header>
								<section class="modal-card-body">
									<div class="level">
										<div class="level-left">
											
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
											<th>Product</th>
											<th>Price</th>
											<th class="small">Quantity</th>
											<th></th>
										</tr>

										<tr is="product-list-item" v-for="product in filteredProducts" @add-item="addItem" @remove-item="removeItem" :product="product" :currency="currency" :key="product.id"></tr>

									</table>
								</section>
								<footer class="modal-card-foot">
									<button @click="sendUp()" class="button is-success">Save changes</button>
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
			count: 0,
			show: false,
			selectedProducts: [],
			search: '',
			hover: false,
			mouseOver: false
		}
	},
	computed: {
		filteredProducts() {
			if (this.search == '') {
				return this.category.products;
			}
			let products = [];
			this.category.products.filter(product => {
				if (product.name.toLowerCase().includes(this.search.toLowerCase())) {
					products.push(product);
				}
			})
			return products;
		}
	},
	methods: {
		addItem(item) {
			if (this.show == false) {
				this.show = true;
			}
			this.selectedProducts.push(item);
			let newCategoryData = {
				id: this.category.id,
				products: this.selectedProducts
			}
			this.$emit('data-update', newCategoryData);
		},
		removeItem(item) {
			let newCategoryData = {
				id: this.category.id,
				product: item
			}
			this.$emit('data-update-remove', newCategoryData);
			this.selectedProducts.forEach((product, index) => {
				if (product.id == item.id) {
					this.selectedProducts.splice(index, 1);
				}
			});
			
		},
		modalLoad() {
			this.showModal = !this.showModal;
			
		},
		cancel() {
			this.showModal = !this.showModal
		},
		sendUp() {
			if (this.showModal == true) {
				this.showModal = false;
			}
			let newCategoryData = {
				id: this.category.id,
				products: this.selectedProducts
			}
			this.$emit('data-update', newCategoryData);
		},
		showCategory() {
			this.show = !this.show;
		}
	}
});

Vue.component('product-list-item', {
	props: ['product', 'currency'],
	template: `
		<tr v-show="product.show">
			<td>{{ product.name }}</td>
			<td>{{ product.price }} {{ currency }}</td>
			<td><input class="input" placeholder="Search" v-model="cacheQuantity"></td>
			<td>
				<button v-if="added" @click="removeProduct(product)" class="button is-danger">Remove</button>
				<button v-else @click="addProduct()" class="button is-success">Add</button>
			</td>
		</tr>
	`,
	data() {
		return {
			added: false,
			cacheQuantity: this.product.quantity
		}
	},
	methods: {
		addProduct() {
			this.added = !this.added;
			let product = {
				id: this.product.id,
				name: this.product.name,
				quantity: this.cacheQuantity,
				price: this.product.price,
				show: this.product.show,
				option: this.product.option
			}
			this.$emit('add-item', product);
		},
		removeProduct() {
			this.added = !this.added;
			this.cacheQuantity = 0;
			let product = {
				id: this.product.id,
				name: this.product.name,
				quantity: this.cacheQuantity,
				price: this.product.price,
				show: this.product.show,
				option: this.product.option
			}
			this.$emit('remove-item', product);

		}
	}
});
  
Vue.component('product', {
	props: ['product', 'currency'],
	template: `
		<tr>
			<td>{{ product.name }}</td>
			<td>{{ product.quantity }}</td>
			<td>{{ product.price }} {{ currency }}</td>
			<td>{{ product.option }}</td>
			<td>{{ product.quantity * product.price }} {{ currency }}</td>
			<td>
				<button class="button" @click="modalLoad" >Modify</button>
			</td>
			<transition name="fade">
				<div class="modal is-active" v-show="show">
					<div class="modal-background"></div>
						<div class="modal-card">
							<header class="modal-card-head">
								<p class="modal-card-title">{{ product.name }}</p>
								<button @click="saved" class="delete" aria-label="close"></button>
							</header>
							<section class="modal-card-body columns">
								<div class="column">
									<label class="label" for="quantity">Quantity</label>
									<input class="input" name="quantity" v-model="product.quantity">
								</div>
								<div class="column">
									<label class="label" for="price">Price {{ currency }}</label>
									<input class="input" name="price" v-model="product.price">
								</div>
								<div class="column">
									<label class="label" for="option">Option</label>
									<input class="input" name="option" v-model="product.option">
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
			count: 0,
			show: false,
			isSelected: false
		}
	},
	methods: {
		saved() {
			this.$emit('saved-product');
			this.show = !this.show;			
		},
		modalLoad() {
			this.show = !this.show;
		}
	}
});

let vm = new Vue({
	el: '#content_scheda',
	data: {
		message: 'Hello'
		
	}
});