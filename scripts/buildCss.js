var fs = require("fs-extra");
var sass = require("node-sass");

sass.render(
  {
    file: "../../koh-i-noor/styles/main.scss"
  },
  function(error, result) {
    if (error) {
      console.log("There was an error!!", error);
    }
    if (!error) {
      fs.writeFile("./public/styles/kohinoor.css", result.css, function(err) {
          console.log("CSS compiled succesfuly!!", error);
        if (!err) {
        }
      });
    }
  }
);
