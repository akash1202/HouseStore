var mysql= require('mysql');
var bodyParser=require('body-parser');
const { request } = require('http');
const { response } = require('express');
var fs=require('fs');
var multer=require('multer'); //file upload operations
//var alert = require('alert'); 
const { config, nextTick } = require('process');
var urlencodedParser=bodyParser.urlencoded({extended: false});
var con= mysql.createConnection({
    host: "localhost",
    user:"root",
    password: "",
    database: "house_store"
}); //connection to the mysql database

var userdata="";

var Storage=multer.diskStorage({
    destination:function(req,file,callback){
        callback(null,"public/images/");
    },
    filename:function(req,file,callback){
        callback(null,file.originalname);
    }
});

var addtoCart=function(productID=0){
let found=false;
this.data.items.forEach(item=>{
    if(item.id===productID){
        found=true;
    }
});
return found;
}

var calculateTotals=function(){
    this.data.totals=0;
    this.data.items.forEach(item=>{
        let price=item.price;
        let qty=item.qty;
        let amount=price*qty;
        this.data.totals+=amount;
    });
    this.setFormattedTotals();
}

var setFormattedTotals=function(){
    let format= new Intl.NumberFormat(config.locale.lang,{style:'currency',currency:config.locale.currency});
    let totals=this.data.totals;
    this.data.formattedTools =format.format(totals);
}

var addToCart=function(product=null,qty=1){
    if(!this.inCart(product.product_id)){
        let format=new Intl.NumberFormat(config.locale.lang,{
            style:'currency',currency:config.locale.currency
        });
        let prod={
            id:product.product_id,
            title:product.title,
            price:product.price,
            qty:qty,
          //  image=product.image,
            formattedPrice:format.format(product.price)
        };
        this.data.items.push(prod);
        this.calculateTotals();
    }
}

var upload=multer({
storage:Storage
}).single("imguploader");

var myCss={
    style:fs.readFileSync('public/css/style.css','utf-8',{async: true})
};

var myCss2={
    style:fs.readFileSync('public/css/style2.css','utf-8',{async: true})
};


module.exports= function(app) {
    app.get('/register',function(req,res){
        //res.render('signup',{udata:userdata,usertype:req.session.usertype});
            console.log('We got 1 more user');
            res.render('signup',{title: 'Registeration Page',
            myCss:myCss,
            udata:userdata,usertype:""});
        //    res.render('registration',{udata:userdata,usertype:req.session.usertype});
    });

   app.get('/login',function(req,res){
        if(req.session.loggedin){
                //res.end('<html><head><script>alert("You\'re already loggedin!");</script></head><body><a href="logout">Logout</body><html>');
            res.render("home",{udata:userdata,usertype:req.session.usertype});
               // popup.alert({content:"you're already loggedin"});   
        }else{
                console.log('We got 1 more user');
                res.render('login',{title: 'Login Page',
                myCss:myCss,
                udata:userdata,usertype:""});           
          //  res.render('login',{udata:userdata,usertype:req.session.usertype});
            }
    });
    
    app.get('/home',function(req,res){
        if(req.session.loggedin){
        //req.session.username=req.body.username;
        //res.redirect("home");
        res.render('home',{udata:userdata,usertype:req.session.usertype});
        }else{
            res.redirect(301,"login");
            console.log("Not Loggedin!!!");
        }
    });

    app.get('/aboutus',function(req,res){
        res.render('aboutus',{udata:userdata,usertype:req.session.usertype});
    });

    app.get('/contactus',function(req,res){
        res.sendFile('contactus.html',{root:'public'});
    });

    app.post('/contactus',function(req,res){
        if(req.body.name!=null && req.body.email!=null && req.body.subject!=null && req.body.message!=null){
        var personName=req.body.name;
        var personEmail=req.body.email;
        var personSubject=req.body.subject;
        var personMessage=req.body.message;
            console.log("Contact us!!");
            query=  "insert into `contactus`( `name`, `email`, `subject`, `message`) values ('"+personName+"','"+personEmail+"','"+personSubject+"','"+personMessage+"');";
            con.query(query,function(err,result,fields){
                    if(err){
                    //    window.alert("Error in Contactus");
                    console.log("Error in Contactus");
                    throw err;
                    }else{
                        console.log("Received Feedback!!");
                        res.end("OK");
                        //res.redirect(301,"login");
                    }
                    });
           // res.end("<html><head><script>alert('Thank you for Contacting we will get back to you asap!')</script><head><body><a href='home'>Go Back</a></body></html>"); 
           }
       
    });

    app.get('/profile',function(req,res){
        data=""
        if(req.session.loggedin){
          //  console.log(JSON.parse(JSON.stringify(userdata)))
          var query="select * from payment where customer_id="+req.session.userid+";";
          con.query(query,function(err,result,fields){
            if(!err){
                data=JSON.parse(JSON.stringify(result))
                console.log('card',data)
                res.render('profile',{usertype:req.session.usertype,card:data,udata:userdata});
            }
          });  
          
        }else{
            res.end("<html><head><script>alert('please Login to view this page!')</script><head><body><a href='home'>Go Back!</a></body></html>");
        }
    });

    app.get('/paymentmethods',function(req,res){
        data=""
        var query="select * from payment where customer_id="+req.session.userid+";";
        if(req.session.loggedin){
            //  console.log(JSON.parse(JSON.stringify(userdata)))
              res.render('paymentmethods',{usertype:req.session.usertype,udata:userdata});
          }else{
              res.end("<html><head><script>alert('please Login to view this page!')</script><head><body><a href='home'>Go Back!</a></body></html>");
          }
    });

    app.get('/products',function(req,res){
        if(req.session.loggedin){
            res.render('products',{usertype:req.session.usertype,udata:userdata});
        }else{
            res.end("<html><head><script>alert('please Login to view this page!')</script><head><body><a href='home'>Go Back!</a></body></html>"); 
        }
        
    });

    app.post('/paid',function(req,res){
        //productid=req.params.id;
        var buyername=req.body.name;
        var cardnumber=req.body.cardnumber;
        var cardcvv=req.body.cvv;
        var cartid=req.body.cartid;
        var customerid=req.body.customerid;
        var amount=req.body.cost.replace('$','');
        var cardexp=req.body.exp;
        var address1=req.body.address1;
        var address2=req.body.address2;
        var city=req.body.city;
        var state=req.body.state;
        var pincode=req.body.pincode;
        var phone=req.body.phone;
        console.log('amount paid: ',amount,buyername,cardnumber,cardcvv,cardexp,cartid,customerid)
        
        if(req.session.loggedin){
            var query1="call paid("+cartid+","+customerid+","+cardnumber+",'"+buyername+"','"+cardexp+"','"+cardcvv+"',"+amount+",'"+address1+"','"+address2+"','"+city+"','"+state+"','"+pincode+"','"+phone+"');";
            con.query(query1,function(err,result,fields){
                 console.log('result'+result);
                 if(err){
                     console.log(err);
                     res.send('error');
                    // return res.end("<script>alert('something went wrong!');</script>");
                 }else{
                    console.log("Paid Successfully!");
                 }
                 
                 res.render('paymentdone');
             });            
         } 
    });
    app.get('/paymentdone',function(req,res){
        res.render('paymentdone');
    });
   
   
    app.post('/additem',function(req,res){
        productid=req.body.id;
        if(!req.session.loggedin){
            var query1="UPDATE `cart_items` SET cart_items.quantity=cart_items.quantity+1 WHERE cart_items.customer_id='"+req.session.userid+"';";
            var query2="UPDATE `product` SET `product`.`availablecount`=`product`.`availablecount`-1 WHERE `product`.`product_id`='"+productid+"';";
            var query3="SELECT * FROM `cart_items` JOIN `product` ON `cart_items`.product_id =`product`.product_id WHERE `cart_items`.customer_id="+req.session.userid+";";
             con.query(query1,function(err,result,fields){
                 console.log('result'+result);
                 if(err){
                     console.log(err);
                     res.send('error');
                    // return res.end("<script>alert('something went wrong!');</script>");
                 }else{
                    console.log("item count increased in cart items");
                     con.query(query2,function(err,result,fields){
                        if(err){
                            console.log(err);
                            res.send('error');
                        }else{
                            console.log("item count decreased in products");
                            con.query(query3,function(err,result,fields){
                                    if(!err){
                                        console.log("items from cart retrieved!");
                                        var data=JSON.parse(JSON.stringify(result));
                                        console.log(data);
                                        res.send({items:data});
                                    }else{
                                        res.send('error');
                                    }
                            });
                            
                            //return res.end("<html><head><script>alert('Product Added Successfully!')</script><head><body><a href='home'>Go Back!</a></body></html>");  
                        }
                     });
                 }             
             });            
         }       
        });

    app.post('/dropitem',function(req,res){
        productid=req.body.item
        if(req.session.loggedin){
            var query1="UPDATE `cart_items` SET cart_items.quantity=cart_items.quantity-1 WHERE cart_items.customer_id=cid;";
            var query2="UPDATE `product` SET `product`.`availablecount`=`product`.`availablecount`+1 WHERE `product`.`product_id`=pid;";
            var query3="SELECT * FROM `cart_items` JOIN `product` ON `cart_items`.product_id =`product`.product_id WHERE `cart_items`.customer_id="+userdata.customer_id+";";
             con.query(query1,function(err,result,fields){
                 console.log('result'+result);
                 if(err){
                     console.log(err);
                     return res.end("<script>alert('something went wrong!');</script>");
                 }else{
                    console.log("item count decreased in cart items");
                     con.query(query2,function(err,result,fields){
                        if(err){
                            console.log(err);
                        }else{
                            console.log("item count increased in products");
                            con.query(query3,function(err,result,fields){
                                    if(!err){
                                        console.log("items from cart retrieved!");
                                        var data=JSON.parse(JSON.stringify(result));
                                        res.send({items:data});
                                    }else{
                                        console.log(err);
                                    }
                            });
                            
                            //return res.end("<html><head><script>alert('Product Added Successfully!')</script><head><body><a href='home'>Go Back!</a></body></html>");  
                        }
                     });
                 }             
             });            
         }   
        productid=req.body.item
        res.send("",{item,});
    });
    app.post('/droporder',function(req,res){
        var cartitemid=req.body.id
        if(req.session.loggedin){
            var query1="DELETE FROM `cart_items` WHERE cart_items.id="+cartitemid+";";
             con.query(query1,function(err,result,fields){
                 console.log('result'+result);
                 if(!err){
                    res.send("ok");
                 }else{
                     console.log("Error in removing Order:",err);
                 }
             });
         }else{

         }   
        
    });



    app.get('/users',function(req,res){
        data="";
        var query="select * from customer;";
        if(req.session.loggedin){
            con.query(query,function(err,result,fields){
                if(!err){
                    data=JSON.parse(JSON.stringify(result));
                    console.log("User Data is ",data);
                    res.render('users',{
                        title:'Users',
                        myCss:myCss,
                        users:data,udata:userdata,usertype:req.session.usertype});
                    //res.render('orders',{usertype:req.session.usertype,items:data,udata:userdata});
                  //  console.log(data);
                }else{
                    console.log(err)
                }
            });
            //res.render('orders',{usertype:req+.session.usertype,udata:userdata});
        }else{
            res.end("<html><head><script>alert('please Login to view this page!')</script><head><body><a href='home'>Go Back!</a></body></html>"); 
        }
    });

    app.get('/addproduct',function(req,res){
        res.render("addproduct",{udata:userdata,usertype:req.session.userType});
    });

    app.post('/addproduct',function(req,res){
        var primage=null;  
        upload(req,res,function(err){
        console.log(err);
        if(err){
                throw err;
                   //return res.end("<script>alert('something went wrong!');</script>");
        }else{
                console.log(req.file.originalname);
                primage='images/'+req.file.originalname;    

                //    req.files.forEach(function(value,key) {
                //        console.log(value.originalname);
                //        productimage='images/'+value.originalname;
                //    });
                //var productimage='images/'+req.files[0].filename;   
                var prtype=req.body.prtype;
                var prname=req.body.prname;
                var prprice=req.body.prprice+'';
                var prdescription=req.body.prdescription;
                var prquantity=req.body.prquantity+'';
                var prsellername=req.body.prsellername;
                var pravailablecount=req.body.prquantity+'';
                console.log(prtype,prname,prdescription,prprice,prquantity,prsellername,pravailablecount);
            if(req.session.loggedin){
                   var query="INSERT INTO `product`(`name`, `price`, `image`, `description`, `type`, `quantity`,`sellername`,`availablecount`) values('"+prname+"','"+prprice+"','"+primage+"','"+prdescription+"','"+prtype+"','"+prquantity+"','"+prsellername+"','"+pravailablecount+"')"; 
                    con.query(query,function(err,result,fields){
                        console.log('result'+result);
                        if(err){
                            console.log(err);
                            return res.end("<script>alert('something went wrong!');</script>");
                        }else{
                          //  res.alert("car booked successfully!!!");
                          return res.end("<html><head><script>alert('Product Added Successfully!')</script><head><body><a href='home'>Go Back!</a></body></html>");  
                         //res.end("Car booked successfully!! ");
                        }             
                    });            
                }       
               }
            });
       // res.render("addproduct",{udata:userdata});

    });

    app.get("/removeitem",function(req,res){
        var productid=req.query.productid;
        console.log("product id:"+productid);
        if(req.session.loggedin){
            var query="DELETE FROM `product` WHERE `product_id`='"+productid+"';";
            con.query(query,function(err,result,fields){
                if(!err){
                    res.end("<html><head><script>alert('Product removed Successfully!')</script><head><body><a href='home'>Go Back!</a></body></html>"); 
                }else{
                    throw err;
                }
            });
        }else{
            res.end("<html><head><script>alert('please Login to view this page!')</script><head><body><a href='home'>Go Back!</a></body></html>"); 
        }
    });

  app.get('/addfirsttocart',function(req,res){
    data="";    
    if(req.session.loggedin){
            var productid=req.query.productid;
            var query1="call addfirsttocart("+productid+","+userdata.customer_id+");";
             con.query(query1,function(err,result,fields){
                 if(!err){
                    data=JSON.parse(JSON.stringify(result));
                    console.log('insert result: '+result);
                    console.log("cart items:",data); //data retrieved after updating cart
                                res.render('shoppingcart2',{
                                        title:'Shopping Cart',
                                        myCss:myCss,
                                        udata:userdata,usertype:req.session.usertype,items:data});               
                         }else{
                             console.log("Insert error:",err,fields);
                         }   
                });             
    } else{
        res.render('login',{
            title:'Login Page',
            myCss:myCss,
            udata:userdata,usertype:req.session.usertype});    
    }
  }); 
  
  app.get('/orders',function(req,res){
    data="";
    var query="call orders("+req.session.userid+");";
    if(req.session.loggedin){
        con.query(query,function(err,result,fields){
            if(!err){
                data=JSON.parse(JSON.stringify(result));
                console.log("Order Data is ",data);
                res.render('orders',{
                    title:'My Orders',
                    myCss:myCss,
                    items:data,udata:userdata,usertype:req.session.usertype});
                //res.render('orders',{usertype:req.session.usertype,items:data,udata:userdata});
              //  console.log(data);
            }else{
                console.log(err)
            }
        });
        //res.render('orders',{usertype:req+.session.usertype,udata:userdata});
    }else{
        res.end("<html><head><script>alert('please Login to view this page!')</script><head><body><a href='home'>Go Back!</a></body></html>"); 
    }
});

app.get('/allorders',function(req,res){
    data="";
    var query="call allorders();";
    console.log(query);
    if(req.session.loggedin){
        con.query(query,function(err,result,fields){
            if(err)
            throw err;
            data=JSON.parse(JSON.stringify(result)); //data object should be assigned internally to query result
            console.log("shopping cart Data is ",data);
            res.render('allorders',{
            title:'Orders',
            myCss:myCss,
            items:data,udata:userdata,usertype:req.session.usertype});
           // res.render('bedroom',{bedrooms:data,usertype:req.session.usertype});
        });
        }else{
            res.end("<html><head><script>alert('please Login to view this page!')</script><head><body><a href='home'>Go Back!</a></body></html>"); 
        }
});

app.post('/updatecart',function(req,res){
   var cart=req.body.data;
   console.log("received ajax request:",cart);
   cart=JSON.parse(cart)
   var Allkeys=Object.keys(cart)
   var keys=Object.keys(cart['items'])
   var cartid=cart['cartid'] //cart id we passed to update item count
   var items=cart['items']
   for(var i=0;i<keys.length;i++){
       console.log(items[keys[i]]);
        var query="call updatecartitem("+keys[i]+","+items[keys[i]]+","+cartid+");";
        con.query(query,function(err,result,fields){
            if(err)
            throw err;
            data=JSON.parse(JSON.stringify(result)); 
            console.log("shoppoing cart data after updating cart:",data);
            //res.setHeader("Content-Type","application/json");
            res.send({result:data});
           // next();
        });
    }
});


app.post('/makepayment',function(req,res){
req.body
res.render('paynow',{});
});

  app.get('/shoppingcart',function(req,res){
    data="";
    var query="call cart("+userdata.customer_id+");";
    console.log(query);
    if(req.session.loggedin){
        con.query(query,function(err,result,fields){
            if(err)
            throw err;
            data=JSON.parse(JSON.stringify(result)); //data object should be assigned internally to query result
            console.log("shopping cart Data is ",data);
            res.render('shoppingcart2',{
            title:'Shopping Cart',
            myCss:myCss,
            items:data,udata:userdata,usertype:req.session.usertype});
           // res.render('bedroom',{bedrooms:data,usertype:req.session.usertype});
        });
        }else{
            res.end("<html><head><script>alert('please Login to view this page!')</script><head><body><a href='home'>Go Back!</a></body></html>"); 
        }
    });

    app.get('/bedroom',function(req,res){
        data="";
        var query="select * from product where type='bedroom';";
        var query2="SELECT * FROM `cart_items` JOIN `product` ON `cart_items`.product_id =`product`.product_id WHERE `cart_items`.customer_id="+userdata.customer_id+";";
        if(req.session.loggedin){
            con.query(query,function(err,result,fields){
                if(!err){
                    con.query(query,function(err,result,fields){
                        if(!err){
                            data=JSON.parse(JSON.stringify(result));            
                        }
                    });       
                }
                if(err)
                throw err;
                data=JSON.parse(JSON.stringify(result));
                console.log("Data is "+data);
                res.render('bedroom',{bedrooms:data,udata:userdata,usertype:req.session.usertype});
            });
        }else{
           // response.send('content-type','application/json');
           res.end("<html><head><script>alert('please Login to view this page!')</script><head><body><a href='home'>Go Back!</a></body></html>"); 
        }
       // res.render('luxury',{});
    });

    app.get('/livingroom',function(req,res){
        data="";
        var query="select * from product where type='livingroom';";
        if(req.session.loggedin){
            con.query(query,function(err,result,fields){
                if(err)
                throw err;
                data=JSON.parse(JSON.stringify(result));
                console.log("Data is "+data);
                res.render('livingroom',{livingrooms:data,udata:userdata,usertype:req.session.usertype});
            });
        }else{
           // response.send('content-type','application/json');
           res.end("<html><head><script>alert('please Login to view this page!')</script><head><body><a href='home'>Go Back!</a></body></html>"); 
        }
       // res.render('luxury',{});
    });

    app.get('/kitchen',function(req,res){
        data="";
        var query="select * from product where type='kitchen';";
        if(req.session.loggedin){
            con.query(query,function(err,result,fields){
                if(err)
                throw err;
                data=JSON.parse(JSON.stringify(result));
                console.log("Data is "+data);
                res.render('kitchen',{kitchens:data,udata:userdata,usertype:req.session.usertype});
            });
        }else{
           // response.send('content-type','application/json');
           res.end("<html><head><script>alert('please Login to view this page!')</script><head><body><a href='home'>Go Back!</a></body></html>"); 
        }
       // res.render('luxury',{});
    });

    app.get('/outdoor',function(req,res){
        data="";
        var query="select * from product where type='outdoor';";
        if(req.session.loggedin){
            con.query(query,function(err,result,fields){
                if(err)
                throw err;
                data=JSON.parse(JSON.stringify(result));
                console.log("Data is "+data);
                res.render('outdoor',{outdoors:data,udata:userdata,usertype:req.session.usertype});
            });
        }else{
           // response.send('content-type','application/json');
           res.end("<html><head><script>alert('please Login to view this page!')</script><head><body><a href='home'>Go Back!</a></body></html>"); 
        }
       // res.render('luxury',{});
    });

    app.post('/registerme',urlencodedParser,function(req,res){
        console.log('User registeration request');
        if(req.body.name!=null && req.body.email!=null && req.body.password!=null && req.body.phone!=null){
        var name=req.body.name;
        var email=req.body.email;
        var password=req.body.password;
        var phone=req.body.phone;
        console.log("registering!!");
        query=  "insert into `customer`( `name`, `email`, `password`, `phone`) values ('"+name+"','"+email+"','"+password+"','"+phone+"');";
        con.query(query,function(err,result,fields){
                if(err){
                 //   window.alert("Error in Registeration");
                console.log("Error in registeration");
                throw err;
                }else{
                    console.log("registered!!");
                    res.redirect(301,"login");
                }
                });
       }
        
    });

    app.post('/logincheck',function(req,res){
        var userType=req.body.usertype;
        var userPassword=req.body.password;
        var userEmail=req.body.email;
        var query=null;
        if(userType=='employee'){
        query="select * from admin where email='"+userEmail+" ' and password='"+userPassword+"'";
        }else{
            query="select * from customer where email='"+userEmail+" ' and password='"+userPassword+"'";
        }

        con.query(query,function(err,result,fields){
            if(result.length>0){
                req.session.loggedin=true;
                req.session.usertype=userType;
                if(userType=='employee'){
                    req.session.userid=result[0].admin_id;
                }else{
                    req.session.userid=result[0].customer_id;
                }

                console.log("id:",req.session.userid);
                req.session.useremail=userEmail;
                userdata=JSON.parse(JSON.stringify(result[0]));
                console.log('User data:',userdata);
                res.redirect(301,"products");
            }else{
                res.end("<html><head><script>alert('Invalid login Credentials!')</script><head><body><a href='home'>Go Back</a></body></html>"); 
            }
        })
    });

    app.get('/logoutme',function(req,res){
        console.log("Logged out!");
        req.session.loggedin=null;
        req.session.username=null;
        req.session.usertype=null;
        req.session.useremail=null;
        userdata=null;  
        console.log('logged out!');
        req.session.destroy(function(err){
                if(err){
                    console.log(err);
                }else{
                 console.log("Logged out");   
                }
        });
        res.render("login",{udata:userdata,usertype:""});
    });

    

    


}