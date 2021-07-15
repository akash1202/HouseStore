if (document.readyState == 'loading') {
    document.addEventListener('DOMContentLoaded', ready)
} else {
    ready()
}

function ready(){
var items=document.getElementsByClassName("item")
var tables=document.getElementById('table')
var trs=tables.getElementsByTagName('tr')
//var itemcountTexts= document.getElementsByClassName("item-count-in-cart")
//var itemaddButtons= document.getElementsByClassName("item-add")
//var itemremoveButtons= document.getElementsByClassName("item-remove")
//var itemTotalTexts=document.getElementsByClassName("item-total")
//var cartTotal=document.getElementsByClassName("cart-total")
console.log(items)
console.log(tables)
var cartids=[];
var cartquantity=[];
var cart = {};
console.log(trs)

  for(var i=1;i<trs.length-2;i++){ //first row is for title and last row is for last order and second last is total of all order    
    var itemCountView=trs[i].getElementsByClassName('item-count')[0]
    var itemRemover=trs[i].getElementsByClassName('item-remove')[0]
    console.log('itemremover',itemRemover)
    //console.log(addButton,removeButton)
    //removeButton.addEventListener('click',dropItemClicked)
    itemRemover.addEventListener('click',itemRemoveClicked)
    }
    var paynowButton=document.getElementsByClassName('register-register-button')[0]
    //paynowButton.addEventListener('click',paynowButtonClicked);


function paynowButtonClicked(event){
    if(parseFloat(updateCartTotal())>0){
        proceedToPay()
    }else{
        alert('please Add Item to Cart first!')
    }
}

function itemRemoveClicked(event){
itemRemoverButton=event.target
console.log('remove:',itemRemoverButton)
itemRemoverButton.parentElement.remove()

var cartitemid=itemRemoverButton.id;
quantityChanged(event)
updateCartTotal()
removeItemNow(cartitemid)    
//dropItemClicked(event)
}


function removeItemNow(cartitemid){
    console.log("item id",cartitemid)
    $.ajax({
        type:"POST",
        url:"droporder",
        data:"id="+cartitemid,
        dataType:"json",
        success:function(items){
            if(items=='ok'){
                alert("Order Removed Successfully!")
            }
            console.log("drop order:",items)
        },
        error:function( xhr,status,error){
            console.log("Ajax error: ",error,status,xhr)
        },
        dataType:'text'
    });
}

function quantityChanged(event) {
    var buttonclicked = event.target
    var input =buttonclicked.parentElement.getElementsByClassName('item-count-in-cart')[0]
    console.log('ab',buttonclicked,input)
      if (isNaN(parseInt(input.innerText)) || parseInt(input.innerText) <= 0) {
          input.innerText = 1
      }
    updateCartTotal()
}


function CheckBrowser() {
    if ('localStorage' in window && window['localStorage'] !== null) {
        // We can use localStorage object to store data.
        return true;
    } else {
            return false;
    }
}

function saveItem(itemids,itemQuantity) {
    for(var i=0;i<itemids;i++){
    localStorage.setItem(itemids[i], itemQuantity[i]);
    }
  //  doShowAll();
}

function getStorageItems(){
    for(var i=0;i<localStorage.length;i++){
        console.log(cartids,cartquantity)
    }
}

function clearAll(){
    localStorage.clear();
}

function dropItemClicked(event){
    var buttonClicked=event.target
    var item=buttonClicked.parentElement.parentElement
    var itemcountElement=buttonClicked.parentElement
    console.log("target:",buttonClicked)
    var itemcounttextElement=buttonClicked.parentElement.getElementsByClassName("item-count-in-cart")[0]
    var currentcount=parseInt(''+itemcounttextElement.innerText)
    itemcounttextElement.innerText=(currentcount-1)
    quantityChanged(event)
    updateCartTotal()
    //var itemtotal=item.getElementsByClassName("item-total")[0].innerText    
    //var carttotalValue=document.getElementsByClassName("cart-total")[0].innerText
    //var sum=0
    //for(var i=0,carttotal=0,itemtotal=0;i<document.getElementsByClassName("item");i++){
    //    itemtotal=0
    //    var itemprice=parseFloat(document.getElementsByClassName("item-count-in-cart")[i].innerText)
    //}
    //cartTotal.innerText=
   
    
   //dropItem(event)
}


function updateCartTotal() {
    var trs=document.getElementsByTagName('tr')
    var total = 0
    var itemIds=[]
    var itemQuantity=[]
    //console.log(document.getElementsByClassName('item'))
    console.log(" update cart total",trs)
    for (var i = 1; i < trs.length-2; i++) {
        var cartRow = trs[i]
        var priceElement = cartRow.children[3]
        var quantityElement = cartRow.children[4].children[0]
        var itemtotalElement=cartRow.children[5]
        var price = parseFloat(priceElement.innerText.replace('$', ''))
        var quantity = parseFloat(quantityElement.innerText.replace(' ',''))
        itemtotalElement.innerText='$'+Math.round(price * quantity*100)/100;
        total = total + (price * quantity)
        console.log('updatecarttotal: ',i,price,quantity,itemtotalElement.innerText,total)
        console.log('id',cartRow,cartRow.id)
        itemIds.push(parseInt(cartRow.id))
        itemQuantity.push(quantity)
    }
    total = Math.round(total * 100)/100
    console.log('update cart total',trs[trs.length-2])
    trs[trs.length-2].children[5].innerText = '$' + total
   // trs[trs.length-1].children[].innerText=formatDate(items[items])
    var payingamount=document.getElementsByClassName('cost')[0]
    var payingamountToSubmit=document.getElementById('cost2')
    trs[trs.length-1].children[0].innerText="Last Ordered: "+trs[trs.length-3].children[7].innerText;
    trs[trs.length-1].children[2].innerText="Time: "+trs[trs.length-3].children[8].innerText;
    trs[trs.length-1].children[4].innerText="Ordered by: "+ trs[trs.length-3].children[6].innerText;

    //payingamount.innerText='$'+total
    //payingamountToSubmit.value=total+''
    cartids=itemIds
    cartquantity=itemQuantity
    result = {};
for(var i=0;i<cartids.length;i++){
    result[cartids[i]]=cartquantity[i]
}
    //cartids.forEach((key,value) => result[key] = cartquantity[i]);
    console.log("cart:  ",result);
    clearAll();
    saveItem(itemIds,itemQuantity)
    return total
}
 
      function addItem(itemid,itemcountertext,carttotal){
        var id=item.id
        //var itemadd= event.target
        //var itemcount=itemadd.parentElement
        //var itemscounttext=itemcount.getElementsByClassName("item-count-in-cart")
        console.log(counter)
        //var itemcounttext=itemscounttext[0]
        //console.log(itemscounttext)
        //var itemcount=itemadd.parentElement;
        //var itemid=parseInt(itemadd.id+'')
        //var item=itemcount.parentElement;
        
        //var count=itemcounttext.innerText;
        alert("item added to cart"+id)
        //itemcounttext.innerText=parseInt(count)+1;
        //cart
            $.ajax({
                url:"addfirstitem",
                data:"id="+id,
                type:"POST",
                dataType:"json",
                success:function(items){
                    if(items=='OK'){
                        alert("item added")
                        itemcounter.innerText=(parseInt(itemcounter.innerText)-1)+'';
                    }
                    var data1="<h1>Hello world</h1>";
                    console.log(items)
        // $("#cartbody").html('<p>'+items[0].name+'</p>');
                }
            });
        }

       
        function dropItem(event){
            var item=event.target;
            item.parent
            $.ajax({
                url:"dropitem",
                data:"id=",
                type:"POST",
                dataType:"json",
                success:function(items){
                    if(items == 'error'){
                       alert("Error");
                    }else{
                        alert("Success");
                    }
                    var data1="<h1>Hello world</h1>";
                    console.log(items)
        //$("#cartbody").html('<p>'+items[0].name+'</p>');
                }
            });
        }
    }