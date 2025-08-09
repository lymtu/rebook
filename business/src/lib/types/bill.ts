export interface Bill {
  id: string;
  userName: string;
  email: string;
  bookName: string;
  bookID: string;
  price: number;
  time: number;
  status: number; // -1：审核不通过 0：取消 1：提交待审核 2：审核通过 3：已完成
}
