/*-----------------
Used in vrsys.html
-------------------*/

var envId ="dxwvr-1e2175";

var ename = null;
var efile = null;

var user = null;
var userCollection = null;


var fileInput = document.getElementById("file");
var uploadButton = document.getElementById("upload");
var fileBoxList = document.getElementById("fileBox");
var fileNoticeSpan = document.getElementById("filenotice");
var remindspan = document.getElementById("remind");
var uploadProgressBar = document.getElementById("uploadProgress");
fileInput.addEventListener("change", this.getFile.bind(this), false);
uploadButton.addEventListener("click", this.upload.bind(this), false);

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
    const _ = db.command;    
    const tempuserlist = ["temp01","temp02"];
    if (tempuserlist.indexOf(user) != -1){       //如果cookie中有记录用户名字则加载该用户的文件列表   
        userCollection = db.collection(user);
        userCollection.where({type:"file", fileID:_.neq(null)})
        .get()
        .then(function (res) {
            if(res.data.length == 0){
                fileNoticeSpan.innerHTML="No file uploaded.";
            }
            else{
                for(var i=0;i<res.data.length;i++){
                    app.getTempFileURL({fileList:[res.data[i].fileID]})
                    .then(res2=>{ //动态生成html元素并压入：
                        

                        //获得文件下载链接 url 和 文件名 fileName
                        var fileObj = res2.fileList[0];
                        var url = fileObj.tempFileURL;
                        console.log(url);

                        var temparray = url.split('/');
                        var fileName = temparray.pop();//get the name from fileID
                        
                        //生成字面为fileName的文件链接
                        var anode =document.createElement("a");
                        var hrefnode=document.createAttribute("href");
                        hrefnode.nodeValue=`${url}`;
                        var textnode=document.createTextNode(`${fileName}`);                          
                        anode.attributes.setNamedItem(hrefnode);
                        anode.appendChild(textnode);

                        //视频缩略图（只支持mp4类型的文件）
                        var videonode= document.createElement("video");
                        videonode.setAttribute("width", "150px");
                        videonode.setAttribute("height", "100px");
                        videonode.setAttribute("controls", "controls");
                        var sourcenode = document.createElement("source");
                        sourcenode.setAttribute("src", url);
                        sourcenode.setAttribute("type", "video/mp4");
                        anode.appendChild(videonode);
                        videonode.appendChild(sourcenode);

                        //生成对应文件的删除按钮
                        var buttonnode = document.createElement("button");
                        var textbuttonnode=document.createTextNode("Delete");    
                        buttonnode.setAttribute("class","btn btn-success");     
                        buttonnode.appendChild(textbuttonnode);
                        buttonnode.addEventListener("click", function(){ deleteFile(fileObj.fileID)}, false);
                   
                        //生成留言板
                        var textcommentnode=document.createTextNode("");
                        userCollection.where({type:"file", fileID:fileObj.fileID}).get()
                        .then(res3=>{
                            var tcoment;
                            tcoment=res3.data[0].ct;
                            if(tcoment)
                                textcommentnode.nodeValue = "Comment: " + tcoment;         
                        });

                        //将所有元素压入表格的一个trbody当中
                        var trnode = document.createElement("tr");
                        var trcommentnode = document.createElement("tr");
                        var tdnode =document.createElement("td");
                        var tdnode2 =document.createElement("td");
                        var tdcommentnode =document.createElement("td");
                        var tbodynode =document.createElement("tbody");

                        tdnode.appendChild(anode);
                        tdnode2.appendChild(buttonnode);
                        tdcommentnode.appendChild(textcommentnode);

                        trnode.appendChild(tdnode);
                        trnode.appendChild(tdnode2);
                        trcommentnode.appendChild(tdcommentnode);
                        
                        tbodynode.appendChild(trnode);     
                        tbodynode.appendChild(trcommentnode);    

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
    .then(res=>{
        alert("Delete success!");
        //从该用户的集合删除形容该文件的文档
        userCollection.where({type:"file", fileID:tempfileID}).remove().then(res=>{
            location.reload(); 
        });
    });  
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
       // remindspan.innerHTML = "Uploading, please wait.";
       // uploadProgressBar.value = 0;
        var value=0;
        progress(value);
        app.uploadFile({
            //文件的绝对路径，包含文件名
            cloudPath: user+"/"+ename,
            //要上传的文件对象
            filePath: efile,
<<<<<<< HEAD
            onUploadProgress: function (progressEvent) {
                console.log(progressEvent);
                var percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);                
                //when upload finished to               
              }
=======
            // onUploadProgress: function (progressEvent) {
            //     // console.log(progressEvent);
            //     // var percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            //     // console.log(percentCompleted)
            //     //when upload finished to
            //
            //     //remindspan.innerHTML = "";
            //
            //   }
>>>>>>> 8819c322573c9748d9ab2069b8cde45626f7695c
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
                        remindspan.innerText=100+"%";
                        $("#uploadProgress").css("width", "100%");
                        setTimeout(function(){
                            alert("Upload Success!");
                            location.reload();
                            },
                            1500);

                    });
                }
                else{
                    alert("The file has existed!")
                    location.reload();
                    }
            });    
        });   
    }
    else
        window.alert("Upload Failed");
}

//check cookie and the video list of this user when load the page(window)
window.addEventListener("load",checkCookieVideoList,false);

function progress(value) {
    if (value < 50) {
        value += 1;
        $("#uploadProgress").css("width", value + "%");
        // remindspan.innerText=value+"%";
        setTimeout("progress("+value+")", 20);
    }else if (value>=50 && value<85){
        value += 1;
        $("#uploadProgress").css("width", value + "%");
        // remindspan.innerText=value+"%";
        setTimeout("progress("+value+")", 40);
    }else if (value>=85 && value<99){
        value += 1;
        $("#uploadProgress").css("width", value + "%");
        // remindspan.innerText=value+"%";
        setTimeout("progress("+value+")", 60);
    }
    else return"";
}
