export interface Bill {
  id: string;
  userName: string;
  email: string;
  bookName: string;
  bookID: string;
  price: number;
  time: number;
  deliveryType: number; // 配送方式 0：自取 1：配送
  address?: string;
  status: number; // -1：审核不通过 0：取消 1：提交待审核 2：审核通过 3：已完成
}
