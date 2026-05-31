export interface Product {
  id?: string;          // Firestore Document ID
  productid: string;    // Custom string identifier
  productname: string;
  category: string;
  description: string;
  images: string;       // Image URL string
  ispublished: boolean;
  status: string;
  tags: string;
  variant: string;
}