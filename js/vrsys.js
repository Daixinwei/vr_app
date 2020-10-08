
/**
 * Used in vrsys.html
 */
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
var rv_fileBoxList = document.getElementById("rv-fileBox");
var rv_fileNoticeSpan = document.getElementById("rv-filenotice");
var fileBoxList = document.getElementById("fileBox");
var fileNoticeSpan = document.getElementById("filenotice");
var nc_fileBoxList = document.getElementById("nc-fileBox");
var nc_fileNoticeSpan = document.getElementById("nc-filenotice");
var uploadProgressBar = document.getElementById("uploadProgress");
var progressDisplayDiv = document.getElementById("progressDisplay");

window.addEventListener("load",checkCookieVideoList,false);
fileInput.addEventListener("change", this.getFile.bind(this), false);
uploadButton.addEventListener("click", this.upload.bind(this), false);
dashboard.addEventListener("click", function(){fileInput.click()}, false);
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

//连接腾讯云
const app =tcb.init({
    env:envId
});
var auth = app.auth({
    persistence: "local"
});
if(!auth.hasLoginState()) {
	auth.signInAnonymously();
}

//获取腾讯云数据库引用
const db =app.database();

/**
 *
 * get the key value by index name
 * @param {*} cname
 * @return {*} 
 */
function getCookie(cname){
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i].trim();
        if (c.indexOf(name)==0) { return c.substring(name.length,c.length); }
    }
    return "";
}

/**
 *check chookie and video list of user when loading vrsys.html
 */
function checkCookieVideoList(){
    user = getCookie("username");
    helloUserName.innerHTML = "Hello! " + user;
    const tempuserlist = ["temp01","temp02","temp03","temp04"];
    if (tempuserlist.indexOf(user) != -1){       //如果cookie中有记录用户名字则加载该用户的文件列表   
        userCollection = db.collection(user);
        //showRecentVideo(rv_fileBoxList,rv_fileNoticeSpan,3);
        refreshJumbotron()
        refreshVideoList(false,fileBoxList,fileNoticeSpan);
        refreshVideoList(true,nc_fileBoxList,nc_fileNoticeSpan);
    }
    else{//该用户未登录
        alert("Please login!");
        window.open("login.html","_self");
    }
}

/**
 *
 * delete file by fileID
 * @param {*} tempfileID fileID 
 */
function deleteFile(tempfileID){
    //从云数据库删除文件
    app.deleteFile({fileList:[tempfileID]})
    .then(res=>{        
             //从该用户的集合删除形容该文件的文档
            userCollection.where({type:"file", fileID:tempfileID}).remove().then(res=>{
            $(".toast").eq(1).toast("show")
            $("#rv-fileBox").empty();
            $("#fileBox").empty();
            $("#nc-fileBox").empty();
            refreshJumbotron()
            //showRecentVideo(rv_fileBoxList,rv_fileNoticeSpan,3);
            refreshVideoList(false,fileBoxList,fileNoticeSpan);
            refreshVideoList(true,nc_fileBoxList,nc_fileNoticeSpan);
        });
    });  
}

//
/**
 *
 * get file and name of file when input element changed
 * @param {*} e
 */
function getFile(e){
    e.stopPropagation();
    e.preventDefault(); 
    efile = e.target.files[0];
    ename = efile.name;
    fileName.innerHTML= ename;
}


/**
 *
 * upload file 
 */
function upload(){
    if(ename && efile){  
        progressDisplayDiv.className = "progress visible";
        var value = 0;
        progress(value);
        
        var index= ename.lastIndexOf(".");
        var ext = ename.substr(index+1);
        app.uploadFile({
            //文件的绝对路径，包含文件名
            cloudPath: user+"/"+ename,
            //要上传的文件对象
            filePath: efile
        }).then(res=>{
            //写入对应用户的json文档里
            const _=db.command;
            
            userCollection.where({fileID:res.fileID}).get().then(res2=>{
                if(res2.data.length == 0){//if the fileID is not recorded in the collection
                    //edit the structure of data file
                    userCollection.add({ 
                        type:"file",
                        format:ext,
                        fileID: res.fileID,
                        date: getUploadDate(),
                        note: noteInput.value,
                        isComment: false,
                        isCheck: false
                    })
                    .then(res3=>{
                        $("#uploadProgress").css("width", "100%");
                        refreshJumbotron()
                        setTimeout(function(){
                            progressDisplayDiv.className = "progress invisible"
                            $("#toast-body").text("Upload Success")
                            $(".toast").eq(0).toast("show")
                            $("#rv-fileBox").empty();
                            $("#fileBox").empty()
                            //showRecentVideo(rv_fileBoxList,rv_fileNoticeSpan,3);
                            refreshVideoList(false,fileBoxList,fileNoticeSpan)
                            },
                            1500);
                    });
                }
                else{ 
                    progressDisplayDiv.className = "progress invisible"
                    $("#toast-body").text("The file has existed")
                    $(".toast").eq(0).toast("show")    
                    }
            });    
        });   
    }
    else
    {
        progressDisplayDiv.className = "progress invisible"
        $("#toast-body").text("Upload Failed")
        $(".toast").eq(0).toast("show")
    }
}


function progress(value) {
    if (value < 50) {
        value += 1;
        $("#uploadProgress").css("width", value + "%");      
        setTimeout("progress("+value+")", 20);
    }else if (value>=50 && value<85){
        value += 1;
        $("#uploadProgress").css("width", value + "%");    
        setTimeout("progress("+value+")", 40);
    }else if (value>=85 && value<99){
        value += 1;
        $("#uploadProgress").css("width", value + "%");
        setTimeout("progress("+value+")", 60);
    }
    else return ""
}

/**
 *
 * get the date when upload the file
 * @return {*} return date in YY-MM-DD format
 */
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


/**
 *
 * refresh the video list 
 * @param {*} isNewCommentPage
 * @param {*} tfileBoxList
 * @param {*} tfileNoticeSpan
 */
function refreshVideoList(isNewCommentPage, tfileBoxList, tfileNoticeSpan){
    var num = -1;
    const _ = db.command;   

    userCollection.where({type:"file", fileID:_.neq(null)})
    .get()
    .then(function (res) {
        if(res.data.length == 0){
            tfileNoticeSpan.innerText="No file uploaded.";
        }
        else
        {   //开始读取文件
            tfileNoticeSpan.innerText= null
            var temprownode = null;

            for(var i=0;i<res.data.length;i++)
            {          
                var isComment = res.data[i].isComment;
                if(isNewCommentPage && !isComment){
                    continue
                }
                else
                {
                    num ++
                }

                var cardnode = document.createElement("div")

                writeCard(res.data[i],cardnode,isNewCommentPage)
                    //将一个文件内容压入 filebox
                if (num% 3 == 0) //如果为新的一行
                {
                    var rownode = document.createElement("div");
                    rownode.setAttribute("class","row");
                    temprownode = rownode;
                    temprownode.appendChild(cardnode);
                    tfileBoxList.appendChild (temprownode);
                }
                else{
                    temprownode.appendChild(cardnode);                            
                }  
            }
        }

        if(num == -1 && isNewCommentPage == true)
        {
            $("#hm-checknewcommentreminder").hide()
            tfileNoticeSpan.innerText="No new comment";
        }
        else if(num > -1 && isNewCommentPage == true)
        {   
            $('[data-toggle="popover"]').popover('show')
            $("#hm-checknewcommentreminder").show()
        }
    });
}

function showRecentVideo(tfileBoxList, tfileNoticeSpan, showSize)
{
    const _ = db.command;   
    userCollection.where({type:"file", fileID:_.neq(null)})
    .get()
    .then(function (res) {
        if(res.data.length == 0){
            tfileNoticeSpan.innerText="No recent video.";
        }
        else
        {   //开始读取文件
            var temprownode = null;
            var num = 0;
            var templength = Math.min(showSize,res.data.length)
            for(var i=0;i<res.data.length;i++)
            {    
                if(i >=res.data.length - templength)
                {
                    var cardnode = document.createElement("div")

                    writeCard(res.data[i],cardnode,false)
                    
                     //将一个文件内容压入 filebox
                    if (num % 3 == 0) //如果为新的一行
                    {
                        var rownode = document.createElement("div");
                        rownode.setAttribute("class","row");
                        temprownode = rownode;
                        temprownode.appendChild(cardnode);
                        tfileBoxList.appendChild (temprownode);
                    }
                    else{
                        var child = temprownode.children[0]
                        temprownode.insertBefore(cardnode,child);                            
                    } 
                    
                    num++
                }
            }
        }
    })
}

/**
 *
 * search file by upload date in history page
 * @param {*} fileBoxList
 * @param {*} fileNoticeSpan
 * @param {*} tdate
 */
function searchByDate(fileBoxList, fileNoticeSpan, tdate){
    const _ = db.command;   
    userCollection.where({type:"file", date:_.eq(tdate)})
    .get()
    .then(function (res) {
        if(res.data.length == 0){
            fileNoticeSpan.innerHTML="No result";
        }
        else
        {   //开始读取文件
            var temprownode = null;

            for(var i=0;i<res.data.length;i++)
            {
                var cardnode = document.createElement("div")
                writeCard(res.data[i],cardnode,false)

                //将一个文件内容压入 filebox
                if (i % 3 == 0) //如果为新的一行
                {
                    var rownode = document.createElement("div");
                    rownode.setAttribute("class","row");
                    temprownode = rownode;
                    temprownode.appendChild(cardnode);
                    fileBoxList.appendChild (temprownode);
                }
                else{
                    temprownode.appendChild(cardnode);                            
                }  
            }
        }
    });
}

/**
 *
 * load one card about video information
 * @param {*} result result document saved in the database
 * @param {*} cardnode div element to hold one card 
 * @param {*} isNewCommentPage is this card in the new comment page
 */
async function writeCard(result, cardnode, isNewCommentPage)
{
    var date = result.date; //*在这获取文件上传的日期
    var comment = result.ct; //*在这获取文件的评论
    var note = result.note;
    var format = result.format;

    await app.getTempFileURL({fileList:[result.fileID]})
    .then(res2=>{ 
        //动态生成文件内容并压入

        //获得文件下载链接 url
        var fileObj = res2.fileList[0];
        var url = fileObj.tempFileURL;

            //X图标，删除
            var inode = document.createElement("i");
            inode.className = "icon fas fa-times float-right mb-1";
            inode.style.cursor = "pointer";
            inode.addEventListener("click", function(e){ 
                e.stopPropagation();
                e.preventDefault(); 
                deleteFile(fileObj.fileID)}, 
                false);

            //confirm 按钮(on in new comment page)
            var buttonnode = document.createElement("button")
            buttonnode.innerText = "Confirm"  
            buttonnode.type = "button"
            buttonnode.className = "btn btn-secondary btn-block btn-lg"
            buttonnode.style.textShadow = "black 2px 1px 1px"
            buttonnode.setAttribute("data-toggle","modal")
            buttonnode.setAttribute("data-target","#confirmModal")
            buttonnode.addEventListener("click", function(e){ 
                e.preventDefault();
                $('#confirm-button').unbind("click")
                $('#confirm-button').click(async function (e) { 
                    e.preventDefault();
                    await userCollection.where({type:"file", fileID:fileObj.fileID}).update({isComment:false});
                    $('#nc-fileBox').empty(); 
                    refreshVideoList(true,nc_fileBoxList,nc_fileNoticeSpan);
                });
                }, 
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

            //生成Date
            var hdatenode = document.createElement("p");
            hdatenode.innerText = date;
            var spanbadge = document.createElement("span")
            spanbadge.className = "badge badge-secondary float-right"
            spanbadge.innerText = format;
            hdatenode.appendChild(spanbadge)

            //Note
            var pnotenode = document.createElement("p")
            pnotenode.setAttribute("style","height: 30px; word-wrap:break-word; overflow-y: scroll; scrollbar-width: none;") 
            pnotenode.style.color = "gray"
            pnotenode.innerHTML = "Note: " + note;
            
            //Comment
            var commenttagnode = document.createElement("div");
            commenttagnode.innerHTML = "<strong>Comment</strong>";
            commenttagnode.style.marginBottom = "0";
            var divcommentnode = document.createElement("p");
            divcommentnode.setAttribute("style","height: 110px; word-wrap:break-word; overflow-y: scroll; scrollbar-width: none") 
            if(comment)
            {
                if(comment instanceof Array)
                {
                    comment.forEach(function(commentObj)
                    {
                        var pcommentObjNode = document.createElement("p")
                        pcommentObjNode.innerHTML =
                            "<i style='width: 25px;' class='fas fa-user-circle'></i>" 
                            + "<strong>"+commentObj.by+": </strong> "
                            + commentObj.content;
                        divcommentnode.appendChild(pcommentObjNode)                
                    })
                }
            }
            else
                divcommentnode.innerHTML = "None";

            //生成外部dividivnod 
            var idivnode = document.createElement("div");

        //将以上所有元素压入idivnode
        if(isNewCommentPage == false)
            idivnode.appendChild(inode);
        idivnode.appendChild(videonode);
        idivnode.appendChild(hdatenode);
        idivnode.appendChild(pnotenode);
        idivnode.appendChild(commenttagnode)
        idivnode.appendChild(divcommentnode);
        if(isNewCommentPage == true)
            idivnode.appendChild(buttonnode);

        idivnode.setAttribute("class","border rounded-sm");
        idivnode.setAttribute("style","padding: 15px");
        cardnode.setAttribute("class","col-md-4 py-2");
        cardnode.appendChild(idivnode);
    })
}

//control jumbotron
function refreshJumbotron()
{
    $("#jb-hellouser").text("Hello," + user)
    $("#jb-date").text("Today is " + getTodayDate())
    checkifUploadToday()
}
function getTodayDate()
{
    var date = new Date();
    var year = date.getFullYear(); //获取完整的年份(4位)
    var day = date.getDate(); //获取当前日
    var months = 
        [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
        ];
    if (day == 1 || day == 11 || day == 21 || day == 31) {
        day = day + "(st)";
    }
    else if (day == 2 || day == 12 || day == 22)
    {
        day = day + "(nd)";
    }
    else if(day == 3 || day == 13 || day == 23)
    {
        day = day + "(rd)";
    }
    else
    {
        day = day + "(th)";
    }
    var currentdate = months[date.getMonth()] + " " + day +", " + year;
    return currentdate;   
}
function checkifUploadToday()
{
    const _ = db.command;   
    userCollection.where({type:"file", date:_.eq(getUploadDate())}).get()
    .then(res=>{
        if(res.data.length >0){
            $("#jb-reminder").text("You have uploaded today's video report. Do not forget to upload next work day.")
            $("#jb-bt").hide()
        }
        else
        {
            $("#jb-reminder").text("Please upload today's video report.")
            $("#jb-bt").show()
        }  
    })  
}


//Jquery.new code (Date: 200927)
$(document).ready(function($){
var $h_filebox = $("#fileBox"),
    $page_home = $("#cd-home"), 
    $page_upload = $("#cd-upload"),
    $page_newcomment = $("#cd-newcomment"),
    $page_history = $("#cd-history"),
    $tab_whole = $(".menu"),
    $tab_home = $tab_whole.children('li').eq(0),
    $tab_upload = $tab_whole.children('li').eq(2),
    $tab_newcomment = $tab_whole.children('li').eq(4),
    $tab_history = $tab_whole.children('li').eq(6),
    $jb_uploadbutton = $("#jb-bt"),
    $hm_checknewcommentbutton = $("#hm-checknewcommentbt")


    $page_home.show()
    $page_upload.hide()
    $page_newcomment.hide()
    $page_history.hide()
    //switch page from nav
    $tab_whole.on('click', function (event) {
        event.preventDefault()
        if($(event.target).is($tab_home)) 
        {
            homeSelected()
        }
        else if($(event.target).is($tab_upload)) 
        {
            uploadSelected()
        }
        else if($(event.target).is($tab_newcomment))
        {
            newCommentSelected()
        }
        else if($(event.target).is($tab_history))
        {   
            historySelected()
        }
    })

    function homeSelected()
    {
        $page_home.fadeIn()
        $page_upload.fadeOut()
        $page_newcomment.fadeOut()
        $page_history.fadeOut()
        $tab_home.addClass("active")
        $tab_upload.removeClass("active")
        $tab_newcomment.removeClass("active")
        $tab_history.removeClass("active")

    }

    function uploadSelected()
    {
        $page_home.fadeOut()
        $page_upload.fadeIn()
        $page_newcomment.fadeOut()
        $page_history.fadeOut()
        $tab_home.removeClass("active")
        $tab_upload.addClass("active")
        $tab_newcomment.removeClass("active")
        $tab_history.removeClass("active")
    }

    function newCommentSelected()
    {
        $('[data-toggle="popover"]').popover('hide')
        $('[data-toggle="popover"]').popover('disable')
        $page_home.fadeOut()
        $page_upload.fadeOut()
        $page_newcomment.fadeIn()
        $page_history.fadeOut()
        $tab_home.removeClass("active")
        $tab_upload.removeClass("active")
        $tab_newcomment.addClass("active")
        $tab_history.removeClass("active")
    }

    function historySelected()
    {
        $page_home.fadeOut()
        $page_upload.fadeOut()
        $page_newcomment.fadeOut()
        $page_history.fadeIn()
        $tab_home.removeClass("active")
        $tab_upload.removeClass("active")
        $tab_newcomment.removeClass("active")
        $tab_history.addClass("active")
    }

    $jb_uploadbutton.on('click', uploadSelected)
    $hm_checknewcommentbutton.on('click', newCommentSelected)

    //select date from calendar
    $("#datetimepicker").datetimepicker({
        format:'YYYY-MM-DD',
        locale:'ja'
    })

    //search by date
    $("#date-search").on('blur',function(event){ 
        event.preventDefault()
        var temparray = this.value.split('-')
        var day = temparray.pop()
        var month = temparray.pop()
        $h_filebox.empty()
        $h_filebox.prepend("<h2 style='color:grey'>"+month+'/'+day+"</h2>")
        fileNoticeSpan.innerHTML = null

        if(this.value.length==0)
        {
            refreshVideoList(false,fileBoxList,fileNoticeSpan)
        }
        else
        {
            searchByDate(fileBoxList,fileNoticeSpan,this.value)
        }
    })
})


