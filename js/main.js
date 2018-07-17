/*Avvio*/
$(document).ready(function() {
	
	/*PRELOAD CONTENT */
	$("#preloader").fadeOut(100);
	$("#container").fadeIn(400); 
});

Vue.component('content-container', {
	data() {
		return {
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
							quantity: 2,
							price: 10,
							show: true,
							option: ''
						},
						{
							id: 1,
							name: 'Brown chair',
							quantity: 3,
							price: 20,
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
							quantity: 2,
							price: 10,
							show: true,
							option: ''
						},
						{
							id: 1,
							name: 'Brown table',
							quantity: 3,
							price: 20,
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
							quantity: 2,
							price: 10,
							show: true,
							option: ''
						},
						{
							id: 1,
							name: 'Brown napkin',
							quantity: 3,
							price: 20,
							show: true,
							option: ''
						}
					]
				}
			]
		}
	},
	template: `
		<div class="content container">
			<div class="header level">
				<h2 class="level-left">
					{{ sectionTitle }}
				</h2>
				<h2 class="level-right">
					{{ sectionTotal }}€
				</h2>
			</div>
			<div class="content-body">

				<category v-for="category in categories" @data-update="categoryTotal()" :category="category" :key="category.id"></category>

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
		categoryTotal() {
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
	props: ['category'],
	template: `
		<div class="category">
			<div class="category-container">
				<div class="level category-header" @click="showCategory">
					<div class="category-title level-left level">
						<div class="level-left">{{ category.title }}</div>
						<div @click="showModal = !showModal" class="level-right"><i class="fas fa-plus-circle"></i></div>  
					</div>
					<div class="category-title level-right">
						{{ category.total }}€
					</div>
				</div>
				<table v-show="show" class="table is-responsive">
					<tr>
						<th>Product</th>
						<th>Quantity</th>
						<th>Price</th>
						<th>Option</th>
						<th>Total</th>
						<th></th>
					</tr>

					<tr is="product" v-for="product in selectedProducts" @saved-product="sendUp()" :product="product" :key="product.id"></tr>

				</table>
				<div class="modal is-active" v-show="showModal">
					<div class="modal-background"></div>
						<div class="modal-card">
							<header class="modal-card-head">
								<p class="modal-card-title">{{ category.title}}</p>
								<button @click="showModal = !showModal" class="delete" aria-label="close"></button>
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
										<th>Quantity</th>
										<th></th>
									</tr>
	
									<tr is="product-list-item" v-for="product in filteredProducts" @add-item="addItem" @remove-item="removeItem" :product="product" :key="product.id"></tr>
	
								</table>
							</section>
							<footer class="modal-card-foot">
								<button @click="sendUp()" class="button is-success">Save changes</button>
								<button @click="showModal = !showModal" class="button">Cancel</button>
							</footer>
						</div>
					</div>
				</div>	
			</div>
		</div>
	`,
	data() {
		return {
			showModal: false,
			count: 0,
			show: false,
			selectedProducts: [],
			search: ''
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
			this.selectedProducts.push(item);
		},
		removeItem(item) {
			this.selectedProducts.forEach((product, index) => {
				if (product.id == item.id) {
					this.selectedProducts.splice(index, 1);
				}
			});
		},
		modalLoad() {
			this.showModal = !this.showModal;
			
		},
		sendUp() {
			if (this.showModal == true) {
				this.showModal = false;
			}
			this.$emit('data-update');
		},
		showCategory() {
			this.show = !this.show;
		}
	}
});

Vue.component('product-list-item', {
	props: ['product'],
	template: `
		<tr v-show="product.show">
			<td>{{ product.name }}</td>
			<td>{{ product.price }}</td>
			<td><input class="input" placeholder="Search" v-model="product.quantity"></td>
			<td>
			<button v-if="added" @click="removeProduct(product)" class="button is-danger">Remove</button>
			<button v-else @click="addProduct(product)" class="button is-success">Add</button>
			</td>
		</tr>
	`,
	data() {
		return {
			added: false
		}
	},
	methods: {
		addProduct(product) {
			this.added = !this.added;
			this.$emit('add-item', this.product);
		},
		removeProduct(product) {
			this.added = !this.added;
			this.$emit('remove-item', this.product);

		}
	}
});
  
Vue.component('product', {
	props: ['product'],
	template: `
		<tr>
			<td class="medium">{{ product.name }}</td>
			<td class="small">{{ product.quantity }}</td>
			<td class="small">{{ product.price }}</td>
			<td class="medium">{{ product.option }}</td>
			<td class="small">{{ product.quantity * product.price }}</td>
			<td class="small"><button class="button" @click="modalLoad" >Modify</button></td>
			<div class="modal is-active" v-show="show">
				<div class="modal-background"></div>
					<div class="modal-card">
						<header class="modal-card-head">
							<p class="modal-card-title">{{ product.name }}</p>
							<button @click="show = !show" class="delete" aria-label="close"></button>
						</header>
						<section class="modal-card-body columns">
							<div class="column">
								<label class="label" for="quantity">Quantity</label>
								<input class="input" name="quantity" v-model="product.quantity">
							</div>
							<div class="column">
								<label class="label" for="price">Price</label>
								<input class="input" name="price" v-model="product.price">
							</div>
							<div class="column">
								<label class="label" for="option">Option</label>
								<input class="input" name="option" v-model="product.option">
							</div>
						</section>
						<footer class="modal-card-foot">
							<button @click="saved" class="button is-success">Save changes</button>
							<button @click="show = !show" class="button">Cancel</button>
						</footer>
					</div>
				</div>
			</div>	
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