const express=require("express");
const app=express();
const http=require("http").Server(app);
const io=require("socket.io")(http);
const mysql=require('mysql');
const bodyParser=require('body-parser');
const session=require('express-session');
const async=require('async');
const mysql_store=require('express-mysql-session')(session);

const sql=mysql.createConnection({
  host:'localhost',
  user:'root',
  password:'2021_Codecdev',
  database:'cloudwaiter'
});
const session_store=new mysql_store({},sql);

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(session({
  secret:'fuck you',
  store:session_store,
  resave:false,
  saveUninitialized:true
}));

app.set('view engine','ejs');
app.use(express.static(__dirname+"/public"));

sql.connect((err)=>{
  if(err) throw err;
  console.log('DB connected!');
});

function date(date){
  var day=date.getDate();
  var mon=date.getMonth()+1;
  var year=date.getFullYear();
  if(day<10){
    day='0'+day;
  }
  if(mon<10){
    mon='0'+mon;
  }
  date=year+'-'+mon+'-'+day;
  return date;
}

var resto;
var slider=[];

function blah(rows,rows1){
  resto=rows;
  slider=rows1;
}

async.parallel([
  function(callback){sql.query("SELECT * FROM restaurant", callback)},
  function(callback){sql.query("SELECT * FROM slider", callback)}
],(err,rows,fields)=>{
  if(!err){
    blah(rows[0][0][0], rows[1][0]);
  }else{
    throw err;
  }
});

app.get('/login',(req,res)=>{
  if(req.query.err){
    var err=req.query.err;
    if(err=="a"){
      err="Does not match any table. Please try again";
    }else if(err=="b"){
      err="Table already occupied. Please try again";
    }else{
      res.render('pages/login',{err:""});
    }
    res.render('pages/login',{err:err});
  }else{
    res.render('pages/login',{err:""});
  }

});

app.post('/login',(req,res)=>{
  var customer={
    table:req.body.table,
    date:date(new Date())
  };
  sql.query("SELECT * FROM tables WHERE table_id='"+customer.table+"'",(err,rows,fields)=>{
    if(!err){
      if(rows!=""){
        if(rows[0].status=='vacant'){
          var query="INSERT INTO customer VALUES(NULL,'"+rows[0].table_id+"','"+customer.date+"',NULL,NULL,NULL)";
          sql.query(query,(err1,result)=>{
            if(!err){
              sql.query("UPDATE tables SET status='occupied', customer_id='"+result.insertId+"' WHERE table_no='"+rows[0].table_id+"'",(err2,result1)=>{
                if(!err1){
                  io.emit('reload');
                  req.session.customer=result.insertId;
                  req.session.table=customer.table;
                  res.redirect('/');
                }else{
                  throw err;
                }

              });
            }else{
              throw err;
            }
          });
        }else{
          res.redirect("/login?err=b#qrinput");
        }

      }else{
        res.redirect("/login?err=a#qrinput");
      }
    }else{
      throw err;
    }
  });


});

app.get('/logout',auth, (req,res)=>{
  var log_out=new Date().toLocaleString();
  sql.query("SELECT * FROM customer WHERE customer_id='"+req.session.customer+"'",(err1,rows,fields)=>{
    if(!err1){
      if(rows[0].payment_id==null || rows[0].payment_id==undefined){
        logout();
      }else{
        payments=rows[0].payment_id.split(",");
        var query="";
        for(a=0;a<payments.length;a++){
          if(a==payments.length-1){
            query+="payment_id='"+payments[a]+"'";
          }else{
            query+="payment_id='"+payments[a]+"' OR ";
          }
        }
        if(query!=""){
          sql.query("SELECT * FROM payment WHERE "+query+"", (err2,rows1,fields1)=>{
            if(!err2){
              status=rows1.map(a=>a.status);
              var out=false;
              for(a=0;a<status.length;a++){
                if(status[a]=="PAID"){
                  out=true;
                }else{
                  out=false;
                }
                if(a==status.length-1){
                  if(out==true){
                    logout();
                  }else{
                    res.redirect('/orders#orders');
                  }
                }
              }
            }else{
              throw err2;
            }
          });
        }
      }
    }else{
      throw err1;
    }
  });
  function logout(){
    async.parallel([
      function(callback){sql.query("UPDATE customer SET log_out='"+log_out+"' WHERE customer_id='"+req.session.customer+"'", callback)},
      function(callback){sql.query("UPDATE tables SET status='vacant', customer_id=NULL WHERE table_no='"+req.session.table+"'", callback)}
    ], (err, result)=>{
      if(!err){
        io.emit('reload');
        req.session.customer=undefined;
        res.redirect('/login');
      }else{
        throw err;
      }
    });
  }
});

function auth(req,res,next){
  sql.query("SELECT * FROM customer WHERE customer_id='"+req.session.customer+"'",(err,rows,fields)=>{
    if(!req.session.customer){
      res.redirect('/login');
    }else if(rows[0].log_out!=null){
      req.session.customer=undefined;
      res.redirect('/login');
    }else{
      next();
    }
  });

};

app.get('/', auth, (req,res)=>{
  async.parallel([
    function(callback){sql.query("SELECT * FROM customer WHERE customer_id='"+req.session.customer+"'", callback)},
    function(callback){sql.query("SELECT * FROM item", callback)}
  ],(err,rows,fields)=>{
    if(!err){
      var items1=rows[1][0];
      var items={
        burgers:[],
        chicken:[],
        rice:[],
        sides:[],
        extras:[],
        drinks:[]
      };

      for(a=0;a<items1.length;a++){
        if(items1[a].class=="Burgers"){
          items.burgers.push(items1[a]);
        }else if(items1[a].class=="Chicken Wings"){
          items.chicken.push(items1[a]);
        }else if(items1[a].class=="Rice Meals"){
          items.rice.push(items1[a]);
        }else if(items1[a].class=="Sides"){
          items.sides.push(items1[a]);
        }else if(items1[a].class=="Extras"){
          items.extras.push(items1[a]);
        }else if(items1[a].class=="Drinks"){
          items.drinks.push(items1[a]);
        }

        if(a==items1.length-1){
          res.render('pages/index',{
            burgers:items.burgers,
            chicken:items.chicken,
            rice:items.rice,
            sides:items.sides,
            extras:items.extras,
            drinks:items.drinks,
            customer:rows[0][0], resto:resto, slider:slider});
        }
      }
    }else{
      throw err;
    }
  });
});

app.get('/orders', auth, (req,res)=>{
  var customer=req.session.customer;
  sql.query("SELECT * FROM customer WHERE customer_id='"+customer+"' AND NOT order_id='null'", (err,rows,fields)=>{
    if(!err){
      if(rows[0]!=''){
        var payment=rows[0].payment_id;
        payment=payment.split(",");
        var query="";
        for(a=0;a<payment.length;a++){
          if(a==payment.length-1){
            query+="payment_id='"+payment[a]+"'";
          }else{
            query+="payment_id='"+payment[a]+"' OR ";
          }
        }
        if(query!=""){
          sql.query("SELECT * FROM payment WHERE "+query+" ORDER BY date_time DESC",(err1,rows1,fields1)=>{
            if(!err1){
              var items={
                name:rows1.map(a=>a.item_name),
                qty:rows1.map(a=>a.item_qty),
                cost:rows1.map(a=>a.cost_item)
              };
              for(a=0;a<items.name.length;a++){
                items.name[a]=items.name[a].split(",");
                items.qty[a]=items.qty[a].split(",");
                items.cost[a]=items.cost[a].split(",");
                if(a==items.name.length-1){
                  res.render('pages/orders',{payment:rows1,items:items,customer:customer, resto:resto, slider:slider});
                }
              }
            }else{
              throw err1;
            }

          });
        }
      }else{
        res.redirect('/');
      }
    }else{
      throw err;
    }
  });
});

app.post('/order', auth, (req,res)=>{
  var orders=JSON.parse(req.body.order);
  res.render('pages/order',{data:orders,resto:resto,slider:slider});
});

app.post('/pay', auth, (req,res)=>{
  var payment=JSON.parse(req.body.payment);
  var time=new Date().toLocaleString();
  var name=payment.map(name=>name.name);
  var qty=payment.map(qty=>qty.qty);
  var c_item=payment.map(c_item=>c_item.c_item);
  var total=req.body.total;
  var customer=req.session.customer;
  var table=req.session.table;
  var query="INSERT INTO orders VALUES('','"+time+"','Pending','"+customer+"','"+table+"',NULL)";
  sql.query(query,(err,result)=>{
    if(!err){
      var query1="INSERT INTO payment VALUES(NULL,'"+total+"',NULL,NULL,'"+result.insertId+"','"+name+"','"+qty+"','"+c_item+"','PENDING','"+time+"')";
      sql.query(query1,(err1,result1)=>{
        if(!err1){
          sql.query("UPDATE orders SET payment_id='"+result1.insertId+"' WHERE order_id='"+result.insertId+"'", (err2, result2)=>{
            if(!err2){
              sql.query("SELECT * FROM customer WHERE customer_id='"+customer+"'",(err4,rows,fields)=>{
                if(!err4){
                  var query2="";
                  if(rows[0].order_id==null){
                    query2="UPDATE customer SET order_id='"+result.insertId+"', payment_id='"+result1.insertId+"' WHERE customer_id='"+customer+"'";
                  }else{
                    query2="UPDATE customer SET order_id='"+rows[0].order_id+","+result.insertId+"', payment_id='"+rows[0].payment_id+","+result1.insertId+"' WHERE customer_id='"+customer+"'";
                  }
                  sql.query(query2, (err3,result3)=>{
                    if(!err3){
                      io.emit('reload');
                      res.redirect('/orders#orders');
                    }else{
                      throw err3;
                    }
                  });
                }else{
                  throw err4;
                }

              });

            }else{
              throw err2;
            }
          });
        }else{
          throw err1;
        }
      });
    }else{
      throw err;
    }
  });

});

app.get('/about',(req,res)=>{
  res.render('pages/about',{resto:resto,slider:slider});
});

app.get('/adminlogin',(req,res)=>{
  if(req.query.err){
    var err=req.query.err;
    if(err==1){
      err="Username does not exist. Please try again.";
    }else if(err==2){
      err="Wrong Password. Please try again.";
    }else{
      err="";
    }
    res.render('pages/adminlogin',{err:err, resto:resto})
  }else{
    res.render('pages/adminlogin',{err:"", resto:resto});
  }
});

app.post('/adminlogin',(req,res)=>{
  var admin={
    user:req.body.user,
    pass:req.body.pass
  };
  sql.query("SELECT * FROM crew WHERE username='"+admin.user+"'",(err,rows,fields)=>{
    if(!err){
      if(rows[0]!=undefined){
        if(rows[0].password==admin.pass){
          sql.query("UPDATE crew SET status='Active' WHERE username='"+rows[0].username+"'",(err1,result)=>{
            if(!err1){
              req.session.admin=rows[0].username;
              req.session.type=rows[0].account_type;
              res.redirect('/'+req.session.type);
            }else{
              throw err1;
            }
          });
        }else{
          res.redirect('/adminlogin?err=2');
        }
      }else{
        res.redirect('/adminlogin?err=1');
      }
    }else{
      throw err;
    }
  });
});

app.get('/adminlogout',(req,res)=>{
  var crew=req.session.admin;
  sql.query("UPDATE crew SET status='Left' WHERE username='"+crew+"'",(err,result)=>{
    if(!err){
      req.session.admin=undefined;
      res.redirect('/adminlogin');
    }else{
      throw err;
    }
  });
});

function cashierauth(req,res,next){
  if(!req.session.admin){
    res.redirect('/adminlogin');
  }else{
    if(req.session.type!="cashier"){
      res.redirect('/'+req.session.type);
    }else{
      next();
    }
  }
}

app.get('/cashier',cashierauth,(req,res)=>{
  async.parallel([
    function(callback){sql.query("SELECT * FROM customer ORDER BY log_out", callback)},
    function(callback){sql.query("SELECT * FROM tables", callback)}
  ],(err,rows,fields)=>{
    if(!err){
      today=date(new Date());
      var payment=rows[0][0].map(a=>a.payment_id);
      payment1=[];
      for(a=0;a<payment.length;a++){
        rows[0][0][a].log_in=date(rows[0][0][a].log_in);
        var query="";
        if(payment[a]!=null){
          var blah=payment[a].search(",");
          if(blah==-1){
            query="payment_id='"+payment[a]+"'";
          }else{
            payment[a]=payment[a].split(",");
            for(b=0;b<payment[a].length;b++){
              if(b==payment[a].length-1){
                query+="payment_id='"+payment[a][b]+"'";
              }else{
                query+="payment_id='"+payment[a][b]+"' OR ";
              }
            }
          }
        }else{
          query="payment_id='null'";
        }
        if(query!=""){
          sql.query("SELECT * FROM payment WHERE "+query+" ORDER BY status DESC", (err1,rows1,fields1)=>{
            extract(rows1);
          });
        }
        var c=0;
        function extract(data){
          payment1.push(data);
          c++;
          if(c==payment.length){
            res.render('pages/cashier',{customer:rows[0][0], tables:rows[1][0], payment:payment1, today:today, resto:resto});
          }
        }
      }
    }else{
      throw err;
    }
  });
});

app.post('/vacate',cashierauth,(req,res)=>{
  var table=req.body.table;
  var customer=req.body.customer;
  var date=new Date();
  async.parallel([
    function(callback){sql.query("UPDATE tables SET status='vacant', customer_id=NULL WHERE table_id='"+table+"'",callback)},
    function(callback){sql.query("UPDATE customer SET log_out='"+date+"' WHERE customer_id='"+customer+"'",callback)}
  ],(err,result)=>{
    if(!err){
      io.emit('vacate');
      if(req.session.type=="cashier"){
        res.redirect('/cashier');
      }else{
        res.redirect('/admin');
      }

    }else{
      throw err;
    }
  });
});

app.get('/transact', cashierauth,(req,res)=>{
  if(req.query.payment){
    var payment=req.query.payment;
    sql.query("SELECT * FROM payment WHERE payment_id='"+payment+"'",(err,rows,fields)=>{
      if(!err){
        var items={
          name:rows[0].item_name,
          qty:rows[0].item_qty,
          cost:rows[0].cost_item
        };
        var query="";
        items.name=(items.name).split(",");
        items.qty=(items.qty).split(",");
        items.cost=(items.cost).split(",");

        res.render('pages/transact',{payment:rows,name:items.name,qty:items.qty,cost:items.cost, resto:resto});
      }else{
        throw err;
      }
    });
  }else{
    res.redirect('/admin');
  }
});

app.post('/transact',cashierauth,(req,res)=>{
  var payment=JSON.parse(req.body.trans);

  var query="UPDATE payment SET cash='"+payment.cash+"', change_='"+payment.change+"', status='PAID' WHERE payment_id='"+payment.id+"'";
  sql.query(query, (err,result)=>{
    if(!err){
      io.emit('paid');
      io.emit('reload');
      res.end("<script>window.close();</script>");
    }else{
      throw err;
    }
  });

});

function kitchenauth(req,res,next){
  if(!req.session.admin){
    res.redirect('/adminlogin');
  }else{
    if(req.session.type!="kitchen"){
      res.redirect('/'+req.session.type);
    }else{
      next();
    }
  }
}

app.get('/kitchen',kitchenauth,(req,res)=>{
  async.parallel([
    function(callback){sql.query("SELECT * FROM orders ORDER BY status",callback)},
    function(callback){sql.query("SELECT * FROM payment",callback)}
  ],(err,rows,fields)=>{
    if(!err){
      var today=date(new Date());
      var order_dates=rows[0][0].map(a=>a.date_time);
      for(a=0;a<order_dates.length;a++){
        order_dates[a]=date(order_dates[a]);
        if(a==order_dates.length-1){
          res.render('pages/kitchen',{orders:rows[0][0], payment:rows[1][0], order_dates:order_dates, today:today, resto:resto});
        }
      }
    }else{
      throw err;
    }
  });
});

app.get('/ready',kitchenauth,(req,res)=>{
  if(req.query.id){
    var order=req.query.id;
    sql.query("UPDATE orders SET status='Ready' WHERE order_id='"+order+"'",(err,result)=>{
      if(!err){
        res.redirect('/kitchen#'+order);
      }else{
        throw err;
      }
    });
  }else{
    res.redirect('/kitchen');
  }
});

function adminauth(req,res,next){
  if(!req.session.admin){
    res.redirect('/adminlogin');
  }else{
    if(req.session.type!="admin"){
      res.redirect('/'+req.session.type);
    }else{
      next();
    }
  }
}

app.get('/admin', adminauth,(req,res)=>{
  async.parallel([
    function(callback){sql.query('SELECT * FROM item',callback)},
    function(callback){sql.query("SELECT * FROM tables", callback)},
    function(callback){sql.query("SELECT * FROM crew", callback)},
    function(callback){sql.query("SELECT * FROM restaurant", callback)},
    function(callback){sql.query("SELECT * FROM slider", callback)}
  ],(err,rows,fields)=>{
    if(!err){
      res.render('pages/admin',{item:rows[0][0], tables:rows[1][0],crew:rows[2][0], resto:rows[3][0][0], slider:rows[4][0]});
    }else{
      throw err;
    }
  });
});

app.post('/tables/:action', adminauth, (req,res)=>{
  if(req.params.action){
    var action=req.params.action;

    if(action=="add"){
      table_no=req.body.table_no;
      sql.query("INSERT INTO tables VALUES(NULL,'"+table_no+"','vacant',NULL)",(err,result)=>{
        if(!err){
          res.redirect('/admin');
        }else{
          throw err;
        }
      });
    }else if(action=="delete"){
      table_id=req.body.id;
      sql.query("DELETE FROM tables WHERE table_id='"+table_id+"'",(err,result)=>{
        if(!err){
          res.redirect('/admin');
        }else{
          throw err;
        }
      });
    }
  }else{
    res.redirect('/admin');
  }
});

app.post('/item/:action',adminauth,(req,res)=>{
  var action=req.params.action;
  var item={
    id:req.body.id,
    name:req.body.name,
    price:req.body.price,
    class1:req.body.class
  };
  if(action=="add"){
    var query="INSERT INTO item VALUES('','"+item.name+"','"+item.price+"','"+item.class1+"')";
    sql.query(query,(err,result)=>{
      if(!err){
        res.redirect('/admin#items');
      }else{
        throw err;
      }
    });
  }else if(action=="edit"){
    var query="UPDATE item SET name='"+item.name+"', price='"+item.price+"', class='"+item.class1+"' WHERE item_id='"+item.id+"'";
    sql.query(query,(err,result)=>{
      if(!err){
        res.redirect('/admin#items');
      }else{
        throw err;
      }
    });
  }else if(action=="delete"){
    var query="DELETE FROM item WHERE item_id='"+item.id+"'";
    sql.query(query,(err,result)=>{
      if(!err){
        res.redirect('/admin#items');
      }else{
        throw err;
      }
    });
  }else{
    res.redirect('/admin');
  }

});

app.post('/resto',adminauth,(req,res)=>{
  var resto1={
    name:req.body.name,
    descript:req.body.descript,
    branches:req.body.branches,
    o_site:req.body.o_site,
    fb_page:req.body.fb_page,
    tweet_page:req.body.tweet_page
  };

  sql.query("UPDATE restaurant SET restaurant='"+resto1.name+"', description='"+resto1.descript+"', branches='"+resto1.branches+"', official_site='"+resto1.o_site+"', facebook_page='"+resto1.fb_page+"', twitter_page='"+resto1.tweet_page+"' WHERE restaurant='"+resto.restaurant+"'",(err,result)=>{
    if(!err){
      res.redirect('/admin#resto1');
    }else{
      throw err;
    }
  });
})

app.post('/acc/:action',adminauth,(req,res)=>{
  if(req.params.action){
    var action=req.params.action;
    if(action=="add"){
      var crew={
        id:req.body.id,
        name:req.body.name,
        user:req.body.username,
        pass:req.body.pass,
        type:req.body.type
      };

      sql.query("INSERT INTO crew VALUES('"+crew.id+"','"+crew.name+"','"+crew.user+"','"+crew.pass+"','"+crew.type+"','Left')",(err,result)=>{
        if(!err){
          res.redirect('/admin');
        }else{
          throw err;
        }
      });
    }else if(action=="edit"){

    }else if(action=="delete"){
      var id=req.body.id;
      sql.query("DELETE FROM crew WHERE crew_id='"+id+"'",(err,result)=>{
        if(!err){
          res.redirect('/admin');
        }else{
          throw err;
        }
      });
    }else{
      res.redirect('/admin');
    }
  }else{
    res.redirect('/admin');
  }
});

io.on("connection",(socket)=>{
  socket.on('checkout',(customer)=>{
    io.emit('checkout',customer);
  });
});

http.listen(3000,()=>{
  console.log('Listening to port 3000');
});
