var envId ="dxwvr-1e2175" ;
var ename = null;
var efile = null;
var user = null;
var fileInput = document.getElementById("file");
var uploadButton = document.getElementById("upload");
var fileBoxList = document.getElementById("fileBox");
var fileNoticeSpan = document.getElementById("filenotice");
fileInput.addEventListener("change", this.getFile.bind(this), false)
uploadButton.addEventListener("click", this.upload.bind(this), false)
const app =tcb.init({
    env:envId
  });

var auth = app.auth({
    persistence: "local"
});

if(!auth.hasLoginState()) {
	auth.signInAnonymously();
}

const db =app.database();
var userCollection;

function getCookie(cname){
    var name = cname + "=";
  var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i].trim();
        if (c.indexOf(name)==0) { return c.substring(name.length,c.length); }
    }
    return "";
}

//*****check chookie and video list of user when onload vrsys.html
function checkCookieVideoList(){
    user = getCookie("username");
    userCollection = db.collection(user);
    const _ = db.command;
    if (user){       //如果cookie中有记录用户名字则加载该用户的文件列表   
        userCollection.where({type:"file", fileID:_.neq(null)})
        .get()
        .then(function (res) {
            if(res.data.length == 0){
                fileNoticeSpan.innerHTML="No file uploaded.";
            }
            else{
                for(var i=0;i<res.data.length;i++){
                    app.getTempFileURL({fileList:[res.data[i].fileID]})
                    .then(res2=>{
                        //动态生成html元素并压入：

                        //获得文件下载链接 url 和 文件名 fileName
                        var fileObj = res2.fileList[0];
                        var url = fileObj.tempFileURL;
                        var temparray = url.split('/');
                        var fileName = temparray.pop();//get the name from fileID
                        
                        //生成字面为fileName的文件链接
                        var anode =document.createElement("a");
                        var hrefnode=document.createAttribute("href");
                        hrefnode.nodeValue=`${url}`;
                        var textnode=document.createTextNode(`${fileName}`);                          
                        anode.attributes.setNamedItem(hrefnode);
                        anode.appendChild(textnode);
                        
                        //生成对应文件的删除按钮
                        var buttonnode = document.createElement("button");
                        var textbuttonnode=document.createTextNode("Delete");       
                        buttonnode.appendChild(textbuttonnode);
                        buttonnode.addEventListener("click", function(){ deleteFile(fileObj.fileID)}, false);
                   
                        //将所有元素压入表格的一行当中
                        var trnode =document.createElement("tr");
                        var tdnode =document.createElement("td");
                        var tdnode2 =document.createElement("td");
                        var tbodynode =document.createElement("tbody");
                        tdnode.appendChild(anode);
                        tdnode2.appendChild(buttonnode);
                        trnode.appendChild(tdnode);
                        trnode.appendChild(tdnode2);
                        tbodynode.appendChild(trnode);                       
                        fileBoxList.appendChild (tbodynode);
                    });
                }
            }
        });
    }
    else{//该用户未登录
        alert("Please login!");
        window.open("login.html","_self");
    }
}

function deleteFile(tempfileID){
    //删除文件
    app.deleteFile({fileList:[tempfileID]})
    .then(res=>{alert("Delete success!\nRefresh the page to refresh your files list.")});
    //从该用户的集合删除形容该文件的文档
    userCollection.where({type:"file", fileID:tempfileID}).remove();
}

//get file and name of file
function getFile(e){
    e.stopPropagation();
    e.preventDefault(); 
    efile = e.target.files[0];
    ename = efile.name;
}

//upload file
function upload(){
    if(ename && efile){
        app.uploadFile({
            //文件的绝对路径，包含文件名
            cloudPath: user+"/"+ename,
            //要上传的文件对象
            filePath: efile,
            onUploadProgress: function (progressEvent) {
                var percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                console.log(percentCompleted);
                
                //when upload finished to
                window.alert("Upload Success!\nRefresh the page to refresh your files list.");//alert               
              }
        }).then(res=>{
            //写入对应用户的json文档里
            const _=db.command;
            userCollection.where({fileID:res.fileID}).get().then(res2=>{
                if(res2.data.length == 0){//if the fileID is not recorded in the collection
                    userCollection.add({
                        type:"file",
                        fileID: res.fileID
                    })
                    .then(function (res3) {   
                    });
                }
            });    
        });   
    }
    else
        window.alert("Upload Failed");
}

