const express = require("express");
let multiparty = require('multiparty');
const fs = require("fs");

const app = express();

app.set("port", process.env.PORT || 3001);

// Express only serves static assets in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

app.post("/upload", (req, res) => {
  let form = new multiparty.Form();
    form.parse(req, (err, fields, files) => {
      let {path: tempPath, originalFilename} = files.imageFile[0];
      let newPath = "./images/" + originalFilename;
      fs.readFile(tempPath, (err, data) => {
        // make copy of image to new location
        fs.writeFile(newPath, data, (err) => {
          // delete temp image
          fs.unlink(tempPath, () => {
            res.send("File uploaded to: " + newPath);
          });
        }); 
      }); 
    })  
})


app.listen(app.get("port"), () => {
  console.log(`Find the server at: http://localhost:${app.get("port")}/`); // eslint-disable-line no-console
});
