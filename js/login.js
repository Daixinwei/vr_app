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

const db = app.database();

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
	
	//avoid throw error when the 'uname' collection does not exist in tcb database
	const tempuserlist = ["temp01","temp02"];//edit when update collections in tcb database
	if(tempuserlist.indexOf(uname) == -1){
		alert("ID does not exist");
		return;
	}

	db.collection(uname).get().then((res)=>{ //找到该用户的集合
    	if(!res.code){//操作成功 code为null
			var subwin = null;
			db.collection(uname).where({password: pwd}).get().then((res2)=>{	//验证密码是否匹配
				if(res2.code){
					alert(`Error: [code=${res2.code}] [message=${res2.message}]`);
				}else{
					  if(res2.data.length == 0)  //密码错误
						 alert("password is wrong!");
					  else						//密码正确
					{
						//window.location.href='vrsys.html?name='+uname+'&psw='+pwd;
						subwin = window.open("vrsys.html","_self");
						setCookie(subwin,"username",uname,7); //set username to cookie
						console.info("success");
					}
				}
			});
		}
	});		
}

