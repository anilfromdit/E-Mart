import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import WebFont from "webfontloader";
import React, { useState } from "react";
import { useEffect } from "react";
import Home from "./component/Home/Home";
import Footer from "./component/layout/Footer/Footer";
import ProductDetails from "./component/Product/ProductDetails";
import Products from "./component/Product/Products";
import LoginSignUp from "./component/User/LoginSignUp";
import { loadUser } from "./actions/userActions";
import UserOptions from "./component/layout/Header/UserOptions";
import { useSelector, useDispatch } from "react-redux";
import Profile from "./component/User/Profile";
import UpdateProfile from "./component/User/UpdateProfile";
import MyNavbar from "./component/layout/Header/MyNavbar";
import UpdatePassword from "./component/User/UpdatePassword";
import ForgotPassword from "./component/User/ForgotPassword";
import ResetPassword from "./component/User/ResetPassword";
import Cart from "./component/Cart/Cart";
// import Page404 from "./component/Misc/Page404";
import Loader from "./component/layout/Loader/Loader";

function App() {
  const { isAuthenticated, user } = useSelector((state) => state.user);

  const dispatch = useDispatch();

  const[show,setShow]= useState("false")

  useEffect(() => {
    WebFont.load({
      google: {
        families: ["Roboto", "Droid Sans", "Chilanka"],
      },
    });
    
    dispatch(loadUser());
    // setShow(isAuthenticated);
  }, [dispatch]);


  return (
    <Router>
      <MyNavbar />
      {/* {isAuthenticated && <UserOptions user={user} />} */}
      {show?
      <>
      {
        user && <UserOptions user={user} />
      }
      </>
      :{}
    }
      <Routes>
      <Route exact path="/" element={<Home />} />
      <Route exact path="/testLoader" element={<Loader />} />
      <Route exact path="/product/:id" element={<ProductDetails />} />
      <Route exact path="/products" element={<Products />} />
      <Route path="/products/:keyword" element={<Products />} />
      <Route path="/products/offer/:offer" element={<Products />} />
      <Route
        exact
        path="/password/reset/:token"
        element={<ResetPassword />}
      />
      <Route exact path="/login" element={<LoginSignUp />} />
      <Route exact path="/cart" element={<Cart/>} />
      <Route exact path="/account" element={<Profile />} />
      <Route exact path="/me/update" element={<UpdateProfile />} />
      <Route
        exact
        path="/password/updatePassword"
        element={<UpdatePassword />}
      />
      <Route
        exact
        path="/password/reset"
        element={<ForgotPassword />}
      />
</Routes>
      <Footer />
    </Router>
  );
}

export default App;
