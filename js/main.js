/*Avvio*/
// $(document).ready(function() {
	
// 	/*PRELOAD CONTENT */
// 	$("#preloader").fadeOut(100);
// 	$("#container").fadeIn(400); 
// });

var eventBus = new Vue();

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
					categories: [
						{
							id: 'd8363645-e56b-4363-a8ff-2b921e7b8be4',
							name: 'Test',
							total: 0,
							subCategories: [
								{
									id: '22677595-f835-4855-af1c-847cd408af72',
									title: 'Chairs',
									total: 0,
									show: false,
									selectedCategory: false,
									products: [
										{
											id: '135696b5-193c-41a4-8f91-2f627d2eabf4',
											name: 'White chair',
											quantity: 0,
											price: 4,
											show: false,
											option: ''
										},
										{
											id: 'df1f5289-0e55-47f4-9d3c-2fd5c277827b',
											name: 'Brown chair',
											quantity: 0,
											price: 3,
											show: false,
											option: ''
										}
									]
								},
								{
									id: '7b886f0e-4060-4a55-8032-c87c6e0180ed',
									title: 'Table',
									total: 0,
									show: false,
									selectedCategory: false,
									products: [
										{
											id: '5f748cad-73af-4628-ab5a-10469fc9dcbe',
											name: 'White table',
											quantity: 0,
											price: 9,
											show: false,
											option: ''
										},
										{
											id: 'e64acbc2-2cfd-45fb-bfd5-f0ed6e0eb9e0',
											name: 'Brown table',
											quantity: 0,
											price: 10,
											show: false,
											option: ''
										}
									]
								},
								{
									id: 'aa939efc-d550-4697-b7c9-9363f02eb2fa',
									title: 'Napkins',
									total: 0,
									show: false,
									selectedCategory: false,
									products: [
										{
											id: '6b84ac16-6070-495d-9623-3634951ffb7f',
											name: 'White napkin',
											quantity: 0,
											price: 4,
											show: false,
											option: ''
										},
										{
											id: '7ffa474c-3073-4320-a246-0529cdb40211',
											name: 'Brown napkin',
											quantity: 0,
											price: 5,
											show: false,
											option: ''
										}
									]
								},
								
							]
						}
					]
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
		updateData(type, newProduct) {
			this.instances.forEach(instance => {
				if (instance.type === "Two-Level") {
					instance.categories.forEach(category => {
						category.total = 0;
						let subCategoryTotal = 0;
						category.subCategories.forEach(subCategory => {
							subCategory.total = 0;
							let productTotal = 0;
							subCategory.products.forEach(product => {
								if (type === '-' && product.id === newProduct.id) {
									product.quantity = 0;
								}
								productTotal += product.price * product.quantity;
							});
							subCategory.total = productTotal;
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
		}
	},
	computed: {
		
	},
	mounted() {
		eventBus.$on('item-update', newProduct => {
			this.instances.forEach(instance => {
				if (instance.type === "Two-Level") {
					instance.categories.forEach(category => {
						category.subCategories.forEach(subCategory => {
							subCategory.products.forEach(product => {
								
								if (product.id === newProduct.id) {
									product.quantity = newProduct.quantity;
									this.updateData('+', newProduct);
								}
							});
						});
					});
				}
			});
    });

		eventBus.$on('remove-item', newProduct => {
			this.instances.forEach(instance => {
				if (instance.type === "Two-Level") {
					instance.categories.forEach(category => {
						category.subCategories.forEach(subCategory => {
							subCategory.products.forEach(product => {
								if (product.id === newProduct.id) {
									product.quantity = newProduct.quantity;
									this.updateData('-', newProduct);
								}
							});
						});
					});
				}
			});
		});
  }	
});

Vue.component('instance', {
	props:['instance', 'currency'],
	template: `
		<div class="card instance">
			<header class="card-header has-background-brown">
				<h2 class="card-header-title has-text-white is-uppercase">
					{{ instance.name }}
				</h2>
				<p class="card-header-title is-block has-text-white has-text-right is-uppercase">
					Total: {{ instanceTotal }} {{ currency }}
				</p>
			</header>
			<div class="card-content">
				<category v-for="category in instance.categories"  :currency="currency" :category="category" :key="category.id"></category>
			</div>
		</div>
	`,
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
		dataUpdate(newCategoryData) {
			this.$emit('data-update', newCategoryData)
		},
		showCategory(category) {
			if (category.selectedCategory === false) {
				category.selectedCategory = true;
			}
			category.show = !category.show;
		},
		categoryTotal(object) {
			this.instances.categories.forEach((category, index) => {
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
					this.instance.categories[index].total = total;
				}
			});
		},
		// updateItemAdd(object) {
		// 	this.instance.categories.forEach(category => {

		// 		subCategory.forEach((category, index) => {
		// 			if (category.id == object.id && category.name == object.name) {
		// 				category.products.forEach(product => {
		// 					if (object.product.id == product.id) {
		// 						product.quantity = object.product.quantity;
		// 						product.price = object.product.price;
		// 						product.show = object.product.show;
		// 						product.option = object.product.option;
		// 					}
		// 				});

		// 				// let productsArray = [];
		// 				// let total = 0;
		// 				// category.products.forEach(product => {
		// 				// 	productsArray.push(product.quantity * product.price);
		// 				// });
		// 				// productsArray.forEach(amount => {
		// 				// 	total += amount;
		// 				// });
		// 				// this.categories[index].total = total;
		// 			}
		// 		});
		// 	});
		// }
	},
	// created() {
	// 	this.categories.forEach(subCategory => {
	// 		subCategory.forEach((category, index) => {
	// 			let productsArray = [];
	// 			let total = 0;
	// 			category.products.forEach(product => {
	// 				productsArray.push(product.quantity * product.price);
	// 			});
	// 			productsArray.forEach(amount => {
	// 				total += amount;
	// 			});
	// 			this.categories[index].total = total;
	// 		});
	// 	});
	// }
});

Vue.component('category', {
	props: ['category', 'currency'],
	template: `
		<div class="content">
			<div class="category-picker">
				<div>{{ category.name }}</div>
			</div>

			<sub-category v-for="subCategory in category.subCategories" @data-update-add="dataUpdateAdd" :subCategory="subCategory" :currency="currency" :key="subCategory.id"></sub-category>
		</div>
	`,
	methods: {
		dataUpdateAdd(newCategoryData) {
			this.$emit('data-update-add', newCategoryData)
		}
	}
});

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
						{{ subCategory.title }}
					</p>
					<p class="">
						Sub-total: {{ subCategory.total }} {{ currency }}
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
							<tr v-else is="product" v-for="product in selectedProducts" @update-product="updateProduct" :product="product" :currency="currency" :key="product.id"></tr>
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
									<button @click="modalLoad()" class="delete" aria-label="close"></button>
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
									<button @click="modalLoad()" class="button is-success">Save changes</button>
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
			// selectedProducts: [],
			search: '',
			hover: false,
			mouseOver: false
		}
	},
	computed: {
		filteredProducts() {
			if (this.search == '') {
				return this.subCategory.products;
			}
			let products = [];
			this.subCategory.products.filter(product => {
				if (product.name.toLowerCase().includes(this.search.toLowerCase())) {
					products.push(product);
				}
			})
			return products;
		},
		selectedProducts() {
			let products = [];
			this.subCategory.products.filter(product => {
				if (product.show) {
					products.push(product);
				}
			})
			return products;
		}
	},
	methods: {
		addItem(product) {
			if (this.show == false) {
				this.show = true;
			}
			this.selectedProducts.push(product);
			let newCategoryData = {
				id: this.subCategory.id,
				name: this.subCategory.name,
				product: product
			}
			// this.$emit('data-update-add', newCategoryData);
		},
		removeItem(product) {
			let newCategoryData = {
				id: this.subCategory.id,
				name: this.subCategory.name,
				product: product
			}
			// this.$emit('data-update-remove', newCategoryData);
			this.selectedProducts.forEach((selectedProduct, index) => {
				if (selectedProduct.id == product.id) {
					this.selectedProducts.splice(index, 1);
				}
			});
			
		},
		modalLoad() {
			this.showModal = !this.showModal;
			
		},
		dataUpdate(product) {
			if (this.showModal == true) {
				this.showModal = false;
			}
			let newCategoryData = {
				id: this.subCategory.id,
				products: this.selectedProducts
			}
			this.$emit('data-update', newCategoryData);
		},
		showCategory() {
			this.show = !this.show;
		},
		updateProduct() {

		}
	},
});

Vue.component('product-list-item', {
	props: ['product', 'currency'],
	template: `
		<tr>
			<td>{{ product.name }}</td>
			<td>{{ product.price }} {{ currency }}</td>
			<td><input class="input" placeholder="Search" v-model.number="cacheQuantity"></td>
			<td>
				<button v-if="added" @click="removeProduct" class="button is-danger">Remove</button>
				<button v-else @click="addProduct" class="button is-success">Add</button>
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
			eventBus.$emit('item-update', product);
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
			
			eventBus.$emit('remove-item', product);
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
									<input class="input" name="quantity" v-model.number="product.quantity">
								</div>
								<div class="column">
									<label class="label" for="price">Price {{ currency }}</label>
									<input class="input" name="price" v-model.number="product.price">
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
			let newProduct = {
				id: this.product.id,
				name: this.product.name,
				quantity: this.product.quantity,
				price: this.product.price,
				show: this.product.show,
				option: this.product.option
			}
			eventBus.$emit('item-update', newProduct);
			this.show = !this.show;			
		},
		modalLoad() {
			this.show = !this.show;
		}
	}
});

let vm = new Vue({
	el: '#app',
	data: {
		message: 'Hello'
		
	}
});