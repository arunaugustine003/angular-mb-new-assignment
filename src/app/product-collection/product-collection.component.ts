import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ProductService } from './../services/product.service';

@Component({
  selector: 'app-product-collection',
  templateUrl: './product-collection.component.html',
  styleUrls: ['./product-collection.component.scss'],
})
export class ProductCollectionComponent implements OnInit {
  @Input() products!: any[];
  @Output() refresh = new EventEmitter<string>();

  page = 1;
  selectedColor = 'All';
  sortBy = 'title';
  selectedProduct!: any;

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.selectedProduct = { title: 'Violet - 10mm Glass Beads' };
    this.productService.getProducts().subscribe((products) => {
      this.products = products as any[];
      this.refreshCollection(this.sortBy);
    });
  }
  filterByColor(color: string) {
    if (color === '') {
      return this.products;
    }
    return this.products.filter(product => product.title.includes(color));
  }
  sortProducts(attribute: string) {
    if (attribute === 'price') {
      this.products.sort((a, b) => {
        return Number(a.variants[0][attribute]) - Number(b.variants[0][attribute]);
      });
    } else if (attribute === 'weight' || attribute === 'inventory_quantity') {
      this.products.sort((a, b) => {
        return a.variants[0][attribute] - b.variants[0][attribute];
      });
    } else {
      this.products.sort((a, b) => {
        if (a[attribute] < b[attribute]) {
          return -1;
        }
        if (a[attribute] > b[attribute]) {
          return 1;
        }
        return 0;
      });
    }
  }
  refreshCollection(attribute: string) {
    //Start of refreshCollection()
    // Sort products by attribute
    this.sortProducts(attribute);
    // Shuffle/Randomize products within each color group
    const colorGroups = [
      'Red',
      'Green',
      'Blue',
      'Yellow',
      'Pink',
      'Orange',
      'Purple',
      'Brown',
    ];
    colorGroups.forEach((color) => {
      this.products.forEach((product, i) => {
        if (product.title.includes(color)) {
          const temp = this.products[i];
          const randomIndex = Math.floor(Math.random() * this.products.length);
          this.products[i] = this.products[randomIndex];
          this.products[randomIndex] = temp;
        }
      });
    });
    // Shuffle color groups
    for (let i = colorGroups.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [colorGroups[i], colorGroups[j]] = [colorGroups[j], colorGroups[i]];
    }
    // Move products with "inventory_quantity": 0 to the end of the array
    this.products = this.products.sort((a, b) => {
      if (
        a.variants[0].inventory_quantity === 0 &&
        b.variants[0].inventory_quantity !== 0
      ) {
        return 1;
      }
      if (
        a.variants[0].inventory_quantity !== 0 &&
        b.variants[0].inventory_quantity === 0
      ) {
        return -1;
      }
      return 0;
    });
    // this.refresh.emit('Collection refreshed');
    //End of refreshCollection()
  }
  selectProduct(product: any) {
    this.selectedProduct = product;
  }
  previousPage() {
    if (this.page > 1) {
      this.page--;
    }
  }

  nextPage() {
    if (this.page < Math.ceil(this.products.length / 20)) {
      this.page++;
    }
  }
}
