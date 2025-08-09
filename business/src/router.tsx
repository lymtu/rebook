import { BrowserRouter, Routes, Route } from "react-router";

import Layout from "@/layout";
import Index from "@/routes/index";
import SignIn from "@/routes/signin";

import Admin from "@/routes/admin";
import BookList from "@/routes/book/list";
import BookAdd from "@/routes/book/add";

import Bill from "@/routes/bill";

import NoticeList from "@/routes/notice/list";
import NotiveAdd from "@/routes/notice/add";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route element={<Layout />}>
          <Route index element={<Index />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/book-list" element={<BookList />} />
          <Route path="/book-add" element={<BookAdd />} />
          <Route path="/bill-list" element={<Bill />} />
          <Route path="/notice-list" element={<NoticeList />} />
          <Route path="/notice-add" element={<NotiveAdd />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
