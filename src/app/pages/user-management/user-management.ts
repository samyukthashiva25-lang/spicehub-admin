import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user'; 
import { User } from '../../models/user.model';
import { NotificationService } from '../../services/notification.service'; // ✅ Injected for dynamic snackbars

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.html',
  styleUrls: ['./user-management.scss']
})
export class UserManagement implements OnInit {
  activeTab: 'list' | 'approvals' = 'list';
  searchQuery: string = '';
  isUserModalOpen: boolean = false;
  isDetailsModalOpen: boolean = false;
  selectedUser: any = null;
  isLightboxOpen: boolean = false;
  lightboxTargetUser: any = null;
  
  isFilterDrawerOpen: boolean = false;

  filterState = {
    status: 'ALL',
    maxCreditLimit: 1000000,
    taxType: 'ALL'
  };

  // Master storage backups to retain data rows safely during filter operations
  masterUsersList: User[] = [];
  masterApprovalsList: User[] = [];

  // Filtered dataset arrays matching active criteria filters
  usersList: User[] = [];
  approvalsList: User[] = [];
  
  // ✅ Paginated View Slices to be bound to your template HTML loops
  paginatedUsersList: User[] = [];
  paginatedApprovalsList: User[] = [];

  // ✅ Independent Pagination Configuration States (Defaulted to 25 items per row)
  userCurrentPage: number = 1;
  userPageSize: number = 25;
  userTotalPages: number = 1;

  approvalCurrentPage: number = 1;
  approvalPageSize: number = 25;
  approvalTotalPages: number = 1;

  newUser: any = this.getEmptyUserObject();

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private notify: NotificationService // ✅ Injected Service Injection
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  toggleFilterDrawer(isOpen: boolean): void {
    this.isFilterDrawerOpen = isOpen;
    this.cdr.markForCheck();
  }

  resetFilters(): void {
    this.filterState = {
      status: 'ALL',
      maxCreditLimit: 1000000,
      taxType: 'ALL'
    };
    this.searchQuery = ''; 
    
    this.userCurrentPage = 1;
    this.approvalCurrentPage = 1;

    this.applyFilterMapping();
    this.toggleFilterDrawer(false);
    this.notify.info('Search filters have been reset.'); // ✅ Info Snackbar
  }

  applyFilters(): void {
    this.userCurrentPage = 1;
    this.approvalCurrentPage = 1;
    this.applyFilterMapping();
    this.toggleFilterDrawer(false);
    this.notify.success('Filters applied successfully.'); // ✅ Success Snackbar
  }

  openViewDetailsModal(user: User): void {
    this.selectedUser = { ...user };
    this.isDetailsModalOpen = true;
    this.cdr.markForCheck(); 
  }

  closeViewDetailsModal(): void {
    this.isDetailsModalOpen = false;
    this.selectedUser = null;
    this.cdr.markForCheck();
  }

  openImagePreviewLightbox(userRecord: any): void {
    if (!userRecord || !userRecord.image) {
      this.notify.warning('No shop board document photo attachment linked with this signup registration.'); // ✅ Warning Snackbar replacement
      return;
    }
    this.lightboxTargetUser = userRecord;
    this.isLightboxOpen = true;
    this.cdr.markForCheck(); 
  }

  closeImagePreviewLightbox(): void {
    this.isLightboxOpen = false;
    this.lightboxTargetUser = null;
    this.cdr.markForCheck();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (data: User[]) => {
        const immutableData = [...data];
        
        this.masterUsersList = immutableData.filter((u: User) => u.status === 'APPROVED' || u.status === 'ACTIVE' || u.status === 'INACTIVE');
        this.masterApprovalsList = immutableData.filter((u: User) => u.status === 'PENDING');
        
        this.userCurrentPage = 1;
        this.approvalCurrentPage = 1;

        this.applyFilterMapping();
      },
      error: (err: unknown) => {
        this.notify.error('Failed to sync user records from the database cluster.'); // ✅ Error Snackbar replacement
        this.masterUsersList = [];
        this.masterApprovalsList = [];
        this.usersList = [];
        this.approvalsList = [];
        this.paginatedUsersList = [];
        this.paginatedApprovalsList = [];
        this.cdr.markForCheck();
      }
    });
  }

  filterUsersByShopName(): void {
    this.userCurrentPage = 1;
    this.approvalCurrentPage = 1;
    this.applyFilterMapping();
  }

  goToUserPage(page: number): void {
    if (page >= 1 && page <= this.userTotalPages) {
      this.userCurrentPage = page;
      this.updateUserPaginationSlice();
    }
  }

  onUserPageSizeChange(event: any): void {
    this.userPageSize = Number(event.target.value);
    this.userCurrentPage = 1;
    this.updateUserPaginationSlice();
  }

  private updateUserPaginationSlice(): void {
    this.userTotalPages = Math.ceil(this.usersList.length / this.userPageSize) || 1;
    
    if (this.userCurrentPage > this.userTotalPages) {
      this.userCurrentPage = this.userTotalPages;
    }

    const startIndex = (this.userCurrentPage - 1) * this.userPageSize;
    const endIndex = startIndex + this.userPageSize;
    
    this.paginatedUsersList = this.usersList.slice(startIndex, endIndex);
    this.cdr.markForCheck();
  }

  goToApprovalPage(page: number): void {
    if (page >= 1 && page <= this.approvalTotalPages) {
      this.approvalCurrentPage = page;
      this.updateApprovalPaginationSlice();
    }
  }

  onApprovalPageSizeChange(event: any): void {
    this.approvalPageSize = Number(event.target.value);
    this.approvalCurrentPage = 1;
    this.updateApprovalPaginationSlice();
  }

  private updateApprovalPaginationSlice(): void {
    this.approvalTotalPages = Math.ceil(this.approvalsList.length / this.approvalPageSize) || 1;

    if (this.approvalCurrentPage > this.approvalTotalPages) {
      this.approvalCurrentPage = this.approvalTotalPages;
    }

    const startIndex = (this.approvalCurrentPage - 1) * this.approvalPageSize;
    const endIndex = startIndex + this.approvalPageSize;

    this.paginatedApprovalsList = this.approvalsList.slice(startIndex, endIndex);
    this.cdr.markForCheck();
  }

  private applyFilterMapping(): void {
    const query = this.searchQuery ? this.searchQuery.trim().toLowerCase() : '';

    const matchesCriteria = (user: User): boolean => {
      if (query && (!user.shopname || !user.shopname.toLowerCase().includes(query))) {
        return false;
      }

      if (user.creditlimit !== undefined && user.creditlimit > this.filterState.maxCreditLimit) {
        return false;
      }

      if (this.filterState.taxType === 'GST' && (!user.gstnumber || user.gstnumber.trim() === '')) {
        return false;
      }

      return true;
    };

    if (this.filterState.status === 'ALL') {
      this.usersList = this.masterUsersList.filter(matchesCriteria);
      this.approvalsList = this.masterApprovalsList.filter(matchesCriteria);
    } 
    else if (this.filterState.status === 'PENDING') {
      this.usersList = [];
      this.approvalsList = this.masterApprovalsList.filter(matchesCriteria);
    } 
    else {
      this.usersList = this.masterUsersList
        .filter((u: User) => u.status === this.filterState.status)
        .filter(matchesCriteria);
      this.approvalsList = []; 
    }
    
    this.updateUserPaginationSlice();
    this.updateApprovalPaginationSlice();
  }

  getEmptyUserObject() {
    return {
      uid: '', shopname: '', ownername: '', phonenumber: '',
      emailid: '', gstnumber: '', creditlimit: 10000, image: '', status: 'PENDING'
    };
  }

  openAddUserModal(): void {
    this.newUser = this.getEmptyUserObject();
    this.isUserModalOpen = true;
    this.cdr.markForCheck();
  }

  closeUserModal(): void {
    this.isUserModalOpen = false;
    this.cdr.markForCheck();
  }

  handleImageUpload(event: any): void {
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
            this.newUser.image = compressedBase64;
            
            this.cdr.detectChanges();
            this.notify.info('Shop board image safely downscaled and prepared.'); // ✅ Info Snackbar replacement
          }
        };
      };
      reader.readAsDataURL(file);
    }
  }

  submitUserForm(): void {
  // 1. Structural Mandatory Field Valdiation Gates
  if (!this.newUser.shopname?.trim()) {
    this.notify.warning('Shop Name is required to register a profile.');
    return;
  }
  
  if (!this.newUser.ownername?.trim()) {
    this.notify.warning('Owner Name is a required field.');
    return;
  }

  // 2. Contact Phone Number Normalization and Match Validation
  const cleanPhone = this.newUser.phonenumber ? String(this.newUser.phonenumber).trim() : '';
  const phoneRegex = /^[6-9]\d{9}$/; // Validates typical 10-digit smartphone sequence variants
  
  if (!cleanPhone) {
    this.notify.warning('Please enter a valid primary mobile contact phone number.');
    return;
  } else if (!phoneRegex.test(cleanPhone)) {
    this.notify.warning('Invalid Phone Number. Please provide a standard 10-digit mobile number.');
    return;
  }

  // 3. Email Validation Syntax Processing Engine Check
  const cleanEmail = this.newUser.emailid ? this.newUser.emailid.trim().toLowerCase() : '';
  // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // if (!cleanEmail) {
  //   this.notify.warning('Email address is mandatory for invoice processing tracking.');
  //   return;
  // } else if (!emailRegex.test(cleanEmail)) {
  //   this.notify.warning('The email address format provided is invalid.');
  //   return;
  // }

  // 4. Conditional Tax Profile GST Structural Validation Gate
  const cleanGst = this.newUser.gstnumber ? this.newUser.gstnumber.trim().toUpperCase() : '';
  if (this.filterState.taxType === 'GST' || cleanGst.length > 0) {
    const gstRegex = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/;
    
    if (!cleanGst) {
      this.notify.warning('A valid GST identification record number must be tied to tax files.');
      return;
    } else if (!gstRegex.test(cleanGst)) {
      this.notify.warning('Invalid GSTIN format structure. Must match standard 15-character statutory limits.');
      return;
    }
  }

  // 5. Credit Limit Floor Limit Controls Checks
  if (this.newUser.creditlimit === undefined || this.newUser.creditlimit === null || this.newUser.creditlimit < 0) {
    this.notify.warning('Please assign a safe baseline credit limit threshold value greater than or equal to 0.');
    return;
  }

  // ⚠️ Format fields cleanly to standardize raw strings into clear data payloads
  const formatPayload = {
    ...this.newUser,
    shopname: this.newUser.shopname.trim(),
    ownername: this.newUser.ownername.trim(),
    phonenumber: cleanPhone,
    emailid: cleanEmail,
    gstnumber: cleanGst || 'N/A', // Set default fallback if unassigned
    status: 'PENDING' // Ensures it naturally flows cleanly into registration approvals view tab queues
  };

  // 6. Safe Pipeline Dispatch Execution Layer
  this.userService.createUser(formatPayload).subscribe({
    next: (response: any) => {
      this.notify.success(`User account profile for "${formatPayload.shopname}" was successfully requested.`);
      this.loadUsers(); // Dynamic table reload refresh
      this.closeUserModal(); // Terminate window modal visibility tree safely
    },
    error: (err: unknown) => {
      this.notify.error('Could not submit details. Server responded with a structural verification rejection exception.');
    }
  });
}

  toggleUserStatus(user: User): void {
    const userId = user.uid || '';
    const updatedStatus = user.status === 'INACTIVE' ? 'APPROVED' : 'INACTIVE';
    
    const finalPayload = { 
      ...user, 
      status: updatedStatus 
    };

    this.userService.updateCreditLimit(userId, finalPayload).subscribe({
      next: (response: any) => {
        this.notify.success(`Status for "${user.shopname}" modified to ${updatedStatus === 'APPROVED' ? 'Active' : 'Inactive'}.`); // ✅ Success Snackbar replacement
        user.status = updatedStatus; 
        this.applyFilterMapping(); 
      },
      error: (err: unknown) => {
        this.notify.error('Failed to change authorization status tracking flags.'); // ✅ Error Snackbar replacement
      }
    });
  }

  handleApprove(user: User): void {
    const userId = user.uid || '';
    
    const finalPayload = { 
      ...user, 
      status: 'APPROVED' 
    };

    this.userService.updateCreditLimit(userId, finalPayload).subscribe({
      next: (response: any) => {
        this.notify.success(`Registration form accepted for "${user.shopname}".`); // ✅ Success Snackbar replacement
        this.loadUsers(); 
      },
      error: (err: unknown) => {
        this.notify.error('Failed to execute account activation approval process.'); // ✅ Error Snackbar replacement
      }
    });
  }

  handleReject(user: User): void {
    const userId = user.uid || '';
    
    const finalPayload = { 
      ...user, 
      status: 'REJECTED'
    };

    this.userService.updateCreditLimit(userId, finalPayload).subscribe({
      next: (response: any) => {
        this.notify.warning(`Registration request for "${user.shopname}" has been rejected.`); // ✅ Warning Snackbar replacement
        this.loadUsers(); 
      },
      error: (err: unknown) => {
        this.notify.error('Failed to process submission rejection notice.'); // ✅ Error Snackbar replacement
      }
    });
  }
}