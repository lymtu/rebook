export interface Book {
  id: string; // category-DateTransformed
  name: string;
  author: string;
  category: string;
  inputTime: number;
  status: boolean; // true: 在售 false: 下架
  price: number;
  coverSrc: string;
  imgSrc: string[];
}
