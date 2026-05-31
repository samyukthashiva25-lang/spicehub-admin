import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product';
import { Product } from '../../models/product.model';
import { Router, RouterLink } from '@angular/router';
import { NotificationService } from '../../services/notification.service'; // ✅ Injected for dynamic snackbars

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './product-management.html',
  styleUrls: ['./product-management.scss']
})
export class ProductManagement implements OnInit {
  // Clean master data source background cache to avoid repetitive backend round-trips
  masterProductsList: Product[] = [];

  // Entire filtered dataset array matching active criteria filters
  productsList: Product[] = [];
  
  // Track what is currently sliced onto the visible data grid view page
  paginatedProductsList: Product[] = [];

  // Pagination Configuration State (Defaulted to 25 records per specifications)
  currentPage: number = 1;
  pageSize: number = 25; 
  totalPages: number = 1;

  // Live real-time text query tracking property
  searchQuery: string = '';
  
  // Component overlay UI side-drawer viewport conditional toggle visibility flag
  isFilterDrawerOpen: boolean = false;

  // Multi-option state object structure tracking parameters from your slide-out panel
  filterState = {
    category: 'ALL',
    status: 'ALL',
    stockLevel: 'ALL',
    variantType: 'ALL',
    maxPrice: 1200 
  };

  // Live Analytics Properties
  totalProductsCount: number = 0;
  activeProductsCount: number = 0;
  categoriesCount: number = 0;
  categoriesListSummary: string = 'Spices, Nuts, Dry Fruits...';

  constructor(
    private productService: ProductService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private notify: NotificationService // ✅ Injected Global Toast Notification Service
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  // Automatically calculates dashboard values from the live API response array
  calculateDashboardMetrics(products: Product[]): void {
    this.totalProductsCount = products.length;
    
    this.activeProductsCount = products.filter(p => p.status === 'ACTIVE' || p.ispublished === true).length;
    
    // Calculate unique categories dynamically from API values
    const uniqueCategories = new Set(products.map(p => p.category).filter(Boolean));
    this.categoriesCount = uniqueCategories.size;

    // Generate dynamic category preview text from current database listings
    if (uniqueCategories.size > 0) {
      const distinctCategoriesArray = Array.from(uniqueCategories);
      const primaryPreview = distinctCategoriesArray.slice(0, 3).join(', ');
      this.categoriesListSummary = distinctCategoriesArray.length > 3 
        ? `${primaryPreview}...` 
        : primaryPreview;
    } else {
      this.categoriesListSummary = 'No categories found';
    }
    
    this.cdr.markForCheck();
  }

  openAddProductModal(): void {
    this.router.navigate(['/products/add']);
  }

  loadProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (products: Product[]) => {
        // Hydrate backend list payload directly into master cache storage array layers
        this.masterProductsList = [...products];
        
        // Trigger calculation using fresh backend records
        this.calculateDashboardMetrics(this.masterProductsList);
        
        // Reset back to page 1 whenever fresh database loads occur
        this.currentPage = 1;
        
        // Pipe baseline data through filter evaluation gates to paint screen rows accurately
        this.applyProductFilterMapping();
      },
      error: (err: unknown) => {
        this.notify.error('Failed to sync product lines from database cluster.'); // ✅ Replaced console.error with Error snackbar
        this.masterProductsList = [];
        this.productsList = [];
        this.paginatedProductsList = [];
        this.calculateDashboardMetrics([]); // Reset counters safely on failure
        this.cdr.markForCheck();
      }
    });
  }

  // Interactive UI Layout Trigger Toggles
  toggleFilterDrawer(isOpen: boolean): void {
    this.isFilterDrawerOpen = isOpen;
    this.cdr.markForCheck();
  }

  // Stream trigger bound onto your Search input's (input) change listener
  filterProducts(): void {
    this.currentPage = 1; // Reset window viewport back to first page on keystroke filter change
    this.applyProductFilterMapping();
  }

  // Triggers when admin clicks "Reset All Filters" button inside drawer panel footer
  resetFilters(): void {
    this.filterState = {
      category: 'ALL',
      status: 'ALL',
      stockLevel: 'ALL',
      variantType: 'ALL',
      maxPrice: 1200
    };
    this.searchQuery = ''; // Clear keyword input matching reset privileges
    this.currentPage = 1;
    this.applyProductFilterMapping();
    this.toggleFilterDrawer(false);
    this.notify.info('Product filters have been reset.'); // ✅ Info Snackbar
  }

  // Triggers when admin clicks "Apply Filters" button inside drawer panel footer
  applyFilters(): void {
    this.currentPage = 1;
    this.applyProductFilterMapping();
    this.toggleFilterDrawer(false);
    this.notify.success('Catalog filters applied successfully.'); // ✅ Success Snackbar
  }

  // PAGINATION WINDOW NAVIGATION HANDLERS
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginationSlice();
    }
  }

  onPageSizeChange(newSize: any): void {
    this.pageSize = Number(newSize.target.value);
    this.currentPage = 1; // Reset view back to start to prevent out-of-bounds math indices
    this.applyProductFilterMapping();
  }

  private updatePaginationSlice(): void {
    // Calculate dynamic pagination thresholds
    this.totalPages = Math.ceil(this.productsList.length / this.pageSize) || 1;
    
    // Safety guard rails for out-of-bounds checks
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    // Perform the page array slice to populate the screen array
    this.paginatedProductsList = this.productsList.slice(startIndex, endIndex);
    this.cdr.markForCheck();
  }

  // CORE COMBINED FILTER PIPELINE ENGINE (Chains Search Queries and Panel State settings)
  private applyProductFilterMapping(): void {
    const queryNormalized = this.searchQuery ? this.searchQuery.trim().toLowerCase() : '';

    this.productsList = this.masterProductsList.filter((product: Product) => {
      
      // 1. Text Title checking constraint gate
      if (queryNormalized && (!product.productname || !product.productname.toLowerCase().includes(queryNormalized))) {
        return false;
      }

      // 2. Category drop checking gate
      if (this.filterState.category !== 'ALL' && product.category !== this.filterState.category) {
        return false;
      }

      // 3. Status Value flag normalization check gate
      if (this.filterState.status !== 'ALL') {
        const currentStatus = product.status ? product.status.toUpperCase() : '';
        const targetStatus = this.filterState.status.toUpperCase();
        
        if (targetStatus === 'ACTIVE' && currentStatus !== 'ACTIVE' && currentStatus !== 'APPROVED') {
          return false;
        }
        if (targetStatus !== 'ACTIVE' && currentStatus !== targetStatus) {
          return false;
        }
      }

      // 4. Stock Level evaluation processing checks safely parsing variant strings
      if (this.filterState.stockLevel !== 'ALL' || this.filterState.variantType !== 'ALL' || product.variant) {
        try {
          const parsedVariants = product.variant ? JSON.parse(product.variant) : [];
          const primaryVariant = Array.isArray(parsedVariants) && parsedVariants.length > 0 ? parsedVariants[0] : null;

          // A. Parse Variant Dropdown Type rules
          if (this.filterState.variantType !== 'ALL') {
            if (!primaryVariant || primaryVariant.type !== this.filterState.variantType) {
              return false;
            }
          }

          // B. Parse Stock Level quantity constraints if present inside variant parameters
          if (this.filterState.stockLevel !== 'ALL') {
            const stockQty = primaryVariant && primaryVariant.stock !== undefined ? Number(primaryVariant.stock) : 0;
            
            if (this.filterState.stockLevel === 'In Stock' && stockQty <= 10) return false;
            if (this.filterState.stockLevel === 'Low Stock' && (stockQty <= 0 || stockQty > 10)) return false;
            if (this.filterState.stockLevel === 'Out of Stock' && stockQty > 0) return false;
          }

          // C. Parse Price Range max sliders tracking variant price per kg bounds
          if (primaryVariant && primaryVariant.price !== undefined) {
            if (Number(primaryVariant.price) > this.filterState.maxPrice) {
              return false;
            }
          }
        } catch (e) {
          this.notify.warning(`Could not parse sub-variant profiles for ${product.productname || 'item'}.`); // ✅ Replaced console.warn with Warning Snackbar
        }
      }

      return true; 
    });

    // Re-calculate visible blocks based on the final filtered result count
    this.updatePaginationSlice();
  }

  togglePublish(product: Product): void {
    product.ispublished = !product.ispublished;
    product.status = product.ispublished ? 'ACTIVE' : 'INACTIVE';
    
    const targetId = product.id || product.productid;
    
    if (targetId) {
      this.productService.updateProduct(targetId, product).subscribe({
        next: (response: any) => {
          this.notify.success(`"${product.productname}" visibility status modified successfully.`); // ✅ Replaced console log with Success snackbar
          this.loadProducts();
        },
        error: (err: unknown) => {
          this.notify.error('Failed to commit item visibility state adjustments.'); // ✅ Replaced console error with Error snackbar
          product.ispublished = !product.ispublished;
          product.status = product.ispublished ? 'ACTIVE' : 'INACTIVE';
          this.applyProductFilterMapping();
        }
      });
    }
  }

  deleteProduct(id: string | undefined): void {
    if (!id) return;
    
    if (confirm('Are you sure you want to permanently delete this product document?')) {
      this.productService.deleteProduct(id).subscribe({
        next: (response: any) => {
          this.notify.success('Product document deleted from catalog collection.'); // ✅ Replaced console log with Success snackbar
          this.loadProducts(); 
        },
        error: (err: unknown) => {
          this.notify.error('Could not clean target item reference from collection rows.'); // ✅ Replaced console error with Error snackbar
        }
      });
    }
  }

  getVariantLabel(variantStr: string): string {
    try {
      const parsed = JSON.parse(variantStr);
      const primary = Array.isArray(parsed) ? parsed[0] : parsed;
      return primary ? `${primary.type} - Rs.${primary.price}` : 'Configured';
    } catch(e) {
      return variantStr || 'Configured';
    }
  }
}