/*-----------------
Used in login_new.html
-------------------*/

var envId ="dxwvr-1e2175";

//avoid throw in Promise error when the 'uname' collection does not exist in tcb database
	//edit when update user or admin collections in tcb database
var e_tempuserlist = ["temp01","temp02"]; 
var m_tempuserlist = ["admin01","admin02"]; 
var e_nameInput = document.getElementById("signin-email");
var e_pwdInput = document.getElementById("signin-password");
var e_loginButton = document.getElementById("signIn");
var m_nameInput = document.getElementById("signup-email");
var m_pwdInput = document.getElementById("signup-password");
var m_loginButton = document.getElementById("signUp");
e_loginButton.addEventListener("click", function(){login(e_nameInput, e_pwdInput, e_tempuserlist)}, false);
m_loginButton.addEventListener("click", function(){login(m_nameInput, m_pwdInput, m_tempuserlist)}, false);

//init CloudBase
const app =tcb.init({
	env:envId
});

var auth = app.auth({
    persistence: "local"
}); 

if(!auth.hasLoginState()) {
	auth.signInAnonymously();
}

const db = app.database();

//bind to login button
function login(nameInput, pwdInput, tempuserlist){
	var uname = nameInput.value;
	var pwd = md5(pwdInput.value);
	//if user does not input ID or the ID is wrong, return
	if(tempuserlist.indexOf(uname) == -1){
		alert("ID does not exist");
		return;
	}

	//if the ID is right
	db.collection(uname).get().then((res)=>{ //get the collection named as this ID
    	if(!res.code){                       //if success, res.code is null
			db.collection(uname).where({password: pwd}).get().then((res2)=>{	//to identify if the password is correct
				if(res2.code){
					alert(`Error: [code=${res2.code}] [message=${res2.message}]`);
				}else{
					if(res2.data.length == 0)  //password wrong
						alert("password is wrong!");
					else{						 //password correct
						var subwin = null;
						//window.location.href='vrsys.html?name='+uname+'&psw='+pwd;
						if(uname=="admin01"|| uname =="admin02")
						{
							subwin = window.open("manage.html","_self");						
						}
							
						else
						{
							subwin = window.open("vrsys.html","_self");				
						}
						
						setCookie(subwin,"username",uname,7);    //set  cookie
					}
				}
			});
		}
	});		
}

//set cookie of MAIN system papge (save username)
function setCookie(csubwin,cname,cvalue,exdays){
	var d = new Date();
	d.setTime(d.getTime()+(exdays*24*60*60*1000));
	var expires = "expires="+d.toGMTString();
	csubwin.document.cookie = cname+"="+cvalue+"; "+expires;
}

//"ENTER" key to click login button
document.addEventListener("keydown",function(){
	if(event.keyCode == 13){
		loginButton.click();
	}
})

