var http = require("http");
var fs = require("fs");
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('test.db');

var error404 = "not_found.html";
var error = "";
try {
  fs.statSync("./" + error404);
  error = fs.readFileSync("./" + error404);
} catch (err) {
  error = "<html><body><h1>404 Not Found</h1></body></html>";
}

var count = 0;
var sql_result = "";

//create a server object:
http
  .createServer(function (req, res) {
    let url = req["url"];
    switch (true) {
      case /^\/top.*/.test(url):
        console.log(url);
        res.writeHead(200, {
          "Content-Type": "text/html; charset=utf-8"
        });
        res.write("<html><body><table border>");
        let query = url.split("?");
        let parameters = {};
        if (query.length >= 2) {
          for (let param of query[1].split("&")) {
            let key, value;
            [key, value] = param.split("=");
            parameters[key] = value;
          }
          console.log(parameters);
        }
        let direction;
        if( parameters[ "desc" ] ) direction = "";
        else direction = " desc ";
        let limit = " limit " + parameters[ "number" ];
        db.serialize(() => {
          db.each("select id, 都道府県, 人口 from example order by 人口" + direction + limit + ";", (error, row) => {
            if (error) {
              console.log('Error: ', error);
              return;
            }
            sql_result += "<tr><td>" + row.id + "</td><td>" + row.都道府県 + "</td><td>" + row.人口 + "</td></tr>";
          });
        });
        res.write(sql_result);
        res.write("</table></body></html>");
        break;
      case /db$/.test(url):
        console.log(url);
        res.writeHead(200, {
          "Content-Type": "text/html; charset=utf-8"
        });
        res.write("<html><body><table border>");
        db.serialize(() => {
          db.each("SELECT id, 都道府県, 人口 FROM example order by id;", (error, row) => {
            if (error) {
              console.log('Error: ', error);
              return;
            }
            sql_result += "<tr><td>" + row.id + "</td><td>" + row.都道府県 + "</td><td>" + row.人口 + "</td></tr>";
          });
        });
        res.write(sql_result);
        res.write("</table></body></html>");
        break;
      case /counter$/.test(url):
        console.log(url);
        count++;
        res.writeHead(200, {
          "Content-Type": "text/html; charset=utf-8"
        });
        res.write(
          "<html><body>あなたは" + count + "番目の来場者です</body></html>"
        );
        break;
      case /\/$/.test(url):
        url += "index.html";
        console.log("URL = " + url);
      default:
        try {
          fs.statSync("." + url);
          let text = fs.readFileSync("." + url);
          res.write(text); //write a response to the client
        } catch (err) {
          console.log("File is not found");
          res.writeHead(404, { "Content-Type": "text/html" });
          res.write(error);
        }
    }
    sql_result = ""; //refresh
    res.end(); //end the response
  })
  .listen(8080); //the server object listens on port 8080
