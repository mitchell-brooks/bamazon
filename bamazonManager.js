var mysql = require("mysql");
var inquirer = require("inquirer");
var columnify = require("columnify");
var connection = mysql.createConnection({
  host: "localhost",
  port: 8889,
  user: "root",
  password: "root",
  database: "bamazon"
});
connection.connect(function(err) {
  if (err) throw err;
});

function viewProducts(){
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    console.log(columnify(res));
    manage();
  });
}

function lowInventory(){
  connection.query("SELECT * FROM products WHERE stock_quantity < 5", function(err, res) {
    if (err) throw err;
    console.log("Here are the items with fewer than 5 left in stock:")
    console.log(columnify(res));
    manage();
  });
}

function addInventory(){
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    console.log(columnify(res) + "\n");
    inquirer.prompt([
      {
      name:"itemChoice",
      type:"input",
      message: "What is the ID of the item for which you'd like to add more inventory? [Q to quit]",
      validate: function(value) {
        if (value === 'q') {
          process.exit();
        }
        else if (isNaN(value) === false) {
          return true;
        }
        return false;
      }
    },{
      name:"quantity",
      type:"input",
      message: "How many would you like to add? [Q to quit]",
      validate: function(value) {
        if (value === 'q') {
          process.exit();
        }
        else if (isNaN(value) === false) {
          return true;
        }
        return false;
      }
    }
  ]).then(function(answer) {
    connection.query(
      "SELECT * FROM products WHERE item_id = ?", [answer.itemChoice], function (err, res){
        if(err) throw err;
        var newQuantity = parseInt(res[0].stock_quantity) + parseInt(answer.quantity);
        console.log("\nSuccess! " + answer.quantity + " added to " + res[0].product_name + ".\nUpdated stock:");
        connection.query("UPDATE products SET ? WHERE ?", [{stock_quantity: newQuantity},{item_id: answer.itemChoice}],function(err) {
          if(err) throw err;
        });
        connection.query(
        "SELECT * FROM products WHERE item_id = ?", [answer.itemChoice], function (err, res){
          console.log(columnify(res));
          manage();
        }
        );
      }
    );
  });
  });
}
function addProduct(){
  connection.query("SELECT * FROM products",function(err, res){
    if(err) throw err;
    console.log(columnify(res));
    inquirer.prompt([
      {
        name:"productName",
        type:"input",
        message:"What product would you like to add? [Q to quit]",
        validate: function(value){
          if (value === 'q'){
            process.exit();
          }
          return true;
        }
      },{
        name:"productDept",
        type:"input",
        message:"What department should it go in? [Q to quit]",
        validate: function(value){
          if(value === 'q'){
            process.exit();
          }
          return true;
        }
      },{
        name:"productPrice",
        type:"input",
        message:"How much should it cost?",
        validate: function(value){
          if(value === 'q'){
            process.exit();
          }
          else if(isNaN(value) === false){
            return true;
          }
          return false;
        }
      },{
        name:"productStock",
        type:"input",
        message:"How many do you want to stock?",
        validate: function(value){
          if(value === 'q'){
            process.exit();
          }
          else if(isNaN(value) === false){
            return true;
          }
          return false;
        }
      }
    ]).then(function(answer){
      connection.query(
        "INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES (?, ?, ?, ?)",[answer.productName, answer.productDept, answer.productPrice, answer.productStock],function(err){
          if (err) throw err;
        });
        console.log("\nSuccess! " + answer.productName + " added successfully.")
        connection.query("SELECT * FROM products WHERE product_name = ?", [answer.productName], function(err,res){
          if(err) throw err;
          console.log("New item:\n" + columnify(res) + "\n");
          inquirer.prompt([
            {
              name:"another",
              type:"list",
              message:"Would you like to add another product?",
              choices:["Yes","No"]
            }
          ]).then(function(answer){
            if(answer.another === "Yes"){
              addProduct();
            } else {
              manage();
            }
          });
        });   
    });

  });

}
function manage(){
  console.log("\n");
  inquirer.prompt([
    {
      name: "promptSelect",
      type: "list",
      message: "Hello, Mr. Manager. What would you like to do?",
      choices: ["View products for sale", "View low inventory", "Add to inventory", "Add new product", "Quit"],
      default: 0
    }
  ]).then(function(answer) {
    switch (answer.promptSelect) {
      case "View products for sale":
        viewProducts();
        break;
      case "View low inventory":
        lowInventory();
        break;
      case "Add to inventory":
        addInventory();
        break;
      case "Add new product":
        addProduct();
        break;
      case "Quit":
        process.exit();
        break;
      // default:
      //   viewProducts();
    }
  });
}
manage();