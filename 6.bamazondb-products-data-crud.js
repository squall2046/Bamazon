require('dotenv').config();
var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: "bamazondb"
});

connection.connect(function (err) {
    if (err) { throw err; }
    console.log("connected as id: " + connection.threadId + "\n");
    productCRUD();
});

function productCRUD() {
    inquirer.prompt({
        name: "CRUD",
        type: "list",
        message: "Select [Create], [Update] or [Delete] an item",
        choices: ["Create", "Update", "Delete"]
    })
        .then(function (response) {
            switch (response.CRUD) {
                case "Create":
                    productCreate()
                    break;
                case "Update":
                    productCreate()
                    break;
                case "Delete":
                    productCreate()
                    break;
            }
        });
}

function productCreate() {
    inquirer.prompt([{
        name: "id",
        type: "input",
        message: "Enter 'item_id' "
    }, {
        name: "name",
        type: "input",
        message: "Enter 'product_name' "
    }, {
        name: "dept",
        type: "input",
        message: "Enter 'department_name' ",
    }, {
        name: "price",
        type: "input",
        message: "Enter 'price' "
    }, {
        name: "quantity",
        type: "input",
        message: "Enter 'stock_quantity' "
    }]).then(function (response) {
        connection.query("INSERT INTO products SET ?", {
            item_id: response.id,
            product_name: response.name,
            department_name: response.dept,
            price: response.price,
            stock_quantity: response.quantity
        }, function (err) {
            if (err) { throw err; }
            console.log("A new product has post.");
            productCRUD();
        }
        );
    });
}