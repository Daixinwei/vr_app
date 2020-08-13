var envId ="dxwvr-1e2175" ;
var user = null;

var fileBoxList = document.getElementById("fileBox");
var fileNoticeSpan = document.getElementById("filenotice");

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
async function checkCookieAlluserVideoList(){
    user = getCookie("username");
    const _ = db.command;
    
    if (user=="admin"){       
        const tempuserlist = ["temp01","temp02"];//users' ID. edit when update collections in tcb database
        //如果cookie中有记录用户名字则加载该用户的文件列表 
        for(var i=0; i<tempuserlist.length;i++){
            var uname = tempuserlist[i];
            var ucollection = db.collection(uname);       
            await ucollection.where({type:"file", fileID:_.neq(null)})
            .get()
            .then(async function (res) {
                if(res.data.length > 0){
                    for(var j=0;j<res.data.length;j++){
                        await app.getTempFileURL({fileList:[res.data[j].fileID]})
                        .then(function(res2){
                            //动态生成html元素并压入：
                            //获得文件下载链接 url 和 文件名 fileName
                            var fileObj = res2.fileList[0];
                            
                            var url = fileObj.tempFileURL;
                            var temparray = url.split('/');
                            var fileName = temparray.pop();//get the name from fileID
                            var un = temparray.pop();
                            
                            //生成字面为fileName的文件链接
                            var anode =document.createElement("a");
                            var hrefnode=document.createAttribute("href");
                            hrefnode.nodeValue=`${url}`;
                           
                            var textnode=document.createTextNode(`${un} / ${fileName}`);                          
                            anode.attributes.setNamedItem(hrefnode);
                            anode.appendChild(textnode);
                            var tdanode =document.createElement("td");
                            tdanode.appendChild(anode);
                            
                            //生成对应文件的删除按钮
                            var buttonnode = document.createElement("button");
                            var textbuttonnode=document.createTextNode("Delete");  
                            buttonnode.setAttribute("class","btn btn-success");     
                            buttonnode.appendChild(textbuttonnode);
                            buttonnode.addEventListener("click", function(){deleteFile(fileObj.fileID, un)}, false);

                            var tdeletenode =document.createElement("td");
                            tdeletenode.appendChild(buttonnode);

                            //生成对应文件的留言栏
                            var trcommentnode = document.createElement("tr");
                            var tdcommentnode = document.createElement("td");
                            var inputnode =  document.createElement("input");
                            
                            tdcommentnode.appendChild(inputnode);
                            inputnode.setAttribute("type","text");
                            inputnode.setAttribute("placeholder","Give Comment");
                            inputnode.setAttribute("class","form-control");
                            ucollection.where({type:"file", fileID:fileObj.fileID}).get()
                            .then(res3=>{
                               // console.log(res3.data);
                                var tcoment;
                                tcoment=res3.data[0].ct;
                                if(tcoment)
                                    inputnode.value=tcoment;         
                            });
                            inputnode.addEventListener("change", function(){giveComment(fileObj.fileID, un,inputnode.value)}, false);

                            //将所有元素压入表格的一行当中
                            var trmainnode =document.createElement("tr");
                            var tbodynode =document.createElement("tbody");
                          
                            trmainnode.appendChild(tdanode);
                            trmainnode.appendChild(tdeletenode);
                            trcommentnode.appendChild(tdcommentnode);

                            tbodynode.appendChild(trmainnode);  
                            tbodynode.appendChild(trcommentnode);    

                            fileBoxList.appendChild (tbodynode);
                        });
                    }
                }
            });
        }  
        
    }
    else{//该用户未登录
        alert("Please login!");
        window.open("login.html","_self");
    }
}

function deleteFile(tfileID, tusername){
    //删除文件
    app.deleteFile({fileList:[tfileID]})
    .then(res=>{alert("Delete success!\nRefresh the page to refresh your files list.")});
    //从该用户的集合删除形容该文件的文档
    db.collection(tusername).where({type:"file", fileID:tfileID}).remove();
}

function giveComment(tfileID, tusername, tcomment){
    db.collection(tusername).where({type:"file", fileID:tfileID}).update({ct:tcomment});
}

