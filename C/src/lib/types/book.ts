export interface Book {
  id: string; // type-MM-DD-YY
  name: string;
  author: string;
  category: string;
  inputTime: number;
  status: boolean; // true: 在售 false: 下架
  price: number;
  coverSrc: string;
  imgSrc: string[];
}
