const http = require('http');
const url = require('url');
const fs = require('fs');
const qs = require("qs");
const mysql = require("mysql");


const conn= mysql.createConnection({
    location:'localhost',
    user: 'root',
    password: 'Matkhau1234@@',
    database: 'DataThiModule3',
    charset: 'utf8_general_ci'
})

conn.connect((error)=>{
    if(error){throw error}
    console.log("connect mysql success")
})

const sql=`select C.nameCity,c.name
from city C
join country c on C.idcountry=c.idcountry`

conn.query(sql,(err, results)=>{
    if(err){throw err}
    const server = http.createServer(((req, res) => {

        // phân tích url
        const urlPath = url.parse(req.url, true);
        let queryString = urlPath.query;

        // dùng switch-case điều hướng  theo url và method của request
        // nó đóng vai trò là router
        let index;
        switch (urlPath.pathname) {
            case '/':
                fs.readFile('./views/index.html','utf8', ((err, data) => {
                    if (err) {
                        console.log(err);
                    }

                    let newData = showListCity(City);
                    data = data.replace('{list-user}', newData)
                    res.writeHead(200,'success', {'Content-type': 'text/html'})
                    res.write(data)
                    res.end()
                }))
                break;

            case '/users/delete':
                index = queryString.id;
                deleteUser(index);

                // set lại location cho res để trình duyệt gọi lên 1 request khác
                res.writeHead(301, {
                    Location: "http://localhost:8002"
                })

                res.end()
                break;

            case '/users/add':
                const method = req.method;
                if(method==='GET'){
                    fs.readFile('./views/add.html','utf-8',(err, data)=>{
                        if (err) {
                            console.log(err)
                        }
                        data.replace('<form action="/add" method="post">','<form action="/add" method="post">\n')
                        res.writeHead(200,'success', {'Content-type': 'text/html'})
                        res.write(data)
                        return res.end()
                    })
                }else {
                    let data='';
                    req.on('data',chunk => {
                        data+=chunk;
                    })
                    req.on("end",()=>{
                        data=qs.parse(data);

                        let userAdd={
                            nameCity:data.city,
                            nameCountry:data.country,
                        }
                        City.push(userAdd);

                        res.writeHead(301,{
                            Location:"http://localhost:8002"
                        })
                        res.end();
                    })
                }

                break;
            case '/users/update':

                index=queryString.id;
                // can sua user[index1]
                let userUpdate=City[index];

                //hien thi giao dien

                if(req.method==="GET"){
                    fs.readFile('./views/edit.html',"utf-8",(err, data)=>{
                        if (err){
                            console.log(err.message)
                        }

                        data=data.replace('value="city"',
                            `value="${userUpdate.nameCity}"`
                        )
                        data=data.replace('value="country"',
                            `value="${userUpdate.nameCountry}"`
                        )

                        data=data.replace('<form action="/users/update" method="post">',`<form action="/users/update?id=${index}" method="post">
`)

                        res.writeHead(200,{"Content-Type":"text/html"})
                        res.write(data);
                        res.end()
                    })
                }else {
                    let data = ''
                    req.on('data', chunk => {
                        data += chunk
                    })

                    req.on('end', () => {
                        let dataForm = qs.parse(data);
                        userUpdate.nameCity = dataForm.city;
                        userUpdate.nameCountry = dataForm.country;

                        res.writeHead(301, {
                            "Location": "http://localhost:8002"
                        })
                        res.end();
                    })
                }
                break;
        }

    }))

    server.listen(8002, 'localhost', () => {
        console.log('server running in http://localhost:8002')
    })

})


function showListCity(data) {
    let html = '';
    for (let i = 0; i < data.length; i++){
        html += '<tr>';
        html += `<td>${i + 1}</td>`
        html += `<td>${data[i].nameCity}</td>`
        html += `<td>${data[i].nameCountry}</td>`
        html += `<td>
                       <a href="users/delete?id=${i}" class="btn btn-danger">Delete</a>
                       <a href="users/update?id=${i}" class="btn btn-primary">Update</a>
                  </td>`
        html += '</tr>';
    }
    return html;
}



function deleteUser(index) {
    City.splice(index, 1);
    return City;
}

// tạo server


let City = [
    {
        nameCity: 'Ha Noi',
        nameCountry:"Viet Nam"
    },
    {
        nameCity: 'Bac Kinh',
        nameCountry:"Trung Quoc"
    },
    {
        nameCity: 'Tokyo',
        nameCountry:"Nhat Ban"
    },

]
