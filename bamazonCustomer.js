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
function getInventory(){
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    console.log(columnify(res));
    shop();
  });
}
function shop(){
  inquirer.prompt([
    {
      name: "itemChoice",
      type: "input",
      message: "What is the ID of the item you'd like to purchase? [Q to quit]",
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
      name: "quantity",
      type: "input",
      message: "How many would you like? [Q to quit]",
      validate: function(value){
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
        var newQuantity = res[0].stock_quantity - answer.quantity;
        if (newQuantity < 0){
          console.log("Sorry, that's more than we currently have in stock.\n");
          getInventory();
        } else {
          console.log("\nCongratulations on purchasing " + res[0].product_name + ". Here's " + answer.quantity.toString() + "!\n");
        connection.query("UPDATE products SET ? WHERE ?", [{stock_quantity: newQuantity},{item_id: answer.itemChoice}],function(err) {
          if (err) throw err;
        });
      getInventory();
      }
  });
  });
}
getInventory();