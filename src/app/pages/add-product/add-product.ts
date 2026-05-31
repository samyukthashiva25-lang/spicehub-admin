import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product';
import { Product } from '../../models/product.model';
import { NotificationService } from '../../services/notification.service'; // ✅ Injected for dynamic snackbars

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './add-product.html',
  styleUrls: ['./add-product.scss']
})
export class AddProduct implements OnInit {
  isEditing: boolean = false;
  productIdFromRoute: string | null = null;

  // Live structural data representation state mapping model properties
  product: any = {
    productid: '',
    productname: '',
    category: '',
    variant: '', // Serves as the variant storage pipeline field mapping row configuration states
    description: '',
    ispublished: true,
    status: 'ACTIVE',
    tags: '',    // Comma-separated string structure mapping your customized badges design layout field
    image: '',
    images: ''
  };

  // Interactive Local Variables for Tags & Badges Feature Engine
  selectedProductTags: string[] = [];
  tagInputString: string = '';
  availablePresetBadges: string[] = ['Best Seller', 'Organic', 'Premium', 'New Arrival', 'Hot Pick'];

  variantsRows = [
    { type: 'Loose', weight: '1 kg', price: '180', minOrder: '5 kg' }
  ];

  constructor(
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private notify: NotificationService // ✅ Injected Global Toast Notification Service
  ) {}

  ngOnInit(): void {
    this.productIdFromRoute = this.route.snapshot.paramMap.get('id');
    
    if (this.productIdFromRoute) {
      this.isEditing = true;
      this.loadProductForEditing(this.productIdFromRoute);
    } else {
      this.generateSequentialProductId();
    }
  }

  generateSequentialProductId(): void {
    this.productService.getAllProducts().subscribe({
      next: (products: Product[]) => {
        const baseNumber = 100;
        const nextSequenceNumber = baseNumber + products.length + 1;
        this.product.productid = `SPH-${nextSequenceNumber}`;
        this.cdr.markForCheck(); 
      },
      error: (err: unknown) => {
        this.product.productid = 'SPH-' + Date.now().toString().slice(-4);
        this.notify.warning('Sequence generation error; defaulted catalog reference key to timestamp code.'); // ✅ Replaced console.error with Warning Snackbar
        this.cdr.markForCheck();
      }
    });
  }

  loadProductForEditing(id: string): void {
    this.productService.getAllProducts().subscribe({
      next: (products: Product[]) => {
        const foundProduct = products.find(p => p.id === id || p.productid === id);
        
        if (foundProduct) {
          this.product = {
            ...foundProduct,
            ispublished: foundProduct.status === 'ACTIVE'
          };

          // Corrected Mapping Array Hook for Product Variant Parameters Matrix
          if (foundProduct.variant) {
            try {
              // Extract matrix strings safely out of variant data container slots
              this.variantsRows = JSON.parse(foundProduct.variant);
            } catch (e) {
              this.notify.warning('Handling variants raw structure string formatting injection fallback.'); // ✅ Replaced console.warn with Warning Snackbar
            }
          }

          // Hydrate Tags & Badges string safely back into an isolated layout array for UI processing
          if (foundProduct.tags) {
            this.selectedProductTags = foundProduct.tags
              .split(',')
              .map(t => t.trim())
              .filter(t => t.length > 0);
          } else {
            this.selectedProductTags = [];
          }

          this.cdr.markForCheck();
        } else {
          this.notify.error(`Target product missing or metadata profile could not be found: ${id}`); // ✅ Replaced console.error with Error Snackbar
          this.router.navigate(['/products']);
        }
      },
      error: (err: unknown) => this.notify.error('Database catalog resolution failure on server.') // ✅ Replaced console.error with Error Snackbar
    });
  }

  // Interactive UI Selection Methods for Tags & Badges Panel Component
  togglePresetBadge(badge: string): void {
    const index = this.selectedProductTags.indexOf(badge);
    if (index > -1) {
      this.selectedProductTags.splice(index, 1); // Deselect badge element if it already exists
    } else {
      this.selectedProductTags.push(badge);      // Inject item into active collection array row
    }
    this.syncTagsToProductModel();
  }

  addCustomTag(event: Event): void {
    event.preventDefault();
    const tagText = this.tagInputString.trim();
    
    if (tagText && !this.selectedProductTags.includes(tagText)) {
      this.selectedProductTags.push(tagText);
      this.notify.success(`Custom badge label "${tagText}" appended.`); // ✅ Success Snackbar
    }
    this.tagInputString = ''; // Reset textual input placeholder string field instantly
    this.syncTagsToProductModel();
  }

  removeCustomTag(index: number): void {
    this.selectedProductTags.splice(index, 1);
    this.syncTagsToProductModel();
  }

  private syncTagsToProductModel(): void {
    // Flatten array parameters out into a clean, comma-separated string required by your database model interface
    this.product.tags = this.selectedProductTags.join(', ');
    this.cdr.markForCheck();
  }

  getTagThemeClass(tag: string): string {
    const normalized = tag.toLowerCase().trim();
    if (normalized.includes('best')) return 'best-seller';
    if (normalized.includes('organic')) return 'organic';
    if (normalized.includes('premium')) return 'premium';
    if (normalized.includes('new')) return 'new-arrival';
    if (normalized.includes('hot')) return 'hot-pick';
    return 'tag-default';
  }

  handleProductImageUpload(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      
      reader.onload = (e: any) => {
        const img = new Image();
        img.src = e.target.result;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          let width = img.width;
          let height = img.height;
          const max_size = 800; 
          
          if (width > height) {
            if (width > max_size) {
              height *= max_size / width;
              width = max_size;
            }
          } else {
            if (height > max_size) {
              width *= max_size / height;
              height = max_size;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
            
            this.product.image = compressedBase64;
            this.product.images = compressedBase64; 
            this.cdr.detectChanges();
            this.notify.info('Catalog display thumbnail compressed and parsed.'); // ✅ Info Snackbar
          }
        };
      };
      reader.readAsDataURL(file);
    }
  }

  addNewVariantRow(): void {
    this.variantsRows = [...this.variantsRows, { type: '', weight: '', price: '', minOrder: '' }];
    this.cdr.markForCheck();
  }

  removeVariantRow(index: number): void {
    if (this.variantsRows.length > 1) {
      this.variantsRows.splice(index, 1);
      this.variantsRows = [...this.variantsRows]; 
      this.cdr.markForCheck();
    }
  }

  saveFullProduct(isDraft: boolean = false): void {
    if (!this.product.productname || !this.product.category) {
      this.notify.warning('Please fill out all mandatory fields marked with an asterisk (*).'); // ✅ Replaced template alert with Warning Snackbar
      return;
    }

    // Automatically assign status based on which button was clicked
    if (isDraft) {
      this.product.ispublished = false;
      this.product.status = 'DRAFT';
    } else {
      this.product.ispublished = true;
      this.product.status = 'ACTIVE';
    }
    
    // Build neat delivery model payload matching your Firestore schemas cleanly
    const finalPayload = {
      ...this.product,
      variant: JSON.stringify(this.variantsRows), // Encodes rows data cleanly into variant properties framework
      tags: this.product.tags                     // Safely preserves curated badges listing collection
    };

    if (this.isEditing && this.productIdFromRoute) {
      this.productService.updateProduct(this.productIdFromRoute, finalPayload).subscribe({
        next: (response: any) => {
          this.notify.success(`"${this.product.productname}" has been modified successfully.`); // ✅ Replaced console log with Success Snackbar
          this.router.navigate(['/products']);
        },
        error: (err: unknown) => this.notify.error('Failed to commit item database modifications.') // ✅ Replaced console error with Error Snackbar
      });
    } else {
      this.productService.addProduct(finalPayload).subscribe({
        next: (response: any) => {
          this.notify.success(
            isDraft 
              ? `"${this.product.productname}" saved to staging drafts folder.` 
              : `"${this.product.productname}" published live to inventory indices.`
          ); // ✅ Replaced console log with tailored Success Snackbar
          this.router.navigate(['/products']);
        },
        error: (err: unknown) => this.notify.error('Failed to provision new catalog item document row.') // ✅ Replaced console error with Error Snackbar
      });
    }
  }
}