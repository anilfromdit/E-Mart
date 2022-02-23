import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import WebFont from 'webfontloader';
import React from "react";
import { useEffect } from "react";
import Home from "./component/Home/Home.js"
import Footer from "./component/layout/Footer/Footer.js"
import ProductDetails from "./component/Product/ProductDetails.js"
import Products from "./component/Product/Products.js"
import LoginSignUp from './component/User/LoginSignUp';
import { loadUser } from './actions/userActions';
import UserOptions from "./component/layout/Header/UserOptions.js"
import { useSelector, useDispatch } from 'react-redux';
import Profile from "./component/User/Profile.js"
import UpdateProfile from "./component/User/UpdateProfile.js"
import MyNavbar from './component/layout/Header/MyNavbar';
import Page404 from './component/Misc/Page404';
// import { getOffer } from './actions/offerAction';


function App() {

  const { isAuthenticated, user } = useSelector((state) => state.user);

  const dispatch = useDispatch();

  useEffect(() => {
    WebFont.load({
      google: {
        families: ["Roboto", "Droid Sans", "Chilanka"]
      }
    });
    dispatch(loadUser());
    // dispatch(getOffer());
  }, [dispatch]);

  return (
    <Router>
      <MyNavbar/>
      {isAuthenticated && <UserOptions user={user} />}
      <Routes>
        <Route exact path='/' element={<Home />} />
        <Route exact path="/product/:id" element={<ProductDetails />} />
        <Route exact path="/products" element={<Products />} />
        <Route path="/products/:keyword" element={<Products />} />
        <Route path="/products/offer/:offer" element={<Products />} />
        <Route exact path="/account" element={<Profile />} />
        <Route exact path="/me/update" element={<UpdateProfile />} />
        <Route exact path="/login" element={<LoginSignUp />} />
        <Route path="*" element={<Page404 />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
