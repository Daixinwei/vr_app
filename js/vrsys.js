/*-----------------
Used in vrsys.html
-------------------*/

var envId ="dxwvr-1e2175";

var ename = null;
var efile = null;

var user = null;
var userCollection = null;

var dashboard = document.getElementById("dashboard");
var fileName = document.getElementById("fileName");
var helloUserName = document.getElementById("helloUserName");
var fileInput = document.getElementById("file");
var uploadButton = document.getElementById("upload");
var noteInput = document.getElementById("Note");
var fileBoxList = document.getElementById("fileBox");
var fileNoticeSpan = document.getElementById("filenotice");
var nc_fileBoxList = document.getElementById("nc-fileBox");
var nc_fileNoticeSpan = document.getElementById("nc-filenotice");

var uploadProgressBar = document.getElementById("uploadProgress");
var progressDisplayDiv = document.getElementById("progressDisplay");
//check cookie and the video list of this user when load the page(window)
window.addEventListener("load",checkCookieVideoList,false);
dashboard.addEventListener("click", function(){fileInput.click()}, false);
fileInput.addEventListener("change", this.getFile.bind(this), false);
uploadButton.addEventListener("click", this.upload.bind(this), false);
dashboard.addEventListener("dragover", function (e) {
    e.preventDefault()
    e.stopPropagation()
})
dashboard.addEventListener("dragenter", function (e) {
    e.preventDefault()
    e.stopPropagation()
    dashboard.style.backgroundColor = "white"
})
dashboard.addEventListener("dragleave", function (e) {
    e.preventDefault()
    e.stopPropagation()
    dashboard.style.backgroundColor = "antiquewhite"
})

dashboard.addEventListener("drop", function (e) {
    // 必须要禁用浏览器默认事件
    e.preventDefault()
    e.stopPropagation()
    efile = e.dataTransfer.files[0];
    ename = efile.name;
    fileName.innerHTML= ename;
})

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
    helloUserName.innerHTML = "Hello! " + user;
    const tempuserlist = ["temp01","temp02"];
    if (tempuserlist.indexOf(user) != -1){       //如果cookie中有记录用户名字则加载该用户的文件列表   
        refreshVideoList(user,false,fileBoxList,fileNoticeSpan);
        refreshVideoList(user,true,nc_fileBoxList,nc_fileNoticeSpan);
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
            //location.reload(); 
            $("#fileBox").empty();
            refreshVideoList(user,false,fileBoxList,fileNoticeSpan);
            refreshVideoList(user,true,nc_fileBoxList,nc_fileNoticeSpan);

        });
    });  
}

//get file and name of file
function getFile(e){
    e.stopPropagation();
    e.preventDefault(); 
    efile = e.target.files[0];
    ename = efile.name;
    fileName.innerHTML= ename;
}

//upload file
function upload(){
    if(ename && efile){  
        progressDisplayDiv.className = "progress visible";
        var value = 0;
        progress(value);
        app.uploadFile({
            //文件的绝对路径，包含文件名
            cloudPath: user+"/"+ename,
            //要上传的文件对象
            filePath: efile
            // onUploadProgress: function (progressEvent) {
            //     // console.log(progressEvent);
            //     // var percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        }).then(res=>{
            //写入对应用户的json文档里
            const _=db.command;
            
            userCollection.where({fileID:res.fileID}).get().then(res2=>{
                if(res2.data.length == 0){//if the fileID is not recorded in the collection
                    //edit the structure of data file
                    userCollection.add({ 
                        type:"file",
                        fileID: res.fileID,
                        date: getUploadDate(),
                        note: noteInput.value,
                        isComment: false,
                        isCheck: false
                    })
                    .then(function (res3) {
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

function getUploadDate(){
    var date = new Date();
	var sep = "-";
	var year = date.getFullYear(); //获取完整的年份(4位)
	var month = date.getMonth() + 1; //获取当前月份(0-11,0代表1月)
	var day = date.getDate(); //获取当前日
	if (month <= 9) {
		month = "0" + month;
	}
	if (day <= 9) {
		day = "0" + day;
	}
	var currentdate = year + sep + month + sep + day;
	return currentdate;
}

//refresh the video list (history page)
function refreshVideoList(tuser, isNewComment, fileBoxList, fileNoticeSpan){
    var num = -1;
    const _ = db.command;   
    userCollection = db.collection(tuser);
    userCollection.where({type:"file", fileID:_.neq(null)})
    .get()
    .then(async function (res) {
        if(res.data.length == 0){
            fileNoticeSpan.innerHTML="No file uploaded.";
        }
        else{   //开始读取文件
            var temprownode = null;

            for(var i=0;i<res.data.length;i++){

                var isComment = res.data[i].isComment;
                if(isNewComment && !isComment){
                    if(num == -1 && i == res.data.length-1) fileNoticeSpan.innerHTML = "No new comment."
                    continue
                }
                else
                {
                    num ++
                }
                var date = res.data[i].date; //*在这获取文件上传的日期
                var comment = res.data[i].ct; //*在这获取文件的评论
                var note = res.data[i].note;
                var commentby = res.data[i].ctby; //*在这获取文件的评论者

                await app.getTempFileURL({fileList:[res.data[i].fileID]})
                .then(res2=>{ 
                    //动态生成文件内容并压入
            
                    //获得文件下载链接 url
                    var fileObj = res2.fileList[0];
                    var url = fileObj.tempFileURL;

                        var inode = document.createElement("i");
                        inode.className = "icon fas fa-times float-right mb-1";
                        inode.style.cursor = "pointer";
                        inode.addEventListener("click", function(e){ 
                            e.stopPropagation();
                            e.preventDefault(); 
                            deleteFile(fileObj.fileID)}, 
                            false);
                        //视频缩略图（<video><source></source></video>,只支持mp4类型的文件）
                        var videonode= document.createElement("video");
                        videonode.setAttribute("width", "100%");
                        videonode.setAttribute("height", "200px");
                        videonode.setAttribute("controls", "controls");

                        var sourcenode = document.createElement("source");
                        sourcenode.setAttribute("src", url);
                        sourcenode.setAttribute("type", "video/mp4");
                        videonode.appendChild(sourcenode);


                
                        //生成Date和Comment
                        var hdatenode = document.createElement("p");
                        hdatenode.innerHTML = date;

                        //Note
                        var pnotenode = document.createElement("p")
                        pnotenode.style.color = "gray"
                        pnotenode.innerHTML = "Note: " + note;

                        var pcommentnode = document.createElement("p");
                        var strongnode = document.createElement("strong");
                        strongnode.innerHTML = "Comment: ";
                        var textcommentnode=document.createTextNode(comment);
                        pcommentnode.appendChild(strongnode);
                        if(comment)
                            pcommentnode.appendChild(textcommentnode);
                        else
                            pcommentnode.innerHTML = "No Comment";

                        //生成对应文件的删除按钮(<p><button></button><p>)
                        //var pbuttonnode = document.createElement("p");
                        //var buttonnode = document.createElement("button");
                        //var textbuttonnode=document.createTextNode("Delete");    
                        //buttonnode.appendChild(textbuttonnode);
                        //pbuttonnode.appendChild(buttonnode);
                        //buttonnode.setAttribute("class","btn btn-primary");  
                        //pbuttonnode.setAttribute("class","text-right");     


                        //生成外部div（idivnod & odivnode）
                        var odivnode = document.createElement("div");
                        var idivnode = document.createElement("div");

                    //将以上所有元素压入idivnode，idivnode压入odivnode
                    idivnode.appendChild(inode);
                    idivnode.appendChild(videonode);
                    idivnode.appendChild(hdatenode);
                    idivnode.appendChild(pnotenode);
                    idivnode.appendChild(pcommentnode);
                   // idivnode.appendChild(pbuttonnode);
                    odivnode.setAttribute("class","col-md-4 py-2");
                    idivnode.setAttribute("class","border rounded-sm");
                    idivnode.setAttribute("style","padding: 15px");
                    odivnode.appendChild(idivnode);

                    //将一个文件内容压入 filebox
                    if (num% 3 == 0) //如果为新的一行
                    {
                        var rownode = document.createElement("div");
                        rownode.setAttribute("class","row");
                        temprownode = rownode;
                        temprownode.appendChild(odivnode);
                        fileBoxList.appendChild (temprownode);
                    }
                    else{
                        temprownode.appendChild(odivnode);                            
                    }  
                });
            }
        }
    });

}

//Jquery.new code (Date: 200927)
$(document).ready(function($){
var $page_upload = $("#cd-upload"),
    $page_newcomment = $("#cd-newcomment"),
    $page_history = $("#cd-history"),
    $tab_whole = $(".menu"),
    $tab_upload = $tab_whole.children('li').eq(0),
    $tab_newcomment = $tab_whole.children('li').eq(2),
    $tab_history = $tab_whole.children('li').eq(4)

    $page_upload.show()
    $page_newcomment.hide()
    $page_history.hide()

    //switch page from nav
    $tab_whole.on('click', function (event) {
        event.preventDefault()
        if($(event.target).is($tab_upload)) 
        {
            $page_upload.show()
            $page_newcomment.hide()
            $page_history.hide()
            $tab_upload.addClass("active")
            $tab_newcomment.removeClass("active")
            $tab_history.removeClass("active")
        }
        else if($(event.target).is($tab_newcomment))
        {
            $page_upload.hide()
            $page_newcomment.show()
            $page_history.hide()
            $tab_upload.removeClass("active")
            $tab_newcomment.addClass("active")
            $tab_history.removeClass("active")
        }
        else if($(event.target).is($tab_history))
        {
            $page_upload.hide()
            $page_newcomment.hide()
            $page_history.show()
            $tab_upload.removeClass("active")
            $tab_newcomment.removeClass("active")
            $tab_history.addClass("active")
        }
    });
})


