export interface User {
  uid: string;          // Firebase Auth UID mapped via @DocumentId
  shopname: string;     // Matches private String shopname;
  ownername: string;    // Matches private String ownername;
  phonenumber: string;  // Matches private String phonenumber;
  emailid: string;      // Matches private String emailid;
  password?: string;    // Optional field (marked with ?), used during registration
  gstnumber: string;    // Matches private String gstnumber;
  image: string;        // Matches private String image;
  creditlimit: number;  // Matches private long creditlimit;
  status: string;       // "PENDING", "APPROVED", "REJECTED"
  role: string;         // "VENDOR" or "ADMIN"
}