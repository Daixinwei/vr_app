var envId ="dxwvr-1e2175" ;
var ename = null;
var efile = null;
var fileInput = document.getElementById("file");
var uploadButton = document.getElementById("upload");
var fileBoxList = document.getElementById("fileBox");
fileInput.addEventListener("change", this.getFile.bind(this), false)
uploadButton.addEventListener("click", this.upload.bind(this), false)
const app =tcb.init({
    env:envId
  });
var auth = app.auth({
    persistence: "local"
  }) 
if(!auth.hasLoginState()) {
	auth.signInAnonymously();
}
const db =app.database();
const userCollection=db.collection("vrUser");

function getCookie(cname){
    var name = cname + "=";
  var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i].trim();
        if (c.indexOf(name)==0) { return c.substring(name.length,c.length); }
    }
    return "";
}

//check chookie and video list of user,from the newset user name
//string var in 'vrUSer' json file:
//fileID
//name
//password
//_id
function checkCookieVideoList(){
  var user=getCookie("username");
  if (user){
    //欢迎该用户登录
    alert("Welcome " + user + " access");  
    //从数据库获取该用户上传的文件的fileID所组成的string数组
    var fileIDList;
    userCollection.where({name:user})
           .get()
           .then(function (res) {
               console.log(res.data[0].fileID);
               if(fileIDList = res.data[0].fileID){
                    //通过fileID遍历该用户上传的所有文件并生成下载链接
                    for(var i=0; i<fileIDList.length; i++){
                        app.getTempFileURL({fileList:[fileIDList[i]]})
                        .then(res2=>{
                            var fileObj = res2.fileList[0];
                            var url = fileObj.tempFileURL;
                            var node =document.createElement("a");
                            var hrefnode=document.createAttribute("href");
                            hrefnode.nodeValue=`${url}`;
                            var textnode=document.createTextNode(`${url}`);
                            var brnode=document.createElement("br")
                            node.attributes.setNamedItem(hrefnode);
                            node.appendChild(textnode);
                            node.appendChild(brnode);
                            fileBoxList.appendChild (node);
                        });
                    }
                }
            });
    }
    else{
        alert("Please login!");
        window.open("login.html","_self");
    }
}


function getFile(e){
    e.stopPropagation();
    e.preventDefault(); 
    efile = e.target.files[0];
    ename = efile.name;
}

function upload(){
    var user=getCookie("username");

    if(ename && efile){
        app.uploadFile({
            //文件的绝对路径，包含文件名
            cloudPath: user+"/"+ename,
            //要上传的文件对象
            filePath: efile,
            onUploadProgress: function (progressEvent) {
                var percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                console.log(percentCompleted);
                //alert when upload finished
                window.alert("Upload Success! Refresh the page to see your newest video list.");
              }
        }).then(res=>{
            //写入对应用户的json文档里
           const _=db.command;
           userCollection.where({name:user})
           .update({fileID:_.push(res.fileID)})
           .then(function (res) {
           });
        });   
    }
    else
        window.alert("Upload Failed");
}