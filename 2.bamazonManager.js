require('dotenv').config();
const mysql = require("mysql");
const inquirer = require("inquirer");
const chalk = require("chalk");
const figlet = require('figlet');
const boxen = require('boxen');
const Table = require('cli-table3');
// ============= 3.5a build a departments cli-table with head only =============
let table = new Table({
    head: ['item_id', 'product_name', 'department_name', 'price', 'stock_quantity']
});
let table2 = new Table({
    head: ['item_id', 'product_name', 'department_name', 'price', 'stock_quantity']
});
let table3 = new Table({
    head: ['item_id', 'product_name', 'department_name', 'price', 'stock_quantity']
});

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
        + boxen("\n ✿ Welcome to ✿\n" + chalk.bold.white(data + "✿ "), { backgroundColor: "cyan", borderColor: "cyan", padding: 1, margin: 1, borderStyle: 'round' })
        + "    ✿                               ✿                     ✿ \n           ✿                    ✿")
    console.log(chalk.bold.cyan("\n                      - Manager Version -\n\r\n\r\n\r\n\r"))

    // ============= 2.connection MySql =============
    connection.connect(function (err) {
        if (err) { throw err };
        // console.log("connected as id: " + connection.threadId + "\n");
        manager();
    });
});

// ============= 3. Read & Update database through inquirer =============
function manager() {
    inquirer.prompt({
        name: "manager",
        type: "list",
        message: "How may I serve you?",
        choices: ["[View Products for Sale]", "[View Low Inventory]", "[Add to Inventory]", "[Add New Product]", "[Exit]"]
    })
        .then(function (answer) {
            switch (answer.manager) {
                case "[View Products for Sale]":
                    viewAll()
                    break;
                case "[View Low Inventory]":
                    viewLow()
                    break;
                case "[Add to Inventory]":
                    addLow()
                    break;
                case "[Add New Product]":
                    addNew()
                    break;
                case "[Exit]":
                    connection.end();
                    process.exit();
                    break;
            }
        });
}

// ======= 3.1 read database (all products) =======
function viewAll() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) { throw err };
        // console.log(res);
        for (let i = 0; i < res.length; i++) {
            let prodArr = [chalk.yellow(res[i].item_id), res[i].product_name, res[i].department_name, chalk.cyanBright(res[i].price), chalk.magentaBright(res[i].stock_quantity)];
            table.push(prodArr);
        };
        console.log(chalk.red("\n\n\n\n                              products table\n") + table.toString() + "\n\n\n\n");
        return manager();
    })
}

// ======= 3.2 read database (low inventory) =======
function viewLow() {
    connection.query("SELECT * FROM products WHERE stock_quantity BETWEEN 0 AND 50", function (err, res) {
        if (err) { throw err };
        // console.log(res);
        for (let i = 0; i < res.length; i++) {
            let lowArr = [chalk.yellow(res[i].item_id), res[i].product_name, res[i].department_name, chalk.cyanBright(res[i].price), chalk.magentaBright(res[i].stock_quantity)];
            table2.push(lowArr);
        };
        console.log(chalk.red("\n\n\n\n                              Low Inventory\n") + table2.toString() + "\n\n\n\n");
        return manager();
    })
}

// ======= 3.3 update data in table column of database (add low inventory) =======
// ======= 3.31 read database (low inventory) =======
function addLow() {
    inquirer.prompt([{
        name: "id",
        type: "input",
        message: "Enter the product ID which need to reload: "
    }, {
        name: "addQuantity",
        type: "input",
        message: "Enter the product quantity for reloading: "
    }]).then(function (answer) {
        if (answer.id.length < 1 || answer.addQuantity.length < 1 || parseFloat(answer.addQuantity) === NaN) {
            console.log(chalk.yellowBright("\n\n    Invalid item ID or quantity, would you like to try again?"));
            console.log(chalk.cyan("\n Return to Menu.......\n\r\n\r\n\r\n\r"));
            return addLow();
        } else {
            connection.query("SELECT * FROM products WHERE ?",
                { item_id: answer.id }, function (err, res) {
                    if (err) { throw err; };
                    // console.log(res);

                    // ======= 3.32 update database (low inventory) =======
                    let upId = answer.id;
                    let upQuantity = parseFloat(answer.addQuantity) + parseFloat(res[0].stock_quantity);
                    // console.log("tlNum: "+upQuantity);

                    connection.query("UPDATE products SET ? WHERE ?",
                        [{ stock_quantity: upQuantity }, { item_id: upId }], function (err, update) {
                            if (err) { throw err; };
                            // console.log(res);
                            console.log(chalk.cyan("\n\n    ============= RELOAD ==============\n"));
                            console.log(chalk.yellowBright("     · tem_id: ") + upId);
                            console.log(chalk.yellowBright("     · product_name: ") + res[0].product_name);
                            console.log(chalk.yellowBright("     · department_name: ") + res[0].department_name);
                            console.log(chalk.yellowBright("     · price: ") + res[0].price);
                            console.log(chalk.yellowBright("     · stock_quantity: ") + chalk.redBright(upQuantity));
                            console.log(chalk.cyan("\n    ==================================="));
                            console.log(chalk.yellowBright("    ➯ The inventory products reloaded !!"));
                            console.log(chalk.cyan("\n Return to Menu.......\n\r\n\r\n\r\n\r"));
                           return manager();
                        }
                    );
                });
        }
    })
}


// ======= 3.4 Create data in table column of database (add new item) =======
function addNew() {
    inquirer.prompt([{
        name: "id",
        type: "input",
        message: "Enter a new 'item_id': "
    }, {
        name: "name",
        type: "input",
        message: "Enter a new 'product_name': "
    }, {
        name: "dept",
        type: "input",
        message: "Enter a new 'department_name': ",
    }, {
        name: "price",
        type: "input",
        message: "Enter a new 'price': "
    }, {
        name: "quantity",
        type: "input",
        message: "Enter a new 'stock_quantity': "
    }]).then(function (answer) {
        if (answer.id.length < 1 || answer.dept.length < 1 || answer.price.length < 1 || answer.quantity.length < 1 || parseFloat(answer.price) === NaN || parseFloat(answer.quantity) === NaN) {
            console.log(chalk.yellowBright("\n\n    Please try again. Make sure Price and Quantity are number ONLY."));
            console.log(chalk.cyan("\n Return to Menu.......\n\r\n\r\n\r\n\r"));
            return addNew();
        } else {
            connection.query("INSERT INTO products SET ?", {
                item_id: answer.id,
                product_name: answer.name,
                department_name: answer.dept,
                price: answer.price,
                stock_quantity: answer.quantity
            }, function (err, res) {
                if (err) { throw err; };
                console.log(chalk.yellowBright("\n\n       ➯ The new products have added to inventory !!"));
                console.log(chalk.cyan("\n Return to the Menu.......\n\r\n\r\n\r\n\r"));
                return manager();
            });
        }
    });
}



// 3.1 和 3.2 是 read data, 所用的 data 已经存在, 所以在 connection.query{ } 中的 function (err, res) 是可以读取 res 的.
// 3.3 和 3.4 是 update 和 create data, 所用的 data 正在被书写和更改, 所以这些 data 尚未存在.
// 由于 Node.js 是异步, 即每条线同时读取, 所以 读到 connection.query{ } 中的 function (err, res) 时, 这个 function是与
// "UPDATE products SET ? WHERE ?" 以及 "INSERT INTO products SET ?" 同时进行的, 所以 res 尚不存在 data,
// 所以暂时不能使用这些 data. 但可以通过 return, 即下一步, 来重新转到一个新的 用来 read data 的 function 来读取.