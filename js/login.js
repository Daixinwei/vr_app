var envId ="dxwvr-1e2175" ;
const app =tcb.init({
  env:envId
});
var auth = app.auth({
    persistence: "local"
  }) 
if(!auth.hasLoginState()) {
	auth.signInAnonymously();
}

const db= app.database();

var nameInput = document.getElementById("user");
var pwdInput = document.getElementById("password");

/*set cookie */
function setCookie(csubwin,cname,cvalue,exdays){
	var d = new Date();
	d.setTime(d.getTime()+(exdays*24*60*60*1000));
	var expires = "expires="+d.toGMTString();
	csubwin.document.cookie = cname+"="+cvalue+"; "+expires;
}

function login(){
	var uname = nameInput.value;
	var pwd = pwdInput.value;
	var coll =db.collection("vrUser");
	var subwin;
	coll.where({
		name: uname,
		password: pwd
	}).get().then((res)=>{	
		if(res.code){
			alert(`Error: [code=${res.code}] [message=${res.message}]`);
		}else{
      		if(res.data.length == 0)
	     		alert("ID or password is wrong!");
	  		else
			{
				//window.location.href='vrsys.html?name='+uname+'&psw='+pwd;

				subwin=window.open("vrsys.html","_self");
				setCookie(subwin,"username",uname,7); //set username to cookie
				console.info("success");
			}
		}
	});
}

