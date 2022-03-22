import React, { useEffect } from "react";
import "./dashboard.css";
import Sidebar from "./Sidebar.js";
import MetaData from "../layout/MetaData";
import { Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { Doughnut} from 'react-chartjs-2';
import { useSelector, useDispatch } from "react-redux";
import { getAdminProduct } from "../../actions/productActions";
import { getAllOrders } from "../../actions/orderAction.js";
import { getAllUsers } from "../../actions/userActions";

const Dashboard = () => {
    const dispatch = useDispatch();

    const { products } = useSelector((state) => state.products);
    const { orders } = useSelector((state) => state.allOrders);

    const { users } = useSelector((state) => state.allUsers);

    let outOfStock = 0;

    products &&
        products.forEach((item) => {
            if (item.Stock < 0) {
                outOfStock += 1;
            }
        });

    useEffect(() => {
        dispatch(getAdminProduct());
        dispatch(getAllOrders());
        dispatch(getAllUsers());
    }, [dispatch]);

    let totalAmount = 0;
    orders &&
        orders.forEach((item) => {
            totalAmount += item.totalPrice;
        });


    const doughnutState = {
        labels: ["Out of Stock", "InStock"],
        datasets: [
            {
                backgroundColor: ["#00A6B4", "#6800B4"],
                hoverBackgroundColor: ["#4B5000", "#35014F"],
                data: [outOfStock, products.length - outOfStock],
            },
        ],
    };


    return (
        <div className="dashboard">
            <MetaData title="Admin Dashboard" />
            <Sidebar />

            <div className="dashboardContainer">
                <Typography component="h1">Dashboard</Typography>

                <div className="dashboardSummary">
                    <div>
                        <p>
                            Total Amount <br /> ₹{Math.round(totalAmount)}
                        </p>
                    </div>
                    <div className="dashboardSummaryBox2">
                        <Link to="/admin/products">
                            <p>Product</p>
                            <p>{products && products.length}</p>
                        </Link>
                        <Link to="/admin/orders">
                            <p>Orders</p>
                            <p>{orders && orders.length}</p>
                        </Link>
                        <Link to="/admin/users">
                            <p>Users</p>
                            <p>{users && users.length}</p>
                        </Link>
                    </div>
                </div>

                <div className="doughnutChart">
                    <Doughnut data={doughnutState} />
                </div>
            </div>
        </div>

    )
}

export default Dashboard