export interface Book {
  id: string; // category-
  name: string;
  author: string;
  category: string;
  inputTime: number;
  price: number;
  coverSrc: string;
  imgSrc: string[];
  status: boolean; // true: 在售 false: 下架
}
