/*-----------------
Used in manage.html
-------------------*/
var envId ="dxwvr-1e2175" ;
var user = null;

var h_fileBoxList = document.getElementById("h-fileBox");
var h_fileNoticeSpan = document.getElementById("h-filenotice");
var nv_fileBoxList = document.getElementById("nv-fileBox");
var nv_fileNoticeSpan = document.getElementById("nv-filenotice");
var comment_input = document.getElementById("comment-input");
const tempmanagerlist = ["admin01","admin02"];
const tempuserlist = ["temp01","temp02"];//users' ID. edit when update collections in tcb database
//check cookie and the video list of this user when load the page(window)
window.addEventListener("load",checkCookieAlluserVideoList,false);

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
function checkCookieAlluserVideoList(){
    user = getCookie("username");
    helloUserName.innerHTML = "Hello! " + user;
    if (tempmanagerlist.indexOf(user) != -1)//如果cookie中有记录用户名字则加载该用户的文件列表 
    {         
        refreshFileBox(nv_fileBoxList, nv_fileNoticeSpan, true)
        refreshFileBox(h_fileBoxList, h_fileNoticeSpan, false)
    }
    else{//该用户未登录
        alert("Please login!");
        window.open("login.html","_self");
    }
}

async function refreshFileBox(fileBoxList, fileNoticeSpan, isNewVideo){
    var num = -1;
    const _ = db.command;
    for(var i=0; i<tempuserlist.length;i++)
    {
        var uname = tempuserlist[i]
        var ucollection = db.collection(uname)      
        await ucollection.where({type:"file", fileID:_.neq(null)})
        .get()
        .then(function (res) 
        {
            if(res.data.length > 0)
            {
                var temprownode = null;
                for(var j=0;j<res.data.length;j++)
                {   
                    var isCheck = res.data[j].isCheck;
                    if(isNewVideo && isCheck){
                        continue
                    }
                    else
                    {
                        num ++
                    }

                    //生成一个卡片      
                    var cardnode = document.createElement("div");
                    writeCard(res.data[j], cardnode, isNewVideo)                     
                    if (num % 3 == 0) //如果为新的一行
                    {
                        var rownode = document.createElement("div");
                        rownode.setAttribute("class","row");
                        temprownode = rownode; 
                        temprownode.appendChild(cardnode);
                        fileBoxList.appendChild (temprownode);
                    }
                    else
                    {
                        temprownode.appendChild(cardnode);                            
                    }  
                }
            }
        })
    }
    if(num == -1)
    {
        if(isNewVideo == true)
            fileNoticeSpan.innerText = "No new video"
        else
            fileNoticeSpan.innerText = "No video uploaded"
    }
}

async function searchByDate(fileBoxList, fileNoticeSpan, date){
    var num = -1;
    const _ = db.command;
    for(var i=0; i<tempuserlist.length;i++)
    {
        var uname = tempuserlist[i]
        var ucollection = db.collection(uname)      
        await ucollection.where({type:"file", date:_.eq(date)})
        .get()
        .then(function (res) 
        {
            if(res.data.length > 0)
            {
                var temprownode = null;
                for(var j=0;j<res.data.length;j++)
                {   
                    var isCheck = res.data[j].isCheck;
                        num ++
                    //生成一个卡片      
                    var cardnode = document.createElement("div");
                    writeCard(res.data[j], cardnode)                     
                    if (num % 3 == 0) //如果为新的一行
                    {
                        var rownode = document.createElement("div");
                        rownode.setAttribute("class","row");
                        temprownode = rownode; 
                        temprownode.appendChild(cardnode);
                        fileBoxList.appendChild (temprownode);
                    }
                    else
                    {
                        temprownode.appendChild(cardnode);                            
                    }  
                }
            }
        })
    }
    if(num == -1)
    {
            fileNoticeSpan.innerText = "No Result"
    }
}


async function writeCard(result, cardnode, isNewVideo){
    var date = result.date; //*在这获取文件上传的日期
    var format = result.format;
    var note = result.note;
    var comment = result.ct; //*在这获取文件的评论
    var commentby = result.ctby; //*在这获取文件的评论者
    await app.getTempFileURL({fileList:[result.fileID]})
    .then(function(res){
        //动态生成html元素并压入：
        //获得文件下载链接 url 和 文件名 fileName
        var fileObj = res.fileList[0];                            
        var url = fileObj.tempFileURL;
        var temparray = url.split('/');
        var fileName = temparray.pop();//get the name from fileID
        var un = temparray.pop();
        
            //X图标，删除
            var inode = document.createElement("i");
            inode.className = "icon fas fa-times float-right mb-1";
            inode.style.cursor = "pointer";
            inode.addEventListener("click", function(e){ 
                e.stopPropagation();
                e.preventDefault(); 
                deleteFile(fileObj.fileID, un)}, 
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

            //生成Date format note 
            var hdatenode = document.createElement("p");
            hdatenode.innerText = date
            var spanbadge = document.createElement("span")
            spanbadge.className = "badge badge-secondary float-right"
            spanbadge.innerText = format
            hdatenode.appendChild(spanbadge)
            var pnotenode = document.createElement("p")
            pnotenode.setAttribute("style","color:gray; height: 50px; word-break:break-all; overflow: hidden") 
            pnotenode.innerHTML = "Note: " + note

            //comment button
            var buttonnode = document.createElement("button")
            if(isNewVideo)
                buttonnode.innerText = "Add Comment"  
            else
                buttonnode.innerText = "Edit Comment"  
            buttonnode.type = "button"
            buttonnode.className = "btn btn-secondary btn-block mb-2"
            buttonnode.style.textShadow = "black 2px 1px 1px"
            buttonnode.setAttribute("data-toggle","modal")
            buttonnode.setAttribute("data-target","#comment-modal")
            buttonnode.addEventListener("click", function(e){ 
                e.preventDefault();
                if(comment)
                    comment_input.value = comment
                else
                    comment_input.value = ""
                $('#comment-button').click(function (e) { 
                    e.preventDefault();
                    e.preventDefault();
                    giveComment(fileObj.fileID, un, comment_input.value)
                    $('#h-fileBox').empty(); 
                    $('#nv-fileBox').empty(); 
                    refreshFileBox(h_fileBoxList, h_fileNoticeSpan, false)
                    refreshFileBox(nv_fileBoxList, nv_fileNoticeSpan, true)
                });
                }, 
                false);       
            
            //inputnode.addEventListener("change", function(){giveComment(fileObj.fileID, un,inputnode.value)}, false);
            //comment
            var pcommentnode = document.createElement("p")
            pcommentnode.setAttribute("style","height: 50px; word-break:break-all; overflow: hidden")
            var strongnode = document.createElement("strong")
            strongnode.innerText = "Comment: "
            var textcommentnode=document.createTextNode(comment)
            pcommentnode.appendChild(strongnode)
            if(comment)
                pcommentnode.appendChild(textcommentnode)
            else
                pcommentnode.innerHTML = "No Comment"
        //生成外部div（idivnod ）

        var idivnode = document.createElement("div");

        //将以上所有元素压入idivnode，idivnode压入cardnode
        if(!isNewVideo)
            idivnode.appendChild(inode)
        idivnode.appendChild(videonode);
        idivnode.appendChild(hdatenode);
        idivnode.appendChild(pnotenode);
        idivnode.appendChild(buttonnode);
        if(!isNewVideo)
            idivnode.appendChild(pcommentnode);
        cardnode.setAttribute("class","col-md-4 py-2");
        idivnode.setAttribute("class","border rounded-sm");
        idivnode.setAttribute("style","padding: 15px");
        cardnode.appendChild(idivnode);
    })
}

function deleteFile(tfileID, tusername){
    //删除文件
    app.deleteFile({fileList:[tfileID]})
    .then(res=>{
        db.collection(tusername).where({type:"file", fileID:tfileID}).remove() //从该用户的集合删除形容该文件的文档
        .then(res2=>{
            $(".toast").eq(0).toast("show")
            $('#h-fileBox').empty(); 
            $('#nv-fileBox').empty(); 
            refreshFileBox(h_fileBoxList, h_fileNoticeSpan, false)
            refreshFileBox(nv_fileBoxList, nv_fileNoticeSpan, true)
        });
    });       
}

async function giveComment(tfileID, tusername, tcomment){
    await db.collection(tusername).where({type:"file", fileID:tfileID}).update({ct:tcomment, ctby:user, isCheck:true, isComment:true});
}


//Jquery.new code (Date: 200929~)
$(document).ready(function($){
var $h_filebox = $("#h-fileBox"),
    $page_newvideo = $("#cd-newvideo"),
    $page_history = $("#cd-history"),
    $tab_whole = $(".menu"),
    $tab_newvideo = $tab_whole.children('li').eq(0),
    $tab_history = $tab_whole.children('li').eq(2)

    $page_newvideo.show()
    $page_history.hide()
    //switch page from nav
    $tab_whole.on('click', function (event) {
        event.preventDefault()
        if($(event.target).is($tab_newvideo)) 
        {
            $page_newvideo.show()
            $page_history.hide()
            $tab_newvideo.addClass("active")
            $tab_history.removeClass("active")
        }
        else if($(event.target).is($tab_history))
        {
            $page_newvideo.hide()
            $page_history.show()
            $tab_newvideo.removeClass("active")
            $tab_history.addClass("active")
        }
    })

    //select date from calendar
    $("#datetimepicker").datetimepicker({
        format:'YYYY-MM-DD',
        locale:'ja'
    })

    //search by date
    $("#date-search").on('blur',function(event){ 
        event.preventDefault()
        $h_filebox.empty()
        h_fileNoticeSpan.innerText = null
        console.log(this.value)
        if(this.value.length==0)
        {
            refreshFileBox(h_fileBoxList, h_fileNoticeSpan, false)
        }
        else
        {
            searchByDate(h_fileBoxList, h_fileNoticeSpan, this.value)
        }
    })
})