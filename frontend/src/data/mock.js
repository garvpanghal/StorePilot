export const products=[
 {id:1,name:'Amul Milk 500ml',category:'Grocery',price:32,stock:18,status:'Low Stock',sales:2450},
 {id:2,name:'Tata Salt 1kg',category:'Grocery',price:28,stock:76,status:'In Stock',sales:1980},
 {id:3,name:'Maggi 70g',category:'Snacks',price:15,stock:92,status:'In Stock',sales:1520},
 {id:4,name:'Aashirvaad Atta 1kg',category:'Grocery',price:62,stock:43,status:'In Stock',sales:1320},
 {id:5,name:'Parle-G Biscuit 100g',category:'Snacks',price:10,stock:11,status:'Low Stock',sales:1150},
 {id:6,name:'Coca-Cola 750ml',category:'Beverages',price:45,stock:35,status:'In Stock',sales:980},
 {id:7,name:'Surf Excel 1kg',category:'Personal Care',price:120,stock:5,status:'Critical',sales:760},
 {id:8,name:'Fortune Sunflower Oil 1L',category:'Grocery',price:145,stock:28,status:'In Stock',sales:690}
];
export const sales=[
 ['INV-1001','Walk-in Customer',5,'₹560.00','Cash','28 May, 10:30 AM'],
 ['INV-1002','Rajesh Kumar',3,'₹230.00','UPI','28 May, 10:15 AM'],
 ['INV-1003','Walk-in Customer',7,'₹785.00','Cash','28 May, 09:45 AM'],
 ['INV-1004','Priya Sharma',2,'₹120.00','Card','28 May, 09:30 AM']
];
export const chart=[
 ['1 May',12,8],['4 May',18,10],['7 May',25,13],['10 May',24,11],['14 May',32,18],['17 May',28,20],['21 May',36,22],['24 May',45,26],['26 May',39,24],['28 May',32,20]
].map(([date,current,last])=>({date,current,last}));
