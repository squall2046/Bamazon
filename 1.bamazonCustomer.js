require('dotenv').config();
const mysql = require("mysql");
const inquirer = require("inquirer");
const chalk = require("chalk");
const figlet = require('figlet');
const boxen = require('boxen');
const moment = require('moment');

let totalPrice = 0;

let connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: "bamazondb"
});

// ============= 1.Welcome =============
figlet('Bamazon', function (err, data) {
    if (err) { console.dir(err); return };
    console.log("\r\n\r\n           ✿                        ✿              ✿\n     ✿        ✿                                       ✿"
        + boxen("\n ✿ Welcome to ✿\n" + chalk.bold.white(data + "✿ "), { backgroundColor: "magenta", borderColor: "magenta", padding: 1, margin: 1, borderStyle: 'round' })
        + "    ✿                               ✿                     ✿ \n           ✿                    ✿ \n\r\n\r\n\r\n\r")

    // ============= 2.connection MySql =============
    connection.connect(function (err) {
        if (err) { throw err };
        // console.log("connected as id: " + connection.threadId + "\n");
        customer();
    });
});

function customer() {
    inquirer.prompt({
        name: "customer",
        type: "list",
        message: "How could I help you?",
        choices: ["Shopping", "Exit"]
    })
        .then(function (answer) {
            switch (answer.customer) {
                case "Shopping":
                    shop()
                    break;
                case "Exit":
                    connection.end();
                    process.exit();
                    break;
            }
        });
}

// ============= 3. Read & Update database through inquirer =============
function shop() {
    inquirer.prompt([
        {
            name: "id",
            type: "input",
            message: "Enter the product unique[ID] please."
        }, {
            name: "quantity",
            type: "input",
            message: "How many would you like for shopping?"
        }
    ]).then(function (answer) {
        // ======= 3.1 read database (customer check id) =======
        connection.query("SELECT * FROM products WHERE ?",
            { item_id: answer.id }, function (err, response) {
                if (err) { throw err };
                // console.log(response);
                if (answer.id.length < 1 || answer.quantity.length < 1 || parseFloat(answer.quantity) === NaN) {
                    console.log(chalk.yellowBright("\n\n    Invalid item ID or quantity, would you like to try again?"));
                    console.log(chalk.cyan("\n Return to Menu.......\n\r\n\r\n\r\n\r"));
                    return shop();
                } else {

                    console.log(boxen("✿ Product Name       " + chalk.bold.greenBright(response[0].product_name + ' (' + response[0].item_id + ')\n') +
                        "✿ Product Price      " + chalk.bold.cyanBright('$ ' + response[0].price + "\n") +
                        "✿ Product Quantity   " + chalk.bold.redBright(response[0].stock_quantity + " left"), { backgroundColor: "black", borderColor: "magenta", padding: 1, margin: 1, borderStyle: 'classic' }
                    ))

                    // 3.2 ======= read database (customer check quantity) =======
                    if (parseInt(response[0].stock_quantity) < parseInt(answer.quantity)) {
                        console.log(" Sorry we don't have enough in the store.")
                        return customer();
                    } else {
                        // for (i = 0; i < parseInt(answer.quantity); i++) {
                        //     totalPrice += response[0].price;
                        // }
                        totalPrice = parseInt(answer.quantity) * parseFloat(response[0].price);

                        console.log("       ................. Receipt .................")
                        console.log("\n\n         " + response[0].product_name + " ............... $ " + response[0].price)
                        console.log("         Purchased ................. x " + answer.quantity)
                        console.log("\n         ...Payment approved...\n         ...Total price: $ " + chalk.yellowBright.underline.bold(totalPrice.toFixed(2)))
                        console.log("         Print Time: " + moment().format() + "\n\n         Thank you for shopping at Bamazon!\n\n")
                        console.log("       ...........................................\n\n")

                        // ============= 3.3 Update database (stock_quantity) =============
                        let newStock = parseFloat(response[0].stock_quantity) - parseFloat(answer.quantity);
                        connection.query("UPDATE products SET ? WHERE ?",
                            [{ stock_quantity: newStock }, { item_id: answer.id }],
                            function (err, update) {
                                if (err) { throw err; };
                                console.log(boxen("✿ Product Quantity   " + chalk.bold.redBright(newStock + " left"), { backgroundColor: "black", borderColor: "magenta", padding: 1, margin: 1, borderStyle: 'classic' }))
                                return customer();
                            }
                        );

                        // ============= 4 Update database (product_sales) =============
                        let totalSales = response[0].product_sales + totalPrice
                        connection.query("UPDATE products SET ? WHERE ?",
                            [{ product_sales: totalSales }, { item_id: answer.id }],
                            function (err, update) {
                                if (err) { throw err; };
                            }
                        );
                    }
                }
            });
    });
}
